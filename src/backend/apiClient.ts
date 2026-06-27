/**
 * Backend API client base (fetch wrapper).
 *
 * Rules (load-bearing):
 *  - Base URL comes from getEnv(). If null/empty => there is NO backend; the
 *    client returns a BACKEND_UNAVAILABLE ApiError. It NEVER fabricates a
 *    success (NO_FAKE_SUCCESS_GATE, BACKEND_API_GATE).
 *  - Bearer token is injected from a TokenProvider (by reference). Tokens are
 *    never logged (redaction on every log path).
 *  - Maps non-2xx + transport errors to a typed ApiError, reading the REAL
 *    MWDS error envelope from the response BODY:
 *        { "error": { code, message, request_id, details? } }
 *    The correlation id prefers `error.request_id` (body), falling back to the
 *    `x-request-id` response header.
 *  - Transport status -> normalized code:
 *      401 -> AUTH_EXPIRED · 403 -> FORBIDDEN · 404 -> NOT_FOUND
 *      400/422 -> VALIDATION · 503 / network -> BACKEND_UNAVAILABLE · else UNKNOWN
 */

import {getEnv, hasBackend} from '../config/env';
import {redactToString} from '../shared/redaction';
import {
  ApiError,
  ApiErrorCode,
  ApiErrorDetail,
  ApiResult,
  isBackendErrorEnvelope,
  RequestOptions,
  TokenProvider,
} from './types';

const REQUEST_ID_HEADER = 'x-request-id';
const DEFAULT_TIMEOUT_MS = 15000;

let tokenProvider: TokenProvider = () => null;

/** Wire the token source (the session layer registers its secure-storage reader). */
export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

/** Build an ApiError without leaking sensitive content. */
export function makeApiError(
  code: ApiErrorCode,
  message: string,
  httpStatus: number,
  extra?: {
    requestId?: string;
    backendCode?: string;
    details?: ApiErrorDetail[];
  },
): ApiError {
  return {
    code,
    message,
    httpStatus,
    requestId: extra?.requestId,
    backendCode: extra?.backendCode,
    details: extra?.details,
  };
}

function classifyStatus(status: number): ApiErrorCode {
  switch (status) {
    case 401:
      return 'AUTH_EXPIRED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 400:
    case 422:
      return 'VALIDATION';
    case 503:
      return 'BACKEND_UNAVAILABLE';
    default:
      return 'UNKNOWN';
  }
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

function buildQuery(
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) {
    return '';
  }
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Perform a request. Returns a discriminated ApiResult; never throws for an
 * expected backend/transport condition (those become {ok:false, error}).
 */
export async function apiRequest<T>(
  options: RequestOptions,
): Promise<ApiResult<T>> {
  const env = getEnv();

  // No backend configured => honest BACKEND_UNAVAILABLE, never a fake success.
  if (!hasBackend(env)) {
    return {
      ok: false,
      error: makeApiError(
        'BACKEND_UNAVAILABLE',
        'No MWDS backend is configured (apiBaseUrl is unset). This build cannot reach a backend; configure a base URL to sign in.',
        0,
      ),
    };
  }

  const {
    method = 'GET',
    path,
    body,
    query,
    headers = {},
    authenticated = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const url = joinUrl(env.apiBaseUrl as string, path) + buildQuery(query);

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (authenticated) {
    const token = await tokenProvider();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    // Network/transport/abort failure: no response => BACKEND_UNAVAILABLE.
    // The error is redacted before any logging the caller may do.
    void redactToString(err);
    return {
      ok: false,
      error: makeApiError(
        'BACKEND_UNAVAILABLE',
        'The MWDS backend could not be reached.',
        0,
      ),
    };
  } finally {
    clearTimeout(timer);
  }

  const headerRequestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

  // Parse body defensively (may be empty or non-JSON on errors).
  let parsed: unknown = undefined;
  const raw = await response.text();
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: mapErrorEnvelope(parsed, response.status, headerRequestId),
    };
  }

  const requestId = pickRequestId(parsed, headerRequestId);
  return {ok: true, data: parsed as T, requestId};
}

/**
 * Map a non-2xx response into an ApiError, reading the real MWDS error
 * envelope `{ error: { code, message, request_id, details } }` from the body.
 * Falls back gracefully when the body is empty / non-conforming.
 */
function mapErrorEnvelope(
  parsed: unknown,
  status: number,
  headerRequestId: string | undefined,
): ApiError {
  const code = classifyStatus(status);
  if (isBackendErrorEnvelope(parsed)) {
    const env = parsed.error;
    return makeApiError(
      code,
      env.message?.trim() || `Request failed (${status}).`,
      status,
      {
        requestId: env.request_id || headerRequestId,
        backendCode: env.code,
        details: Array.isArray(env.details) ? env.details : undefined,
      },
    );
  }
  return makeApiError(code, `Request failed (${status}).`, status, {
    requestId: headerRequestId,
  });
}

/** On success, prefer a body-level request id if the backend echoes one. */
function pickRequestId(
  parsed: unknown,
  headerRequestId: string | undefined,
): string | undefined {
  if (
    parsed &&
    typeof parsed === 'object' &&
    'request_id' in parsed &&
    typeof (parsed as {request_id: unknown}).request_id === 'string'
  ) {
    return (parsed as {request_id: string}).request_id;
  }
  return headerRequestId;
}

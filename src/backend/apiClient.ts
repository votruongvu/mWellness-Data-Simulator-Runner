/**
 * MR-A — Backend API client base (fetch wrapper).
 *
 * Rules (load-bearing):
 *  - Base URL comes from getEnv(). If null/empty => there is NO backend; the
 *    client returns/throws a BACKEND_UNAVAILABLE ApiError. It NEVER fabricates
 *    a success (NO_FAKE_SUCCESS_GATE, BACKEND_API_GATE).
 *  - Bearer token is injected from a TokenProvider (by reference). Tokens are
 *    never logged (redaction on every log path).
 *  - Captures the `x-request-id` correlation header (TO_VERIFY) on every call.
 *  - Maps non-2xx + transport errors to typed ApiError:
 *      401 -> AUTH_EXPIRED · 403 -> FORBIDDEN · 404 -> NOT_FOUND
 *      400/422 -> VALIDATION · 503 / network -> BACKEND_UNAVAILABLE · else UNKNOWN
 */

import {getEnv, hasBackend} from '../config/env';
import {redactToString} from '../shared/redaction';
import {
  ApiError,
  ApiErrorCode,
  ApiResult,
  RequestOptions,
  TokenProvider,
} from './types';

const REQUEST_ID_HEADER = 'x-request-id'; // TO_VERIFY against MWDS backend.
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
  requestId?: string,
): ApiError {
  return {code, message, httpStatus, requestId};
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
    headers = {},
    authenticated = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const url = joinUrl(env.apiBaseUrl as string, path);

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
    // Note: the error is redacted before any logging the caller may do.
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

  const requestId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;

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
    const code = classifyStatus(response.status);
    const message = extractMessage(parsed) ?? `Request failed (${response.status}).`;
    return {
      ok: false,
      error: makeApiError(code, message, response.status, requestId),
    };
  }

  return {ok: true, data: parsed as T, requestId};
}

/** Best-effort message extraction from a backend error body (never a token). */
function extractMessage(parsed: unknown): string | undefined {
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.message === 'string') {
      return obj.message;
    }
    if (typeof obj.error === 'string') {
      return obj.error;
    }
  }
  return undefined;
}

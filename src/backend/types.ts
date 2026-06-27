/**
 * MR-A — Backend client base types.
 *
 * Mirrors the MR-A contract baseline error envelope:
 *   ApiError { code; message; requestId?; httpStatus }
 * Codes: AUTH_EXPIRED · BACKEND_UNAVAILABLE · FORBIDDEN · NOT_FOUND · VALIDATION · UNKNOWN.
 *
 * The client NEVER returns a success result on failure (no fake success).
 */

export type ApiErrorCode =
  | 'AUTH_EXPIRED'
  | 'BACKEND_UNAVAILABLE'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'UNKNOWN';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  /** Correlation id captured from the `x-request-id` response header (TO_VERIFY). */
  requestId?: string;
  /** HTTP status; 0 for transport/network failures with no response. */
  httpStatus: number;
}

/** Discriminated result — callers must branch on `ok` before using data. */
export type ApiResult<T> =
  | {ok: true; data: T; requestId?: string}
  | {ok: false; error: ApiError};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  /** Path appended to the configured base URL, e.g. "/auth/login". */
  path: string;
  body?: unknown;
  /** Extra headers (Authorization is injected by the client, not here). */
  headers?: Record<string, string>;
  /** When false, the Bearer token is not attached (e.g. the login call). */
  authenticated?: boolean;
  /** Abort timeout in ms. */
  timeoutMs?: number;
}

/** Supplies the current bearer token (by reference) to the client. */
export type TokenProvider = () => string | null | Promise<string | null>;

/** Type guard for ApiError-shaped values. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'httpStatus' in value
  );
}

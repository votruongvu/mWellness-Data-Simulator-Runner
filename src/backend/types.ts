/**
 * Backend client base types.
 *
 * MR-B reconcile: the real MWDS error envelope is carried in the RESPONSE BODY:
 *   { "error": { "code": string, "message": string, "request_id": string,
 *                "details"?: {path,code,message,expected,actual,severity}[] } }
 *
 * The local ApiError keeps a transport-level classification (`code` is our
 * normalized ApiErrorCode) AND surfaces the backend's own machine code
 * (`backendCode`) + request id (`requestId`, from the body, falling back to the
 * `x-request-id` header) + structured `details` when present. The client NEVER
 * returns a success result on failure (no fake success).
 */

/** Normalized transport-level classification used by the app's UI states. */
export type ApiErrorCode =
  | 'AUTH_EXPIRED'
  | 'BACKEND_UNAVAILABLE'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'UNKNOWN';

/** One structured validation detail from the backend error envelope. */
export interface ApiErrorDetail {
  path?: string;
  code?: string;
  message?: string;
  expected?: unknown;
  actual?: unknown;
  severity?: string;
}

export interface ApiError {
  /** Normalized transport classification (drives the app's error UI). */
  code: ApiErrorCode;
  /** Human-readable message (from the backend envelope when available). */
  message: string;
  /** The backend's own machine code from `error.code`, when present. */
  backendCode?: string;
  /** Correlation id: `error.request_id` from the body, else the `x-request-id` header. */
  requestId?: string;
  /** HTTP status; 0 for transport/network failures with no response. */
  httpStatus: number;
  /** Structured validation details from `error.details`, when present. */
  details?: ApiErrorDetail[];
}

/** The raw backend error envelope shape (response body on any error). */
export interface BackendErrorEnvelope {
  error: {
    code?: string;
    message?: string;
    request_id?: string;
    details?: ApiErrorDetail[];
  };
}

/** Discriminated result — callers must branch on `ok` before using data. */
export type ApiResult<T> =
  | {ok: true; data: T; requestId?: string}
  | {ok: false; error: ApiError};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  /** Path appended to the configured base URL, e.g. "/api/v1/auth/login". */
  path: string;
  body?: unknown;
  /** Query params; appended as a URL-encoded query string. */
  query?: Record<string, string | number | boolean | undefined>;
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

/** Type guard for the backend error envelope `{ error: { ... } }`. */
export function isBackendErrorEnvelope(
  value: unknown,
): value is BackendErrorEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as {error: unknown}).error === 'object' &&
    (value as {error: unknown}).error !== null
  );
}

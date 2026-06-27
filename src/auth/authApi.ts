/**
 * Auth API calls against the MWDS backend.
 *
 * Reconciled to the VERIFIED MWDS routes (read-only + login/logout only):
 *   POST /api/v1/auth/login  body { username, password }
 *        -> 200 { token, token_type: "Bearer", expires_at: ISO, user }
 *        -> 401/400 error envelope.
 *   GET  /api/v1/auth/me     -> { user }
 *   POST /api/v1/auth/logout -> 204
 *
 * There is NO refresh route in the verified contract; a refresh helper is
 * intentionally absent (we do not invent endpoints). No backend configured =>
 * apiRequest returns BACKEND_UNAVAILABLE. No call here fabricates a session on
 * failure (NO_FAKE_SUCCESS / BACKEND_API_GATE).
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';

/** Backend user shape (subset we rely on) — real MWDS fields. */
export interface BackendUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  token_type: 'Bearer';
  /** ISO-8601 timestamp when the token expires. */
  expires_at: string;
  user: BackendUser;
}

export interface MeResponse {
  user: BackendUser;
}

/** Authenticate against the MWDS backend. The login call is unauthenticated. */
export function login(
  username: string,
  password: string,
): Promise<ApiResult<LoginResponse>> {
  return apiRequest<LoginResponse>({
    method: 'POST',
    path: '/api/v1/auth/login',
    authenticated: false,
    body: {username, password},
  });
}

/** Validate/restore the current session (uses the stored bearer token). */
export function me(): Promise<ApiResult<MeResponse>> {
  return apiRequest<MeResponse>({
    method: 'GET',
    path: '/api/v1/auth/me',
    authenticated: true,
  });
}

/** Invalidate the session server-side; local clear happens in the session layer. */
export function logout(): Promise<ApiResult<void>> {
  return apiRequest<void>({
    method: 'POST',
    path: '/api/v1/auth/logout',
    authenticated: true,
  });
}

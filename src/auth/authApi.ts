/**
 * MR-A — Auth API calls against the MWDS backend.
 *
 * Shapes follow the MR-A contract baseline (TO_VERIFY against real MWDS):
 *   POST /auth/login  -> { access_token, refresh_token?, expires_in, user }
 *   GET  /auth/me     -> { user }
 *   POST /auth/logout
 *   POST /auth/refresh (optional; kept minimal)
 *
 * No backend configured => apiRequest returns BACKEND_UNAVAILABLE. No call here
 * fabricates a session on failure (NO_FAKE_SUCCESS / BACKEND_API_GATE).
 */

import {apiRequest} from '../backend/apiClient';
import {ApiResult} from '../backend/types';

/** Backend user shape (subset we rely on). */
export interface BackendUser {
  id: string;
  display_name?: string;
  email?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  /** Seconds until the access token expires. */
  expires_in: number;
  user: BackendUser;
}

export interface MeResponse {
  user: BackendUser;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

/** Authenticate against the MWDS backend. The login call is unauthenticated. */
export function login(
  email: string,
  password: string,
): Promise<ApiResult<LoginResponse>> {
  return apiRequest<LoginResponse>({
    method: 'POST',
    path: '/auth/login',
    authenticated: false,
    body: {email, password},
  });
}

/** Validate/restore the current session (uses the stored bearer token). */
export function me(): Promise<ApiResult<MeResponse>> {
  return apiRequest<MeResponse>({
    method: 'GET',
    path: '/auth/me',
    authenticated: true,
  });
}

/** Invalidate the session server-side; local clear happens in the session layer. */
export function logout(): Promise<ApiResult<void>> {
  return apiRequest<void>({
    method: 'POST',
    path: '/auth/logout',
    authenticated: true,
  });
}

/** Optional refresh (kept minimal in MR-A; only used if the backend supports it). */
export function refresh(
  refreshToken: string,
): Promise<ApiResult<RefreshResponse>> {
  return apiRequest<RefreshResponse>({
    method: 'POST',
    path: '/auth/refresh',
    authenticated: false,
    body: {refresh_token: refreshToken},
  });
}

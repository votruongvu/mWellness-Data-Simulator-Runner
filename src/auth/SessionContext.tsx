/**
 * MR-A — Session context / provider.
 *
 * Single source of auth/session truth for the app. States:
 *   booting        — restoring on app start
 *   unauthenticated — no valid session (or restore failed cleanly)
 *   authenticated  — valid session, user known
 *   expired        — token rejected by backend (AUTH_EXPIRED) -> design E01
 *
 * Hard rules:
 *  - NO fake authenticated state. login() only sets 'authenticated' after a
 *    real backend success + a real secure-storage save. With no backend, login
 *    surfaces BACKEND_UNAVAILABLE and stays unauthenticated.
 *  - Tokens never logged; any logging routes through redaction.
 *  - Tokens persist ONLY via secureStorage (keychain), never AsyncStorage.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ApiError} from '../backend/types';
import {setTokenProvider} from '../backend/apiClient';
import {getEnv, hasBackend} from '../config/env';
import {redactToString} from '../shared/redaction';
import {
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  type BackendUser,
} from './authApi';
import {
  clearSession,
  getAccessToken,
  isExpired,
  loadSession,
  saveSession,
  StoredSession,
} from './secureStorage';

export type SessionStatus =
  | 'booting'
  | 'unauthenticated'
  | 'authenticated'
  | 'expired';

export interface SessionUser {
  userId: string;
  username: string;
  name: string;
  role: string;
}

export interface SessionState {
  status: SessionStatus;
  user?: SessionUser;
  /** Env snapshot for badges. */
  env: {apiBaseUrl: string | null; envLabel: string};
}

export interface SessionContextValue extends SessionState {
  /** Last login/restore error, surfaced to Login + Backend-Unavailable states. */
  lastError?: ApiError;
  /** True if a real backend base URL is configured. */
  backendConfigured: boolean;
  restore: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Clear the surfaced error (e.g. on retry). */
  clearError: () => void;
  /**
   * Flip to the expired state from anywhere (e.g. a read screen that gets an
   * AUTH_EXPIRED while loading). Clears the now-invalid stored session and
   * re-routes to E01. Never used to fabricate or hide a session.
   */
  expireSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

/** Map a backend user to the app's session-user shape. */
function toSessionUser(bu: BackendUser): SessionUser {
  return {userId: bu.id, username: bu.username, name: bu.name, role: bu.role};
}

/** Dev-safe log that always redacts. No raw tokens ever reach the log. */
function safeLog(scope: string, detail: unknown): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[session] ${scope}`, redactToString(detail));
  }
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const env = getEnv();
  const [status, setStatus] = useState<SessionStatus>('booting');
  const [user, setUser] = useState<SessionUser | undefined>(undefined);
  const [lastError, setLastError] = useState<ApiError | undefined>(undefined);

  // Keep the latest stored session for the token provider without re-renders.
  const storedRef = useRef<StoredSession | null>(null);

  // Register the API client's token source once. Reads from secure storage.
  useEffect(() => {
    setTokenProvider(() => getAccessToken());
  }, []);

  const clearError = useCallback(() => setLastError(undefined), []);

  const restore = useCallback(async () => {
    setStatus('booting');
    setLastError(undefined);

    // No backend => cannot validate a session; present as unauthenticated.
    if (!hasBackend(env)) {
      storedRef.current = null;
      setUser(undefined);
      setStatus('unauthenticated');
      return;
    }

    const stored = await loadSession();
    if (!stored || isExpired(stored)) {
      storedRef.current = null;
      setUser(undefined);
      setStatus(stored ? 'expired' : 'unauthenticated');
      return;
    }

    storedRef.current = stored;
    // Validate the token against the backend.
    const result = await apiMe();
    if (result.ok) {
      setUser(toSessionUser(result.data.user));
      setStatus('authenticated');
      return;
    }

    // Honest failure handling — never keep a stale "authenticated".
    if (result.error.code === 'AUTH_EXPIRED') {
      await clearSession();
      storedRef.current = null;
      setUser(undefined);
      setStatus('expired');
    } else {
      setLastError(result.error);
      setUser(undefined);
      setStatus('unauthenticated');
    }
    safeLog('restore failed', result.error);
  }, [env]);

  const login = useCallback(
    async (username: string, password: string) => {
      setLastError(undefined);

      const result = await apiLogin(username, password);
      if (!result.ok) {
        // No fake auth. Surface the typed error (BACKEND_UNAVAILABLE if no
        // backend, AUTH_EXPIRED/VALIDATION/etc otherwise) and stay out.
        setLastError(result.error);
        setStatus(prev => (prev === 'authenticated' ? 'authenticated' : 'unauthenticated'));
        safeLog('login failed', result.error);
        return;
      }

      const {token, expires_at, user: bu} = result.data;
      // expires_at is an ISO timestamp; parse to epoch ms. If unparseable,
      // treat the session as already expired rather than inventing a lifetime.
      const expiresAt = Date.parse(expires_at);
      const session: StoredSession = {
        token,
        expiresAt: Number.isNaN(expiresAt) ? 0 : expiresAt,
        user: {
          userId: bu.id,
          username: bu.username,
          name: bu.name,
          role: bu.role,
        },
      };
      // Persist ONLY to secure storage before flipping to authenticated.
      await saveSession(session);
      storedRef.current = session;
      setUser(toSessionUser(bu));
      setStatus('authenticated');
    },
    [],
  );

  const logout = useCallback(async () => {
    // Best-effort server logout; local clear is authoritative.
    try {
      await apiLogout();
    } catch (err) {
      safeLog('logout api error', err);
    }
    await clearSession();
    storedRef.current = null;
    setUser(undefined);
    setLastError(undefined);
    setStatus('unauthenticated');
  }, []);

  const expireSession = useCallback(async () => {
    await clearSession();
    storedRef.current = null;
    setUser(undefined);
    setStatus('expired');
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      env: {apiBaseUrl: env.apiBaseUrl, envLabel: env.envLabel},
      lastError,
      backendConfigured: hasBackend(env),
      restore,
      login,
      logout,
      clearError,
      expireSession,
    }),
    [status, user, env, lastError, restore, login, logout, clearError, expireSession],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Hook to read the session. Throws if used outside the provider. */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}

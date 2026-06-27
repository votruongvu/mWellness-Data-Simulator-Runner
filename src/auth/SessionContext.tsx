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
import {login as apiLogin, logout as apiLogout, me as apiMe} from './authApi';
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
  displayName?: string;
  email?: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Clear the surfaced error (e.g. on retry). */
  clearError: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

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
      setUser({
        userId: result.data.user.id,
        displayName: result.data.user.display_name,
        email: result.data.user.email,
      });
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
    async (email: string, password: string) => {
      setLastError(undefined);

      const result = await apiLogin(email, password);
      if (!result.ok) {
        // No fake auth. Surface the typed error (BACKEND_UNAVAILABLE if no
        // backend, AUTH_EXPIRED/VALIDATION/etc otherwise) and stay out.
        setLastError(result.error);
        setStatus(prev => (prev === 'authenticated' ? 'authenticated' : 'unauthenticated'));
        safeLog('login failed', result.error);
        return;
      }

      const {access_token, refresh_token, expires_in, user: bu} = result.data;
      const session: StoredSession = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + expires_in * 1000,
        user: {userId: bu.id, displayName: bu.display_name},
      };
      // Persist ONLY to secure storage before flipping to authenticated.
      await saveSession(session);
      storedRef.current = session;
      setUser({
        userId: bu.id,
        displayName: bu.display_name,
        email: bu.email,
      });
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
    }),
    [status, user, env, lastError, restore, login, logout, clearError],
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

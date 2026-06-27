/**
 * MR-A — Secure session storage (react-native-keychain).
 *
 * ADR-MWR-006 + safety gate: tokens live ONLY in OS-backed secure storage
 * (iOS Keychain / Android Keystore via react-native-keychain). NEVER in plain
 * AsyncStorage, NEVER logged, NEVER committed. The rest of the app references
 * the token by reading it through here on demand.
 *
 * The persisted blob holds: accessToken (+ optional refreshToken), expiry, and
 * a small user reference. It is stored under a fixed service name.
 */

import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.mwellness.mobilerunner.session';
/** Fixed username slot; the secret payload carries the real data. */
const ACCOUNT = 'mwr-session';

/** Minimal user reference persisted alongside the token. */
export interface StoredUserRef {
  userId: string;
  displayName?: string;
}

/** What we persist in secure storage. The token is the sensitive part. */
export interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  /** Epoch milliseconds when the access token expires. */
  expiresAt: number;
  user: StoredUserRef;
}

/** Persist the session into the OS keychain/keystore. Never logs the token. */
export async function saveSession(session: StoredSession): Promise<void> {
  const payload = JSON.stringify(session);
  await Keychain.setGenericPassword(ACCOUNT, payload, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/** Load the session, or null if absent/unreadable. Never logs the token. */
export async function loadSession(): Promise<StoredSession | null> {
  const result = await Keychain.getGenericPassword({service: SERVICE});
  if (!result) {
    return null;
  }
  try {
    const parsed = JSON.parse(result.password) as StoredSession;
    if (!parsed.accessToken || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    // Corrupt payload: treat as no session (do NOT echo contents).
    return null;
  }
}

/** Read just the bearer token (used by the API client's token provider). */
export async function getAccessToken(): Promise<string | null> {
  const session = await loadSession();
  return session?.accessToken ?? null;
}

/** Clear the stored session from secure storage. */
export async function clearSession(): Promise<void> {
  await Keychain.resetGenericPassword({service: SERVICE});
}

/** True if the stored expiry is in the past. */
export function isExpired(session: StoredSession, now: number = Date.now()): boolean {
  return session.expiresAt <= now;
}

/**
 * MR-A — Foundation. Lightweight environment seam.
 *
 * A real backend base URL is injected at build time from the gitignored `.env`
 * via react-native-dotenv (the `@env` module). It is intentionally NOT committed
 * (see `.env.example`) and NOT defaulted to any reachable host: when `.env` is
 * absent/empty, `API_BASE_URL` is `undefined` and `apiBaseUrl` resolves to
 * `null` — there is no backend, and the auth/session layer must surface
 * BACKEND_UNAVAILABLE rather than fabricate a session.
 *
 * Scope guard: this is a single env BADGE + base-URL seam only. There is no
 * local/dev/staging/prod management screen in MR-A (design S02 is deferred).
 */

import {API_BASE_URL, ENV_LABEL} from '@env';

function cleanString(value: string | undefined): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export interface EnvConfig {
  /** Backend base URL. `null` => no backend configured (login must fail honestly). */
  apiBaseUrl: string | null;
  /** Short label shown in the env badge, e.g. "dev". */
  envLabel: string;
}

/**
 * Default config sourced from the gitignored `.env` (`@env`). `apiBaseUrl` is
 * `null` when `.env` is absent/empty — no reachable backend, no committed
 * default endpoint (login then fails honestly with BACKEND_UNAVAILABLE).
 */
const DEFAULT_ENV: EnvConfig = {
  apiBaseUrl: cleanString(API_BASE_URL),
  envLabel: cleanString(ENV_LABEL) ?? 'dev',
};

let activeEnv: EnvConfig = DEFAULT_ENV;

/**
 * Build/config-time injection seam. Call once at startup (or from a generated
 * config module) to point the runner at a real MWDS backend. No-op by default.
 */
export function configureEnv(overrides: Partial<EnvConfig>): void {
  activeEnv = {...activeEnv, ...overrides};
}

/** Read the active environment configuration. */
export function getEnv(): EnvConfig {
  return activeEnv;
}

/** True when a backend base URL is configured (non-null, non-empty). */
export function hasBackend(env: EnvConfig = getEnv()): boolean {
  return typeof env.apiBaseUrl === 'string' && env.apiBaseUrl.trim().length > 0;
}

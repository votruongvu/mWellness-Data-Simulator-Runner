/**
 * MR-A — Foundation. Lightweight environment seam.
 *
 * A real backend base URL is injected at build/config time (e.g. via a native
 * build flavor, an `.env`-driven generated module, or a CI substitution step).
 * It is intentionally NOT committed and NOT defaulted to any reachable host:
 * with `apiBaseUrl === null` there is no backend, and the auth/session layer
 * must surface BACKEND_UNAVAILABLE rather than fabricate a session.
 *
 * Scope guard: this is a single env BADGE + base-URL seam only. There is no
 * local/dev/staging/prod management screen in MR-A (design S02 is deferred).
 */

export interface EnvConfig {
  /** Backend base URL. `null` => no backend configured (login must fail honestly). */
  apiBaseUrl: string | null;
  /** Short label shown in the env badge, e.g. "dev". */
  envLabel: string;
}

/**
 * Default config. `apiBaseUrl` is deliberately null — there is no reachable
 * backend in this build and no committed default endpoint.
 */
const DEFAULT_ENV: EnvConfig = {
  apiBaseUrl: null,
  envLabel: 'dev',
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

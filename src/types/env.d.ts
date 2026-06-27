/**
 * Ambient type for the `@env` module provided by react-native-dotenv at build
 * time (values come from the gitignored `.env`). Both are optional — if `.env`
 * is absent/empty the values are `undefined` and `src/config/env.ts` falls back
 * to `apiBaseUrl: null` (honest BACKEND_UNAVAILABLE, never a fabricated session).
 */
declare module '@env' {
  export const API_BASE_URL: string | undefined;
  export const ENV_LABEL: string | undefined;
}

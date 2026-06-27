/**
 * MR-A — Navigation route params.
 *
 * MR-A surface only: Splash, Login, Dashboard, Settings, and the two error
 * states (SessionExpired, BackendUnavailable). Test-case / version / plan /
 * permission / run routes are deferred to later phases and intentionally absent.
 */

import type {ApiErrorCode} from '../backend/types';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Dashboard: undefined;
  Settings: undefined;
  SessionExpired: undefined;
  BackendUnavailable: {
    /** Endpoint that was attempted (base URL), for the E02 detail. */
    endpoint?: string | null;
    code?: ApiErrorCode;
    message?: string;
    requestId?: string;
  };
};

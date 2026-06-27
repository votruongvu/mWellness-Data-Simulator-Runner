/**
 * Navigation route params.
 *
 * MR-A surface: Splash, Login, Dashboard, Settings, and the two error states
 * (SessionExpired, BackendUnavailable).
 *
 * MR-B adds the read-only loading + dry-run-planner surface:
 *   TestCaseList (P05) -> TestCaseDetail (P06) -> VersionScenarios (P07)
 *   -> ExecutionPlanPreview (P08) -> DryRunResult (P09).
 * Permission / real-write / run routes remain deferred to later phases and are
 * intentionally absent.
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

  // MR-B — read-only loading + dry-run planner.
  TestCaseList: undefined;
  TestCaseDetail: {
    testCaseId: string;
    /** Optional name for an immediate header before detail loads. */
    name?: string;
  };
  VersionScenarios: {
    testCaseId: string;
    versionId: string;
  };
  ExecutionPlanPreview: {
    testCaseId: string;
    versionId: string;
  };
  DryRunResult: {
    testCaseId: string;
    versionId: string;
  };
};

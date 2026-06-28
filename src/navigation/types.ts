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
    /**
     * MR-C — when 'operation', the preview loads the backend F8 runnable
     * payload and renders operation-level (concrete) detail. Absent/'metric'
     * keeps the MR-B metric-level fallback path.
     */
    planSource?: 'operation' | 'metric';
  };
  DryRunResult: {
    testCaseId: string;
    versionId: string;
    /** MR-C — same operation-level vs metric-level selector as the preview. */
    planSource?: 'operation' | 'metric';
  };

  // MR-C (MWR-MRC-002) — iOS HealthKit capability + permission PREVIEW.
  // No write path; the OS prompt is gated (#1/#3/#9). Final UX/copy is gate-pending.
  HealthPermission: undefined;

  // MR-C-003 — iOS guarded HealthKit write POC (reached after a dry-run).
  // Real write only after the five-gate chain + explicit confirmation; minimal set.
  HealthWritePoc: {
    testCaseId: string;
    versionId: string;
    /** Set true when navigated from a completed dry-run. */
    dryRunCompleted?: boolean;
  };
};

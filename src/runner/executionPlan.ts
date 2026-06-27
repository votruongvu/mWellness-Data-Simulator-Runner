/**
 * MR-B — Execution plan model (types only; pure data).
 *
 * The execution plan is a deterministic, read-only interpretation of a backend
 * version + its ordered scenarios + catalog metric metadata. In MR-B it is
 * built at the VERSION-METRIC level: one PlanOperation per version metric,
 * classified using the catalog's authoritative `selectable`/`reason`.
 *
 * Honest boundaries baked into the model:
 *  - `permission_missing` is NOT decided here — capability/permission checks are
 *    deferred to MR-D. The interpreter never emits it; the type lists it only so
 *    later phases extend the same union.
 *  - Operation COUNTS are at the metric level. Per-scenario per-operation
 *    payload detail (values/timestamps/segments) is NOT available in MR-B read
 *    scope; the plan marks it deferred to MR-C and never fabricates it.
 *  - No native write, no Date.now, no network is involved in building a plan.
 */

import {Version} from '../testCases/types';

/** Operation classification at the version-metric level. */
export type OperationStatus =
  | 'writable' // catalog marks the metric selectable for this destination+profiles
  | 'unsupported' // catalog reason says the platform/profile can't take it
  | 'invalid' // the owning scenario is backend-invalid
  | 'skipped' // metadata absent / not applicable; surfaced, never silently dropped
  | 'permission_missing'; // DEFERRED to MR-D — never emitted by the MR-B interpreter

/** Stable machine reason codes (align with design S04 / safety matrix). */
export type ReasonCode =
  | 'OK'
  | 'METRIC_NOT_WRITABLE_ON_PLATFORM'
  | 'METRIC_INACTIVE'
  | 'PROFILE_NOT_SUPPORTED'
  | 'NO_PROFILE_SUPPORTS_METRIC'
  | 'METRIC_METADATA_MISSING'
  | 'SCENARIO_INVALID'
  // Deferred — not emitted in MR-B:
  | 'PERMISSION_MISSING';

/** One planned operation for a (scenario, metric) pair at metric granularity. */
export interface PlanOperation {
  /** Scenario this operation belongs to (for ordered grouping). */
  scenarioSlug: string;
  scenarioName: string;
  /** Scenario order position (1-based) as resolved from order_index. */
  scenarioOrder: number;
  metricSlug: string;
  metricName: string;
  status: OperationStatus;
  reasonCode: ReasonCode;
  /** Human-readable explanation (never fabricated values). */
  detail: string;
}

/** Per-scenario grouping of operations, in backend order. */
export interface PlanScenarioGroup {
  scenarioSlug: string;
  scenarioName: string;
  scenarioOrder: number;
  validationStatus: 'valid' | 'invalid';
  operations: PlanOperation[];
}

/** Rolled-up metric-level totals. */
export interface PlanTotals {
  writable: number;
  unsupported: number;
  invalid: number;
  skipped: number;
  /** Always 0 in MR-B (permission checks are MR-D). */
  permissionMissing: number;
  /** Total operations classified (metric level). */
  total: number;
}

/** The full execution plan (mode is always dry-run-capable in MR-B). */
export interface ExecutionPlan {
  testCaseId: string;
  versionId: string;
  versionNumber: number;
  destinationSlug: string;
  /** Compact target label, e.g. "iOS · Apple Health". */
  targetLabel: string;
  device: 'iOS' | 'Android' | 'Unknown';
  groups: PlanScenarioGroup[];
  totals: PlanTotals;
  /**
   * True — per-scenario per-operation payload detail (values/timestamps) is not
   * in MR-B read scope; counts here are metric-level estimates, deferred to MR-C.
   */
  operationDetailDeferred: boolean;
  /** Explicit note rendered by the preview. */
  boundaryNote: string;
}

/** Convenience: empty totals. */
export function emptyTotals(): PlanTotals {
  return {
    writable: 0,
    unsupported: 0,
    invalid: 0,
    skipped: 0,
    permissionMissing: 0,
    total: 0,
  };
}

/** Type-only re-export anchor so the version type is co-located. */
export type {Version};

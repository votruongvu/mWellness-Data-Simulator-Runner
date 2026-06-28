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

/* ------------------------------------------------------------------------- *
 * MR-C — F8 OPERATION-LEVEL execution plan (concrete operations).
 *
 * The MR-B model above is metric-level (no payload). MR-C consumes the backend
 * F8 runnable payload, which carries CONCRETE per-operation detail (value,
 * unit, time model, idempotency key). These types add that operation-level
 * granularity WITHOUT changing the MR-B metric-level types, which remain the
 * read-only fallback/diagnostic path.
 *
 * Rules baked in:
 *  - Backend IDs (operation_id, idempotency_key), scenario order_index, units,
 *    values and timestamps are preserved verbatim — never fabricated.
 *  - `permission_missing` is RESERVED here (capability/permission is MR-D) and
 *    is never emitted by the operation-level builder.
 *  - An operation missing a required concrete field is `invalid` with a reason
 *    code — surfaced, never silently dropped, never given a fabricated value.
 * ------------------------------------------------------------------------- */

/** Operation-level reason codes (superset of the MR-B reason codes). */
export type OperationReasonCode =
  | 'OK'
  | 'MISSING_VALUE'
  | 'MISSING_UNIT'
  | 'MISSING_TIME'
  | 'INVALID_TIME_MODEL'
  | 'MISSING_IDEMPOTENCY_KEY'
  | 'MISSING_METRIC_REF'
  | 'MISSING_PROVENANCE'
  | 'METRIC_NOT_WRITABLE_ON_PLATFORM'
  | 'METRIC_INACTIVE'
  | 'METRIC_METADATA_MISSING'
  // Reserved — never emitted by the operation-level builder (MR-D):
  | 'PERMISSION_MISSING';

/** Raw relative time offsets, preserved verbatim from the backend payload. */
export interface PlanRelativeTime {
  model: string;
  startOffsetMinutes: number;
  endOffsetMinutes: number;
}

/** One concrete planned operation, preserving backend provenance verbatim. */
export interface PlanConcreteOperation {
  /** Backend operation id — preserved verbatim. */
  operationId: string;
  /** Owning backend scenario id — preserved verbatim. */
  scenarioId: string;
  /** Metric reference (at least one present in a valid op). */
  metricSlug?: string;
  metricId?: string;
  destinationSlug?: string;
  /**
   * Target profiles, preserved as an array (live shape). Never collapsed: if
   * more than one profile is present, all are kept and the native writer (later
   * phase, MR-D) decides per-profile handling.
   */
  profileSlugs?: string[];
  operationKind: string;
  /** Concrete value — verbatim from the backend; undefined only when missing. */
  value?: number | string;
  unit?: string;
  /** Raw relative time offsets (verbatim) — absolute times resolved at write. */
  time?: PlanRelativeTime;
  /** Resolved absolute start — present ONLY when a base instant was injected. */
  startTimeIso?: string;
  /** Resolved absolute end — present ONLY when a base instant was injected. */
  endTimeIso?: string;
  /** Stable backend idempotency key — preserved verbatim. */
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  status: OperationStatus;
  reasonCode: OperationReasonCode;
  detail: string;
}

/** Per-scenario grouping of concrete operations, in backend order. */
export interface PlanConcreteScenarioGroup {
  scenarioId: string;
  scenarioSlug?: string;
  scenarioName: string;
  /**
   * Scenario order position. The backend order_index may be null (live shape);
   * builders then use the scenario's array position (0-based) as the order.
   */
  scenarioOrder: number;
  operations: PlanConcreteOperation[];
}

/** Rolled-up operation-level totals (concrete operations). */
export interface ConcretePlanTotals {
  writable: number;
  unsupported: number;
  invalid: number;
  skipped: number;
  /** Always 0 here (permission checks are MR-D). */
  permissionMissing: number;
  /** Total concrete operations classified. */
  total: number;
}

/**
 * The OPERATION-LEVEL execution plan built from the F8 runnable payload.
 * `operationDetailDeferred` is false — concrete detail IS present here.
 */
export interface ConcreteExecutionPlan {
  /** Discriminator so screens can tell an F8 plan from an MR-B metric plan. */
  kind: 'operation';
  testCaseId: string;
  versionId: string;
  versionNumber: number;
  /** Backend payload status (e.g. "ready"). */
  payloadStatus: string;
  /** ISO time the backend generated the payload. */
  generatedAt: string;
  destinationSlug: string;
  targetLabel: string;
  device: 'iOS' | 'Android' | 'Unknown';
  groups: PlanConcreteScenarioGroup[];
  totals: ConcretePlanTotals;
  /** False — concrete per-operation detail is present (not deferred). */
  operationDetailDeferred: false;
  boundaryNote: string;
}

/** Convenience: empty concrete totals. */
export function emptyConcreteTotals(): ConcretePlanTotals {
  return {
    writable: 0,
    unsupported: 0,
    invalid: 0,
    skipped: 0,
    permissionMissing: 0,
    total: 0,
  };
}

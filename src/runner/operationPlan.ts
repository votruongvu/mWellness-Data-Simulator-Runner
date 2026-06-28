/**
 * MR-C — F8 operation-level execution-plan builder (PURE, DETERMINISTIC).
 *
 * Input : a backend F8 RunnablePayload (concrete operations, RELATIVE time) +
 *         options (optional catalog Metric[] metadata; optional injected base
 *         instant for relative→absolute time resolution).
 * Output: a ConcreteExecutionPlan classifying each CONCRETE operation, grouped
 *         by scenario in backend array order (order_index may be null).
 *
 * This is the preferred MR-C / native-readiness input. The MR-B metric-level
 * interpreter.ts path is kept as a read-only fallback/diagnostic (not deleted).
 *
 * Determinism rules (load-bearing):
 *  - NO Date.now / randomness / network / native calls. The base instant used
 *    to resolve relative time is INJECTED via options — never read from the
 *    clock here. Same payload + same options -> same plan (replay-safe).
 *  - NO fabricated value/unit/time/idempotency. An operation missing a required
 *    concrete field (or with an unsupported/invalid time model) is `invalid`
 *    with a reason code — surfaced, never dropped, never given a fallback.
 *  - Backend IDs (operation_id, idempotency_key), units, values, relative time
 *    offsets, destination/profile provenance are preserved verbatim.
 *  - profile_slugs is preserved AS AN ARRAY (never collapsed); when more than
 *    one profile is present, all are kept for the native writer to handle later.
 *  - Catalog metadata (when supplied) only DOWNGRADES a non-selectable metric to
 *    `unsupported`; it never invents writability and never re-decides for an
 *    already-invalid operation.
 *  - `permission_missing` is NEVER emitted here (capability/permission is MR-D).
 */

import {Metric} from '../catalog/types';
import {platformForDestination} from '../shared/platform';
import {
  RunnableOperation,
  RunnablePayload,
  RunnableScenario,
  validateRunnablePayload,
} from '../testCases/runnablePayloadTypes';
import {
  ConcreteExecutionPlan,
  ConcretePlanTotals,
  emptyConcreteTotals,
  OperationReasonCode,
  OperationStatus,
  PlanConcreteOperation,
  PlanConcreteScenarioGroup,
} from './executionPlan';
import {resolveRelativeTime} from './timeModel';

const BOUNDARY_NOTE =
  'Operation-level plan from the backend F8 runnable payload. Values, units, ' +
  'relative time offsets and idempotency keys are the backend-authored ' +
  'concrete contract (never fabricated on device). Absolute times are resolved ' +
  'only from an injected base instant. Capability and permission checks are ' +
  'deferred to MR-D; this plan never writes health data.';

/** Options for building the operation-level plan. */
export interface BuildPlanOptions {
  /** Catalog metric metadata for the version context (downgrade-only check). */
  catalogMetrics?: Metric[];
  /**
   * Injected base instant (epoch ms) to resolve RELATIVE time to absolute ISO.
   * When omitted, absolute times are left undefined (the op stays valid — the
   * relative offsets are present; resolution is deferred to the write-time
   * clock). NEVER read from Date.now here — the clock is injected.
   */
  baseInstantMs?: number;
}

/** Maps an issue code to the operation-level reason code (1:1). */
function reasonForIssue(code: string): OperationReasonCode {
  switch (code) {
    case 'MISSING_VALUE':
      return 'MISSING_VALUE';
    case 'MISSING_UNIT':
      return 'MISSING_UNIT';
    case 'MISSING_TIME':
      return 'MISSING_TIME';
    case 'INVALID_TIME_MODEL':
      return 'INVALID_TIME_MODEL';
    case 'MISSING_IDEMPOTENCY_KEY':
      return 'MISSING_IDEMPOTENCY_KEY';
    case 'MISSING_METRIC_REF':
      return 'MISSING_METRIC_REF';
    case 'MISSING_PROVENANCE':
      return 'MISSING_PROVENANCE';
    default:
      return 'OK';
  }
}

/**
 * Resolve catalog metadata for an operation's metric, preferring metric_slug.
 * Returns undefined when no metadata is available for this context.
 */
function metaForOp(
  op: RunnableOperation,
  metaBySlug: Map<string, Metric>,
): Metric | undefined {
  if (op.metric_slug) {
    return metaBySlug.get(op.metric_slug);
  }
  return undefined;
}

/**
 * Classify a single concrete operation. `firstIssueCode` is the first tagged
 * issue for this operation (if any); a tagged issue dominates -> `invalid`.
 */
function classifyOperation(
  op: RunnableOperation,
  firstIssueCode: string | undefined,
  metaBySlug: Map<string, Metric>,
): {status: OperationStatus; reasonCode: OperationReasonCode; detail: string} {
  // A tagged validation issue dominates -> invalid, never fabricated.
  if (firstIssueCode) {
    return {
      status: 'invalid',
      reasonCode: reasonForIssue(firstIssueCode),
      detail: `Operation has a validation issue (${firstIssueCode}); surfaced as invalid, not fabricated.`,
    };
  }

  // Optional catalog cross-check: only downgrades, never upgrades.
  const meta = metaForOp(op, metaBySlug);
  if (meta) {
    if (!meta.is_active) {
      return {
        status: 'unsupported',
        reasonCode: 'METRIC_INACTIVE',
        detail: `Catalog marks ${meta.display_name} inactive for this context.`,
      };
    }
    if (!meta.selectable) {
      return {
        status: 'unsupported',
        reasonCode: 'METRIC_NOT_WRITABLE_ON_PLATFORM',
        detail: `Catalog marks ${meta.display_name} not selectable (${meta.reason || 'unsupported'}).`,
      };
    }
  }

  // No issue, and (if known) catalog-selectable -> writable.
  return {
    status: 'writable',
    reasonCode: 'OK',
    detail: 'Concrete operation is complete; would be attempted in a real run.',
  };
}

/**
 * Build the OPERATION-LEVEL execution plan from an F8 runnable payload.
 *
 * Pure and deterministic. Scenarios are emitted by backend array position
 * (order_index may be null in the live data); operations keep their array
 * order. Every concrete operation becomes one PlanConcreteOperation, preserving
 * backend ids/keys/values/relative-time-offsets/profile-array verbatim.
 *
 * @param payload  the backend F8 runnable payload (concrete operations).
 * @param options  catalog metadata (downgrade-only) + injected base instant.
 */
export function buildExecutionPlanFromPayload(
  payload: RunnablePayload,
  options: BuildPlanOptions = {},
): ConcreteExecutionPlan {
  const {catalogMetrics, baseInstantMs} = options;
  const {opIssues} = validateRunnablePayload(payload);

  // First issue per operation_id (a tagged issue dominates classification).
  const firstIssueByOp = new Map<string, string>();
  for (const it of opIssues) {
    if (!firstIssueByOp.has(it.operation_id)) {
      firstIssueByOp.set(it.operation_id, it.code);
    }
  }

  const metaBySlug = new Map<string, Metric>();
  for (const m of catalogMetrics ?? []) {
    metaBySlug.set(m.slug, m);
  }

  // Destination: prefer the top-level payload field (live shape), then fall
  // back to the first operation that declares one. 'unknown' only affects the
  // display label, never classification.
  const destinationSlug = deriveDestinationSlug(payload);
  const target = platformForDestination(destinationSlug);

  // Order by array position; order_index may be null in the live data.
  const totals = emptyConcreteTotals();
  const groups: PlanConcreteScenarioGroup[] = payload.scenarios.map(
    (scenario, scenarioIndex) => {
      const operations: PlanConcreteOperation[] = scenario.operations.map(op => {
        const firstIssue = firstIssueByOp.get(op.operation_id);
        const {status, reasonCode, detail} = classifyOperation(
          op,
          firstIssue,
          metaBySlug,
        );
        bumpTotal(totals, status);
        return buildPlanOperation(op, status, reasonCode, detail, baseInstantMs);
      });

      return {
        scenarioId: scenario.scenario_id,
        scenarioSlug: scenario.scenario_slug,
        scenarioName: scenario.name,
        // order_index may be null -> use the array position as the order.
        scenarioOrder: orderForScenario(scenario, scenarioIndex),
        operations,
      };
    },
  );

  return {
    kind: 'operation',
    testCaseId: payload.test_case_id,
    versionId: payload.version_id,
    versionNumber: payload.version_number,
    payloadStatus: payload.status,
    generatedAt: payload.generated_at,
    destinationSlug,
    targetLabel: target.label,
    device: target.device,
    groups,
    totals,
    operationDetailDeferred: false,
    boundaryNote: BOUNDARY_NOTE,
  };
}

/**
 * Build one PlanConcreteOperation, preserving backend provenance verbatim.
 * profile_slugs is kept AS AN ARRAY (never collapsed). Absolute ISO times are
 * resolved ONLY when a base instant is injected; otherwise they stay undefined
 * and the relative offsets are carried for resolution at the write-time clock.
 */
function buildPlanOperation(
  op: RunnableOperation,
  status: OperationStatus,
  reasonCode: OperationReasonCode,
  detail: string,
  baseInstantMs: number | undefined,
): PlanConcreteOperation {
  const time = op.time
    ? {
        model: op.time.model,
        startOffsetMinutes: op.time.start_offset_minutes,
        endOffsetMinutes: op.time.end_offset_minutes,
      }
    : undefined;

  // Resolve absolute times ONLY from the injected base instant (no Date.now).
  // Only resolve when the offsets are finite (a valid relative model).
  let startTimeIso: string | undefined;
  let endTimeIso: string | undefined;
  if (
    op.time &&
    baseInstantMs !== undefined &&
    Number.isFinite(op.time.start_offset_minutes) &&
    Number.isFinite(op.time.end_offset_minutes)
  ) {
    const resolved = resolveRelativeTime(op.time, baseInstantMs);
    startTimeIso = resolved.startTimeIso;
    endTimeIso = resolved.endTimeIso;
  }

  return {
    operationId: op.operation_id,
    scenarioId: op.scenario_id,
    metricSlug: op.metric_slug,
    metricId: op.metric_id,
    destinationSlug: op.destination_slug,
    // Preserve the array verbatim — the native writer (MR-D) decides
    // per-profile handling later when more than one profile is present.
    profileSlugs: op.profile_slugs,
    operationKind: op.operation_kind,
    // Preserve verbatim; only blank when the field is genuinely absent.
    value: hasValue(op.value) ? op.value : undefined,
    unit: op.unit || undefined,
    time,
    startTimeIso,
    endTimeIso,
    idempotencyKey: op.idempotency_key || undefined,
    metadata: op.metadata,
    status,
    reasonCode,
    detail,
  };
}

/** True when a concrete value field is present (number or non-empty string). */
function hasValue(v: number | string): boolean {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * The order position for a scenario. Uses the backend order_index when it is a
 * finite number; otherwise (null/absent in the live data) uses the scenario's
 * 0-based array position so emission order is stable and deterministic.
 */
function orderForScenario(scenario: RunnableScenario, arrayIndex: number): number {
  if (typeof scenario.order_index === 'number' && Number.isFinite(scenario.order_index)) {
    return scenario.order_index;
  }
  return arrayIndex;
}

/**
 * Derive the destination slug. Prefers the top-level payload field (live
 * shape); falls back to the first operation that declares one, then 'unknown'
 * which only affects the display label, never classification.
 */
function deriveDestinationSlug(payload: RunnablePayload): string {
  if (payload.destination_slug && payload.destination_slug.trim().length > 0) {
    return payload.destination_slug;
  }
  for (const scenario of payload.scenarios) {
    for (const op of scenario.operations) {
      if (op.destination_slug && op.destination_slug.trim().length > 0) {
        return op.destination_slug;
      }
    }
  }
  return 'unknown';
}

function bumpTotal(totals: ConcretePlanTotals, status: OperationStatus): void {
  totals.total += 1;
  switch (status) {
    case 'writable':
      totals.writable += 1;
      break;
    case 'unsupported':
      totals.unsupported += 1;
      break;
    case 'invalid':
      totals.invalid += 1;
      break;
    case 'skipped':
      totals.skipped += 1;
      break;
    case 'permission_missing':
      totals.permissionMissing += 1;
      break;
  }
}

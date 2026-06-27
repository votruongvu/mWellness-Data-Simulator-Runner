/**
 * MR-C — F8 operation-level execution-plan builder (PURE, DETERMINISTIC).
 *
 * Input : a backend F8 RunnablePayload (concrete operations) + optionally the
 *         catalog Metric[] metadata for the version's destination+profiles.
 * Output: a ConcreteExecutionPlan classifying each CONCRETE operation, grouped
 *         by scenario in backend order_index then operation order.
 *
 * This is the preferred MR-C / native-readiness input. The MR-B metric-level
 * interpreter.ts path is kept as a read-only fallback/diagnostic (not deleted).
 *
 * Determinism rules (load-bearing):
 *  - NO Date.now / randomness / network / native calls. Same payload -> same
 *    plan (replay-safe).
 *  - NO fabricated value/unit/time/idempotency. An operation missing a required
 *    concrete field is `invalid` with a reason code — surfaced, never dropped,
 *    never given a fallback.
 *  - Backend IDs (operation_id, idempotency_key), scenario order_index, units,
 *    values, timestamps, destination/profile provenance are preserved verbatim.
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

const BOUNDARY_NOTE =
  'Operation-level plan from the backend F8 runnable payload. Values, units, ' +
  'timestamps and idempotency keys are the backend-authored concrete contract ' +
  '(never fabricated on device). Capability and permission checks are deferred ' +
  'to MR-D; this plan never writes health data.';

/** Maps an issue code to the operation-level reason code (1:1). */
function reasonForIssue(code: string): OperationReasonCode {
  switch (code) {
    case 'MISSING_VALUE':
      return 'MISSING_VALUE';
    case 'MISSING_UNIT':
      return 'MISSING_UNIT';
    case 'MISSING_TIME':
      return 'MISSING_TIME';
    case 'MISSING_IDEMPOTENCY_KEY':
      return 'MISSING_IDEMPOTENCY_KEY';
    case 'MISSING_METRIC_REF':
      return 'MISSING_METRIC_REF';
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
 * Classify a single concrete operation. `firstIssue` is the first tagged
 * missing-field issue for this operation (if any); a missing field dominates.
 */
function classifyOperation(
  op: RunnableOperation,
  firstIssueCode: string | undefined,
  metaBySlug: Map<string, Metric>,
): {status: OperationStatus; reasonCode: OperationReasonCode; detail: string} {
  // Missing required concrete field dominates -> invalid, never fabricated.
  if (firstIssueCode) {
    return {
      status: 'invalid',
      reasonCode: reasonForIssue(firstIssueCode),
      detail: `Operation is missing a required concrete field (${firstIssueCode}); surfaced as invalid, not fabricated.`,
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
 * Pure and deterministic. Scenarios are emitted by backend order_index (stable
 * for ties, then operation order). Every concrete operation becomes one
 * PlanConcreteOperation, preserving backend ids/keys/values/timestamps verbatim.
 *
 * @param payload         the backend F8 runnable payload (concrete operations).
 * @param catalogMetrics  optional catalog metadata for cross-check (downgrade-only).
 */
export function buildExecutionPlanFromPayload(
  payload: RunnablePayload,
  catalogMetrics?: Metric[],
): ConcreteExecutionPlan {
  const {opIssues} = validateRunnablePayload(payload);

  // First issue per operation_id (a missing field dominates classification).
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

  // Derive the destination from operations when present (payload has no
  // top-level destination); fall back to 'unknown' for the label only.
  const destinationSlug = deriveDestinationSlug(payload);
  const target = platformForDestination(destinationSlug);

  const ordered = orderScenariosByIndex(payload.scenarios);
  const totals = emptyConcreteTotals();
  const groups: PlanConcreteScenarioGroup[] = [];

  for (const scenario of ordered) {
    const operations: PlanConcreteOperation[] = scenario.operations.map(op => {
      const firstIssue = firstIssueByOp.get(op.operation_id);
      const {status, reasonCode, detail} = classifyOperation(
        op,
        firstIssue,
        metaBySlug,
      );
      bumpTotal(totals, status);
      return {
        operationId: op.operation_id,
        scenarioId: op.scenario_id,
        metricSlug: op.metric_slug,
        metricId: op.metric_id,
        destinationSlug: op.destination_slug,
        profileSlug: op.profile_slug,
        operationKind: op.operation_kind,
        // Preserve verbatim; only blank when the field is genuinely absent.
        value: hasValue(op.value) ? op.value : undefined,
        unit: op.unit || undefined,
        startTime: op.start_time,
        endTime: op.end_time,
        idempotencyKey: op.idempotency_key || undefined,
        metadata: op.metadata,
        status,
        reasonCode,
        detail,
      };
    });

    groups.push({
      scenarioId: scenario.scenario_id,
      scenarioName: scenario.name,
      scenarioOrder: scenario.order_index,
      operations,
    });
  }

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

/** True when a concrete value field is present (number or non-empty string). */
function hasValue(v: number | string): boolean {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Derive the destination slug from the operations (the F8 payload carries it at
 * the operation level). Uses the first operation that declares one; falls back
 * to 'unknown' which only affects the display label, never classification.
 */
function deriveDestinationSlug(payload: RunnablePayload): string {
  for (const scenario of payload.scenarios) {
    for (const op of scenario.operations) {
      if (op.destination_slug && op.destination_slug.trim().length > 0) {
        return op.destination_slug;
      }
    }
  }
  return 'unknown';
}

/** Order scenarios by backend order_index asc; stable for ties. */
export function orderScenariosByIndex(
  scenarios: RunnablePayload['scenarios'],
): RunnablePayload['scenarios'] {
  return [...scenarios]
    .map((s, i) => ({s, i}))
    .sort((a, b) => {
      if (a.s.order_index !== b.s.order_index) {
        return a.s.order_index - b.s.order_index;
      }
      return a.i - b.i;
    })
    .map(x => x.s);
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

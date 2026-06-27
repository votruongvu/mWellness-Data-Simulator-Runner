/**
 * MR-C — F8 runnable-payload DTOs + validation adapter (READ-ONLY input).
 *
 * Mirrors the VERIFIED MWDS F8 route response exactly:
 *   GET /api/v1/test-cases/{id}/versions/{version_id}/runnable-payload
 *
 * The F8 payload is the OPERATION-LEVEL (concrete) runnable contract: per
 * operation it carries a concrete value, unit, time model, idempotency key and
 * metric/destination/profile provenance. This is the preferred MR-C /
 * native-readiness input, superseding the MR-B metric-level-only path.
 *
 * Safety rules baked into this module (load-bearing):
 *  - This module NEVER fabricates a value/unit/time/idempotency. The adapter
 *    only READS and TAGS the backend payload — it never fills a gap.
 *  - An operation missing a required concrete field is TAGGED as an issue and
 *    surfaced (status `invalid` downstream) — it is NEVER dropped silently and
 *    NEVER given a fabricated fallback.
 *  - Backend IDs (operation_id, idempotency_key), scenario order_index, units,
 *    values, and timestamps are preserved verbatim.
 */

/** One concrete runnable operation as returned by the backend (F8). */
export interface RunnableOperation {
  operation_id: string;
  scenario_id: string;
  /** At least one of metric_slug / metric_id is present (backend guarantee). */
  metric_slug?: string;
  metric_id?: string;
  destination_slug?: string;
  profile_slug?: string;
  operation_kind: string;
  /** Concrete value — never fabricated by the client. */
  value: number | string;
  unit: string;
  /** ISO time model (or documented equivalent). */
  start_time?: string;
  end_time?: string;
  metadata?: Record<string, unknown>;
  /** Stable backend idempotency key — preserved verbatim. */
  idempotency_key: string;
}

/** One scenario's ordered set of concrete operations (F8). */
export interface RunnableScenario {
  scenario_id: string;
  order_index: number;
  name: string;
  operations: RunnableOperation[];
}

/** The version-level runnable payload (F8). */
export interface RunnablePayload {
  test_case_id: string;
  version_id: string;
  version_number: number;
  status: string;
  /** ISO timestamp the backend generated the payload. */
  generated_at: string;
  scenarios: RunnableScenario[];
}

/** Stable machine reason codes for a missing/invalid concrete field. */
export type OperationIssueCode =
  | 'MISSING_VALUE'
  | 'MISSING_UNIT'
  | 'MISSING_TIME'
  | 'MISSING_IDEMPOTENCY_KEY'
  | 'MISSING_METRIC_REF';

/** One tagged issue for a specific operation (never throws away the op). */
export interface OperationIssue {
  scenario_id: string;
  operation_id: string;
  code: OperationIssueCode;
  detail: string;
}

/** Result of validating a raw F8 payload: the (unchanged) payload + issues. */
export interface ValidatedRunnablePayload {
  payload: RunnablePayload;
  /** Per-operation issues, keyed by operation_id (never empties the payload). */
  opIssues: OperationIssue[];
}

/** True when a value is a non-empty trimmed string. */
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** True when a concrete value field is present (number, or non-empty string). */
function hasConcreteValue(v: unknown): boolean {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }
  return isNonEmptyString(v);
}

/**
 * Validate a raw F8 payload against the required-concrete-field contract.
 *
 * It NEVER mutates, drops, or fabricates: the payload is returned as-is and
 * every operation that is missing a required concrete field is recorded as an
 * OperationIssue. Downstream (operationPlan) maps an issued operation to status
 * `invalid` with its reason code, so nothing is silently lost.
 *
 * Required per operation: a value, a unit, a time model (at least start_time),
 * an idempotency_key, and at least one metric reference (metric_slug|metric_id).
 */
export function validateRunnablePayload(
  payload: RunnablePayload,
): ValidatedRunnablePayload {
  const opIssues: OperationIssue[] = [];

  for (const scenario of payload.scenarios) {
    for (const op of scenario.operations) {
      if (!hasConcreteValue(op.value)) {
        opIssues.push(
          issue(op, 'MISSING_VALUE', 'Operation has no concrete value.'),
        );
      }
      if (!isNonEmptyString(op.unit)) {
        opIssues.push(
          issue(op, 'MISSING_UNIT', 'Operation has no unit.'),
        );
      }
      if (!isNonEmptyString(op.start_time)) {
        opIssues.push(
          issue(
            op,
            'MISSING_TIME',
            'Operation has no time model (start_time absent).',
          ),
        );
      }
      if (!isNonEmptyString(op.idempotency_key)) {
        opIssues.push(
          issue(
            op,
            'MISSING_IDEMPOTENCY_KEY',
            'Operation has no idempotency_key.',
          ),
        );
      }
      if (!isNonEmptyString(op.metric_slug) && !isNonEmptyString(op.metric_id)) {
        opIssues.push(
          issue(
            op,
            'MISSING_METRIC_REF',
            'Operation has neither metric_slug nor metric_id.',
          ),
        );
      }
    }
  }

  return {payload, opIssues};
}

function issue(
  op: RunnableOperation,
  code: OperationIssueCode,
  detail: string,
): OperationIssue {
  return {
    scenario_id: op.scenario_id,
    operation_id: op.operation_id,
    code,
    detail,
  };
}

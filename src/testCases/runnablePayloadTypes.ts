/**
 * MR-C — F8 runnable-payload DTOs + validation adapter (READ-ONLY input).
 *
 * Mirrors the VERIFIED MWDS F8 route response exactly (live HTTP 200 shape):
 *   GET /api/v1/test-cases/{id}/versions/{version_id}/runnable-payload
 *
 * The F8 payload is the OPERATION-LEVEL (concrete) runnable contract: per
 * operation it carries a concrete value, unit, RELATIVE time model
 * (offset-minutes from a runner-chosen base instant — no absolute timestamps
 * are stored), idempotency key and metric/destination/profile provenance. This
 * is the preferred MR-C / native-readiness input, superseding the MR-B
 * metric-level-only path.
 *
 * Safety rules baked into this module (load-bearing):
 *  - This module NEVER fabricates a value/unit/time/idempotency. The adapter
 *    only READS and TAGS the backend payload — it never fills a gap.
 *  - An operation missing a required concrete field (or carrying an
 *    unsupported/invalid time model) is TAGGED as an issue and surfaced (status
 *    `invalid` downstream) — it is NEVER dropped silently and NEVER given a
 *    fabricated fallback.
 *  - Backend IDs (operation_id, idempotency_key), scenario order_index, units,
 *    values, and relative time offsets are preserved verbatim.
 */

/**
 * The relative time model carried by each operation (verified live shape).
 *
 * `model` is "relative" in the live data: offsets are minutes from the
 * scenario's base instant, which the RUNNER chooses (no absolute timestamp is
 * stored). Absolute ISO times are resolved later from an injected base instant
 * (see src/runner/timeModel.ts) — never fabricated here.
 */
export interface RunnableTimeModel {
  model: string;
  start_offset_minutes: number;
  end_offset_minutes: number;
}

/** One concrete runnable operation as returned by the backend (F8). */
export interface RunnableOperation {
  operation_id: string;
  scenario_id: string;
  /** At least one of metric_slug / metric_id is present (backend guarantee). */
  metric_slug?: string;
  metric_id?: string;
  destination_slug?: string;
  /** Target profiles (live shape is an array; may carry more than one). */
  profile_slugs?: string[];
  operation_kind: string;
  /** Concrete value — never fabricated by the client. */
  value: number | string;
  unit: string;
  /** Relative time model — absolute times are resolved at write-time. */
  time?: RunnableTimeModel;
  metadata?: Record<string, unknown>;
  /** Stable backend idempotency key — preserved verbatim. */
  idempotency_key: string;
}

/** One scenario's ordered set of concrete operations (F8). */
export interface RunnableScenario {
  scenario_id: string;
  scenario_slug?: string;
  /**
   * Backend order index. In the live data this is null — ordering is then the
   * scenario array position. Builders order by array position when null.
   */
  order_index: number | null;
  name: string;
  operations: RunnableOperation[];
}

/** The version-level runnable payload (F8). */
export interface RunnablePayload {
  test_case_id: string;
  version_id: string;
  version_number: number;
  status: string;
  /** Top-level destination for the whole payload (live shape). */
  destination_slug?: string;
  /** Top-level target profiles for the whole payload (live shape). */
  profile_slugs?: string[];
  /** Backend-reported total operation count (live shape). */
  operation_count?: number;
  /** Backend note describing the relative time model (live shape). */
  time_model_note?: string;
  /** ISO timestamp the backend generated the payload. */
  generated_at: string;
  scenarios: RunnableScenario[];
}

/** Stable machine reason codes for a missing/invalid concrete field. */
export type OperationIssueCode =
  | 'MISSING_VALUE'
  | 'MISSING_UNIT'
  | 'MISSING_TIME'
  | 'INVALID_TIME_MODEL'
  | 'MISSING_IDEMPOTENCY_KEY'
  | 'MISSING_METRIC_REF'
  | 'MISSING_PROVENANCE';

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

/** True when v is a finite number (no NaN/Infinity, no string coercion). */
function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Validate a raw F8 payload against the required-concrete-field contract.
 *
 * It NEVER mutates, drops, or fabricates: the payload is returned as-is and
 * every operation that is missing a required concrete field (or carries an
 * unsupported/invalid time model) is recorded as an OperationIssue. Downstream
 * (operationPlan) maps an issued operation to status `invalid` with its reason
 * code, so nothing is silently lost.
 *
 * Required per operation (none of these are weakened — each is a rejection):
 *  - a concrete value;
 *  - a non-empty unit;
 *  - a non-empty idempotency_key;
 *  - at least one metric reference (metric_slug|metric_id);
 *  - a `time` model (absent -> MISSING_TIME); for model "relative" both
 *    offsets must be finite numbers (else INVALID_TIME_MODEL); an unknown
 *    model is INVALID_TIME_MODEL;
 *  - non-empty provenance ids: operation_id AND scenario_id (else
 *    MISSING_PROVENANCE).
 *
 * The VERIFIED live shape (relative time, profile_slugs[]) produces ZERO issues.
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
        opIssues.push(issue(op, 'MISSING_UNIT', 'Operation has no unit.'));
      }
      validateTime(op, opIssues);
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
      if (
        !isNonEmptyString(op.operation_id) ||
        !isNonEmptyString(op.scenario_id)
      ) {
        opIssues.push(
          issue(
            op,
            'MISSING_PROVENANCE',
            'Operation is missing operation_id or scenario_id provenance.',
          ),
        );
      }
    }
  }

  return {payload, opIssues};
}

/**
 * Validate the relative time model. Absent `time` -> MISSING_TIME. A "relative"
 * model with non-finite offsets, or any unknown model, -> INVALID_TIME_MODEL.
 * Never fabricates a time; never coerces strings to numbers.
 */
function validateTime(op: RunnableOperation, opIssues: OperationIssue[]): void {
  const time = op.time;
  if (!time || typeof time !== 'object') {
    opIssues.push(
      issue(op, 'MISSING_TIME', 'Operation has no time model (time absent).'),
    );
    return;
  }
  if (time.model === 'relative') {
    if (
      !isFiniteNumber(time.start_offset_minutes) ||
      !isFiniteNumber(time.end_offset_minutes)
    ) {
      opIssues.push(
        issue(
          op,
          'INVALID_TIME_MODEL',
          'Relative time offsets must both be finite numbers.',
        ),
      );
    }
    return;
  }
  opIssues.push(
    issue(
      op,
      'INVALID_TIME_MODEL',
      `Unsupported time model "${String(time.model)}".`,
    ),
  );
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

/**
 * MR-C-003 — guarded iOS HealthKit write orchestrator.
 *
 * The ONLY path to a real HealthKit write. It enforces, in order:
 *  1. The five-gate write chain (evaluateWriteGate) — if ANY gate is unmet, NO
 *     native write is attempted at all (the run is blocked).
 *  2. Per-operation classification — only the approved minimal metric set with a
 *     complete backend F8 payload (value/unit/time/idempotency_key) is sent to the
 *     native bridge; everything else is skipped_unsupported / skipped_invalid_payload.
 *  3. No-fake-success — an operation is `succeeded` ONLY if the native bridge
 *     returned `succeeded` for it. Partial success is distinct from full success.
 *
 * Values/units/times come verbatim from the backend F8 payload (resolved to
 * absolute ISO via the INJECTED clock); nothing is fabricated. No metric-metadata
 * write: only concrete operation payload values are written.
 */

import {evaluateWriteGate, type FiveGateState} from './permissionFlow';
import {
  type HealthKitBridge,
  type NativeWriteResult,
  type NativeWriteSample,
} from './healthKitBridge';
import {conceptTokenForSlug, type HealthConceptToken} from './healthKitTypes';
import type {PlanConcreteOperation} from '../runner/executionPlan';
import {resolveRelativeTime} from '../runner/timeModel';

/**
 * The smallest safe metric set MR-C-003 will WRITE. Intentionally `stepCount`
 * only (a simple cumulative count). Everything else is skipped_unsupported —
 * coverage is NOT broadened in this POC.
 */
export const MRC_003_WRITABLE_CONCEPTS: readonly HealthConceptToken[] = ['stepCount'];

export type WriteOpStatus =
  | 'succeeded'
  | 'failed'
  | 'skipped_permission'
  | 'skipped_unsupported'
  | 'skipped_invalid_payload'
  | 'cancelled';

export interface WriteOpResult {
  readonly operationId: string;
  readonly metricSlug?: string;
  readonly status: WriteOpStatus;
  /** Reason / native message; never implies success. */
  readonly reason?: string;
}

export interface WriteSummary {
  /** True when the five-gate chain was not satisfied → no write attempted. */
  readonly blocked: boolean;
  readonly blockedBy: readonly string[];
  readonly results: readonly WriteOpResult[];
  readonly counts: Readonly<Record<WriteOpStatus, number>>;
  readonly total: number;
  /** succeeded>0 AND at least one non-succeeded — distinct from full success. */
  readonly partialSuccess: boolean;
  /** total>0 AND every operation succeeded. */
  readonly fullSuccess: boolean;
}

function zeroCounts(): Record<WriteOpStatus, number> {
  return {
    succeeded: 0,
    failed: 0,
    skipped_permission: 0,
    skipped_unsupported: 0,
    skipped_invalid_payload: 0,
    cancelled: 0,
  };
}

function summarize(results: readonly WriteOpResult[], blockedBy: readonly string[]): WriteSummary {
  const counts = zeroCounts();
  for (const r of results) {
    counts[r.status] += 1;
  }
  const total = results.length;
  const succeeded = counts.succeeded;
  const fullSuccess = total > 0 && succeeded === total;
  const partialSuccess = succeeded > 0 && succeeded < total;
  return {
    blocked: blockedBy.length > 0,
    blockedBy,
    results,
    counts,
    total,
    partialSuccess,
    fullSuccess,
  };
}

/** Is this operation a complete, writable F8 payload for the minimal set? */
function classify(
  op: PlanConcreteOperation,
): {writable: true; concept: HealthConceptToken} | {writable: false; status: WriteOpStatus; reason: string} {
  const concept = op.metricSlug ? conceptTokenForSlug(op.metricSlug) : undefined;
  if (!concept || !MRC_003_WRITABLE_CONCEPTS.includes(concept)) {
    return {writable: false, status: 'skipped_unsupported', reason: 'metric not in the MR-C-003 writable set'};
  }
  // Complete concrete payload required — never fabricate a missing field.
  if (typeof op.value !== 'number' || !op.unit || !op.time || !op.idempotencyKey) {
    return {
      writable: false,
      status: 'skipped_invalid_payload',
      reason: 'missing concrete value / unit / time / idempotency_key',
    };
  }
  return {writable: true, concept};
}

export interface GuardedWriteInput {
  readonly operations: readonly PlanConcreteOperation[];
  readonly gates: FiveGateState;
  readonly bridge: HealthKitBridge;
  /** Injected base instant (epoch ms) for relative→absolute resolution. */
  readonly baseInstantMs: number;
}

/**
 * Execute the guarded write. Returns a summary; never throws on a blocked gate.
 * If the five-gate chain is unmet, NO native write is attempted.
 */
export async function executeGuardedWrite(input: GuardedWriteInput): Promise<WriteSummary> {
  const {operations, gates, bridge, baseInstantMs} = input;

  // GATE: all five must be true, or nothing is written.
  const gate = evaluateWriteGate(gates);
  if (!gate.allowed) {
    return summarize([], gate.blockedBy);
  }

  // Classify; build the native batch from writable ops only.
  const prelim: WriteOpResult[] = [];
  const batch: NativeWriteSample[] = [];
  for (const op of operations) {
    const c = classify(op);
    if (!c.writable) {
      prelim.push({operationId: op.operationId, metricSlug: op.metricSlug, status: c.status, reason: c.reason});
      continue;
    }
    const {startTimeIso, endTimeIso} = resolveRelativeTime(
      {
        model: op.time!.model,
        start_offset_minutes: op.time!.startOffsetMinutes,
        end_offset_minutes: op.time!.endOffsetMinutes,
      },
      baseInstantMs,
    );
    batch.push({
      operationId: op.operationId,
      concept: c.concept,
      value: op.value as number,
      unit: op.unit as string,
      startTimeIso,
      endTimeIso,
      idempotencyKey: op.idempotencyKey as string,
    });
  }

  // Native write for the valid batch only. A native throw is NOT success.
  let nativeResults: readonly NativeWriteResult[] = [];
  if (batch.length > 0) {
    try {
      nativeResults = await bridge.writeQuantitySamples(batch);
    } catch {
      nativeResults = batch.map(s => ({
        operationId: s.operationId,
        status: 'failed' as const,
        message: 'native write threw',
      }));
    }
  }
  const byId = new Map(nativeResults.map(r => [r.operationId, r]));

  const written: WriteOpResult[] = batch.map(s => {
    const nr = byId.get(s.operationId);
    if (!nr) {
      // No native result for a sent sample → failed (never assume success).
      return {operationId: s.operationId, metricSlug: s.concept, status: 'failed', reason: 'no native result returned'};
    }
    return {operationId: s.operationId, metricSlug: s.concept, status: nr.status, reason: nr.message};
  });

  return summarize([...prelim, ...written], []);
}

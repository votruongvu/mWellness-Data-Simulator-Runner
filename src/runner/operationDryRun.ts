/**
 * MR-C — F8 operation-level dry-run simulation (PURE, NO-WRITE).
 *
 * Takes a ConcreteExecutionPlan (built from the backend F8 runnable payload)
 * and produces a DryRunResultConcrete with per-operation CONCRETE detail.
 *
 * Safety contract (load-bearing):
 *  - NO real writes. NO native HealthKit / Health Connect call. NO network.
 *  - NO Date.now / randomness — deterministic for a fixed plan (replay-safe).
 *  - It NEVER reports success as if data were written. The result explicitly
 *    states "No health data was written." and reports SIMULATED counts only.
 *  - It NEVER fabricates a value/unit/time/idempotency: it echoes only what the
 *    plan already carries (which came verbatim from the backend). The relative
 *    time offsets are echoed; the resolved absolute ISO times appear ONLY when
 *    the plan already carried them (from an injected base instant).
 *
 * Distinct from the MR-B metric-level dry-run (dryRun.ts), which is kept as the
 * read-only fallback. Reuses the safety statement convention from MR-B.
 */

import {
  ConcreteExecutionPlan,
  OperationReasonCode,
  OperationStatus,
  PlanRelativeTime,
} from './executionPlan';

/** One simulated operation, echoing the plan's concrete detail verbatim. */
export interface DryRunOperation {
  operationId: string;
  scenarioId: string;
  scenarioName: string;
  scenarioOrder: number;
  metricSlug?: string;
  metricId?: string;
  destinationSlug?: string;
  /** Target profiles, preserved as an array (never collapsed). */
  profileSlugs?: string[];
  operationKind: string;
  value?: number | string;
  unit?: string;
  /** Raw relative time offsets (verbatim from the plan). */
  time?: PlanRelativeTime;
  /** Resolved absolute start — present only if the plan carried it. */
  startTimeIso?: string;
  /** Resolved absolute end — present only if the plan carried it. */
  endTimeIso?: string;
  idempotencyKey?: string;
  status: OperationStatus;
  reasonCode: OperationReasonCode;
  detail: string;
}

export interface DryRunResultConcrete {
  /** Discriminator so screens can tell an F8 dry-run from an MR-B one. */
  kind: 'operation';
  versionId: string;
  versionNumber: number;
  targetLabel: string;
  /** Always true — the safety invariant. */
  noHealthDataWritten: true;
  /** Operations that WOULD be attempted in a real run (concrete). */
  simulatedWritable: number;
  /** Operations that would be skipped (unsupported + invalid + skipped). */
  wouldSkip: number;
  wouldSkipUnsupported: number;
  wouldSkipInvalid: number;
  wouldSkipOther: number;
  /** Total concrete operations considered. */
  total: number;
  /** Every operation with its concrete detail, so nothing is hidden. */
  operations: DryRunOperation[];
  /** False — concrete per-operation detail is present (not deferred). */
  operationDetailDeferred: false;
  /** The honest next-step note. */
  nextStepNote: string;
}

const NEXT_STEP_NOTE =
  'Next: a real capability + permission check is deferred to MR-D. This ' +
  'dry-run does not request permissions, does not check device capability, ' +
  'and never writes health data.';

/**
 * Simulate the concrete plan. Pure: deterministic for a fixed plan, no writes.
 */
export function simulateDryRunFromPayload(
  plan: ConcreteExecutionPlan,
): DryRunResultConcrete {
  let simulatedWritable = 0;
  let wouldSkipUnsupported = 0;
  let wouldSkipInvalid = 0;
  let wouldSkipOther = 0;
  const operations: DryRunOperation[] = [];

  for (const group of plan.groups) {
    for (const op of group.operations) {
      switch (op.status) {
        case 'writable':
          simulatedWritable += 1;
          break;
        case 'unsupported':
          wouldSkipUnsupported += 1;
          break;
        case 'invalid':
          wouldSkipInvalid += 1;
          break;
        case 'skipped':
        case 'permission_missing':
        default:
          wouldSkipOther += 1;
          break;
      }
      operations.push({
        operationId: op.operationId,
        scenarioId: op.scenarioId,
        scenarioName: group.scenarioName,
        scenarioOrder: group.scenarioOrder,
        metricSlug: op.metricSlug,
        metricId: op.metricId,
        destinationSlug: op.destinationSlug,
        profileSlugs: op.profileSlugs,
        operationKind: op.operationKind,
        value: op.value,
        unit: op.unit,
        time: op.time,
        startTimeIso: op.startTimeIso,
        endTimeIso: op.endTimeIso,
        idempotencyKey: op.idempotencyKey,
        status: op.status,
        reasonCode: op.reasonCode,
        detail: op.detail,
      });
    }
  }

  const wouldSkip = wouldSkipUnsupported + wouldSkipInvalid + wouldSkipOther;

  return {
    kind: 'operation',
    versionId: plan.versionId,
    versionNumber: plan.versionNumber,
    targetLabel: plan.targetLabel,
    noHealthDataWritten: true,
    simulatedWritable,
    wouldSkip,
    wouldSkipUnsupported,
    wouldSkipInvalid,
    wouldSkipOther,
    total: plan.totals.total,
    operations,
    operationDetailDeferred: false,
    nextStepNote: NEXT_STEP_NOTE,
  };
}

/**
 * MR-B — Dry-run simulation (PURE).
 *
 * Takes an ExecutionPlan and produces a DryRunResult SUMMARY. This is the heart
 * of the safety contract for MR-B:
 *  - NO real writes. NO native HealthKit / Health Connect call. NO network.
 *  - NO Date.now / randomness — deterministic for a fixed plan (replay-safe).
 *  - It NEVER reports success as if data were written. The result explicitly
 *    states "No health data was written." and reports SIMULATED counts only.
 *
 * A "simulated writable" is an operation the catalog marks writable on this
 * platform; the dry-run asserts it WOULD be attempted, not that it succeeded.
 * Unsupported/invalid/skipped operations are reported as would-skip with their
 * reason codes so nothing is silently dropped.
 *
 * Honest boundary: counts are metric-level (payload deferred to MR-C). Real
 * capability/permission checks are deferred to MR-D and are listed as the next
 * step — the dry-run does not assert permission state.
 */

import {ExecutionPlan, ReasonCode} from './executionPlan';

export interface DryRunWarning {
  scenarioSlug: string;
  metricSlug: string;
  reasonCode: ReasonCode;
  detail: string;
}

export interface DryRunResult {
  versionId: string;
  versionNumber: number;
  targetLabel: string;
  /** Always true in MR-B — the safety invariant. */
  noHealthDataWritten: true;
  /** Operations that WOULD be attempted in a real run (metric level). */
  simulatedWritable: number;
  /** Operations that would be skipped (unsupported + invalid + skipped). */
  wouldSkip: number;
  /** Breakdown of would-skip. */
  wouldSkipUnsupported: number;
  wouldSkipInvalid: number;
  wouldSkipOther: number;
  /** Total operations considered (metric level). */
  total: number;
  /** Per-skip warnings, so nothing is silently dropped. */
  warnings: DryRunWarning[];
  /** Counts are metric-level; payload detail deferred to MR-C. */
  operationDetailDeferred: true;
  /** The honest next-step note. */
  nextStepNote: string;
}

const NEXT_STEP_NOTE =
  'Next: a real capability + permission check is deferred to MR-C/MR-D. ' +
  'This dry-run does not request permissions, does not check device ' +
  'capability, and never writes health data.';

/**
 * Simulate the plan. Pure: deterministic for a fixed ExecutionPlan, no writes.
 */
export function simulateDryRun(plan: ExecutionPlan): DryRunResult {
  let simulatedWritable = 0;
  let wouldSkipUnsupported = 0;
  let wouldSkipInvalid = 0;
  let wouldSkipOther = 0;
  const warnings: DryRunWarning[] = [];

  for (const group of plan.groups) {
    for (const op of group.operations) {
      switch (op.status) {
        case 'writable':
          simulatedWritable += 1;
          break;
        case 'unsupported':
          wouldSkipUnsupported += 1;
          warnings.push(toWarning(op));
          break;
        case 'invalid':
          wouldSkipInvalid += 1;
          warnings.push(toWarning(op));
          break;
        case 'skipped':
        case 'permission_missing':
        default:
          wouldSkipOther += 1;
          warnings.push(toWarning(op));
          break;
      }
    }
  }

  const wouldSkip = wouldSkipUnsupported + wouldSkipInvalid + wouldSkipOther;

  return {
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
    warnings,
    operationDetailDeferred: true,
    nextStepNote: NEXT_STEP_NOTE,
  };
}

function toWarning(op: {
  scenarioSlug: string;
  metricSlug: string;
  reasonCode: ReasonCode;
  detail: string;
}): DryRunWarning {
  return {
    scenarioSlug: op.scenarioSlug,
    metricSlug: op.metricSlug,
    reasonCode: op.reasonCode,
    detail: op.detail,
  };
}

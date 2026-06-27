/**
 * MR-C — operation-level dry-run tests (PURE, NO-WRITE).
 *
 * Covers: simulateDryRunFromPayload from the fixture-built plan — per-operation
 * concrete detail, would-skip breakdown, the no-write invariant, determinism,
 * and that NO write/native/permission path exists.
 *
 * SAFETY: this file imports ONLY pure runner modules — no HealthKit/Health
 * Connect/native/permission/real-write module is in the import graph, so a
 * write cannot occur (no write path exists). The dry-run is a pure function
 * with no side effects; the assertions below confirm it never reports a write.
 */

import {buildExecutionPlanFromPayload} from '../src/runner/operationPlan';
import {simulateDryRunFromPayload} from '../src/runner/operationDryRun';
import {f8Fixture} from './fixtures/runnablePayload.fixture';

describe('simulateDryRunFromPayload', () => {
  const plan = buildExecutionPlanFromPayload(f8Fixture);

  it('asserts the no-write safety invariant', () => {
    const result = simulateDryRunFromPayload(plan);
    expect(result.noHealthDataWritten).toBe(true);
    expect(result.kind).toBe('operation');
    expect(result.operationDetailDeferred).toBe(false);
  });

  it('echoes per-operation concrete detail verbatim (no fabrication)', () => {
    const result = simulateDryRunFromPayload(plan);
    expect(result.operations).toHaveLength(7);
    const a1 = result.operations.find(o => o.operationId === 'op-A1')!;
    expect(a1.value).toBe(250);
    expect(a1.unit).toBe('count');
    expect(a1.idempotencyKey).toBe('idem-A1');
    expect(a1.status).toBe('writable');

    // A missing-value op surfaces as invalid with no fabricated value.
    const mv = result.operations.find(
      o => o.operationId === 'op-B-missing-value',
    )!;
    expect(mv.status).toBe('invalid');
    expect(mv.reasonCode).toBe('MISSING_VALUE');
  });

  it('breaks down would-skip and simulated-writable correctly', () => {
    const result = simulateDryRunFromPayload(plan);
    expect(result.simulatedWritable).toBe(2);
    expect(result.wouldSkipInvalid).toBe(5);
    expect(result.wouldSkip).toBe(5);
    expect(result.total).toBe(7);
  });

  it('is deterministic — same plan yields an identical result', () => {
    const a = simulateDryRunFromPayload(plan);
    const b = simulateDryRunFromPayload(plan);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('no native / permission / real-write path exists', () => {
  it('the result exposes no write/permission/native capability, only sim counts', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    const result = simulateDryRunFromPayload(plan);

    // The result shape carries ONLY simulation data — no write handle, no
    // permission grant, no native record id. A real write is structurally
    // impossible: there is nothing here to invoke.
    const keys = Object.keys(result);
    expect(keys).not.toContain('writeResult');
    expect(keys).not.toContain('permissionGranted');
    expect(keys).not.toContain('nativeRecordIds');
    expect(result.noHealthDataWritten).toBe(true);

    // Every operation is data-only; none carries an executable write callback.
    for (const op of result.operations) {
      for (const v of Object.values(op)) {
        expect(typeof v).not.toBe('function');
      }
    }
  });
});

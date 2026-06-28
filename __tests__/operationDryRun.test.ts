/**
 * MR-C — operation-level dry-run tests (PURE, NO-WRITE).
 *
 * Covers: simulateDryRunFromPayload from the fixture-built plan — per-operation
 * concrete detail (value/unit/idempotency, profile_slugs[], relative time +
 * resolved absolute when present), would-skip breakdown, the no-write
 * invariant, determinism, and that NO write/native/permission path exists.
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
  // Fixed, INJECTED base instant so resolved absolute times are deterministic.
  const baseInstantMs = Date.UTC(2025, 5, 1, 0, 0, 0, 0);
  const plan = buildExecutionPlanFromPayload(f8Fixture, {baseInstantMs});

  it('asserts the no-write safety invariant', () => {
    const result = simulateDryRunFromPayload(plan);
    expect(result.noHealthDataWritten).toBe(true);
    expect(result.kind).toBe('operation');
    expect(result.operationDetailDeferred).toBe(false);
  });

  it('echoes per-operation concrete detail verbatim (no fabrication)', () => {
    const result = simulateDryRunFromPayload(plan);
    expect(result.operations).toHaveLength(12);
    const distance = result.operations.find(
      o => o.operationId === 'scn-1:distance:0',
    )!;
    expect(distance.value).toBe(900);
    expect(distance.unit).toBe('metres');
    expect(distance.idempotencyKey).toBe(
      '5f3c290b52889a0ee7b88fd6f54ee953ac40910a2a05726f61de885f83c722d3',
    );
    expect(distance.status).toBe('writable');
    // profile_slugs[] surfaced as an array (not collapsed).
    expect(distance.profileSlugs).toEqual(['apple_watch']);
    // Relative offsets surfaced + resolved absolute (base instant was injected).
    expect(distance.time).toEqual({
      model: 'relative',
      startOffsetMinutes: -720,
      endOffsetMinutes: -660,
    });
    expect(distance.startTimeIso).toBe('2025-05-31T12:00:00.000Z');
    expect(distance.endTimeIso).toBe('2025-05-31T13:00:00.000Z');

    // A missing-value op surfaces as invalid with no fabricated value.
    const mv = result.operations.find(o => o.operationId === 'op-missing-value')!;
    expect(mv.status).toBe('invalid');
    expect(mv.reasonCode).toBe('MISSING_VALUE');
  });

  it('breaks down would-skip and simulated-writable correctly', () => {
    const result = simulateDryRunFromPayload(plan);
    expect(result.simulatedWritable).toBe(4);
    expect(result.wouldSkipInvalid).toBe(8);
    expect(result.wouldSkip).toBe(8);
    expect(result.total).toBe(12);
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

/**
 * MR-C — operation-level plan + validation tests (PURE, no network/native).
 *
 * Covers (against the REAL live F8 shape: relative `time`, `profile_slugs[]`):
 *  - validateRunnablePayload: each missing/invalid required field -> tagged
 *    issue with the right reason code; ops are NEVER dropped and NEVER
 *    fabricated; the VERIFIED live payload produces ZERO issues.
 *  - buildExecutionPlanFromPayload: scenario array-position ordering (order_index
 *    is null); operation_id + idempotency_key + relative time preserved verbatim;
 *    profile_slugs[] preserved (not collapsed); missing/invalid ops classified
 *    `invalid` with the matching reason code; complete ops `writable`;
 *    relative→absolute resolution from an INJECTED base instant is deterministic;
 *    same inputs -> identical plan (proxy for no-Date.now).
 *
 * SAFETY: this file imports ONLY pure runner/testCases modules. It imports no
 * health/native/permission module, and there is no write path to exercise.
 */

import {
  validateRunnablePayload,
  OperationIssueCode,
  RunnablePayload,
} from '../src/testCases/runnablePayloadTypes';
import {buildExecutionPlanFromPayload} from '../src/runner/operationPlan';
import {f8Fixture} from './fixtures/runnablePayload.fixture';

/**
 * The VERIFIED live payload (captured from a real HTTP 200), reduced to its
 * exact shape: relative time, profile_slugs[], order_index null. This MUST pass
 * validation with ZERO issues.
 */
const liveVerifiedPayload: RunnablePayload = {
  test_case_id: '17',
  version_id: '15',
  version_number: 1,
  status: 'active',
  destination_slug: 'apple_health',
  profile_slugs: ['apple_watch'],
  operation_count: 4,
  time_model_note: 'Operation times are RELATIVE offset-minutes ...',
  generated_at: '2026-06-28T08:02:36Z',
  scenarios: [
    {
      scenario_id: '11',
      scenario_slug: 'active_day_basic',
      order_index: null,
      name: 'Active Day Basic',
      operations: [
        {
          operation_id: '11:distance:0',
          scenario_id: '11',
          metric_slug: 'distance',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'daily_summary time_series',
          value: 900,
          unit: 'metres',
          time: {model: 'relative', start_offset_minutes: -720, end_offset_minutes: -660},
          metadata: {end_offset_minutes: -660, start_offset_minutes: -720, value: 900},
          idempotency_key:
            '5f3c290b52889a0ee7b88fd6f54ee953ac40910a2a05726f61de885f83c722d3',
        },
        {
          operation_id: '11:steps:0',
          scenario_id: '11',
          metric_slug: 'steps',
          destination_slug: 'apple_health',
          profile_slugs: ['apple_watch'],
          operation_kind: 'daily_summary time_series',
          value: 1200,
          unit: 'count',
          time: {model: 'relative', start_offset_minutes: -720, end_offset_minutes: -660},
          metadata: {end_offset_minutes: -660, start_offset_minutes: -720, value: 1200},
          idempotency_key:
            'bfce80cc8a3126a0da521403a1d45ee5291420b79f77a33d43917d41fa12e5c2',
        },
      ],
    },
  ],
};

describe('validateRunnablePayload — verified live shape passes clean', () => {
  it('produces ZERO issues for the VERIFIED live F8 payload', () => {
    const {payload, opIssues} = validateRunnablePayload(liveVerifiedPayload);
    expect(payload).toBe(liveVerifiedPayload);
    expect(opIssues).toHaveLength(0);
  });
});

describe('validateRunnablePayload — required/invalid-field handling', () => {
  it('tags each missing/invalid field, drops nothing, fabricates nothing', () => {
    const {payload, opIssues} = validateRunnablePayload(f8Fixture);

    // Payload is returned unchanged (same reference, nothing removed).
    expect(payload).toBe(f8Fixture);
    const totalOps = payload.scenarios.reduce(
      (n, s) => n + s.operations.length,
      0,
    );
    expect(totalOps).toBe(12); // 3 in scn-1 + 9 in scn-2 — none dropped.

    const byOp = (id: string): OperationIssueCode[] =>
      opIssues.filter(i => i.operation_id === id).map(i => i.code);

    expect(byOp('op-missing-value')).toContain('MISSING_VALUE');
    expect(byOp('op-missing-unit')).toContain('MISSING_UNIT');
    expect(byOp('op-missing-time')).toContain('MISSING_TIME');
    expect(byOp('op-bad-offset')).toContain('INVALID_TIME_MODEL');
    expect(byOp('op-unknown-model')).toContain('INVALID_TIME_MODEL');
    expect(byOp('op-missing-idem')).toContain('MISSING_IDEMPOTENCY_KEY');
    expect(byOp('op-missing-metric')).toContain('MISSING_METRIC_REF');
    // The empty-operation_id op is tagged MISSING_PROVENANCE.
    expect(opIssues.some(i => i.code === 'MISSING_PROVENANCE')).toBe(true);

    // Complete operations have NO issues.
    expect(byOp('scn-1:distance:0')).toHaveLength(0);
    expect(byOp('scn-1:steps:0')).toHaveLength(0);
    expect(byOp('scn-1:steps:multi')).toHaveLength(0);
    expect(byOp('scn-2:steps:0')).toHaveLength(0);
  });

  it('never invents a value for a missing field', () => {
    const {payload} = validateRunnablePayload(f8Fixture);
    const op = payload.scenarios
      .flatMap(s => s.operations)
      .find(o => o.operation_id === 'op-missing-value')!;
    // The adapter must not have backfilled the empty value.
    expect(op.value).toBe('');
  });
});

describe('buildExecutionPlanFromPayload', () => {
  it('orders scenarios by array position when order_index is null', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    expect(plan.kind).toBe('operation');
    expect(plan.operationDetailDeferred).toBe(false);
    expect(plan.groups.map(g => g.scenarioId)).toEqual(['scn-1', 'scn-2']);
    // order_index is null -> 0-based array position is the scenario order.
    expect(plan.groups.map(g => g.scenarioOrder)).toEqual([0, 1]);
  });

  it('uses the top-level destination_slug (live shape) for the target', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    expect(plan.destinationSlug).toBe('apple_health');
    expect(plan.targetLabel).toBe('iOS · Apple Health');
  });

  it('preserves operation_id + idempotency_key + value/unit + relative time', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    const distance = plan.groups[0].operations[0];
    expect(distance.operationId).toBe('scn-1:distance:0');
    expect(distance.idempotencyKey).toBe(
      '5f3c290b52889a0ee7b88fd6f54ee953ac40910a2a05726f61de885f83c722d3',
    );
    expect(distance.value).toBe(900);
    expect(distance.unit).toBe('metres');
    expect(distance.time).toEqual({
      model: 'relative',
      startOffsetMinutes: -720,
      endOffsetMinutes: -660,
    });
    // No base instant injected -> absolute times stay undefined (op still valid).
    expect(distance.startTimeIso).toBeUndefined();
    expect(distance.endTimeIso).toBeUndefined();
    expect(distance.status).toBe('writable');
  });

  it('preserves profile_slugs[] verbatim and does NOT collapse a multi-profile op', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    const byId = new Map(
      plan.groups.flatMap(g => g.operations).map(o => [o.operationId, o]),
    );
    expect(byId.get('scn-1:distance:0')!.profileSlugs).toEqual(['apple_watch']);
    // The multi-profile op keeps ALL profiles (array not collapsed).
    expect(byId.get('scn-1:steps:multi')!.profileSlugs).toEqual([
      'apple_watch',
      'iphone',
    ]);
  });

  it('resolves relative→absolute deterministically from an INJECTED base instant', () => {
    // Fixed base instant: 2025-06-01T00:00:00.000Z = 1748736000000 ms.
    const baseInstantMs = Date.UTC(2025, 5, 1, 0, 0, 0, 0);
    const plan = buildExecutionPlanFromPayload(f8Fixture, {baseInstantMs});
    const distance = plan.groups[0].operations[0];
    // -720 min = -12h, -660 min = -11h from the base instant. Exact ISO.
    expect(distance.startTimeIso).toBe('2025-05-31T12:00:00.000Z');
    expect(distance.endTimeIso).toBe('2025-05-31T13:00:00.000Z');

    // Same base instant -> identical resolution (deterministic).
    const plan2 = buildExecutionPlanFromPayload(f8Fixture, {baseInstantMs});
    expect(plan2.groups[0].operations[0].startTimeIso).toBe(
      distance.startTimeIso,
    );
  });

  it('classifies each missing/invalid op invalid with the matching reason code', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    const opById = new Map(
      plan.groups.flatMap(g => g.operations).map(o => [o.operationId, o]),
    );

    expect(opById.get('op-missing-value')!.status).toBe('invalid');
    expect(opById.get('op-missing-value')!.reasonCode).toBe('MISSING_VALUE');
    expect(opById.get('op-missing-unit')!.reasonCode).toBe('MISSING_UNIT');
    expect(opById.get('op-missing-time')!.reasonCode).toBe('MISSING_TIME');
    expect(opById.get('op-bad-offset')!.reasonCode).toBe('INVALID_TIME_MODEL');
    expect(opById.get('op-unknown-model')!.reasonCode).toBe(
      'INVALID_TIME_MODEL',
    );
    expect(opById.get('op-missing-idem')!.reasonCode).toBe(
      'MISSING_IDEMPOTENCY_KEY',
    );
    expect(opById.get('op-missing-metric')!.reasonCode).toBe(
      'MISSING_METRIC_REF',
    );

    // Complete ops are writable.
    expect(opById.get('scn-1:distance:0')!.status).toBe('writable');
    expect(opById.get('scn-2:steps:0')!.status).toBe('writable');
  });

  it('rolls up totals: 4 writable, 8 invalid, 12 total — nothing lost', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    expect(plan.totals.total).toBe(12);
    expect(plan.totals.writable).toBe(4);
    expect(plan.totals.invalid).toBe(8);
    expect(plan.totals.unsupported).toBe(0);
    expect(plan.totals.skipped).toBe(0);
    expect(plan.totals.permissionMissing).toBe(0); // never emitted here
  });

  it('is deterministic — same inputs yield an identical plan (no Date.now)', () => {
    const baseInstantMs = Date.UTC(2025, 5, 1, 0, 0, 0, 0);
    const a = buildExecutionPlanFromPayload(f8Fixture, {baseInstantMs});
    const b = buildExecutionPlanFromPayload(f8Fixture, {baseInstantMs});
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

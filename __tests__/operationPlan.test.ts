/**
 * MR-C — operation-level plan + validation tests (PURE, no network/native).
 *
 * Covers:
 *  - validateRunnablePayload: each missing required field -> tagged issue with
 *    the right reason code; ops are NEVER dropped and NEVER fabricated.
 *  - buildExecutionPlanFromPayload: scenario order_index preservation;
 *    operation_id + idempotency_key preservation; missing-field ops classified
 *    `invalid` with the matching reason code; complete ops `writable`.
 *
 * SAFETY: this file imports ONLY pure runner/testCases modules. It imports no
 * health/native/permission module, and there is no write path to exercise.
 */

import {
  validateRunnablePayload,
  OperationIssueCode,
} from '../src/testCases/runnablePayloadTypes';
import {buildExecutionPlanFromPayload} from '../src/runner/operationPlan';
import {f8Fixture} from './fixtures/runnablePayload.fixture';

describe('validateRunnablePayload — required-field handling', () => {
  it('tags each missing required field, drops nothing, fabricates nothing', () => {
    const {payload, opIssues} = validateRunnablePayload(f8Fixture);

    // Payload is returned unchanged (same reference, nothing removed).
    expect(payload).toBe(f8Fixture);
    const totalOps = payload.scenarios.reduce(
      (n, s) => n + s.operations.length,
      0,
    );
    expect(totalOps).toBe(7); // 6 in B + 1 in A — none dropped.

    const byOp = (id: string): OperationIssueCode[] =>
      opIssues.filter(i => i.operation_id === id).map(i => i.code);

    expect(byOp('op-B-missing-value')).toContain('MISSING_VALUE');
    expect(byOp('op-B-missing-unit')).toContain('MISSING_UNIT');
    expect(byOp('op-B-missing-time')).toContain('MISSING_TIME');
    expect(byOp('op-B-missing-idem')).toContain('MISSING_IDEMPOTENCY_KEY');
    expect(byOp('op-B-missing-metric')).toContain('MISSING_METRIC_REF');

    // Complete operations have NO issues.
    expect(byOp('op-B1')).toHaveLength(0);
    expect(byOp('op-A1')).toHaveLength(0);
  });

  it('never invents a value/unit/time/idempotency for a missing field', () => {
    const {payload} = validateRunnablePayload(f8Fixture);
    const op = payload.scenarios
      .flatMap(s => s.operations)
      .find(o => o.operation_id === 'op-B-missing-value')!;
    // The adapter must not have backfilled the empty value.
    expect(op.value).toBe('');
  });
});

describe('buildExecutionPlanFromPayload', () => {
  it('preserves scenario order_index (A before B despite input order)', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    expect(plan.kind).toBe('operation');
    expect(plan.operationDetailDeferred).toBe(false);
    expect(plan.groups.map(g => g.scenarioId)).toEqual(['scn-A', 'scn-B']);
    expect(plan.groups.map(g => g.scenarioOrder)).toEqual([1, 2]);
  });

  it('preserves operation_id + idempotency_key + value/unit/time verbatim', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    const a1 = plan.groups[0].operations[0];
    expect(a1.operationId).toBe('op-A1');
    expect(a1.idempotencyKey).toBe('idem-A1');
    expect(a1.value).toBe(250);
    expect(a1.unit).toBe('count');
    expect(a1.startTime).toBe('2025-01-01T07:00:00.000Z');
    expect(a1.metricId).toBe('metric-uuid-steps');
  });

  it('classifies each missing-field op invalid with the matching reason code', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    const opById = new Map(
      plan.groups.flatMap(g => g.operations).map(o => [o.operationId, o]),
    );

    expect(opById.get('op-B-missing-value')!.status).toBe('invalid');
    expect(opById.get('op-B-missing-value')!.reasonCode).toBe('MISSING_VALUE');
    expect(opById.get('op-B-missing-unit')!.reasonCode).toBe('MISSING_UNIT');
    expect(opById.get('op-B-missing-time')!.reasonCode).toBe('MISSING_TIME');
    expect(opById.get('op-B-missing-idem')!.reasonCode).toBe(
      'MISSING_IDEMPOTENCY_KEY',
    );
    expect(opById.get('op-B-missing-metric')!.reasonCode).toBe(
      'MISSING_METRIC_REF',
    );

    // Complete ops are writable.
    expect(opById.get('op-A1')!.status).toBe('writable');
    expect(opById.get('op-B1')!.status).toBe('writable');
  });

  it('rolls up totals: 2 writable, 5 invalid, 7 total — nothing lost', () => {
    const plan = buildExecutionPlanFromPayload(f8Fixture);
    expect(plan.totals.total).toBe(7);
    expect(plan.totals.writable).toBe(2);
    expect(plan.totals.invalid).toBe(5);
    expect(plan.totals.unsupported).toBe(0);
    expect(plan.totals.skipped).toBe(0);
    expect(plan.totals.permissionMissing).toBe(0); // never emitted here
  });

  it('is deterministic — same payload yields an identical plan', () => {
    const a = buildExecutionPlanFromPayload(f8Fixture);
    const b = buildExecutionPlanFromPayload(f8Fixture);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

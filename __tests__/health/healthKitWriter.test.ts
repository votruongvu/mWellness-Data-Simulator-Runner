/**
 * MR-C-003 — guarded HealthKit write orchestrator (the real-write safety core).
 */
import {executeGuardedWrite} from '../../src/health/healthKitWriter';
import type {
  HealthKitBridge,
  NativeWriteResult,
  NativeWriteSample,
  NativeWriteStatus,
} from '../../src/health/healthKitBridge';
import type {FiveGateState} from '../../src/health/permissionFlow';
import type {PlanConcreteOperation} from '../../src/runner/executionPlan';

const ALL_GATES: FiveGateState = {
  dryRunCompleted: true,
  payloadSourceVerified: true,
  capabilityChecked: true,
  permissionResolvedOrGranted: true,
  explicitConfirmation: true,
};

const op = (over: Partial<PlanConcreteOperation> = {}): PlanConcreteOperation => ({
  operationId: 'op1',
  scenarioId: 's1',
  operationKind: 'daily_summary',
  status: 'writable',
  reasonCode: 'OK',
  detail: '',
  metricSlug: 'steps',
  value: 1200,
  unit: 'count',
  time: {model: 'relative', startOffsetMinutes: -720, endOffsetMinutes: -660},
  idempotencyKey: 'idem-1',
  ...over,
});

/** A bridge whose write returns a configurable result and records calls + the batch it received. */
function mockBridge(
  write: (samples: readonly NativeWriteSample[]) => readonly NativeWriteResult[],
): {bridge: HealthKitBridge; calls: () => number; lastBatch: () => readonly NativeWriteSample[]} {
  let calls = 0;
  let batch: readonly NativeWriteSample[] = [];
  const bridge: HealthKitBridge = {
    async isHealthDataAvailable() {
      return true;
    },
    async getShareStatus(tokens) {
      return tokens.map(token => ({token, raw: 'sharing_authorized' as const}));
    },
    async requestShareAuthorization() {
      return {outcome: 'resolved' as const, perConcept: []};
    },
    async writeQuantitySamples(samples) {
      calls += 1;
      batch = samples;
      return write(samples);
    },
  };
  return {bridge, calls: () => calls, lastBatch: () => batch};
}

describe('executeGuardedWrite — five-gate enforcement (no write unless all five)', () => {
  const gateKeys: (keyof FiveGateState)[] = [
    'dryRunCompleted',
    'payloadSourceVerified',
    'capabilityChecked',
    'permissionResolvedOrGranted',
    'explicitConfirmation',
  ];

  for (const missing of gateKeys) {
    it(`blocks and never calls native when ${missing} is false`, async () => {
      const m = mockBridge(() => []);
      const summary = await executeGuardedWrite({
        operations: [op()],
        gates: {...ALL_GATES, [missing]: false},
        bridge: m.bridge,
        baseInstantMs: 0,
      });
      expect(summary.blocked).toBe(true);
      expect(summary.blockedBy).toContain(missing);
      expect(m.calls()).toBe(0); // NO native write attempted
      expect(summary.fullSuccess).toBe(false);
      expect(summary.counts.succeeded).toBe(0);
    });
  }
});

describe('executeGuardedWrite — classification (skip, never fabricate)', () => {
  it('skips an unsupported metric (not in the writable set) without a native call', async () => {
    const m = mockBridge(() => []);
    const summary = await executeGuardedWrite({
      operations: [op({metricSlug: 'heart_rate'})],
      gates: ALL_GATES,
      bridge: m.bridge,
      baseInstantMs: 0,
    });
    expect(summary.results[0].status).toBe('skipped_unsupported');
    expect(m.calls()).toBe(0);
  });

  it('skips an invalid payload (missing value) as skipped_invalid_payload', async () => {
    const m = mockBridge(() => []);
    const summary = await executeGuardedWrite({
      operations: [op({value: undefined})],
      gates: ALL_GATES,
      bridge: m.bridge,
      baseInstantMs: 0,
    });
    expect(summary.results[0].status).toBe('skipped_invalid_payload');
    expect(m.calls()).toBe(0);
  });

  it('resolves relative→absolute time via the injected clock (no Date.now, no fabrication)', async () => {
    const m = mockBridge(s => s.map(x => ({operationId: x.operationId, status: 'succeeded' as const})));
    await executeGuardedWrite({operations: [op()], gates: ALL_GATES, bridge: m.bridge, baseInstantMs: 0});
    const sent = m.lastBatch()[0];
    // base 0 + (-720 min) = -43_200_000 ms = 1969-12-31T12:00:00Z
    expect(sent.startTimeIso).toBe('1969-12-31T12:00:00.000Z');
    expect(sent.endTimeIso).toBe('1969-12-31T13:00:00.000Z');
    expect(sent.value).toBe(1200);
    expect(sent.idempotencyKey).toBe('idem-1');
  });
});

describe('executeGuardedWrite — no fake success', () => {
  it('reports succeeded ONLY when the native bridge returned succeeded', async () => {
    const ok = mockBridge(s => s.map(x => ({operationId: x.operationId, status: 'succeeded' as const})));
    const okSummary = await executeGuardedWrite({operations: [op()], gates: ALL_GATES, bridge: ok.bridge, baseInstantMs: 0});
    expect(okSummary.results[0].status).toBe('succeeded');
    expect(okSummary.fullSuccess).toBe(true);

    const fail = mockBridge(s => s.map(x => ({operationId: x.operationId, status: 'failed' as const, message: 'HK save error'})));
    const failSummary = await executeGuardedWrite({operations: [op()], gates: ALL_GATES, bridge: fail.bridge, baseInstantMs: 0});
    expect(failSummary.results[0].status).toBe('failed');
    expect(failSummary.fullSuccess).toBe(false);
    expect(failSummary.counts.succeeded).toBe(0);
  });

  it('treats a missing native result for a sent sample as failed (never assumed success)', async () => {
    const m = mockBridge(() => []); // sent a sample but returns nothing
    const summary = await executeGuardedWrite({operations: [op()], gates: ALL_GATES, bridge: m.bridge, baseInstantMs: 0});
    expect(summary.results[0].status).toBe('failed');
    expect(summary.counts.succeeded).toBe(0);
  });

  it('treats a native throw as failed (never success)', async () => {
    const bridge: HealthKitBridge = {
      async isHealthDataAvailable() {
        return true;
      },
      async getShareStatus(tokens) {
        return tokens.map(token => ({token, raw: 'sharing_authorized' as const}));
      },
      async requestShareAuthorization() {
        return {outcome: 'resolved' as const, perConcept: []};
      },
      async writeQuantitySamples() {
        throw new Error('native boom');
      },
    };
    const summary = await executeGuardedWrite({operations: [op()], gates: ALL_GATES, bridge, baseInstantMs: 0});
    expect(summary.results[0].status).toBe('failed');
    expect(summary.counts.succeeded).toBe(0);
  });
});

describe('executeGuardedWrite — partial success is distinct from success', () => {
  it('flags partialSuccess (not fullSuccess) when some succeed and some do not', async () => {
    const m = mockBridge(s =>
      s.map((x, i) => ({operationId: x.operationId, status: (i === 0 ? 'succeeded' : 'failed') as NativeWriteStatus})),
    );
    const summary = await executeGuardedWrite({
      operations: [op({operationId: 'a'}), op({operationId: 'b'})],
      gates: ALL_GATES,
      bridge: m.bridge,
      baseInstantMs: 0,
    });
    expect(summary.counts.succeeded).toBe(1);
    expect(summary.counts.failed).toBe(1);
    expect(summary.partialSuccess).toBe(true);
    expect(summary.fullSuccess).toBe(false);
  });
});

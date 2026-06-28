/**
 * MR-C (MWR-MRC-002) — explain-before-prompt + five-gate chain (the safety core).
 */
import {
  canRequestPermission,
  evaluateWriteGate,
  requestPermissionGuarded,
  realWriteEnabledInThisBuild,
  REAL_WRITE_BLOCKED_IN_MR_C_002,
  EXPLAIN_BEFORE_PROMPT_REQUIRED,
  CAPABILITY_UNAVAILABLE,
  type PermissionFlowState,
} from '../../src/health/permissionFlow';
import type {HealthKitBridge} from '../../src/health/healthKitBridge';
import type {HealthKitCapability} from '../../src/health/healthKitCapability';
import {MRC_APPROVED_CONCEPT_TOKENS} from '../../src/health/healthKitTypes';

const cap = (available: boolean): HealthKitCapability => ({
  available,
  reason: available ? 'available' : 'bridge_unavailable',
  summary: 'test',
});

const state = (over: Partial<PermissionFlowState> = {}): PermissionFlowState => ({
  step: 'capability_checked',
  capability: cap(true),
  explanationAcknowledged: true,
  permission: 'not_requested',
  ...over,
});

describe('canRequestPermission (explain-before-prompt)', () => {
  it('blocks when capability is unavailable', () => {
    const g = canRequestPermission(state({capability: cap(false)}));
    expect(g.allowed).toBe(false);
    expect(g.blockedBy).toContain(CAPABILITY_UNAVAILABLE);
  });

  it('blocks when the explanation has not been acknowledged', () => {
    const g = canRequestPermission(state({explanationAcknowledged: false}));
    expect(g.allowed).toBe(false);
    expect(g.blockedBy).toContain(EXPLAIN_BEFORE_PROMPT_REQUIRED);
  });

  it('allows only when capability available AND explanation acknowledged', () => {
    const g = canRequestPermission(state());
    expect(g.allowed).toBe(true);
    expect(g.blockedBy).toHaveLength(0);
  });
});

describe('requestPermissionGuarded (no silent prompt)', () => {
  it('does NOT call the native prompt when the guard fails', async () => {
    const ref = {calls: 0};
    const bridge: HealthKitBridge = {
      async isHealthDataAvailable() {
        return true;
      },
      async getShareStatus(tokens) {
        return tokens.map(token => ({token, raw: 'not_determined' as const}));
      },
      async requestShareAuthorization() {
        ref.calls += 1;
        return {outcome: 'resolved' as const, perConcept: []};
      },
    };
    const result = await requestPermissionGuarded(
      state({explanationAcknowledged: false}),
      bridge,
      MRC_APPROVED_CONCEPT_TOKENS,
    );
    expect(ref.calls).toBe(0); // the OS prompt was never reached
    expect(result.outcome).toBe('gate_pending');
    expect(result.reasonCode).toBe(EXPLAIN_BEFORE_PROMPT_REQUIRED);
  });

  it('calls the native prompt only once the guard passes', async () => {
    const ref = {calls: 0};
    const bridge: HealthKitBridge = {
      async isHealthDataAvailable() {
        return true;
      },
      async getShareStatus(tokens) {
        return tokens.map(token => ({token, raw: 'not_determined' as const}));
      },
      async requestShareAuthorization() {
        ref.calls += 1;
        return {outcome: 'resolved' as const, perConcept: []};
      },
    };
    const result = await requestPermissionGuarded(state(), bridge, MRC_APPROVED_CONCEPT_TOKENS);
    expect(ref.calls).toBe(1);
    expect(result.outcome).toBe('resolved');
  });
});

describe('evaluateWriteGate (five-gate chain)', () => {
  const all = {
    dryRunCompleted: true,
    payloadSourceVerified: true,
    capabilityChecked: true,
    permissionResolvedOrGranted: true,
    explicitConfirmation: true,
  };

  it('allows only when all five gates are true', () => {
    expect(evaluateWriteGate(all).allowed).toBe(true);
  });

  it('blocks and names each unmet gate', () => {
    expect(evaluateWriteGate({...all, capabilityChecked: false}).blockedBy).toEqual(['capabilityChecked']);
    expect(evaluateWriteGate({...all, dryRunCompleted: false, explicitConfirmation: false}).allowed).toBe(false);
  });

  it('blocks when nothing is satisfied', () => {
    const none = evaluateWriteGate({
      dryRunCompleted: false,
      payloadSourceVerified: false,
      capabilityChecked: false,
      permissionResolvedOrGranted: false,
      explicitConfirmation: false,
    });
    expect(none.allowed).toBe(false);
    expect(none.blockedBy).toHaveLength(5);
  });
});

describe('no real write path in MR-C-002', () => {
  it('real write is hard-blocked regardless of software gates', () => {
    expect(realWriteEnabledInThisBuild()).toBe(false);
    expect(REAL_WRITE_BLOCKED_IN_MR_C_002).toBe(true);
  });
});

/**
 * MR-C (MWR-MRC-002) — guarded bridge seam: no fake success, fail-closed default.
 */
import {
  gatePendingBridge,
  resolveHealthKitBridge,
  NATIVE_BRIDGE_GATE_PENDING,
} from '../../src/health/healthKitBridge';
import {MRC_APPROVED_CONCEPT_TOKENS} from '../../src/health/healthKitTypes';

describe('gatePendingBridge', () => {
  it('reports HealthKit unavailable', async () => {
    await expect(gatePendingBridge.isHealthDataAvailable()).resolves.toBe(false);
  });

  it('reports every requested concept as unavailable', async () => {
    const status = await gatePendingBridge.getShareStatus(MRC_APPROVED_CONCEPT_TOKENS);
    expect(status).toHaveLength(MRC_APPROVED_CONCEPT_TOKENS.length);
    expect(status.every(s => s.raw === 'unavailable')).toBe(true);
  });

  it('returns gate_pending (never resolved/success) and fires no prompt', async () => {
    const result = await gatePendingBridge.requestShareAuthorization(MRC_APPROVED_CONCEPT_TOKENS);
    expect(result.outcome).toBe('gate_pending');
    expect(result.outcome).not.toBe('resolved');
    expect(result.perConcept).toHaveLength(0);
    expect(result.reasonCode).toBe(NATIVE_BRIDGE_GATE_PENDING);
  });
});

describe('resolveHealthKitBridge', () => {
  it('falls back to the gate-pending default when no native module is registered', () => {
    const {bridge, present} = resolveHealthKitBridge();
    expect(present).toBe(false);
    expect(bridge).toBe(gatePendingBridge);
  });
});

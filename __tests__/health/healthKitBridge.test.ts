/**
 * MR-C (MWR-MRC-002) — guarded bridge seam: no fake success, fail-closed default.
 */
import {
  gatePendingBridge,
  normalizeNativeBridge,
  resolveHealthKitBridge,
  NATIVE_BRIDGE_GATE_PENDING,
} from '../../src/health/healthKitBridge';
import {summarizeHealthPermission} from '../../src/health/healthPermission';
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

describe('normalizeNativeBridge (raw iOS status → normalized tokens)', () => {
  // The native module emits raw iOS strings; the wrapper must normalize them so
  // an authorized real-device user summarizes to `granted` (not `unavailable`).
  const rawNative = {
    async isHealthDataAvailable() {
      return true;
    },
    async getShareStatus(tokens: readonly (typeof MRC_APPROVED_CONCEPT_TOKENS)[number][]) {
      return tokens.map(token => ({token, raw: 'sharingAuthorized'}));
    },
    async requestShareAuthorization(tokens: readonly (typeof MRC_APPROVED_CONCEPT_TOKENS)[number][]) {
      return {outcome: 'resolved' as const, perConcept: tokens.map(token => ({token, raw: 'sharingAuthorized'}))};
    },
    async writeQuantitySamples() {
      return [];
    },
  };

  it('maps iOS sharingAuthorized → sharing_authorized → granted', async () => {
    const bridge = normalizeNativeBridge(rawNative);
    const status = await bridge.getShareStatus(MRC_APPROVED_CONCEPT_TOKENS);
    expect(status.every(s => s.raw === 'sharing_authorized')).toBe(true);
    expect(summarizeHealthPermission(status)).toBe('granted');
  });

  it('normalizes the request-authorization perConcept too', async () => {
    const bridge = normalizeNativeBridge(rawNative);
    const r = await bridge.requestShareAuthorization(MRC_APPROVED_CONCEPT_TOKENS);
    expect(r.outcome).toBe('resolved');
    expect(summarizeHealthPermission(r.perConcept)).toBe('granted');
  });

  it('maps an unrecognized iOS status to unavailable (fail-closed, never granted)', async () => {
    const weird = {...rawNative, async getShareStatus(tokens: readonly (typeof MRC_APPROVED_CONCEPT_TOKENS)[number][]) {
      return tokens.map(token => ({token, raw: 'somethingElse'}));
    }};
    const bridge = normalizeNativeBridge(weird);
    const status = await bridge.getShareStatus(MRC_APPROVED_CONCEPT_TOKENS);
    expect(status.every(s => s.raw === 'unavailable')).toBe(true);
    expect(summarizeHealthPermission(status)).not.toBe('granted');
  });
});

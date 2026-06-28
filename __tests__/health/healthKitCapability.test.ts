/**
 * MR-C (MWR-MRC-002) — HealthKit capability evaluation (fail-closed).
 */
import {evaluateHealthKitCapability} from '../../src/health/healthKitCapability';

describe('evaluateHealthKitCapability', () => {
  it('is unavailable (non-iOS) on Android', () => {
    const cap = evaluateHealthKitCapability({os: 'android', bridgePresent: true, nativeIsAvailable: true});
    expect(cap.available).toBe(false);
    expect(cap.reason).toBe('unavailable_non_ios');
  });

  it('reports bridge_unavailable on iOS when the native bridge is absent (fail-closed)', () => {
    const cap = evaluateHealthKitCapability({os: 'ios', bridgePresent: false});
    expect(cap.available).toBe(false);
    expect(cap.reason).toBe('bridge_unavailable');
  });

  it('is available only when iOS + bridge present + native says available', () => {
    const cap = evaluateHealthKitCapability({os: 'ios', bridgePresent: true, nativeIsAvailable: true});
    expect(cap.available).toBe(true);
    expect(cap.reason).toBe('available');
  });

  it('is unavailable_device when iOS bridge reports HealthKit unavailable', () => {
    const cap = evaluateHealthKitCapability({os: 'ios', bridgePresent: true, nativeIsAvailable: false});
    expect(cap.available).toBe(false);
    expect(cap.reason).toBe('unavailable_device');
  });

  it('is unknown (fail-closed) when availability is indeterminate', () => {
    const cap = evaluateHealthKitCapability({os: 'ios', bridgePresent: true, nativeIsAvailable: null});
    expect(cap.available).toBe(false);
    expect(cap.reason).toBe('unknown');
  });

  it('never reports available without an explicit native true', () => {
    for (const nativeIsAvailable of [undefined, null, false]) {
      const cap = evaluateHealthKitCapability({os: 'ios', bridgePresent: true, nativeIsAvailable});
      expect(cap.available).toBe(false);
    }
  });
});

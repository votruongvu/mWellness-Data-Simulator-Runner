/**
 * MR-C (MWR-MRC-002) — iOS HealthKit availability / capability model.
 *
 * Pure evaluation of "can this device use Apple Health (HealthKit)?". The actual
 * `HKHealthStore.isHealthDataAvailable()` runs **natively** (in the gated
 * `MwrHealthKit` module); this layer only interprets that result + the OS into a
 * fail-closed capability decision. No silent assumptions: an unknown/absent
 * bridge is reported as such, never assumed available.
 *
 * Terminology guard (R-MWR-010): this is Apple Health · HealthKit (iOS). The
 * Android target is Health Connect — never "Google HealthKit" / Google Fit.
 */

export type CapabilityReason =
  /** iOS + native bridge reports HealthKit available. */
  | 'available'
  /** Not iOS → HealthKit is not applicable (Android uses Health Connect). */
  | 'unavailable_non_ios'
  /** iOS, but the native store reports HealthKit unavailable (e.g. iPad, simulator). */
  | 'unavailable_device'
  /** The native `MwrHealthKit` bridge is not present yet (seam not built — gated). */
  | 'bridge_unavailable'
  /** State could not be determined (fail-closed: treated as not available). */
  | 'unknown';

export interface HealthKitCapability {
  /** Fail-closed: only `true` when iOS + bridge present + native reports available. */
  readonly available: boolean;
  readonly reason: CapabilityReason;
  /** Short human label for the capability UI. */
  readonly summary: string;
}

export interface CapabilityInput {
  /** Resolved device OS. */
  readonly os: 'ios' | 'android' | 'unknown';
  /** Whether the native `MwrHealthKit` bridge module is registered. */
  readonly bridgePresent: boolean;
  /**
   * Result of the native `isHealthDataAvailable()` call, when the bridge ran.
   * `undefined`/`null` means it was not (or could not be) determined.
   */
  readonly nativeIsAvailable?: boolean | null;
}

const SUMMARIES: Record<CapabilityReason, string> = {
  available: 'Apple Health (HealthKit) is available on this device.',
  unavailable_non_ios: 'Not an iOS device — Apple Health (HealthKit) is not applicable here.',
  unavailable_device: 'This iOS device reports HealthKit is unavailable (e.g. iPad or simulator).',
  bridge_unavailable:
    'The native HealthKit bridge is not enabled yet (gated: #1/#3/#9). Capability cannot be confirmed.',
  unknown: 'HealthKit availability could not be determined.',
};

function capability(available: boolean, reason: CapabilityReason): HealthKitCapability {
  return {available, reason, summary: SUMMARIES[reason]};
}

/**
 * Evaluate HealthKit capability, fail-closed. Only `available: true` when the
 * platform is iOS, the native bridge is present, and the native availability
 * check returned `true`.
 */
export function evaluateHealthKitCapability(input: CapabilityInput): HealthKitCapability {
  if (input.os !== 'ios') {
    return capability(false, 'unavailable_non_ios');
  }
  if (!input.bridgePresent) {
    // Seam not built yet — honest, not "available".
    return capability(false, 'bridge_unavailable');
  }
  if (input.nativeIsAvailable === true) {
    return capability(true, 'available');
  }
  if (input.nativeIsAvailable === false) {
    return capability(false, 'unavailable_device');
  }
  return capability(false, 'unknown');
}

/**
 * MR-C-004 — SHARED (iOS + Android) health-store capability model.
 *
 * Platform-agnostic version of the iOS-only `healthKitCapability`. Interprets the
 * native availability result + the OS into a fail-closed decision for the SHARED
 * write path (Apple Health on iOS · Health Connect on Android). No silent
 * assumptions: an unknown/absent bridge is reported as such, never available.
 *
 * Terminology guard (R-MWR-010): iOS destination = Apple Health (HealthKit API);
 * Android destination = Health Connect — never "Google HealthKit" / Google Fit.
 */

export type HealthCapabilityReason =
  /** Native bridge reports the platform health store is available. */
  | 'available'
  /** Neither iOS nor Android → no supported health store. */
  | 'unavailable_platform'
  /** Platform health store reports unavailable (iOS: iPad/sim; Android: Health Connect not installed / update required). */
  | 'unavailable_device'
  /** The native bridge module is not present (seam not built / not on this platform). */
  | 'bridge_unavailable'
  /** Could not determine (fail-closed: treated as not available). */
  | 'unknown';

export interface HealthCapability {
  readonly available: boolean;
  readonly reason: HealthCapabilityReason;
  readonly platform: 'ios' | 'android' | 'unknown';
  /** Destination label, e.g. "Apple Health" / "Health Connect". */
  readonly destinationLabel: string;
  readonly summary: string;
}

export interface HealthCapabilityInput {
  readonly platform: 'ios' | 'android' | 'unknown';
  readonly bridgePresent: boolean;
  readonly nativeIsAvailable?: boolean | null;
}

function destinationFor(platform: 'ios' | 'android' | 'unknown'): string {
  return platform === 'ios' ? 'Apple Health' : platform === 'android' ? 'Health Connect' : 'Unknown';
}

/**
 * Evaluate health-store capability, fail-closed. `available: true` only when the
 * platform is iOS/Android, the native bridge is present, and the native check
 * returned `true`.
 */
export function evaluateHealthCapability(input: HealthCapabilityInput): HealthCapability {
  const destinationLabel = destinationFor(input.platform);
  const make = (available: boolean, reason: HealthCapabilityReason, summary: string): HealthCapability => ({
    available,
    reason,
    platform: input.platform,
    destinationLabel,
    summary,
  });

  if (input.platform !== 'ios' && input.platform !== 'android') {
    return make(false, 'unavailable_platform', 'No supported health store on this platform.');
  }
  if (!input.bridgePresent) {
    return make(
      false,
      'bridge_unavailable',
      `The native ${destinationLabel} bridge is not enabled. Capability cannot be confirmed.`,
    );
  }
  if (input.nativeIsAvailable === true) {
    return make(true, 'available', `${destinationLabel} is available on this device.`);
  }
  if (input.nativeIsAvailable === false) {
    const detail =
      input.platform === 'android'
        ? 'Health Connect is not installed or needs an update.'
        : 'This iOS device reports HealthKit is unavailable (e.g. iPad or simulator).';
    return make(false, 'unavailable_device', detail);
  }
  return make(false, 'unknown', `${destinationLabel} availability could not be determined.`);
}

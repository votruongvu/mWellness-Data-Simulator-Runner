/**
 * MR-C (MWR-MRC-002) — guarded iOS HealthKit native bridge SEAM.
 *
 * Defines the contract the native `MwrHealthKit` module (Obj-C/Swift, native
 * prefix `Mwr<Capability>` per ADR-MWR-010) will implement **later**, and a
 * fail-closed default used until then. THIS FILE DOES NOT:
 *   - touch a real `HKHealthStore` (gate #1),
 *   - fire the OS permission prompt (gate #3),
 *   - require the HealthKit entitlement / Info.plist (gate #9),
 *   - or fabricate a success (NO_FAKE_SUCCESS, ADR-MWR-005).
 *
 * The native module is intentionally absent in this story; `resolveHealthKitBridge`
 * therefore returns the `gatePendingBridge`, which reports honestly and fires no
 * prompt. When the native module ships (post gates #1/#3/#9 + device QA), it
 * plugs into the same seam. Even then, the prompt must be reached only through
 * `requestPermissionGuarded` (permissionFlow.ts), which enforces explain-before-prompt.
 */

import {NativeModules, Platform} from 'react-native';
import type {PerConceptPermission} from './healthPermission';
import type {HealthConceptToken} from './healthKitTypes';

/** Outcome of a guarded permission request. NEVER a fake success. */
export type AuthorizationRequestOutcome =
  /** A real native prompt completed; per-concept statuses are returned. */
  | 'resolved'
  /** Native bridge/prompt not enabled yet (gates #1/#3/#9) — no prompt fired. */
  | 'gate_pending'
  /** HealthKit not available on this device/platform — no prompt fired. */
  | 'unavailable'
  /** Native call failed — surfaced, not swallowed, never reported as success. */
  | 'error';

export interface AuthorizationRequestResult {
  readonly outcome: AuthorizationRequestOutcome;
  /** Per-concept statuses — empty unless `outcome === 'resolved'`. */
  readonly perConcept: readonly PerConceptPermission[];
  /** Machine reason for a non-resolved outcome; never implies success. */
  readonly reasonCode?: string;
  readonly message?: string;
}

/**
 * The native seam. Implemented later by the native `MwrHealthKit` module ONLY
 * after gates #1/#3/#9 + device QA. No method here may report success that the
 * platform did not actually return.
 */
export interface HealthKitBridge {
  /** `HKHealthStore.isHealthDataAvailable()` — resolved natively. No prompt. */
  isHealthDataAvailable(): Promise<boolean>;
  /** `authorizationStatus(forSharing:)` per concept — resolved natively. No prompt. */
  getShareStatus(tokens: readonly HealthConceptToken[]): Promise<readonly PerConceptPermission[]>;
  /**
   * `requestAuthorization(toShare:read:)` — this is the call that FIRES THE OS
   * PROMPT (gate #1 + gate #3). Must only be reached via `requestPermissionGuarded`.
   */
  requestShareAuthorization(
    tokens: readonly HealthConceptToken[],
  ): Promise<AuthorizationRequestResult>;
}

/** Reason code surfaced when the native bridge is not yet enabled. */
export const NATIVE_BRIDGE_GATE_PENDING = 'NATIVE_BRIDGE_GATE_PENDING';

/**
 * Fail-closed default seam used until the native module ships. Reports HealthKit
 * unavailable, all concepts `unavailable`, and a `gate_pending` request outcome.
 * It fires NO prompt and NEVER returns `resolved`/success.
 */
export const gatePendingBridge: HealthKitBridge = {
  async isHealthDataAvailable(): Promise<boolean> {
    return false;
  },
  async getShareStatus(
    tokens: readonly HealthConceptToken[],
  ): Promise<readonly PerConceptPermission[]> {
    return tokens.map(token => ({token, raw: 'unavailable' as const}));
  },
  async requestShareAuthorization(): Promise<AuthorizationRequestResult> {
    return {
      outcome: 'gate_pending',
      perConcept: [],
      reasonCode: NATIVE_BRIDGE_GATE_PENDING,
      message:
        'The native HealthKit permission bridge is not enabled. Requesting real ' +
        'permission requires human-approval gates #1 (Apple Health write/auth), #3 ' +
        '(permission-prompt timing + copy) and #9 (HealthKit entitlement + Info.plist), ' +
        'plus a real iOS device. No OS prompt was shown and nothing was written.',
    };
  },
};

/**
 * Resolve the active bridge: the native `MwrHealthKit` module when present on
 * iOS, otherwise the fail-closed `gatePendingBridge`. `present` reflects whether
 * a real native module backs the seam (used by the capability evaluation).
 */
export function resolveHealthKitBridge(): {bridge: HealthKitBridge; present: boolean} {
  const native = (NativeModules as {MwrHealthKit?: HealthKitBridge}).MwrHealthKit;
  if (
    Platform.OS === 'ios' &&
    native &&
    typeof native.isHealthDataAvailable === 'function' &&
    typeof native.requestShareAuthorization === 'function'
  ) {
    return {bridge: native, present: true};
  }
  return {bridge: gatePendingBridge, present: false};
}

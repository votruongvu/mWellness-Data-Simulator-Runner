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
import {
  mapAndroidShareStatus,
  mapIosShareStatus,
  type PerConceptPermission,
  type RawShareAuthorization,
} from './healthPermission';
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
 * One quantity sample to write. Values/units/times are the backend F8 payload's
 * (resolved to absolute ISO via the injected clock) — NEVER fabricated here.
 */
export interface NativeWriteSample {
  readonly operationId: string;
  /** Concept token (e.g. 'stepCount'); the native module maps it to the HK type. */
  readonly concept: HealthConceptToken;
  readonly value: number;
  readonly unit: string;
  readonly startTimeIso: string;
  readonly endTimeIso: string;
  /** Backend idempotency key — used as the HealthKit sync identifier. */
  readonly idempotencyKey: string;
}

/** Per-operation native write status. `succeeded` ONLY if the native save succeeded. */
export type NativeWriteStatus =
  | 'succeeded'
  | 'failed'
  | 'skipped_permission'
  | 'skipped_unsupported'
  | 'skipped_invalid_payload';

export interface NativeWriteResult {
  readonly operationId: string;
  readonly status: NativeWriteStatus;
  /** Native error/skip reason; present for non-succeeded — never implies success. */
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
  /**
   * Guarded native write of quantity samples. The native module re-checks
   * support + share authorization per sample and only reports `succeeded` when
   * `HKHealthStore` actually saved it. The TS five-gate chain must already pass
   * before this is reached (see healthKitWriter.ts). NO fake success.
   */
  writeQuantitySamples(
    samples: readonly NativeWriteSample[],
  ): Promise<readonly NativeWriteResult[]>;
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
  async writeQuantitySamples(
    samples: readonly NativeWriteSample[],
  ): Promise<readonly NativeWriteResult[]> {
    // Native bridge absent → fail closed. NEVER report success.
    return samples.map(s => ({
      operationId: s.operationId,
      status: 'failed' as const,
      message: `Native HealthKit bridge not available (${NATIVE_BRIDGE_GATE_PENDING}); nothing was written.`,
    }));
  },
};

/**
 * The RAW native `MwrHealthKit` module shape. The native side emits the iOS
 * authorization-status STRINGS verbatim (`sharingAuthorized` / `sharingDenied`
 * / `notDetermined`); the wrapper below normalizes them to `RawShareAuthorization`
 * via `mapIosShareStatus`. (Keeping the native side "raw iOS" and normalizing in
 * TS is the single mapping point — see healthPermission.mapIosShareStatus.)
 */
interface RawHealthKitNative {
  isHealthDataAvailable(): Promise<boolean>;
  getShareStatus(
    tokens: readonly HealthConceptToken[],
  ): Promise<ReadonlyArray<{token: HealthConceptToken; raw: string}>>;
  requestShareAuthorization(tokens: readonly HealthConceptToken[]): Promise<{
    outcome: AuthorizationRequestOutcome;
    perConcept: ReadonlyArray<{token: HealthConceptToken; raw: string}>;
    reasonCode?: string;
    message?: string;
  }>;
  writeQuantitySamples(
    samples: readonly NativeWriteSample[],
  ): Promise<readonly NativeWriteResult[]>;
}

/**
 * Wrap the raw native module into the normalized `HealthKitBridge`, using the
 * platform-specific status mapper (iOS `mapIosShareStatus` by default; Android
 * passes `mapAndroidShareStatus`).
 */
export function normalizeNativeBridge(
  native: RawHealthKitNative,
  mapStatus: (raw: string) => RawShareAuthorization = mapIosShareStatus,
): HealthKitBridge {
  return {
    isHealthDataAvailable: () => native.isHealthDataAvailable(),
    getShareStatus: async tokens =>
      (await native.getShareStatus(tokens)).map(p => ({token: p.token, raw: mapStatus(p.raw)})),
    requestShareAuthorization: async tokens => {
      const r = await native.requestShareAuthorization(tokens);
      return {
        outcome: r.outcome,
        perConcept: r.perConcept.map(p => ({token: p.token, raw: mapStatus(p.raw)})),
        reasonCode: r.reasonCode,
        message: r.message,
      };
    },
    writeQuantitySamples: samples => native.writeQuantitySamples(samples),
  };
}

function hasBridgeShape(n: RawHealthKitNative | undefined): n is RawHealthKitNative {
  return (
    !!n &&
    typeof n.isHealthDataAvailable === 'function' &&
    typeof n.requestShareAuthorization === 'function' &&
    typeof n.writeQuantitySamples === 'function'
  );
}

/**
 * Resolve the active bridge: the native `MwrHealthKit` module (normalized) when
 * present on iOS, otherwise the fail-closed `gatePendingBridge`. iOS-only entry
 * kept for the MR-C-002 preview screen; the shared write path uses
 * {@link resolveHealthBridge}.
 */
export function resolveHealthKitBridge(): {bridge: HealthKitBridge; present: boolean} {
  const native = (NativeModules as {MwrHealthKit?: RawHealthKitNative}).MwrHealthKit;
  if (Platform.OS === 'ios' && hasBridgeShape(native)) {
    return {bridge: normalizeNativeBridge(native, mapIosShareStatus), present: true};
  }
  return {bridge: gatePendingBridge, present: false};
}

/**
 * Platform-agnostic resolver for the shared write path. Selects the native
 * `MwrHealthKit` (iOS) or `MwrHealthConnect` (Android) module — never both, so
 * the iOS path can't reach the Android bridge or vice-versa — else the
 * fail-closed `gatePendingBridge`.
 */
export function resolveHealthBridge(): {
  bridge: HealthKitBridge;
  present: boolean;
  platform: 'ios' | 'android' | 'unknown';
} {
  if (Platform.OS === 'ios') {
    const native = (NativeModules as {MwrHealthKit?: RawHealthKitNative}).MwrHealthKit;
    return hasBridgeShape(native)
      ? {bridge: normalizeNativeBridge(native, mapIosShareStatus), present: true, platform: 'ios'}
      : {bridge: gatePendingBridge, present: false, platform: 'ios'};
  }
  if (Platform.OS === 'android') {
    const native = (NativeModules as {MwrHealthConnect?: RawHealthKitNative}).MwrHealthConnect;
    return hasBridgeShape(native)
      ? {bridge: normalizeNativeBridge(native, mapAndroidShareStatus), present: true, platform: 'android'}
      : {bridge: gatePendingBridge, present: false, platform: 'android'};
  }
  return {bridge: gatePendingBridge, present: false, platform: 'unknown'};
}

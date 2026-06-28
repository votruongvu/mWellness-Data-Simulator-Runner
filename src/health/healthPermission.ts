/**
 * MR-C (MWR-MRC-002) — iOS HealthKit permission STATUS model.
 *
 * Represents share (write) authorization "without silent assumptions" (story
 * acceptance criterion). The raw per-concept status is reported by the native
 * `MwrHealthKit` bridge (gated); this layer maps + summarizes it. It never
 * fabricates a grant: an undetermined or unavailable status is reported as such,
 * never coerced to `granted`.
 *
 * HealthKit note: for SHARE (write) types iOS exposes the real authorization
 * status; `granted` here means the user did not deny WRITE — it does NOT imply a
 * future write will succeed (no-fake-success still applies at write time, MR-C-003).
 */

import type {HealthConceptToken} from './healthKitTypes';

/** Story-canonical permission status set. */
export type HealthPermissionStatus =
  | 'not_requested'
  | 'granted'
  | 'denied'
  | 'partial'
  | 'unavailable'
  | 'unknown';

/** Per-concept share authorization as reported by the native bridge. */
export type RawShareAuthorization =
  /** iOS `.sharingAuthorized` — user permitted writing this type. */
  | 'sharing_authorized'
  /** iOS `.sharingDenied` — user denied writing this type. */
  | 'sharing_denied'
  /** iOS `.notDetermined` — not yet asked. */
  | 'not_determined'
  /** Capability/bridge absent — cannot be determined. */
  | 'unavailable';

export interface PerConceptPermission {
  readonly token: HealthConceptToken;
  readonly raw: RawShareAuthorization;
}

/**
 * Map an iOS HealthKit authorization-status string to the raw model. The native
 * bridge is expected to pass these literal tokens; an unrecognized value maps to
 * `unavailable` (fail-closed) rather than being assumed authorized.
 */
export function mapIosShareStatus(iosStatus: string): RawShareAuthorization {
  switch (iosStatus) {
    case 'sharingAuthorized':
      return 'sharing_authorized';
    case 'sharingDenied':
      return 'sharing_denied';
    case 'notDetermined':
      return 'not_determined';
    default:
      return 'unavailable';
  }
}

/**
 * Map an Android Health Connect permission state to the raw model. Health Connect
 * exposes granted permissions only; the native bridge emits `granted` /
 * `not_granted` (pre-request) and `denied` (post-request, still not granted). An
 * unrecognized value maps to `unavailable` (fail-closed), never authorized.
 */
export function mapAndroidShareStatus(androidStatus: string): RawShareAuthorization {
  switch (androidStatus) {
    case 'granted':
      return 'sharing_authorized';
    case 'denied':
      return 'sharing_denied';
    case 'not_granted':
    case 'not_determined':
      return 'not_determined';
    default:
      return 'unavailable';
  }
}

/**
 * Summarize per-concept authorizations into the overall status, fail-closed.
 *
 *  - no entries                          → `unknown`
 *  - every entry unavailable             → `unavailable`
 *  - all determinable entries authorized → `granted`
 *  - some (not all) authorized           → `partial`
 *  - none authorized, ≥1 denied          → `denied`
 *  - none authorized, only not-determined→ `not_requested`
 */
export function summarizeHealthPermission(
  perConcept: readonly PerConceptPermission[],
): HealthPermissionStatus {
  if (perConcept.length === 0) {
    return 'unknown';
  }
  let authorized = 0;
  let denied = 0;
  let notDetermined = 0;
  let unavailable = 0;
  for (const p of perConcept) {
    switch (p.raw) {
      case 'sharing_authorized':
        authorized += 1;
        break;
      case 'sharing_denied':
        denied += 1;
        break;
      case 'not_determined':
        notDetermined += 1;
        break;
      case 'unavailable':
        unavailable += 1;
        break;
    }
  }
  const n = perConcept.length;
  if (unavailable === n) {
    return 'unavailable';
  }
  if (authorized === n) {
    return 'granted';
  }
  if (authorized > 0) {
    return 'partial';
  }
  // authorized === 0 below.
  if (denied > 0) {
    return 'denied';
  }
  if (notDetermined > 0) {
    return 'not_requested';
  }
  // Only unavailable + (no authorized/denied/not_determined) but not all unavailable
  // is unreachable; default fail-closed.
  return 'unknown';
}

/** Human label for the permission status (UI). */
export function describeHealthPermission(status: HealthPermissionStatus): string {
  switch (status) {
    case 'granted':
      return 'Write access granted for the requested types.';
    case 'partial':
      return 'Write access granted for some types only — others denied or not yet requested.';
    case 'denied':
      return 'Write access denied. Denied types are skipped (PERMISSION_MISSING) — never forced.';
    case 'not_requested':
      return 'Write access has not been requested yet.';
    case 'unavailable':
      return 'HealthKit is unavailable on this device — permission cannot be requested.';
    case 'unknown':
    default:
      return 'Permission status is unknown.';
  }
}

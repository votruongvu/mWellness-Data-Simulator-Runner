/**
 * MR-C (MWR-MRC-002) — iOS HealthKit capability/permission DOMAIN tokens.
 *
 * Concept-token boundary (capability matrix, load-bearing): the TS/domain layer
 * carries UNQUALIFIED concept tokens only and names **no** OS SDK symbol. The
 * qualified HealthKit identifiers (`HKQuantityType(...)`, `HKHealthStore`, …)
 * resolve **only inside the native `.swift`/`.mm` module**, and only after the
 * per-write gate chain passes. That native module (`MwrHealthKit`) is NOT built
 * in this story — gates #1 (real auth/query) / #3 (prompt timing+copy) / #9
 * (HealthKit entitlement + Info.plist) are pending. Nothing here touches a real
 * health store, fires a prompt, or writes.
 *
 * Writability of every concept below is `TO_VERIFY` (per-device, ADR-MWR-009);
 * the set is owned by the MWDS backend catalog, not authored here.
 */

/** Approved MR-C candidate metric concept tokens (writability `TO_VERIFY`). */
export type HealthConceptToken =
  | 'heartRate'
  | 'stepCount'
  | 'distanceWalkingRunning'
  | 'activeEnergyBurned'
  | 'sleepAnalysis'
  | 'bodyMass';

/** The minimal MR-C candidate set (from the capability matrix). */
export const MRC_APPROVED_CONCEPT_TOKENS: readonly HealthConceptToken[] = [
  'heartRate',
  'stepCount',
  'distanceWalkingRunning',
  'activeEnergyBurned',
  'sleepAnalysis',
  'bodyMass',
] as const;

/**
 * Backend `metric_slug` → unqualified concept token (REFERENCE only).
 * The backend authors the slug; this maps it to the device-side concept the
 * gated native writer would later resolve. Writability is `TO_VERIFY`.
 */
export const BACKEND_SLUG_TO_CONCEPT: Readonly<Record<string, HealthConceptToken>> = {
  heart_rate: 'heartRate',
  steps: 'stepCount',
  distance: 'distanceWalkingRunning',
  active_energy: 'activeEnergyBurned',
  sleep: 'sleepAnalysis',
  body_mass: 'bodyMass',
  weight: 'bodyMass',
};

/** Resolve a backend metric slug to its concept token, or `undefined` if the
 *  slug is outside the approved MR-C set (surfaced as unsupported — not mapped). */
export function conceptTokenForSlug(slug: string): HealthConceptToken | undefined {
  return BACKEND_SLUG_TO_CONCEPT[slug];
}

/** True iff the concept token is in the approved MR-C candidate set. */
export function isApprovedConcept(token: string): token is HealthConceptToken {
  return (MRC_APPROVED_CONCEPT_TOKENS as readonly string[]).includes(token);
}

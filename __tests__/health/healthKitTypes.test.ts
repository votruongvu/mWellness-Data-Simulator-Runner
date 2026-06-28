/**
 * MR-C (MWR-MRC-002) — concept-token resolution (unsupported-surfaced, not mapped).
 */
import {
  conceptTokenForSlug,
  isApprovedConcept,
  MRC_APPROVED_CONCEPT_TOKENS,
} from '../../src/health/healthKitTypes';

describe('conceptTokenForSlug', () => {
  it('maps each approved backend slug to its concept token', () => {
    expect(conceptTokenForSlug('steps')).toBe('stepCount');
    expect(conceptTokenForSlug('heart_rate')).toBe('heartRate');
    expect(conceptTokenForSlug('distance')).toBe('distanceWalkingRunning');
    expect(conceptTokenForSlug('active_energy')).toBe('activeEnergyBurned');
    expect(conceptTokenForSlug('sleep')).toBe('sleepAnalysis');
    expect(conceptTokenForSlug('body_mass')).toBe('bodyMass');
    expect(conceptTokenForSlug('weight')).toBe('bodyMass');
  });

  it('returns undefined for a non-approved slug (surfaced as unsupported, never mapped/fabricated)', () => {
    expect(conceptTokenForSlug('floors_climbed')).toBeUndefined();
    expect(conceptTokenForSlug('blood_glucose')).toBeUndefined();
    expect(conceptTokenForSlug('')).toBeUndefined();
  });
});

describe('isApprovedConcept', () => {
  it('is true only for the approved MR-C concept set', () => {
    for (const token of MRC_APPROVED_CONCEPT_TOKENS) {
      expect(isApprovedConcept(token)).toBe(true);
    }
  });

  it('is false for tokens outside the approved set', () => {
    expect(isApprovedConcept('floorsClimbed')).toBe(false);
    expect(isApprovedConcept('bloodGlucose')).toBe(false);
    expect(isApprovedConcept('stepcount')).toBe(false); // case-sensitive
  });
});

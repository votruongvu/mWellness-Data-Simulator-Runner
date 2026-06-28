/**
 * MR-C (MWR-MRC-002) — permission status model (no silent assumptions).
 */
import {
  mapIosShareStatus,
  summarizeHealthPermission,
  type PerConceptPermission,
} from '../../src/health/healthPermission';

const p = (raw: PerConceptPermission['raw'], token: PerConceptPermission['token'] = 'stepCount'): PerConceptPermission => ({
  token,
  raw,
});

describe('mapIosShareStatus', () => {
  it('maps known iOS statuses', () => {
    expect(mapIosShareStatus('sharingAuthorized')).toBe('sharing_authorized');
    expect(mapIosShareStatus('sharingDenied')).toBe('sharing_denied');
    expect(mapIosShareStatus('notDetermined')).toBe('not_determined');
  });

  it('maps an unknown status to unavailable (fail-closed, never authorized)', () => {
    expect(mapIosShareStatus('something_else')).toBe('unavailable');
    expect(mapIosShareStatus('')).toBe('unavailable');
  });
});

describe('summarizeHealthPermission', () => {
  it('returns unknown for an empty set', () => {
    expect(summarizeHealthPermission([])).toBe('unknown');
  });

  it('returns unavailable when every concept is unavailable', () => {
    expect(summarizeHealthPermission([p('unavailable'), p('unavailable', 'heartRate')])).toBe('unavailable');
  });

  it('returns granted only when all are authorized', () => {
    expect(
      summarizeHealthPermission([p('sharing_authorized'), p('sharing_authorized', 'heartRate')]),
    ).toBe('granted');
  });

  it('returns partial when some (not all) are authorized', () => {
    expect(
      summarizeHealthPermission([p('sharing_authorized'), p('sharing_denied', 'heartRate')]),
    ).toBe('partial');
    expect(
      summarizeHealthPermission([p('sharing_authorized'), p('not_determined', 'heartRate')]),
    ).toBe('partial');
  });

  it('returns not_requested when nothing is authorized/denied and some are not-determined', () => {
    expect(summarizeHealthPermission([p('not_determined'), p('not_determined', 'heartRate')])).toBe(
      'not_requested',
    );
  });

  it('returns denied when none authorized and at least one denied', () => {
    expect(summarizeHealthPermission([p('sharing_denied'), p('not_determined', 'heartRate')])).toBe('denied');
    expect(summarizeHealthPermission([p('sharing_denied'), p('sharing_denied', 'heartRate')])).toBe('denied');
  });

  it('NEVER reports granted from a not-determined-only set (no fake grant)', () => {
    expect(summarizeHealthPermission([p('not_determined')])).not.toBe('granted');
  });
});

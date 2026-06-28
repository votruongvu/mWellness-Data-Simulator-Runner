/**
 * MR-C — relative time resolution tests (PURE, INJECTED CLOCK).
 *
 * Covers resolveRelativeTime: relative offset-minutes + an INJECTED base
 * instant -> exact, deterministic absolute ISO instants. The base instant is
 * always supplied by the caller (never Date.now), so a fixed base yields a
 * fixed ISO every time.
 *
 * SAFETY: pure arithmetic only — no network/native/permission/write path, and
 * no clock read inside the core (the base instant is injected).
 */

import {resolveRelativeTime} from '../src/runner/timeModel';
import {RunnableTimeModel} from '../src/testCases/runnablePayloadTypes';

describe('resolveRelativeTime — injected clock, deterministic', () => {
  // Fixed base instant: 2025-06-01T00:00:00.000Z.
  const baseInstantMs = Date.UTC(2025, 5, 1, 0, 0, 0, 0);

  it('resolves negative offsets to exact ISO instants (fixed base -> fixed ISO)', () => {
    const time: RunnableTimeModel = {
      model: 'relative',
      start_offset_minutes: -720, // -12h
      end_offset_minutes: -660, // -11h
    };
    const {startTimeIso, endTimeIso} = resolveRelativeTime(time, baseInstantMs);
    expect(startTimeIso).toBe('2025-05-31T12:00:00.000Z');
    expect(endTimeIso).toBe('2025-05-31T13:00:00.000Z');
  });

  it('resolves a zero/positive window exactly', () => {
    const time: RunnableTimeModel = {
      model: 'relative',
      start_offset_minutes: 0,
      end_offset_minutes: 90, // +1h30m
    };
    const {startTimeIso, endTimeIso} = resolveRelativeTime(time, baseInstantMs);
    expect(startTimeIso).toBe('2025-06-01T00:00:00.000Z');
    expect(endTimeIso).toBe('2025-06-01T01:30:00.000Z');
  });

  it('is deterministic — same inputs always yield the same ISO (no clock read)', () => {
    const time: RunnableTimeModel = {
      model: 'relative',
      start_offset_minutes: -60,
      end_offset_minutes: 0,
    };
    const a = resolveRelativeTime(time, baseInstantMs);
    const b = resolveRelativeTime(time, baseInstantMs);
    expect(a).toEqual(b);
  });

  it('shifts the result when a different base instant is injected', () => {
    const time: RunnableTimeModel = {
      model: 'relative',
      start_offset_minutes: 0,
      end_offset_minutes: 0,
    };
    const earlier = resolveRelativeTime(time, Date.UTC(2025, 0, 1, 0, 0, 0, 0));
    const later = resolveRelativeTime(time, Date.UTC(2026, 0, 1, 0, 0, 0, 0));
    expect(earlier.startTimeIso).toBe('2025-01-01T00:00:00.000Z');
    expect(later.startTimeIso).toBe('2026-01-01T00:00:00.000Z');
  });
});

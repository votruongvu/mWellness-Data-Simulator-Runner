/**
 * MR-C — relative time resolution (PURE, INJECTED CLOCK).
 *
 * The backend F8 payload carries RELATIVE time only: offset-minutes from a base
 * instant that the runner chooses (no absolute timestamps are stored). This
 * module resolves those offsets to absolute ISO instants.
 *
 * Determinism / safety (load-bearing):
 *  - NO Date.now / randomness / network / native. The base instant is INJECTED
 *    by the caller — never read from the clock inside this core. The same
 *    inputs always produce the same ISO strings (replay-safe).
 *  - Fabricates nothing: it only does arithmetic on the offsets the backend
 *    already provided plus the caller-supplied base instant.
 */

import {RunnableTimeModel} from '../testCases/runnablePayloadTypes';

/** Resolved absolute window for one operation. */
export interface ResolvedTimeWindow {
  startTimeIso: string;
  endTimeIso: string;
}

const MS_PER_MINUTE = 60_000;

/**
 * Resolve a relative time model to absolute ISO instants using an INJECTED base
 * instant (epoch ms). Pure and deterministic: `new Date(ms).toISOString()` is
 * fine because the base instant is supplied by the caller, not read from the
 * clock here.
 *
 * @param time          the operation's relative time model.
 * @param baseInstantMs the runner-chosen base instant (epoch ms), injected.
 */
export function resolveRelativeTime(
  time: RunnableTimeModel,
  baseInstantMs: number,
): ResolvedTimeWindow {
  const startMs = baseInstantMs + time.start_offset_minutes * MS_PER_MINUTE;
  const endMs = baseInstantMs + time.end_offset_minutes * MS_PER_MINUTE;
  return {
    startTimeIso: new Date(startMs).toISOString(),
    endTimeIso: new Date(endMs).toISOString(),
  };
}

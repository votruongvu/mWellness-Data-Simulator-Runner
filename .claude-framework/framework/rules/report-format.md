# Report Format — canonical ordering for framework reports (MWR)

Single source of truth for the **shape** of every framework report. Cite
this file from templates / skills / commands; do **not** inline the rule text
elsewhere.

## R-1 — Human Summary first
Every **FULL-LANE / lifecycle** report starts with `## Human Summary`
(Result / What changed / What still matters [Blocking / Non-blocking / Can
defer] / Recommended next action — field contract canonical at
`framework/templates/task-brief.md`). **Does NOT apply** to `/direct-patch`
(R-8), TINY `/review-task` (R-9 Mode 1), copy-only or small UI patches.

## R-2 — Recommended next action below it
```text
Run: <one line, names a command>
Reason: <one sentence>
Do not run: <one line, or "none">
Reason: <one sentence, or "n/a">
```
Same exemptions as R-1.

## R-3 — Portable handoff summary last
Every FULL-LANE report ends with `## Portable handoff summary` (9-field
schema canonical at [`.claude/HANDOFF.md`](../../../.claude/HANDOFF.md)).
Same exemptions as R-1.

## R-4 — Review reports carry three severity buckets
`/review-task` (FOCUSED/FULL) reports carry, between R-2 and R-3:
- `## Blocking before close` — P0 / P1 (empty bullet = none)
- `## Safe to carry` — P2 (empty bullet = none)
- `## Informational / no action needed`

## R-4a — Severity rubric (MWR mobile health-write runner — single source)
- **P0 — STOP.** A **real native write without dry-run + capability +
  permission + explicit confirmation**; a **dry-run that performs a real
  write**; **fake write success** (a denied/failed/partial write reported as
  succeeded); a **raw token / secret / real endpoint credential** committed
  or leaked into a log; **real PHI/PII** (or a real account/device id/token)
  in a fixture, scenario, log, or commit; a **scenario authored / validated /
  mutated / reordered on device**; an **unsupported metric silently dropped**;
  a **production endpoint defaulted** or reachable without human-confirmed
  enablement; MWR **computing/asserting an authoritative wellness score**;
  the Android target labelled **"Google HealthKit"** or any **Google Fit**
  integration in current truth; a **backend API gap fabricated** instead of
  STOPping for approval; AI would have to make a Human Decision Owner call
  silently; a required gate bypassed. Do not close, do not auto-fix.
- **P1 — fix before close (unless human explicitly accepts).** Correctness
  issue undermining acceptance; metric->platform mapping wrong (wrong type/
  unit/record); broken idempotency (duplicate writes on re-run); missing
  retry/backoff or error classification on a real-write path; missing dry-run
  / no-fake-success / capability-permission / no-leak / replay-determinism
  test; run lifecycle (start/pause/resume/stop) not honored; contract
  regression.
- **P2 — close-with-followups OK.** Real risk but core behavior safe;
  hardening of retry tuning; minor coupling; deferred refactor; log
  verbosity.
- **P3 — defer OK.** Minor / cosmetic / doc / naming.

| Severity | Action |
|---|---|
| P0 | STOP |
| P1 | Fix before close, or human accepts |
| P2 | Close-with-followups OK |
| P3 | Defer OK |

## R-5 — Closure reports prepend a Closure Summary
`/close-task` (full) starts with `## Closure Summary` (Final status /
Accepted by / Open blockers / Carried follow-ups / Context promotion / Next
action) before the durable Closure Report.

## R-6 — Scoped refresh discloses no broad rewrite
`/refresh-context --scope=<files>` reports include the literal line
`No broad adapter rewrite was performed.`

## R-7 — Naming guard
The handoff block is always **"Portable handoff summary"** — generic,
tool-agnostic. No canonical file names it after a specific assistant.

## R-8 — /direct-patch uses a 5-field compact output
```text
Result: <one line>
Files:  <comma-separated list>
Tests:  <focused tests + result, or one-line reason none>
Risk:   <one line, or "none">
Next:   <one line, or "none">
```
No Human Summary / Portable handoff / severity buckets. Safety rails NOT
relaxed — still STOP-and-escalate on denylist/size/decision/mid-patch
high-risk (see [`lane-classification.md`](lane-classification.md)).

## R-9 — /review-task has three mode contracts
- **Mode 1 TINY (default):** 5-field compact (Verdict / Blocking /
  Non-blocking / Tests checked / Recommendation). No R-1/R-3/R-4.
- **Mode 2 FOCUSED:** Expected behaviour / Files touched / Wiring path /
  Focused tests / Regression risk. R-1/R-3 optional.
- **Mode 3 FULL:** full R-1 + R-2 + R-4 buckets + R-3, reviewer fan-out wired.
- All modes: discover high-risk scope mid-review -> STOP-and-escalate to FULL.

## Closeout classification (lifecycle)
- **APPROVED** — no P0, no P1 (P2s recorded as follow-ups).
- **APPROVED_WITH_FOLLOWUPS** — no P0, no P1; P2s exist, listed with owners.
- **BLOCKED** — any P0, or any unaddressed P1 (unless the human accepts the P1 as a tracked follow-up — record who).

## Citation discipline
This file is the single source for report ordering + the severity rubric.
Every emitting surface CITES it; none inline R-1..R-9 or the rubric.

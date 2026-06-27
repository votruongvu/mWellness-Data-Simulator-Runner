# Prompt Rules — mWellness-Mobile-Runner (MWR)

How task briefs and prompts are composed. Cited by `/compose-task` and the
`mwr-prompt-composer` agent.

## P-1 — Brief answers every applicable gate
The `PROMPT_OVERRIDE_GATE` (see [`gates.md`](gates.md)) requires a brief to
explicitly answer every mandatory behavioral rule in
[`prompt-overrides.md`](../../adapter/prompt-overrides.md) that applies to
the touched surface. No applicable override is silently waived.

## P-2 — Lane Triage is emitted, never self-decided
Every brief carries a Lane Triage block and STOPs for human `lane=`
confirmation (see [`lane-classification.md`](lane-classification.md)). Claude
proposes; the Human Decision Owner decides.

## P-3 — Risk-First Pass (high-risk surfaces)
For any high-risk surface (backend client/auth, scenario interpretation,
execution plan, dry-run, a platform writer, real-write, capability/
permission, secrets/endpoints), the brief names the **failure modes** and,
for each, **the test that proves it is handled** — before design. Example
failure modes to consider: real PHI leaks into a fixture; dry-run writes; a
re-run double-writes (idempotency); an unsupported metric is silently
dropped; a denied/failed write is reported as success (fake success); a
token leaks into a log; a scenario is mutated/reordered on device; a
production endpoint is the default.

## P-4 — Confirmed context vs Open assumptions
Separate **confirmed context (with source)** from **OPEN ASSUMPTION** lines
tied to an Open ADR / P1 risk. Never present an assumption as fact. A backend
API gap that would force fabricating local data is an OPEN ASSUMPTION that
STOPs for human approval — never fabricated.

## P-5 — Named, verifiable tests + acceptance
Tests are named against categories in
[`test-map.md`](../../adapter/test-map.md); acceptance criteria are each
verifiable. Never write "tests pass" without the command + result.

## P-6 — Cite, do not inline
Cite single-source files (lane denylist, gates, report format,
prompt-overrides). Never paste their text into a brief.

## P-7 — Minimal reads
List the smallest set of files the task needs — default to the matching
context pack + its adapter slices, not the whole adapter.

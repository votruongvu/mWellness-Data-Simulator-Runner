# Skill — direct-patch

## Name
`direct-patch`

## Purpose
The Tiny-lane shortcut for a narrow, low-risk, pre-declared fix.

## Mode
**EXECUTION-CAPABLE (Tiny).** ≤ 3 files / ≤ 50 lines, pre-declared list.
No agents, no adapter context.

## Inputs
A pre-declared tiny fix (e.g. "DIRECT PATCH: fix copy in X").

## Context to load
- The edited file(s) + root `CLAUDE.md` guidance only (L0). The lane denylist ([`lane-classification.md`](../../../.claude-framework/framework/rules/lane-classification.md)).

## Gates to run
- **Tiny preflight** — refuse if the pre-declared scope hits any denylist category.
- **STOP-and-escalate** — on a mid-patch denylist hit, size-cap breach (>3 files / >50 lines), or a surfaced decision.

## Step-by-step workflow
1. Preflight the declared scope against the denylist + size cap.
2. If clean, apply the patch; run the nearest focused test.
3. Emit the 5-field compact output ([`report-format.md`](../../../.claude-framework/framework/rules/report-format.md) R-8).

## Output format / artifact
5-field compact (Result / Files / Tests / Risk / Next). No artifact file.

## Closeout / artifact requirements
No Human Summary / Portable handoff / Closure Report (the Stop hook enforces this).

## Escalation triggers
- **Never** route a backend-client/auth, scenario-interpretation/contract, execution-plan, dry-run, capability/permission, Apple Health or Health Connect writer, any real-write path, no-fake-success reporting, secret/token/endpoint, idempotency, test-data/fixture, redaction, run-mode toggle, or native iOS/Android surface through here → escalate to Light/Full (`/compose-task`, or `/mwr-safety-critical` for safety-sensitive, `/mwr-health-write-task` for a writer).

# Skill — execute-task

## Name
`execute-task`

## Purpose
Implement an approved task brief — the canonical execution playbook.

## Mode
**EXECUTION-CAPABLE.** Edits MWR source only within the approved brief's
scope. The `mwr-implementation-agent` is the executing worker.

## Inputs
An approved `TASK-BRIEF-*.md` with a confirmed lane.

## Context to load
- The brief, [`wiring-paths.md`](../../../.claude-framework/adapter/wiring-paths.md), [`test-map.md`](../../../.claude-framework/adapter/test-map.md), the matching context pack.

## Gates to run
- **Execution Gate** (human) — proceed within scope.
- **Mid-patch denylist** — STOP-and-escalate on any out-of-scope denylist surface ([`lane-classification.md`](../../../.claude-framework/framework/rules/lane-classification.md)).
- The brief's mandatory gates ([`gates.md`](../../../.claude-framework/framework/rules/gates.md)).

## Step-by-step workflow
1. Re-confirm scope + the MWR safety invariants the brief must preserve (dry-run-no-write, no-fake-success, capability + permission before any write, secret/endpoint safety, unsupported-surfaced-with-reason).
2. Implement within scope; respect the one-way boundary execution-plan operation → typed mapping → platform writer; resolve relative time via the injected clock (no ambient `Date.now()`/`Math.random()` in the run path).
3. Run the named tests; record command + result. Do not loosen a safety/determinism assertion.
4. Run [`post-patch-verification.md`](../../../.claude-framework/framework/checklists/post-patch-verification.md).
5. If scope grows into a denylist surface → STOP, surface partial work, escalate to `/compose-task`.

## Output format / artifact
The diff + run results. Read-only audit notes (if any) → `.claude/task-runs/<slug>.md`.

## Closeout / artifact requirements
Diff ready for `/review-task`. Full-lane report per [`report-format.md`](../../../.claude-framework/framework/rules/report-format.md).

## Escalation triggers
- Any MWR safety invariant would be violated (a dry-run that writes, faked success, a silent metric drop, a leaked token, "Google HealthKit"/Google Fit) → STOP, do not commit (P0).
- A **real** Apple Health / Health Connect write, permission-prompt timing/copy, dry-run/confirmation/capability/permission bypass, token storage, or a backend-API gap forcing fabrication → STOP for the human-approval gate ([`human-approval-gates.md`](../../../.claude-framework/adapter/human-approval-gates.md)); never fabricate.
- A decision surfaces mid-patch, or an Open ADR (RN baseline, token storage, writable metrics, run-mode gating) blocks → STOP-and-escalate; do not bake an assumption.

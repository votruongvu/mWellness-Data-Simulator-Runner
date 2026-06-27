---
description: Drive autonomous phase execution — run a phase's stories in canonical order, STOP for human approval before the next phase.
---

**Command** (NOT a skill): drives the autonomous MWR phase loop. It owns
orchestration of the execution layer; it does not invent product truth and
it never bypasses a safety or human-approval gate. One invocation drives
**one phase** (MR0 … MR7), then STOPs.

User input: $ARGUMENTS  (the target phase, e.g. `phase=MR1`)

## Authoritative reads (load first, in this order)
1. [`.claude-framework/execution/MWR_LOOP_RUNBOOK.md`](.claude-framework/execution/MWR_LOOP_RUNBOOK.md) — the read-truth → apply → validate → closeout rhythm + validation matrix.
2. [`.claude-framework/execution/MWR_EXECUTION_CONTROLLER.md`](.claude-framework/execution/MWR_EXECUTION_CONTROLLER.md) — the loop algorithm + budget rule.
3. [`.claude-framework/execution/MWR_PHASE_QUEUE.md`](.claude-framework/execution/MWR_PHASE_QUEUE.md) — the canonical phase order (MR0–MR7) + per-phase scope/order constraints.
4. [`.claude-framework/execution/MWR_EXECUTION_STATE.md`](.claude-framework/execution/MWR_EXECUTION_STATE.md) — the current phase-state machine; read it, advance it, persist it.
5. `USER_STORY_INDEX.md` — the canonical per-phase story order. **`TO_VERIFY`: this file does not exist yet; it is created in MR0+.** If it is absent, STOP and report that the phase cannot run until the story index exists.
6. [`MWR_STOP_CONDITIONS.md`](.claude-framework/execution/MWR_STOP_CONDITIONS.md) and [`MWR_HUMAN_APPROVAL_GATES.md`](.claude-framework/execution/MWR_HUMAN_APPROVAL_GATES.md) — the halt set.

## Agent crew
Per story, runs the standard lifecycle crew: `mwr-prompt-composer` (brief) →
`mwr-implementation-agent` (execute, the only execution-capable worker) →
the review fanout matching the story's surface (`mwr-backend-api-reviewer`,
`mwr-execution-plan-reviewer`, `mwr-apple-health-write-reviewer`,
`mwr-health-connect-write-reviewer`, `mwr-rn-architecture-reviewer`,
`mwr-test-reviewer`, `mwr-doc-sync-reviewer`, with
**`mwr-test-data-and-health-write-safety-reviewer`** mandatory on any
safety surface). `mwr-codebase-explorer` may map read-only first.

## Per-phase procedure
1. Read the authoritative files above; confirm the target phase and that
   its order constraints are met (e.g. MR0 locks contracts before
   implementation; MR3 dry-run plan exists before MR4/MR5 real writers).
2. Read `USER_STORY_INDEX.md` and execute the phase's stories **in canonical
   order**. For each story: `/compose-task` → `/execute-task` →
   `/review-task` → `/close-task`.
3. **Commit each story separately** (one commit per story).
4. **Run validation per story** (the validation matrix in the runbook +
   `validate-framework.sh` when framework files moved); record each command
   and its exact status — never hide `NOT_RUN_<reason>` behind PASS.
5. When an implementation changes a contract, risk, backend API, native
   behavior, a safety gate, or phase sequencing, **update traceability +
   the named adapter file(s)** via `/refresh-context` (the only adapter
   writer; `CONTEXT_PROMOTION_GATE`).
6. Advance and persist `MWR_EXECUTION_STATE.md`.

## Gates
Every per-story gate from [`gates.md`](.claude-framework/framework/rules/gates.md)
applies; the high-risk surfaces in
[`lane-classification.md`](.claude-framework/framework/rules/lane-classification.md)
are full lane. The loop consults the hard human-approval gate set
([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md) /
[`MWR_HUMAN_APPROVAL_GATES.md`](.claude-framework/execution/MWR_HUMAN_APPROVAL_GATES.md))
before continuing. On any hard gate (real Apple Health / Health Connect
write, permission-prompt timing/copy, dry-run/confirmation/capability/
permission bypass, token storage, backend API gap forcing fabrication,
release-readiness claim, new/changed ADR or contract break, UX flow not in
an approved contract) the loop **STOPs** and emits a Human Approval Request.
A gate is never self-waived by the loop or the task budget.

## Closeout + STOP
After the phase's stories complete, prepare a **close-task-style phase
review** ([`MWR_LOOP_CLOSEOUT_TEMPLATE.md`](.claude-framework/execution/MWR_LOOP_CLOSEOUT_TEMPLATE.md)):
Result · Stories · Files · Scope-Guard · Validation (every command + exact
status) · Followups (P1/P2) · Human-Approval-Needed · Next phase. Then
**STOP for human approval before starting the next phase** — do not roll
into the next phase automatically.

## Output
Per-story commits + per-story validation records, updated execution state,
updated adapters/traceability where contracts/risks/APIs/native-behavior/
safety-gates/sequencing changed, and the phase closeout report.

---
story_id: MWR-FW-004
phase: MR-FRAMEWORK-00
order: 4
title: "Add phase loop closeout and context refresh process"
depends_on: ["MWR-FW-002", "MWR-FW-003"]
status: done
---

# MWR-FW-004 — Add Phase Loop Closeout And Context Refresh Process

## Story File

`STORY-add-phase-loop-closeout-and-context-refresh-process.md`

## Phase

`MR-FRAMEWORK-00 — Claude Framework Bootstrap`

## Goal

Create or adapt mobile framework commands for story-by-story execution, context refresh, traceability, and close-task-style review.

## Context

This phase bootstraps a dedicated Claude Framework for `mWellness-Mobile-Runner`.

Inputs expected from the human:

- old mobile Claude Framework archive, e.g. `Archive(2).zip`
- new Master REQ, e.g. `mWellness_Mobile_Runner_Master_REQ_v1.0.html`
- optional roadmap/design handoff documents if already available

The new Mobile Runner framework must replace old app/DM1 requirement truth with the new Master REQ.

Canonical product direction:

```text
Backend runnable scenario contract
→ Mobile execution plan
→ Dry-run
→ Permission/capability gate
→ Platform writer
→ Run orchestration
→ Result reporting
```

## Dependencies

- MWR-FW-002
- MWR-FW-003

## Scope

- Create or update `.claude/commands/run-phase-loop.md`.
- Create or update `.claude/commands/close-task.md` or close-task-style handoff instructions.
- Create or update `.claude/commands/refresh-context.md` if framework convention supports it.
- Ensure phase loop reads `USER_STORY_INDEX.md` as canonical story order.
- Ensure each story is completed and committed separately.
- Ensure validation is run per story and recorded.
- Ensure traceability matrix is updated where present.
- Ensure context/adapters are refreshed when implementation changes contracts, APIs, native behavior, safety gates, risks, decisions, or task sequencing.
- Ensure phase closeout prepares review summary and stops for human classification before next phase.
- Do not auto-continue to the next phase.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native mobile app.
- Do not create MR0, MR1, or later phase user stories.
- Do not implement HealthKit or Health Connect native write code.
- Do not preserve old DM1 REQ/product roadmap as active canonical truth.
- Do not introduce Google Fit, vendor SDKs, RBAC, tenant, billing, or admin scope.
- Do not use mock runnable test cases/scenarios as completed product behavior.

## Required Source Hierarchy

1. Real repository state for descriptive facts.
2. New Mobile Runner Master REQ for product requirements.
3. Mobile Runner framework adapter docs for current operating truth.
4. Old framework archive as reusable mechanics/history only.
5. Old DM1 REQ/product docs are legacy/superseded unless explicitly transformed and approved.

## Acceptance Criteria

- Run phase loop command exists or is clearly documented.
- Close-task-style phase review handoff exists.
- Refresh-context behavior is present or referenced.
- Loop uses `USER_STORY_INDEX.md` as canonical order.
- Loop requires per-story commits.
- Loop stops after phase closeout for human approval.
- No product code changed.

## Validation Expectations

- Framework/docs validation where available.
- Markdown/link validation where available.
- Manual inspection of source-of-truth, known-risks, human gates, and roadmap docs.
- Honest statement if a validator does not exist yet.

## Human Approval Triggers

Stop and ask for human approval if:

- Old DM1 app requirements appear necessary to keep as active truth.
- The task requires product code or React Native app scaffold.
- The task requires native HealthKit or Health Connect write code.
- The task requires changing product boundary beyond Master REQ.
- The task requires new integrations such as Google Fit/vendor SDKs.
- The task cannot preserve safety guardrails.

## Commit Requirement

Commit subject must be:

`MR-FRAMEWORK-00 STORY-add-phase-loop-closeout-and-context-refresh-process`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, framework impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-00 phase loop

- **Executed:** 2026-06-27 · branch `mr-framework-00-stories` · via `.claude/commands/run-phase-loop.md`.
- **Status:** DONE — acceptance criteria verified against the live repo.
- **Evidence:** .claude/commands/run-phase-loop.md, close-task.md(+skill), refresh-context.md(+skill); execution/{MWR_EXECUTION_CONTROLLER,MWR_LOOP_RUNBOOK,MWR_LOOP_CLOSEOUT_TEMPLATE,MWR_STOP_CONDITIONS,MWR_HUMAN_APPROVAL_GATES}.md. This very phase run (index-driven order, per-story commits, stop-before-next-phase) exercises the process.
- **Deliverables provenance:** framework artifacts were produced in the MR-FRAMEWORK-00 bootstrap commits `cbe7e22` / `8ef3a72` (now on `main`, ancestor of this branch) and re-verified live in this loop; no new files required.
- **Validation:** `validate-framework.sh` PASS (0 errors); `validate_context_pack_paths.py` OK; internal links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no MR0/MR1+ stories · no HealthKit/Health Connect native write · no Google Fit/vendor SDK · no RBAC/tenant/billing/admin · no fake success · old DM1 REQ remains legacy/superseded (named only in `adapter/known-legacy.md`).
- **Followups:** none.

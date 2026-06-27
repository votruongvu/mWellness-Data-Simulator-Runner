---
story_id: MWR-FW-005
phase: MR-FRAMEWORK-00
order: 5
title: "Create Mobile Runner framework core docs"
depends_on: ["MWR-FW-002", "MWR-FW-003"]
status: done
---

# MWR-FW-005 — Create Mobile Runner Framework Core Docs

## Story File

`STORY-create-mobile-runner-framework-core-docs.md`

## Phase

`MR-FRAMEWORK-00 — Claude Framework Bootstrap`

## Goal

Create core architecture, contract, safety, and roadmap docs required by future MR-DESIGN-00 and MR0 loops.

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

- Create `docs/architecture/MOBILE_RUNNER_ARCHITECTURE.md`.
- Create `docs/contracts/MOBILE_BACKEND_API_CONTRACT.md`.
- Create `docs/contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`.
- Create `docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md`.
- Create `docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md`.
- Roadmap must include MR-FRAMEWORK-00, MR-FRAMEWORK-01, MR-DESIGN-00, MR0, MR1, MR2, MR3, MR4, MR5, MR6, MR7.
- Document that Claude Design handoff belongs to `MR-DESIGN-00` before implementation.
- Document that backend runnable scenario contract precedes mobile execution plan and platform writer.
- Do not create MR0/MR1 user stories in this story.

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

- Architecture, backend API contract, execution model, safety, and roadmap docs exist.
- Docs reflect Master REQ and Mobile Runner boundary.
- MR-DESIGN-00 placement is documented.
- Roadmap contains the approved loop order.
- No product implementation or phase story files beyond MR-FRAMEWORK-00 are created.

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

`MR-FRAMEWORK-00 STORY-create-mobile-runner-framework-core-docs`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, framework impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-00 phase loop

- **Executed:** 2026-06-27 · branch `mr-framework-00-stories` · via `.claude/commands/run-phase-loop.md`.
- **Status:** DONE — acceptance criteria verified against the live repo.
- **Evidence:** docs/architecture/MOBILE_RUNNER_ARCHITECTURE.md; docs/contracts/{MOBILE_BACKEND_API_CONTRACT,MOBILE_SCENARIO_EXECUTION_MODEL}.md; docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md; docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md.
- **Deliverables provenance:** framework artifacts were produced in the MR-FRAMEWORK-00 bootstrap commits `cbe7e22` / `8ef3a72` (now on `main`, ancestor of this branch) and re-verified live in this loop; UPDATED docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md to add MR-FRAMEWORK-01 and MR-DESIGN-00 and document the MR-DESIGN-00 Claude Design handoff before implementation (MR1+).
- **Validation:** `validate-framework.sh` PASS (0 errors); `validate_context_pack_paths.py` OK; internal links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no MR0/MR1+ stories · no HealthKit/Health Connect native write · no Google Fit/vendor SDK · no RBAC/tenant/billing/admin · no fake success · old DM1 REQ remains legacy/superseded (named only in `adapter/known-legacy.md`).
- **Followups:** P2: align .claude-framework/execution/MWR_PHASE_QUEUE.md to also name MR-FRAMEWORK-01 / MR-DESIGN-00.

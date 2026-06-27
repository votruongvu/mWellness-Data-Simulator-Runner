---
story_id: MWR-FW-002
phase: MR-FRAMEWORK-00
order: 2
title: "Bootstrap Mobile Runner framework skeleton"
depends_on: ["MWR-FW-001"]
status: done
---

# MWR-FW-002 — Bootstrap Mobile Runner Framework Skeleton

## Story File

`STORY-bootstrap-mobile-runner-framework-skeleton.md`

## Phase

`MR-FRAMEWORK-00 — Claude Framework Bootstrap`

## Goal

Create the dedicated Claude Framework skeleton for mWellness-Mobile-Runner using the new Master REQ as canonical source.

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

- MWR-FW-001

## Scope

- Create or update `CLAUDE.md` for `mWellness-Mobile-Runner`.
- Create `.claude/commands/` structure with framework command placeholders or reused commands where appropriate.
- Create `.claude-framework/adapter/` with source-of-truth, current-decisions, known-risks, repository-map, human-approval-gates, test-map, and settings-map docs.
- Create `.claude-framework/framework/` with rules, checklists, templates, and context folders according to framework convention.
- Copy or convert `mWellness_Mobile_Runner_Master_REQ_v1.0.html` into canonical repo docs.
- Create `docs/requirements/MOBILE_RUNNER_MASTER_REQ.html` and markdown equivalent if practical.
- Create `docs/architecture/`, `docs/contracts/`, `docs/safety/`, and `docs/roadmap/` placeholders/canonical docs.
- Use `mWellness-Mobile-Runner` / `MWR` naming consistently.
- Do not preserve old DM1 product roadmap as active truth.

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

- Framework skeleton exists in repo.
- `CLAUDE.md` identifies Mobile Runner project and scope.
- Master REQ is copied/converted into canonical docs.
- Old DM1 REQ/product truth is not canonical.
- Adapter docs exist and point to new Master REQ.
- No React Native product scaffold or native write code is created.

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

`MR-FRAMEWORK-00 STORY-bootstrap-mobile-runner-framework-skeleton`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, framework impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-00 phase loop

- **Executed:** 2026-06-27 · branch `mr-framework-00-stories` · via `.claude/commands/run-phase-loop.md`.
- **Status:** DONE — acceptance criteria verified against the live repo.
- **Evidence:** CLAUDE.md; .claude/{commands(18),skills(12),agents,hooks,settings.json}; .claude-framework/{adapter(13),framework,execution,scripts}; docs/requirements/MOBILE_RUNNER_MASTER_REQ.{html,md}; docs/{architecture,contracts,safety,roadmap}.
- **Deliverables provenance:** framework artifacts were produced in the MR-FRAMEWORK-00 bootstrap commits `cbe7e22` / `8ef3a72` (now on `main`, ancestor of this branch) and re-verified live in this loop; no new files required (skeleton already built; Master REQ canonicalized).
- **Validation:** `validate-framework.sh` PASS (0 errors); `validate_context_pack_paths.py` OK; internal links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no MR0/MR1+ stories · no HealthKit/Health Connect native write · no Google Fit/vendor SDK · no RBAC/tenant/billing/admin · no fake success · old DM1 REQ remains legacy/superseded (named only in `adapter/known-legacy.md`).
- **Followups:** none.

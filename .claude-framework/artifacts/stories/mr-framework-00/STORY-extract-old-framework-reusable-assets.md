---
story_id: MWR-FW-001
phase: MR-FRAMEWORK-00
order: 1
title: "Extract old framework reusable assets"
depends_on: []
status: done
---

# MWR-FW-001 — Extract Old Framework Reusable Assets

## Story File

`STORY-extract-old-framework-reusable-assets.md`

## Phase

`MR-FRAMEWORK-00 — Claude Framework Bootstrap`

## Goal

Inspect the old mobile framework archive and classify reusable, rewrite-required, and legacy-only framework assets for the new Mobile Runner repo.

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

- None

## Scope

- Inspect the uploaded old mobile Claude Framework archive.
- Inventory old framework files/directories, commands, agents, skills, hooks, templates, scripts, docs, and artifacts.
- Classify each major item as reuse directly, rewrite for Mobile Runner, or drop/archive as legacy.
- Identify old DM1/app assumptions that must not become canonical in the new repo.
- Identify reusable mobile-specific safety/checklist assets such as Apple Health, Health Connect, dry-run, no-write, RN testing, secret/log safety, and QA checklists.
- Create `artifacts/bootstrap/MWR_FRAMEWORK_EXTRACTION_AUDIT.md`.
- Do not create product code, React Native scaffold, MR0 stories, or native write code.

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

- Extraction audit document exists.
- Old archive content is inventoried at useful file/directory level.
- Reuse/rewrite/drop classification is explicit.
- Old DM1/app requirement assumptions are identified as legacy/superseded.
- New Mobile Runner Master REQ is named as the requirement source that will replace old app truth.
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

`MR-FRAMEWORK-00 STORY-extract-old-framework-reusable-assets`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, framework impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-00 phase loop

- **Executed:** 2026-06-27 · branch `mr-framework-00-stories` · via `.claude/commands/run-phase-loop.md`.
- **Status:** DONE — acceptance criteria verified against the live repo.
- **Evidence:** artifacts/bootstrap/MWR_FRAMEWORK_EXTRACTION_AUDIT.md (full archive inventory; reuse/rewrite/drop classification; DM1 assumptions flagged legacy; Master REQ named canonical).
- **Deliverables provenance:** framework artifacts were produced in the MR-FRAMEWORK-00 bootstrap commits `cbe7e22` / `8ef3a72` (now on `main`, ancestor of this branch) and re-verified live in this loop; no new files required (extraction audit already produced).
- **Validation:** `validate-framework.sh` PASS (0 errors); `validate_context_pack_paths.py` OK; internal links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no MR0/MR1+ stories · no HealthKit/Health Connect native write · no Google Fit/vendor SDK · no RBAC/tenant/billing/admin · no fake success · old DM1 REQ remains legacy/superseded (named only in `adapter/known-legacy.md`).
- **Followups:** none.

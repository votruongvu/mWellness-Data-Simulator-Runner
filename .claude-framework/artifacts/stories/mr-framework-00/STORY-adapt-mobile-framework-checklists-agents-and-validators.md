---
story_id: MWR-FW-006
phase: MR-FRAMEWORK-00
order: 6
title: "Adapt mobile framework checklists agents and validators"
depends_on: ["MWR-FW-001", "MWR-FW-003", "MWR-FW-004"]
status: done
---

# MWR-FW-006 — Adapt Mobile Framework Checklists Agents And Validators

## Story File

`STORY-adapt-mobile-framework-checklists-agents-and-validators.md`

## Phase

`MR-FRAMEWORK-00 — Claude Framework Bootstrap`

## Goal

Adapt reusable old framework checklists, agents, hooks, and validators to Mobile Runner semantics.

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
- MWR-FW-003
- MWR-FW-004

## Scope

- Reuse old framework mechanics where safe and useful.
- Adapt RN testing and performance checklists to new Mobile Runner repo.
- Adapt Apple Health write checklist to HealthKit writer safety gates.
- Adapt Health Connect write checklist to Android writer safety gates.
- Adapt dry-run/no-write checklist.
- Adapt secret/endpoint/log safety checklist.
- Adapt mobile manual QA checklist.
- Add or preserve framework validator script such as `.claude-framework/scripts/validate-framework.sh` if available.
- Drop/archive legacy-only agents/checklists tied to old DM1 product flow.
- Do not create product code or real native writer code.

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

- Mobile-relevant checklists exist and reference MWR semantics.
- Legacy-only checklists/agents are dropped or clearly archived as legacy.
- Framework validator exists or absence is documented.
- Apple Health/Health Connect checklists require dry-run, capability, permission, confirmation, and no-fake-success.
- No old DM1 product assumptions remain active.

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

`MR-FRAMEWORK-00 STORY-adapt-mobile-framework-checklists-agents-and-validators`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, framework impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-00 phase loop

- **Executed:** 2026-06-27 · branch `mr-framework-00-stories` · via `.claude/commands/run-phase-loop.md`.
- **Status:** DONE — acceptance criteria verified against the live repo.
- **Evidence:** framework/checklists/* (21; incl. apple-health-write, health-connect-write, dry-run-no-write, no-fake-success, capability-permission, secret-endpoint-safety, mobile-exploratory-qa, rn-testing/perf/ui); .claude/agents/* (11 mwr-* + README); .claude/hooks/* (6); scripts/validate-framework.sh + validate_context_pack_paths.py. Legacy DM1-only reviewers/checklists (canonical-data, seed-engine, dataset-export) were dropped (not present).
- **Deliverables provenance:** framework artifacts were produced in the MR-FRAMEWORK-00 bootstrap commits `cbe7e22` / `8ef3a72` (now on `main`, ancestor of this branch) and re-verified live in this loop; no new files required.
- **Validation:** `validate-framework.sh` PASS (0 errors); `validate_context_pack_paths.py` OK; internal links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no MR0/MR1+ stories · no HealthKit/Health Connect native write · no Google Fit/vendor SDK · no RBAC/tenant/billing/admin · no fake success · old DM1 REQ remains legacy/superseded (named only in `adapter/known-legacy.md`).
- **Followups:** P1: add docs/platform/MWR_DEVICE_QA_MATRIX.md (per MR-FRAMEWORK-01 audit F1).

---
story_id: MWR-FW1-005
phase: MR-FRAMEWORK-01
order: 5
title: "Audit backend API and contract readiness for MR0"
depends_on: ["MWR-FW1-001", "MWR-FW1-004"]
status: done
---

# MWR-FW1-005 — Audit backend API and contract readiness for MR0

## Phase

`MR-FRAMEWORK-01 — Context Completeness & MR0 Readiness`

## Goal

Identify contract topics MR0 must lock before implementation.

## Context

This phase audits the Mobile Runner Claude Framework after MR-FRAMEWORK-00 and MR-DESIGN-00.

Expected state:

```text
MR-FRAMEWORK-00 = complete / approved
MR-DESIGN-00 = complete / approved with followups
MR-FRAMEWORK-01 = this phase
MR0 = not yet started; hard human approval gate
MR1 = not yet started
```

Source priority:

```text
Master REQ = canonical product requirement source
MR0 contracts = future binding implementation input once created
Refined MR-DESIGN-00 artifacts = UI/UX implementation input
Framework source-of-truth/current-decisions = active operating truth
Old DM1/app truth = legacy/superseded only
```

## Dependencies

- MWR-FW1-001
- MWR-FW1-004

## Scope

- Read Master REQ, backend API contract docs, scenario execution docs, design implementation handoff, and current risks.
- Create a MR0 readiness checklist covering mobile/backend API contract gaps.
- List required backend routes: auth/session, runnable test cases, version detail, ordered scenarios, scenario content, metric metadata, optional run reporting.
- List required DTOs: RunnableTestCase, RunnableTestCaseVersion, RunnableScenario, ScenarioContent, MetricDefinition, ExecutionPlan, RunResult.
- List required error envelope and request/correlation ID behavior.
- List per-metric writability questions for iOS and Android.
- List token/session storage hard-gate questions.
- List real-write gating and run scope questions.
- Create artifacts/bootstrap/MWR_FRAMEWORK_01_MR0_CONTRACT_READINESS.md.
- Do not solve MR0 contracts in this phase; only identify readiness/gaps.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native write code.
- Do not create MR0, MR1, or later implementation user stories.
- Do not change Master REQ product scope.
- Do not make design artifacts higher authority than Master REQ.
- Do not introduce Google Fit, vendor SDKs, RBAC, tenant, billing, admin, catalog editing, scenario authoring, seed library, scenario upload, reorder UI, or export-bundle primary flow.

## Acceptance Criteria

- MR0 contract readiness doc exists.
- Backend/API gaps are explicit.
- Token/session storage strategy is called out as hard gate if unresolved.
- Per-metric writability is called out as MR0/MR4/MR5 dependency.
- Run scope and reporting questions are listed.
- No backend implementation or MR0 stories are created.

## Validation Expectations

- Framework validator where available.
- Context path validator where available.
- Markdown/internal link validation where available.
- Manual audit against Master REQ, MR-FRAMEWORK-00 closeout, MR-DESIGN-00 artifacts, and framework adapters.
- Honest statement if a validator/tool is unavailable.

## Human Approval Triggers

Stop and ask for human approval if:

- A P0 safety gate is missing.
- Old DM1 product truth appears canonical.
- Design artifacts conflict with Master REQ and cannot be reconciled.
- MR0 readiness is blocked by missing Master REQ/API/safety input.
- The task requires product implementation code.
- The task requires native health write implementation.
- The task requires creating MR0/MR1 story files.

## Commit Requirement

Commit subject must be:

`MR-FRAMEWORK-01 STORY-audit-backend-api-and-contract-readiness-for-mr0`

## Closeout Requirements

Return story closeout with status, commit hash, files changed, audit impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-01 phase loop
- **Executed:** 2026-06-27 · branch `mr-framework-01-stories` · via `.claude/commands/run-phase-loop.md`. **Status:** DONE.
- **Deliverable:** artifacts/bootstrap/MWR_FRAMEWORK_01_MR0_CONTRACT_READINESS.md
- **Work:** MR0 checklist: routes A, DTOs B, error envelope C, per-metric writability D, token storage E (hard gate), real-write/run-scope F, device matrix G — gaps identified, not solved.
- **Validation:** `validate-framework.sh` PASS (0 errors); context-pack OK; links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no backend API · no native write · no MR0/MR1+ stories · Master REQ canonical · design subordinate · DM1 legacy-only · safety gates not weakened · no Google Fit/vendor/RBAC/authoring/catalog/seed/upload/reorder/export-bundle.
- **Followups:** P1 — MR0 locks A–G.

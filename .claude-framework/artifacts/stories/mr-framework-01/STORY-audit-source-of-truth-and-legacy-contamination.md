---
story_id: MWR-FW1-001
phase: MR-FRAMEWORK-01
order: 1
title: "Audit source of truth and legacy contamination"
depends_on: []
status: done
---

# MWR-FW1-001 — Audit source of truth and legacy contamination

## Phase

`MR-FRAMEWORK-01 — Context Completeness & MR0 Readiness`

## Goal

Verify source hierarchy, Master REQ canonical status, design subordinate status, and old DM1 legacy-only status.

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

- None

## Scope

- Read CLAUDE.md, Master REQ docs, framework adapters, roadmap docs, MR-FRAMEWORK-00 closeout, and MR-DESIGN-00 artifacts.
- Audit source hierarchy and current operating truth.
- Confirm new Mobile Runner Master REQ is canonical.
- Confirm design handoff is UI/UX implementation input only.
- Confirm old DM1 REQ/product truth is not canonical.
- Scan for legacy contamination: generator, seed-engine, old source-library as active model, old 4-destination app scope, old M1-M6 roadmap, Google Fit, old DM1 authority.
- Create artifacts/bootstrap/MWR_FRAMEWORK_01_SOURCE_OF_TRUTH_AUDIT.md.
- Do not implement product code or create MR0 stories.

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

- Source-of-truth audit exists.
- Master REQ canonical status is confirmed.
- MR-DESIGN-00 design input status is confirmed as subordinate to Master REQ.
- Old DM1 product truth is confirmed legacy/superseded or gaps are listed.
- Any legacy contamination is classified P0/P1/P2.
- No product code or MR0/MR1 stories are created.

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

`MR-FRAMEWORK-01 STORY-audit-source-of-truth-and-legacy-contamination`

## Closeout Requirements

Return story closeout with status, commit hash, files changed, audit impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-01 phase loop
- **Executed:** 2026-06-27 · branch `mr-framework-01-stories` · via `.claude/commands/run-phase-loop.md`. **Status:** DONE.
- **Deliverable:** artifacts/bootstrap/MWR_FRAMEWORK_01_SOURCE_OF_TRUTH_AUDIT.md
- **Work:** source hierarchy verified; legacy scan CLEAN (P0/P1/P2 = none).
- **Validation:** `validate-framework.sh` PASS (0 errors); context-pack OK; links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no backend API · no native write · no MR0/MR1+ stories · Master REQ canonical · design subordinate · DM1 legacy-only · safety gates not weakened · no Google Fit/vendor/RBAC/authoring/catalog/seed/upload/reorder/export-bundle.
- **Followups:** none.

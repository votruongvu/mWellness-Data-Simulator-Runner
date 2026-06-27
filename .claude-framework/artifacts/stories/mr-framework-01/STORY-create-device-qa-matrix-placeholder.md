---
story_id: MWR-FW1-006
phase: MR-FRAMEWORK-01
order: 6
title: "Create device QA matrix placeholder"
depends_on: ["MWR-FW1-002", "MWR-FW1-005"]
status: done
---

# MWR-FW1-006 — Create device QA matrix placeholder

## Phase

`MR-FRAMEWORK-01 — Context Completeness & MR0 Readiness`

## Goal

Create the platform/device QA matrix placeholder required by previous P1 followup.

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

- MWR-FW1-002
- MWR-FW1-005

## Scope

- Create docs/platform/MWR_DEVICE_QA_MATRIX.md.
- Define minimum target coverage placeholders for iOS real device, Android real device, supported OS versions, HealthKit availability, Health Connect availability, permission states, unsupported platform states, simulator/emulator limitations, and manual QA ownership.
- Document that exact named devices/OS versions must be finalized before MR4/MR5 real-write POC approval.
- Document that simulator/emulator cannot be the sole validation for real health writes.
- Link device QA matrix from roadmap/safety docs where appropriate.
- Do not claim manual QA executed.

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

- docs/platform/MWR_DEVICE_QA_MATRIX.md exists.
- Matrix includes iOS and Android sections.
- HealthKit and Health Connect real-device limitations are documented.
- MR4/MR5 approval dependency is explicit.
- Manual QA status is NOT_EXECUTED unless actually performed.

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

`MR-FRAMEWORK-01 STORY-create-device-qa-matrix-placeholder`

## Closeout Requirements

Return story closeout with status, commit hash, files changed, audit impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-FRAMEWORK-01 phase loop
- **Executed:** 2026-06-27 · branch `mr-framework-01-stories` · via `.claude/commands/run-phase-loop.md`. **Status:** DONE.
- **Deliverable:** docs/platform/MWR_DEVICE_QA_MATRIX.md
- **Work:** created device QA matrix placeholder (iOS + Android, real-device-required, simulator-not-sole, manual QA NOT_EXECUTED); linked from roadmap.
- **Validation:** `validate-framework.sh` PASS (0 errors); context-pack OK; links 0 broken.
- **Non-goals preserved:** no product code · no RN scaffold · no backend API · no native write · no MR0/MR1+ stories · Master REQ canonical · design subordinate · DM1 legacy-only · safety gates not weakened · no Google Fit/vendor/RBAC/authoring/catalog/seed/upload/reorder/export-bundle.
- **Followups:** P1 — name concrete devices/OS versions before MR4/MR5.

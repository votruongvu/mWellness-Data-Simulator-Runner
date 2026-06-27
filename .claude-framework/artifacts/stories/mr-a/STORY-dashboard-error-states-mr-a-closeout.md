---
story_id: MWR-MRA-004
phase: MR-A
order: 4
title: "Dashboard / Error States / MR-A Closeout"
depends_on: ["MWR-MRA-001", "MWR-MRA-002", "MWR-MRA-003"]
status: ready
---

# MWR-MRA-004 — Dashboard / Error States / MR-A Closeout

## Phase

`MR-A — Foundation + Contracts + Auth Shell`

## Goal

Complete the first reviewable app milestone: dashboard shell, lightweight backend/platform status, session/backend error states, validation, traceability, and MR-B readiness.

## Why This Story Is a Capability Slice

This story is intentionally larger than a single file/screen/checklist. It should produce a reviewable milestone slice and may update multiple files as needed. Do not split the work into micro-stories unless a P0 blocker is found.

## Context

MR-A replaces the older split of MR0 + MR1. It is the first implementation-oriented loop, but it only implements the foundation/auth shell and the minimal contracts needed to start.

Expected state before MR-A:

```text
MR-FRAMEWORK-00 = complete / approved
MR-DESIGN-00 = complete / approved with followups
MR-FRAMEWORK-01 = complete / approved with followups
MR-A = this phase
MR-B = not started
```

Core product principle:

```text
Backend runnable scenario contract
→ Mobile execution plan
→ Dry-run
→ Permission/capability gate
→ Platform writer
→ Run orchestration
→ Result reporting
```

MR-A only covers the first foundation/auth/backend-shell layer. It does not attempt dry-run or native write.

## Dependencies

- MWR-MRA-001
- MWR-MRA-002
- MWR-MRA-003

## Scope

- Implement lightweight Runner Dashboard shell using authenticated session and backend status.
- Show concise environment/backend status without heavy local/dev/staging/prod management.
- Add session expired and backend unavailable screens/states.
- Add Settings or secondary technical screen only if needed for backend URL/status recovery; keep it lightweight.
- Confirm no native health capability/permission/write flow is implemented in MR-A.
- Update traceability matrix and execution records.
- Run validation: typecheck, lint, unit tests, framework validator, link checks where available.
- Create `PHASE_CLOSEOUT.md` or equivalent MR-A closeout.
- Classify MR-B readiness and list P0/P1/P2 followups.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect write code.
- Do not implement execution planner, dry-run, run orchestration, or real-write flow.
- Do not implement full test case browser beyond minimal contract/API seams.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success.
- Do not weaken safety gates.
- Do not implement full Diagnostics/Logs feature in MR-A.
- Do not implement test case list/detail in MR-A.
- Do not implement platform capability/permission checks beyond placeholder/status copy.

## Acceptance Criteria

- Authenticated user can reach dashboard shell after login if backend auth exists.
- Backend unavailable/session expired states are visible and useful.
- Environment handling remains lightweight and does not dominate primary UX.
- Validation results are recorded.
- MR-A closeout exists with MR-B readiness classification.
- No test case browser, execution planner, native permission, or native write code is implemented.

## Validation Expectations

- Run app build/start validation if available.
- Run typecheck, lint, and unit tests where available.
- Run framework/context validation where available.
- Run markdown/internal link validation where available for docs changes.
- Manually inspect that no native write or test case browser scope leaked into MR-A.
- Honestly state unavailable validators/tools.

## Human Approval Triggers

Stop and ask for human approval if:

- Backend auth/session contract is missing and implementation would require fake login.
- Secure token/session storage cannot be implemented safely.
- The work requires native health permission/write behavior.
- The work requires changing Master REQ/product boundary.
- The work requires adding MR-B/MR-C scope.
- The work requires adding Google Fit/vendor SDKs/RBAC/tenant/billing/admin scope.

## Commit Requirement

Commit subject must be:

`MR-A STORY-dashboard-error-states-mr-a-closeout`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, and P0/P1/P2 followups.

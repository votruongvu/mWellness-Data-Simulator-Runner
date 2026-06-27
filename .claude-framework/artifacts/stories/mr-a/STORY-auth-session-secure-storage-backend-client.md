---
story_id: MWR-MRA-003
phase: MR-A
order: 3
title: "Auth Session + Secure Storage + Backend Client"
depends_on: ["MWR-MRA-001", "MWR-MRA-002"]
status: ready
---

# MWR-MRA-003 — Auth Session + Secure Storage + Backend Client

## Phase

`MR-A — Foundation + Contracts + Auth Shell`

## Goal

Implement the minimal auth/session flow, secure token storage, backend API client base, backend status handling, and error envelope mapping.

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

## Scope

- Implement auth API client based on the minimal contract baseline.
- Implement login, logout, session restore, and expired session handling.
- Use secure OS-backed storage target for tokens/session according to MR-A contract; do not store tokens in plain AsyncStorage.
- Implement backend API client base: base URL/config seam, auth header, request wrapper, error envelope mapping, request/correlation ID capture.
- Implement backend status/health check if supported by backend contract; otherwise document backend gap clearly.
- Add redaction for token/session data in logs/diagnostics.
- Wire Login screen to real auth API if available; if backend endpoint is missing, block/mark gap rather than fake successful login.
- Add tests for auth/session/client behavior where feasible.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect write code.
- Do not implement execution planner, dry-run, run orchestration, or real-write flow.
- Do not implement full test case browser beyond minimal contract/API seams.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success.
- Do not weaken safety gates.
- Do not add mock auth success as completed behavior.
- Do not implement advanced token refresh beyond contract baseline unless backend already supports it.
- Do not implement runnable data APIs beyond client base/status unless needed for dashboard counts and clearly scoped.

## Acceptance Criteria

- Login/logout/session restore flow is implemented against real API or blocked by explicit backend gap.
- Secure storage strategy is implemented or platform limitation is documented as P1/P0 depending on severity.
- API client maps error envelope and exposes request/correlation IDs.
- Session expired/backend unavailable states are surfaced.
- No token is logged or stored in plain AsyncStorage.
- No runnable test case browser, execution planner, or native write code is implemented.

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

`MR-A STORY-auth-session-secure-storage-backend-client`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, and P0/P1/P2 followups.

---
story_id: MWR-MRA-001
phase: MR-A
order: 1
title: "Minimal Contract Baseline"
depends_on: []
status: done
---

# MWR-MRA-001 — Minimal Contract Baseline

## Phase

`MR-A — Foundation + Contracts + Auth Shell`

## Goal

Lock only the minimum contracts required to start mobile implementation: product boundary, source-of-truth, auth/session API assumptions, runnable data API shape, core DTOs, and error/correlation behavior.

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

- None

## Scope

- Create/update a compact `docs/contracts/MOBILE_RUNNER_CONTRACT_BASELINE.md` instead of splitting one doc per contract area.
- Lock product boundary: Mobile Runner is a runtime app, not an authoring app.
- Confirm Master REQ is canonical; MR-DESIGN-00 is UI/UX input; old DM1/app truth is legacy only.
- Define the minimum backend API route groups needed for MR-A/MR-B: auth/session, backend health/status, runnable test case list, test case detail/current version, ordered scenarios, metric metadata.
- Define minimum DTOs: AuthSession, BackendStatus, RunnableTestCaseSummary, RunnableTestCaseDetail, RunnableVersion, RunnableScenarioSummary, MetricDefinitionSummary.
- Define minimum error envelope and correlation fields: code, message, request_id/correlation_id, retryable, status.
- Define token/session security baseline: secure OS-backed storage target, session restore, logout cleanup, expiry handling, no token logs.
- Explicitly defer full native write mapping, per-metric writability table, full run reporting, advanced diagnostics, and full device QA execution to later loops.
- Document backend gaps as open items; do not hide gaps with local fake data.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect write code.
- Do not implement execution planner, dry-run, run orchestration, or real-write flow.
- Do not implement full test case browser beyond minimal contract/API seams.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success.
- Do not weaken safety gates.
- Do not lock full HealthKit/Health Connect mapping in this story.
- Do not define full run reporting/diagnostics contract in this story.
- Do not create one markdown file per small contract.

## Acceptance Criteria

- `docs/contracts/MOBILE_RUNNER_CONTRACT_BASELINE.md` exists and is concise.
- Contract baseline is sufficient for MR-A auth shell and MR-B runnable data loading.
- Deferred scope is explicit and intentional.
- Token/session storage strategy is clear enough for MR-A implementation.
- Backend gaps are explicit.
- No product code, RN scaffold, backend implementation, native write code, or MR-B stories are created by this story.

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

`MR-A STORY-minimal-contract-baseline`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-A phase loop
- **Executed:** 2026-06-27 · branch `main` (human-approved direct commit) · via `.claude/commands/run-phase-loop.md`. **Status:** DONE.
- **Deliverable:** `docs/contracts/MOBILE_RUNNER_CONTRACT_BASELINE.md` — minimum auth/session + runnable-data API shape + core DTOs + error envelope/correlation + lightweight env. MR0-equivalent lock folded into MR-A.
- **Human-approval gates (approved this phase):** #9 RN baseline ADR + native substrate; #5 token/session storage strategy (OS-backed Keychain/Keystore). Stack ratified ADR-MWR-001 = bare RN CLI + TypeScript + react-native-keychain + React Navigation.
- **Backend reality:** no MWDS backend reachable here → routes `TO_VERIFY`; login will be blocked with a documented gap, never faked.
- **Validation:** markdown OK; links resolve; `validate-framework.sh` PASS.
- **Non-goals preserved:** no test-case browser/execution-plan/dry-run/native-permission/native-write; Master REQ canonical; design subordinate; DM1 legacy-only; no Google Fit/vendor/RBAC.
- **Followups:** P1 — lock exact MWDS routes + auth shape + x-request-id at backend availability.

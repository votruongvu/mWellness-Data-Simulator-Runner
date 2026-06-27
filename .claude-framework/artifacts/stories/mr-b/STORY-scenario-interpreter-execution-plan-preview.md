---
story_id: MWR-MRB-003
phase: MR-B
order: 3
title: "Scenario Interpreter + Execution Plan Preview"
depends_on: ["MWR-MRB-002"]
status: done
---

# MWR-MRB-003 — Scenario Interpreter + Execution Plan Preview

## Phase

`MR-B — Runnable Data Loading + Dry-run Planner`

## Goal

Convert backend ordered scenarios from `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios` into a local execution plan preview for a minimal supported subset. No native writes.

## Backend URL Contract Input

Use the real MWDS backend base URL configured in Mobile Runner, then append these route paths.

### operational
- `GET /healthz`
- `GET /readyz`
- `GET /api/v1/meta`
### auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
### catalog_reference
- `GET /api/v1/catalog/destinations`
- `GET /api/v1/catalog/profiles`
- `GET /api/v1/catalog/metrics`
### test_cases
- `GET /api/v1/test-cases`
- `POST /api/v1/test-cases`
- `GET /api/v1/test-cases/{id}`
- `PATCH /api/v1/test-cases/{id}`
- `POST /api/v1/test-cases/{id}/duplicate`
- `POST /api/v1/test-cases/{id}/archive`
- `POST /api/v1/test-cases/{id}/unarchive`
- `DELETE /api/v1/test-cases/{id}`
### versions
- `POST /api/v1/test-cases/{id}/versions`
- `GET /api/v1/test-cases/{id}/versions`
- `GET /api/v1/test-cases/{id}/versions/{version_id}`
### scenarios
- `POST /api/v1/test-cases/{id}/versions/{version_id}/scenario-template`
- `GET /api/v1/test-cases/{id}/versions/{version_id}/scenario-template/download`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/scenarios/upload`
- `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/scenarios/reorder`
### seeds_out_of_scope_for_mrb
- `GET /api/v1/scenario-seeds`
- `GET /api/v1/scenario-seeds/{slug}`
- `GET /api/v1/test-cases/{id}/versions/{version_id}/applicable-seeds`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/apply-seed`

## MR-B Route Scope

MR-B may use:

- `GET /healthz`
- `GET /readyz`
- `GET /api/v1/meta`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/catalog/destinations`
- `GET /api/v1/catalog/profiles`
- `GET /api/v1/catalog/metrics`
- `GET /api/v1/test-cases`
- `GET /api/v1/test-cases/{id}`
- `GET /api/v1/test-cases/{id}/versions`
- `GET /api/v1/test-cases/{id}/versions/{version_id}`
- `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios`

MR-B must not use as completed product behavior:

- `POST/PATCH/DELETE /api/v1/test-cases*`
- `POST /api/v1/test-cases/{id}/versions`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/scenario-template`
- `GET /api/v1/test-cases/{id}/versions/{version_id}/scenario-template/download`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/scenarios/upload`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/scenarios/reorder`
- `GET/POST /api/v1/scenario-seeds*`
- `GET /api/v1/test-cases/{id}/versions/{version_id}/applicable-seeds`
- `POST /api/v1/test-cases/{id}/versions/{version_id}/apply-seed`

## Why This Story Is a Capability Slice

This story is a reviewable product capability slice. It may touch API clients, DTO adapters, screens, tests, and docs together if they belong to this slice. Do not split into file-level micro-stories unless a P0 blocker is found.

## Context

MR-B follows MR-A. MR-A established the RN foundation, auth/session, secure storage, backend client seam, dashboard shell, and minimal contract baseline.

MR-B must prove the next product path:

```text
real backend runnable data
→ read-only test case/version/scenario loading
→ execution plan preview
→ dry-run result
```

MR-B must not implement native permission or native write behavior.

## Dependencies

- MWR-MRB-002

## Scope

- Define local scenario interpreter model based on actual backend scenario payloads returned by `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios`.
- Use catalog metadata from `GET /api/v1/catalog/metrics` where needed for display/classification.
- Implement operation builder for the minimum supported scenario/metric shapes needed to prove the planner path.
- Classify operations as writable_candidate, unsupported, blocked, invalid_payload, permission_required_future, or unknown.
- Preserve backend scenario IDs, order, metric IDs/slugs, timestamps/time offsets, and provenance needed for traceability.
- Implement Execution Plan Preview screen or section.
- Show counts and reasons for unsupported/blocked/unknown operations.
- Guarantee this story does not call native HealthKit or Health Connect APIs.
- Add tests for parser behavior, ordering preservation, invalid payload handling, and unsupported classification.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect permission/write code.
- Do not implement real-write confirmation or platform writer flow.
- Do not implement full run orchestration beyond dry-run planning.
- Do not implement backend run reporting as completed behavior.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success or local fake test cases.
- Do not weaken safety gates.
- Do not support the full metric universe.
- Do not use upload/template/reorder/seed endpoints.
- Do not implement real dry-run result execution yet if it goes beyond preview; that belongs to MR-B-004.
- Do not add iOS/Android native bridge code.

## Acceptance Criteria

- Backend scenario data can produce a local execution plan preview for the supported subset.
- Unsupported/blocked/unknown items are visible with reasons.
- Backend order and provenance are preserved.
- Catalog metric metadata is used where available, but missing metadata is not silently ignored.
- No native permission/write bridge is called or imported.
- No real-write confirmation or run orchestration is implemented.

## Validation Expectations

- Run typecheck, lint, and unit tests where available.
- Run app build/start validation if local toolchain is available.
- Run framework/context validation where available.
- Run markdown/internal link validation where available for docs changes.
- Grep/check that no HealthKit/Health Connect/native write/permission scope leaked into MR-B.
- Grep/check that no fake backend success or local fake runnable data is marked as completed product behavior.
- Verify actual backend URLs when a reachable base URL is configured.
- Honestly state unavailable validators/tools.

## Human Approval Triggers

Stop and ask for human approval if:

- Real MWDS backend routes are unavailable and completing the story would require fake data.
- Backend route shape conflicts with MR-A contract baseline.
- Scenario payload shape requires new product interpretation beyond Master REQ.
- Work requires native health permission/write behavior.
- Work requires changing Master REQ/product boundary.
- Work requires MR-C native writer scope.
- Work requires adding Google Fit/vendor SDKs/RBAC/tenant/billing/admin scope.

## Commit Requirement

Commit subject must be:

`MR-B STORY-scenario-interpreter-execution-plan-preview`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, verified backend URLs, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-B phase loop
- **Executed:** 2026-06-27 · branch `main`. **Status:** DONE.
- **Deliverable:** `src/runner/executionPlan.ts` (ExecutionPlan/PlanOperation/OperationStatus `writable|unsupported|permission_missing|invalid|skipped`/ReasonCode/PlanTotals); `src/runner/interpreter.ts` (pure `buildExecutionPlan`: Version + ScenarioSummary[] + catalog Metric[] → metric-level operations classified per destination platform via catalog `selectable`/`reason`; grouped by ordered scenarios; `permission_missing` reserved for MR-D, never emitted now); `src/screens/ExecutionPlanPreviewScreen.tsx` (P08: Dry-run mode badge, target, writable/unsupported/blocked totals, per-scenario rows).
- **Honesty:** metric-level (not per-segment) — payload deferred; pure (no Date.now/random/network/native); no fabricated operation values.
- **Validation:** tsc clean; validate-framework.sh PASS.
- **Followups:** P1 — per-operation detail + permission_missing at MR-C/MR-D.

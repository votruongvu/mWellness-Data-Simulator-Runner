---
story_id: MWR-MRB-002
phase: MR-B
order: 2
title: "Test Case Detail + Version / Ordered Scenarios"
depends_on: ["MWR-MRB-001"]
status: done
---

# MWR-MRB-002 — Test Case Detail + Version / Ordered Scenarios

## Phase

`MR-B — Runnable Data Loading + Dry-run Planner`

## Goal

Implement read-only test case detail, version list/detail, ordered scenarios, catalog metric metadata, and payload preview from real backend URLs.

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

- MWR-MRB-001

## Scope

- Verify read-only test case detail endpoint: `GET /api/v1/test-cases/{id}`.
- Verify version endpoints: `GET /api/v1/test-cases/{id}/versions` and `GET /api/v1/test-cases/{id}/versions/{version_id}`.
- Verify scenario list endpoint: `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios`.
- Verify catalog metadata endpoints if needed: `GET /api/v1/catalog/destinations`, `GET /api/v1/catalog/profiles`, `GET /api/v1/catalog/metrics`.
- Implement API client methods and DTO adapters for detail/version/scenario loading.
- Implement Test Case Detail screen.
- Implement Version / Ordered Scenarios section or screen.
- Show scenario order exactly as backend provides it; do not allow reorder.
- Show basic metric chips/metadata where available.
- Add read-only payload preview with safe truncation/redaction where needed.
- Handle loading/empty/error/session/backend-unavailable states.
- Add tests for DTO adaptation, ordering preservation, and screen states where feasible.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect permission/write code.
- Do not implement real-write confirmation or platform writer flow.
- Do not implement full run orchestration beyond dry-run planning.
- Do not implement backend run reporting as completed behavior.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success or local fake test cases.
- Do not weaken safety gates.
- Do not call scenario upload/template/reorder endpoints as product behavior in MR-B.
- Do not implement scenario editing, upload, reorder, seed-library applicability, or authoring.
- Do not implement execution operations yet.
- Do not claim full metric catalog coverage.

## Acceptance Criteria

- Test case detail loads from `GET /api/v1/test-cases/{id}` or backend gap is explicit.
- Versions load from the documented version URLs or backend gap is explicit.
- Ordered scenarios load from `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios` or backend gap is explicit.
- Backend scenario order is preserved.
- No edit/reorder/upload/authoring controls exist.
- Payload preview is read-only and safe.
- No execution planner, dry-run, native permission, or native write code is implemented.

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

`MR-B STORY-test-case-detail-version-ordered-scenarios`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, verified backend URLs, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-B phase loop
- **Executed:** 2026-06-27 · branch `main`. **Status:** DONE.
- **Deliverable:** `src/catalog/{types,catalogApi}.ts` (getDestinations / getProfiles(destination_slug) / getMetrics(destination_slug,profile_slugs)); `src/testCases/{versionsApi,scenariosApi}.ts` (listVersions/getVersion/listScenarios) + Version/ScenarioSummary types; `src/runner/planInputs.ts` (read-only composite loader + orderScenarios); `src/screens/TestCaseDetailScreen.tsx` (P06; "Configuration is managed in MWDS Web App") + `VersionScenariosScreen.tsx` (P07: version destination[device-profile]/profiles/metrics-grouped via catalog metadata, ordered scenarios read-only, Build-execution-plan CTA).
- **Honest boundary:** full per-scenario payload is NOT in MR-B read scope (only template/download/upload, excluded) → the metric/metadata preview is real; no scenario JSON is fabricated; the limit is surfaced.
- **Validation:** tsc clean; validate-framework.sh PASS. Read-only; terminology (apple_health→iOS·Apple Health·HealthKit / health_connect→Android·Health Connect).
- **Followups:** P1 — scenario payload preview deferred to MR-C (route out of MR-B scope).

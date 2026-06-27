# PHASE_MR_B_SRS_DETAILED.md — Runnable Data Loading + Dry-run Planner

Project: `mWellness-Mobile-Runner`  
Phase: `MR-B — Runnable Data Loading + Dry-run Planner`

## Objective

MR-B proves the runner's first real product flow after auth:

```text
MWDS backend runnable data
→ read-only mobile browser
→ scenario detail
→ execution plan preview
→ dry-run result
```

MR-B intentionally stops before native permission/write behavior.

## Backend URL Contract

Use the configured MWDS backend base URL and append these route paths.

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

## What MR-B Unlocks

- Exact backend route verification for runnable data.
- Real test case list loading.
- Real test case detail/current version/ordered scenario display.
- Basic metric metadata and read-only payload preview.
- Scenario interpreter for a minimal supported subset.
- Execution plan preview.
- Dry-run result with unsupported/blocked/skipped classification.
- MR-C readiness for native writer MVP.

## What MR-B Defers

- Native HealthKit/Health Connect permission flow.
- Native writer bridges.
- Real-write confirmation.
- Full run orchestration.
- Backend run reporting as completed behavior.
- Advanced diagnostics/export.
- Full metric universe.

## Source Priority

```text
Master REQ = canonical product requirement source
MR-A contract baseline = current minimum implementation baseline
MR-DESIGN-00 artifacts = UI/UX implementation input
MR-FRAMEWORK-01 = readiness/gap input
Old DM1/app truth = legacy/superseded only
```

## Hard Backend Rule

MR-B must use real backend routes or explicitly stop/classify the gap.

Acceptable:
- route verified and implemented
- route missing and documented as BACKEND_GAP
- route shape mismatch and documented as P1/P0 followup

Not acceptable:
- local fake runnable data marked as completed behavior
- fake dry-run from invented scenarios
- silent fallback that hides backend gaps
- use of create/update/upload/reorder/seed/admin routes as MR-B product behavior

## Required Outputs

- updated backend route notes/contract baseline if needed
- runnable test case list API/client/screen
- test case detail/version/scenario API/client/screen
- scenario interpreter + operation builder
- execution plan preview
- dry-run result
- tests where feasible
- `PHASE_CLOSEOUT.md` or equivalent
- updated traceability

## Done Definition

MR-B is done when real backend runnable data can be loaded and dry-run planned, or missing backend routes are honestly classified as blocking gaps. No native permission/write code is allowed.

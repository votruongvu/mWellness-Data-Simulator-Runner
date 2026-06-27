# USER_STORY_INDEX.md — MR-B Runnable Data Loading + Dry-run Planner

Project: `mWellness-Mobile-Runner`  
Phase: `MR-B — Runnable Data Loading + Dry-run Planner`  
Story granularity: capability-slice milestones, not file-level tasks

This index is the canonical execution order for `.claude/commands/run-phase-loop.md`.

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

## MR-B Allowed Read Routes

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

## MR-B Explicitly Out of Scope URLs

- test case create/update/delete/archive/duplicate/unarchive
- version create
- scenario template/download/upload/reorder
- scenario seed browse/apply/applicable-seeds
- any admin user route

## Phase Boundary

MR-B should unlock:

- real backend runnable test case loading
- read-only test case detail
- version / ordered scenario detail
- basic metric metadata / payload preview
- local scenario interpreter
- execution plan preview
- dry-run result
- MR-C readiness

MR-B should not attempt:

- native HealthKit / Health Connect permission flow
- native writer bridge
- real-write confirmation
- full run orchestration
- backend run reporting as completed behavior
- full diagnostics/export
- full metric universe

## Key Safety Rule

If real backend routes are unavailable, stop with `BACKEND_GAP` instead of completing a fake browser or fake dry-run.

## Canonical Execution Order

| Order | Story ID | Story File | Depends On | Execution Notes |
|---:|---|---|---|---|
| 01 | MWR-MRB-001 | `STORY-backend-route-verification-runnable-test-case-list.md` | none | Verify real MWDS backend base URL and route contract, then implement the first read-only runnable test case list using backend-authoritative `GET /api/v1/test-cases` data. |
| 02 | MWR-MRB-002 | `STORY-test-case-detail-version-ordered-scenarios.md` | MWR-MRB-001 | Implement read-only test case detail, version list/detail, ordered scenarios, catalog metric metadata, and payload preview from real backend URLs. |
| 03 | MWR-MRB-003 | `STORY-scenario-interpreter-execution-plan-preview.md` | MWR-MRB-002 | Convert backend ordered scenarios from `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios` into a local execution plan preview for a minimal supported subset. No native writes. |
| 04 | MWR-MRB-004 | `STORY-dry-run-result-mr-b-closeout.md` | MWR-MRB-001, MWR-MRB-002, MWR-MRB-003 | Implement dry-run result for the execution plan without native writes, close MR-B, and classify MR-C readiness using the verified backend URLs. |

## Commit Rule

Each completed story must be committed separately.

```text
MR-B <story-file-name-without-md>
```

## Phase Closeout Rule

After all stories are complete:

- summarize story statuses
- list commit hashes
- list validation results
- list files created/updated
- summarize backend route verification
- list verified backend URLs
- summarize runnable browser and read-only detail
- summarize execution plan preview and dry-run result
- confirm no MR-C/native scope leaked in
- confirm no fake backend success or local fake runnable data was used as completed behavior
- classify MR-C readiness
- stop for human review

## Execution Status (run-phase-loop, 2026-06-27, branch main)
| Order | Story ID | Commit | Status |
|---:|---|---|---|
| 01 | MWR-MRB-001 | `2e0c809` | DONE |
| 02 | MWR-MRB-002 | `b28719e` | DONE |
| 03 | MWR-MRB-003 | `d610d4e` | DONE |
| 04 | MWR-MRB-004 | (closeout) | DONE |

Phase result: **4/4 DONE**. Backend verified live (no BACKEND_GAP). MR-C readiness: READY_WITH_FOLLOWUPS. Loop stops for human review.

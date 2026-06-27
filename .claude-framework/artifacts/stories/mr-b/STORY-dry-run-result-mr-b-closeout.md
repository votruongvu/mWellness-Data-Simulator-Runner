---
story_id: MWR-MRB-004
phase: MR-B
order: 4
title: "Dry-run Result + MR-B Closeout"
depends_on: ["MWR-MRB-001", "MWR-MRB-002", "MWR-MRB-003"]
status: done
---

# MWR-MRB-004 — Dry-run Result + MR-B Closeout

## Phase

`MR-B — Runnable Data Loading + Dry-run Planner`

## Goal

Implement dry-run result for the execution plan without native writes, close MR-B, and classify MR-C readiness using the verified backend URLs.

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
- MWR-MRB-002
- MWR-MRB-003

## Scope

- Implement dry-run action/result from the execution plan preview.
- Guarantee dry-run performs zero native writes and zero native permission prompts.
- Show dry-run result summary: total operations, writable candidates, unsupported, blocked, invalid, skipped, unknown.
- Show per-operation reason/details where useful without raw sensitive data leakage.
- Add safety copy that real write is not available in MR-B.
- Add tests proving dry-run does not call native writer/permission seams.
- Document final verified backend URLs used in MR-B closeout.
- Document out-of-scope backend URLs that MR-B must not call: scenario template/download/upload/reorder and scenario seed endpoints.
- Update traceability matrix and execution records.
- Run validation: typecheck, lint, unit tests, framework validator, link checks where available.
- Create `PHASE_CLOSEOUT.md` or equivalent MR-B closeout.
- Classify MR-C readiness and list P0/P1/P2 followups.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect permission/write code.
- Do not implement real-write confirmation or platform writer flow.
- Do not implement full run orchestration beyond dry-run planning.
- Do not implement backend run reporting as completed behavior.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success or local fake test cases.
- Do not weaken safety gates.
- Do not implement real-write confirmation.
- Do not implement iOS/Android native bridge.
- Do not call backend run reporting as completed behavior.
- Do not implement backend scenario upload/template/reorder or seed apply behavior.

## Acceptance Criteria

- Dry-run result is available from real backend scenario data when backend routes exist.
- Dry-run has no native write and no native permission prompt.
- Result categories are distinct and understandable.
- MR-B closeout lists verified backend base URL and route URLs.
- MR-B closeout confirms no authoring/upload/reorder/seed endpoints were used as product behavior.
- MR-C readiness is classified.
- No HealthKit/Health Connect native bridge/write implementation is added.

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

`MR-B STORY-dry-run-result-mr-b-closeout`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, verified backend URLs, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-B phase loop
- **Executed:** 2026-06-27 · branch `main`. **Status:** DONE.
- **Deliverable:** `src/runner/dryRun.ts` (pure `simulateDryRun` — no real writes/network) + `src/screens/DryRunResultScreen.tsx` (P09: "No health data was written", writable/would-skip/blocked counts, warnings, permission deferred to MR-C/MR-D, no real-write button); PHASE_CLOSEOUT + traceability + index.
- **Validation:** validate-framework.sh PASS; tsc clean; links 0 broken.
- **Confirmations:** no MR-C/native scope; no fake success; read-only; authoring/upload/reorder/seed/admin routes not used.
- **Readiness:** MR-C READY_WITH_FOLLOWUPS (needs scenario payload route + capability/permission + native writers — hard-gated).
- **Followups:** P1 — scenario payload/per-op detail + permission flow at MR-C; ESLint plugin fix.

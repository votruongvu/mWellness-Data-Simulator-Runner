---
story_id: MWR-MRB-001
phase: MR-B
order: 1
title: "Backend Route Verification + Runnable Test Case List"
depends_on: []
status: done
---

# MWR-MRB-001 — Backend Route Verification + Runnable Test Case List

## Phase

`MR-B — Runnable Data Loading + Dry-run Planner`

## Goal

Verify real MWDS backend base URL and route contract, then implement the first read-only runnable test case list using backend-authoritative `GET /api/v1/test-cases` data.

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

- None

## Scope

- Read `src/config/env.ts` / runtime config and point Mobile Runner at the real MWDS backend base URL.
- Verify operational endpoints: `GET /healthz`, `GET /readyz`, `GET /api/v1/meta`.
- Verify auth endpoints from MR-A still match backend: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Verify runnable list endpoint: `GET /api/v1/test-cases` protected by bearer auth.
- Verify response envelope/shape against `docs/contracts/MOBILE_RUNNER_CONTRACT_BASELINE.md`; update a compact MR-B route addendum if backend reality differs.
- Implement API client method for `GET /api/v1/test-cases` using MR-A backend client seam.
- Implement read-only Test Case List screen reachable from Dashboard.
- Show loading, empty, backend unavailable, session expired, and error-envelope states.
- Display only backend-authoritative data; do not create local fake test cases.
- Add tests for route mapping/client behavior and list screen states where feasible.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect permission/write code.
- Do not implement real-write confirmation or platform writer flow.
- Do not implement full run orchestration beyond dry-run planning.
- Do not implement backend run reporting as completed behavior.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success or local fake test cases.
- Do not weaken safety gates.
- Do not use `POST/PATCH/DELETE /api/v1/test-cases*` authoring routes in MR-B.
- Do not implement test case detail/version/scenario detail here.
- Do not add local seed/mock test cases as completed behavior.
- Do not implement dry-run in this story.

## Acceptance Criteria

- Backend base URL and tested endpoints are documented.
- `GET /api/v1/test-cases` exact route is documented or `BACKEND_GAP` is recorded.
- If backend route is available, Test Case List loads real backend data.
- If backend route is unavailable, story stops or closes with `BACKEND_GAP`, not fake completion.
- Dashboard Browse Test Cases action is wired only when safe.
- No scenario detail, execution planner, dry-run, native permission, or native write code is implemented.

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

`MR-B STORY-backend-route-verification-runnable-test-case-list`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, verified backend URLs, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-B phase loop
- **Executed:** 2026-06-27 · branch `main` · via `.claude/commands/run-phase-loop.md`. **Status:** DONE.
- **Backend verification (live, http://localhost:8080):** `/healthz`,`/readyz`,`/api/v1/meta` → 200; `/api/v1/auth/me`, `/catalog/{destinations,profiles,metrics}`, `/test-cases`, `/test-cases/{id}`, `/versions`, `/versions/{vid}`, `/scenarios` → 401 (exist, auth-gated); `POST /auth/login` → 401. **No 404 → no BACKEND_GAP.** Shapes taken from the authoritative MWDS OpenAPI.
- **Reconcile (MR-A built these as TO_VERIFY):** login body `username` (not email); response `token`/`expires_at` (not access_token/expires_in); `/me` → `{user:{id,username,name,role}}`; **error envelope `{error:{code,message,request_id}}`** parsed from the body (x-request-id header = fallback); removed speculative refresh. Documented in `docs/contracts/MR_B_BACKEND_ROUTE_ADDENDUM.md`.
- **Deliverable:** `src/testCases/{types,testCasesApi}.ts` (`listTestCases` → {data,pagination}); `src/screens/TestCaseListScreen.tsx` (read-only; loading/empty/error/backend-unavailable/session-expired/backend-gap states); Dashboard "Browse test cases" ENABLED → TestCaseList; shared `useApiResource`/`ScreenStates`/`platform.ts`. Framework validator fixed to exclude gitignored `node_modules` from the macOS-metadata guard (now `git ls-files`-based).
- **Validation:** `tsc --noEmit` clean (per implementer); `validate-framework.sh` PASS (0 errors). Run `npm run typecheck` to re-confirm.
- **Non-goals preserved:** read-only (no create/update/delete/archive/duplicate/upload/reorder/seed/admin methods exist); no native/permission/write; no scenario-detail/planner/dry-run here; no fake data.
- **Followups:** P1 — live authenticated data-shape verification (needs a token / the user running the app); P2 — `q`/`status` filter polish.

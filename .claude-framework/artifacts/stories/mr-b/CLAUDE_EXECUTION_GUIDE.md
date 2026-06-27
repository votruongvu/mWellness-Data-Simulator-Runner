# CLAUDE_EXECUTION_GUIDE.md — MR-B

Use `.claude/commands/run-phase-loop.md` with input folder:

```text
artifacts/stories/mr-b
```

Critical rule: MR-B must prove runnable data loading and dry-run planning from real backend data. Do not fake backend success or use invented local runnable data as completed behavior.

## Recommended Run Prompt

```text
Run `.claude/commands/run-phase-loop.md` with input folder:

`artifacts/stories/mr-b`

Use the canonical order from `USER_STORY_INDEX.md`.

Execute MR-B story-by-story and commit each completed story using the story filename.

Inputs:
- Mobile Runner Master REQ
- MR-A closeout and contract baseline
- MWDS backend router routes:
  - GET /healthz
  - GET /readyz
  - GET /api/v1/meta
  - POST /api/v1/auth/login
  - POST /api/v1/auth/logout
  - GET /api/v1/auth/me
  - GET /api/v1/catalog/destinations
  - GET /api/v1/catalog/profiles
  - GET /api/v1/catalog/metrics
  - GET /api/v1/test-cases
  - GET /api/v1/test-cases/{id}
  - GET /api/v1/test-cases/{id}/versions
  - GET /api/v1/test-cases/{id}/versions/{version_id}
  - GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios
- MR-DESIGN-00 artifacts
- framework source-of-truth/current-decisions/known-risks
- device QA matrix

Goal:
Implement the next useful Mobile Runner milestone: real backend runnable data loading, read-only test case/version/scenario detail, execution plan preview, and dry-run result.

MR-B must produce:
- backend route verification for runnable data
- runnable test case list
- test case detail / version / ordered scenarios
- basic metric metadata / safe payload preview
- scenario interpreter for a minimal supported subset
- execution plan preview
- dry-run result
- closeout and MR-C readiness

Rules:
- Master REQ remains canonical.
- MR-A contract baseline is the current implementation baseline.
- Design is UI/UX implementation input, subordinate to Master REQ.
- Use real MWDS backend base URL plus the route paths above.
- Do not implement native HealthKit or Health Connect permission/write code.
- Do not implement real-write confirmation.
- Do not implement full run orchestration.
- Do not implement backend run reporting as completed behavior.
- Do not add Google Fit/vendor SDKs/RBAC/tenant/billing/admin.
- Do not use create/update/delete/archive/duplicate/upload/reorder/seed/admin routes as MR-B product behavior.
- Do not hide backend gaps with fake success.
- If real MWDS backend routes are unavailable, stop with BACKEND_GAP instead of completing fake browser/dry-run behavior.
- Keep all runnable data read-only.

If current branch is `main`, ask me before committing story work.

Start with import/source validation, then run the loop if clean.
```

# CLAUDE_EXECUTION_GUIDE.md — MR-A

Use `.claude/commands/run-phase-loop.md` with input folder:

```text
artifacts/stories/mr-a
```

Critical rule: MR-A is not a full product implementation loop. It only locks the minimal contract baseline and implements foundation/auth/backend shell.

## Recommended Run Prompt

```text
Run `.claude/commands/run-phase-loop.md` with input folder:

`artifacts/stories/mr-a`

Use the canonical order from `USER_STORY_INDEX.md`.

Execute MR-A story-by-story and commit each completed story using the story filename.

Inputs:
- Mobile Runner Master REQ
- MR-FRAMEWORK-01 closeout/readiness audits
- MR-DESIGN-00 artifacts
- framework source-of-truth/current-decisions/known-risks
- device QA matrix

Goal:
Build the first useful Mobile Runner milestone: minimal contract baseline + React Native foundation + auth/session + backend client shell + dashboard/error states.

MR-A must produce:
- minimal contract baseline
- RN app foundation/navigation shell
- auth/session/secure storage
- backend API client base
- dashboard shell
- session expired/backend unavailable states
- closeout and MR-B readiness

Rules:
- Master REQ remains canonical.
- Design is UI/UX implementation input, subordinate to Master REQ.
- Old DM1/app truth is legacy/superseded only.
- Do not implement test case browser/detail.
- Do not implement execution plan or dry-run.
- Do not implement HealthKit or Health Connect permissions/writes.
- Do not add Google Fit/vendor SDKs/RBAC/tenant/billing/admin.
- Do not hide backend gaps with fake success.
- Keep environment handling lightweight; no heavy local/dev/prod primary UX.
- Use secure OS-backed token/session storage target; no plain AsyncStorage for tokens.

If current branch is `main`, ask me before committing story work.

Start with import/source validation, then run the loop if clean.
```

---
story_id: MWR-MRA-002
phase: MR-A
order: 2
title: "React Native App Foundation + Navigation Shell"
depends_on: ["MWR-MRA-001"]
status: done
---

# MWR-MRA-002 — React Native App Foundation + Navigation Shell

## Phase

`MR-A — Foundation + Contracts + Auth Shell`

## Goal

Scaffold the mobile app foundation, core project structure, navigation shell, providers, basic app boot flow, and validation baseline.

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

## Scope

- Create the React Native app foundation according to the repo/framework convention.
- Set up TypeScript baseline and core directory structure.
- Add app providers/shell needed for navigation, API/session context, and basic app state.
- Implement the minimal navigation stack for Splash/Bootstrap, Login, Dashboard, Settings/Error recovery if applicable.
- Add basic app boot flow with backend status placeholder wired to the backend client seam if available.
- Add initial testing setup or update existing test harness.
- Add lint/typecheck/test scripts according to repo convention.
- Do not implement test case browser, execution planner, native health permissions, or native writes.

## Explicit Non-Goals

- Do not implement native HealthKit or Health Connect write code.
- Do not implement execution planner, dry-run, run orchestration, or real-write flow.
- Do not implement full test case browser beyond minimal contract/API seams.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success.
- Do not weaken safety gates.
- Do not build full UI polish beyond shell-level screens.
- Do not implement runnable test case loading in this story.
- Do not implement health platform capability/permission flow.

## Acceptance Criteria

- App foundation exists and builds/runs in the documented local target or limitations are documented.
- Navigation shell supports unauthenticated and authenticated routes conceptually.
- Splash/Login/Dashboard route placeholders exist with no fake completed product behavior.
- Typecheck/lint/test baseline is available or missing setup is documented.
- No HealthKit/Health Connect/native write implementation is added.

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

`MR-A STORY-react-native-app-foundation-navigation-shell`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-A phase loop
- **Executed:** 2026-06-27 · branch `main`. **Status:** DONE.
- **Deliverable:** RN foundation — `package.json`/`tsconfig`/`babel`/`metro`/`jest`/eslint/prettier/`index.js`/`app.json`/`App.tsx`; `src/navigation/` (RootNavigator + types, auth vs app stack from session); `src/shared/` (theme + EnvBadge/SafetyBanner/StatusBadge/PrimaryButton); `src/config/env.ts` (base-URL seam, default null = no backend; lightweight env badge); `src/screens/Splash` + `Login`; `__tests__/smoke.test.tsx`; `docs/platform/MWR_APP_FOUNDATION_SETUP.md`; `.gitignore` RN ignores. ADR ratified: **ADR-MWR-010** (RN CLI 0.74.5 + TS strict + React Navigation v6 + react-native-keychain).
- **Build:** `npm install`/`pod install`/native build/typecheck **NOT run** (no toolchain/network here) — documented in the setup doc; iOS/Android native projects generated from the RN 0.74.5 template at setup.
- **Gates:** #9 (RN baseline ADR + native substrate) human-approved at MR-A.
- **Validation:** `validate-framework.sh` PASS; markdown/links OK.
- **Non-goals preserved:** lightweight env (no local/dev/staging/prod UX); no test-case browser/execution-plan/dry-run/permission/native-write; no Google Fit/vendor/RBAC.
- **Note:** per-story commits are additive layers — `App.tsx`/`RootNavigator` reference the auth (003) + dashboard/error (004) modules added later in the phase.
- **Followups:** P2 — run `npm install` + native build on a toolchained machine to verify the foundation compiles/runs.

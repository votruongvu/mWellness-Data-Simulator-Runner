# PHASE_MR_A_SRS_DETAILED.md — Foundation + Contracts + Auth Shell

Project: `mWellness-Mobile-Runner`  
Phase: `MR-A — Foundation + Contracts + Auth Shell`

## Objective

MR-A replaces the earlier split of MR0 + MR1.

The goal is to reduce overhead by creating a single useful loop that locks only the minimum contracts needed for app startup and implements the first app foundation/auth shell.

## What MR-A Unlocks

- Minimal product/backend/session contract baseline.
- React Native app shell.
- Login/logout/session restore.
- Secure session/token storage.
- Backend API client base.
- Basic dashboard shell.
- Backend unavailable/session expired states.
- MR-B readiness for real runnable data loading.

## What MR-A Defers

- Full backend contract coverage beyond minimal auth/runnable API shape.
- Runnable test case browser implementation.
- Version/scenario detail implementation.
- Execution plan and dry-run.
- Native capability/permission/writes.
- Full HealthKit / Health Connect mapping.
- Full run reporting/diagnostics.
- Device QA execution.

## Source Priority

```text
Master REQ = canonical product requirement source
MR-DESIGN-00 artifacts = UI/UX implementation input
MR-FRAMEWORK-01 = readiness/gap input
MR-A contract baseline = binding minimum for MR-A/MR-B after this loop
Old DM1/app truth = legacy/superseded only
```

## Required Outputs

- `docs/contracts/MOBILE_RUNNER_CONTRACT_BASELINE.md`
- React Native app foundation files according to repo convention
- Auth/session implementation
- Secure storage implementation
- Backend API client base
- Splash/Login/Dashboard/session/backend error states
- `PHASE_CLOSEOUT.md` or equivalent
- updated traceability

## Done Definition

MR-A is done when the app foundation is runnable/reviewable, auth/session/backend shell works or backend gaps are explicitly blocking, validation is recorded, and MR-B readiness is classified.

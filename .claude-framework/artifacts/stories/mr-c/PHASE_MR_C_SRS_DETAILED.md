# PHASE_MR_C_SRS_DETAILED.md — Native Writer MVP: iOS + Android

Project: `mWellness-Mobile-Runner`  
Phase: `MR-C — Native Writer MVP: iOS + Android`

## Objective

MR-C implements the first native writer MVP for both Apple Health / HealthKit and Health Connect, using only a minimal verified metric/record set.

The phase must start by resolving the payload contract. MR-B produced a metric-level dry-run. MR-C needs per-operation write values. If those values are not available from real backend data or an approved payload source, MR-C must stop before native write implementation.

## What MR-C Unlocks

- Per-operation payload contract/readiness.
- Minimal approved metric/record set.
- HealthKit capability and permission flow.
- Guarded iOS write POC.
- Health Connect availability and permission flow.
- Guarded Android write POC.
- Real-device QA status.
- Native mapping backlog.
- MR-D readiness.

## What MR-C Defers

- Full metric universe.
- Full run orchestration.
- Backend run reporting.
- Advanced diagnostics/export.
- Production readiness.

## Source Priority

```text
Master REQ = canonical product requirement source
MR-A contract baseline = foundation/auth/backend baseline
MR-B closeout = runnable data + dry-run baseline
MR-DESIGN-00 artifacts = UI/UX implementation input
MR-FRAMEWORK-01 = safety/readiness guardrails
Old DM1/app truth = legacy/superseded only
```

## Hard Safety Rules

- No fabricated health values.
- No fake native success.
- No silent permission prompt.
- No unsupported metric attempted.
- No denied permission write attempted.
- No real write without dry-run, payload verification, capability check, permission resolution, and explicit confirmation.
- Partial success must be distinct from success.
- Missing manual QA must be reported as NOT_EXECUTED/BLOCKED, not implied pass.

## Done Definition

MR-C is done when a minimal native writer path is implemented and honestly validated on iOS and Android, or blocked early by a real payload/backend/tooling gap. The result must be reviewable and safe; it must not claim production readiness.

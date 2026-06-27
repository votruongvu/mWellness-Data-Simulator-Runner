# PHASE_MR_DESIGN_00_SRS_DETAILED.md — Design Handoff Normalization

Project: `mWellness-Mobile-Runner`  
Phase: `MR-DESIGN-00 — Design Handoff Normalization`

## Objective

Normalize the accepted/refined Claude Designer output into implementation-ready design artifacts before MR0/MR1/MR2 implementation.

## Why This Phase Exists

The first design package was directionally correct but slightly overbuilt around environment management and internal platform feel. The refined direction is to simplify the UX around the core runner flow while preserving mandatory safety gates.

## Source Priority

1. Master REQ = canonical product requirement source.
2. Refined Claude Design = UI/UX implementation input.
3. Framework source-of-truth/current-decisions = active operating truth.
4. Old design iterations = evidence/history only.

## Required Artifacts

- `MOBILE_RUNNER_SCREEN_MAP.md`
- `MOBILE_RUNNER_E2E_FLOWS.md`
- `MOBILE_RUNNER_COMPONENT_KIT.md`
- `MOBILE_RUNNER_STATE_MATRIX.md`
- `MOBILE_RUNNER_SAFETY_UX_MATRIX.md`
- `MOBILE_RUNNER_IMPLEMENTATION_HANDOFF.md`
- `MOBILE_RUNNER_DESIGN_HANDOFF_CLOSEOUT.md`

## Core Flow

```text
Login
→ Browse runnable test cases
→ Select version/scenarios
→ Build execution plan
→ Dry-run
→ Check permission/capability
→ Confirm real write
→ Run
→ Result
```

## Screen Direction

Primary screens:

- Splash / Bootstrap
- Login
- Runner Dashboard
- Platform Capability Summary
- Test Case List
- Test Case Detail
- Version / Ordered Scenarios
- Execution Plan Preview
- Dry-run Result
- Permission & Capability Check
- Real-write Confirmation
- Run Progress
- Run Result

Secondary screens:

- Scenario Payload Preview
- Diagnostics / Logs
- Settings
- Error Detail

Error states:

- Session Expired
- Backend Unavailable
- Unsupported Platform

## Done Definition

MR-DESIGN-00 is done when the design package is archived and normalized into implementation-ready screen, flow, component, state, safety, and handoff docs with traceability and no product code changes.

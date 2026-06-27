---
story_id: MWR-MRC-005
phase: MR-C
order: 5
title: "Native Writer QA Closeout + Mapping Backlog"
depends_on: ["MWR-MRC-001", "MWR-MRC-002", "MWR-MRC-003", "MWR-MRC-004"]
status: ready
---

# MWR-MRC-005 — Native Writer QA Closeout + Mapping Backlog

## Phase

`MR-C — Native Writer MVP: iOS + Android`

## Goal

Validate MR-C native writer MVP, record real-device QA status, produce mapping backlog, and classify MR-D readiness.

## Why This Story Is a Capability Slice

This story is a reviewable native-writer capability slice. It may touch contracts, native bridge code, UI gates, tests, and QA docs together when they belong to this slice. Do not split into file-level micro-stories unless a P0 blocker is found.

## Context

MR-C follows MR-B. MR-B proved:

```text
real backend runnable data
→ read-only test case/version/scenario loading
→ execution plan preview
→ dry-run result
```

MR-C begins real native writer work. This is a hard-gated phase.

Critical MR-B followup:

```text
scenario payload + per-operation detail source must be resolved before any native write
```

If per-operation write values are unavailable, MR-C must stop with `BACKEND_GAP` or `PAYLOAD_GAP`, not fabricate values.

## Dependencies

- MWR-MRC-001
- MWR-MRC-002
- MWR-MRC-003
- MWR-MRC-004

## Scope

- Run typecheck, lint, unit tests, framework validator, and link checks where available.
- Run or document manual iOS real-device QA for HealthKit MVP.
- Run or document manual Android real-device QA for Health Connect MVP.
- Update `docs/platform/MWR_DEVICE_QA_MATRIX.md` with actual MR-C status: PASS, FAIL, BLOCKED, NOT_EXECUTED, or TO_VERIFY.
- Create/update `docs/contracts/MR_C_NATIVE_MAPPING_BACKLOG.md` for metrics/records deferred from MR-C.
- Confirm no full run orchestration, backend run reporting, advanced diagnostics/export, or full metric universe was implemented.
- Confirm no fake native success and no real write without required gates.
- Create `PHASE_CLOSEOUT.md` or equivalent MR-C closeout.
- Classify MR-D readiness and list P0/P1/P2 followups.

## Explicit Non-Goals

- Do not fabricate per-operation health values.
- Do not implement full metric universe coverage.
- Do not implement full run orchestration beyond minimal writer POC flow.
- Do not implement backend run reporting as completed behavior.
- Do not add mobile authoring/editing features.
- Do not add catalog editing, scenario seed library, scenario upload, scenario reorder, RBAC, tenant, billing, admin, Google Fit, vendor SDKs, or export-bundle primary flow.
- Do not hide backend gaps with local fake success or local fake test cases.
- Do not weaken dry-run/capability/permission/confirmation gates.
- Do not claim production readiness.
- Do not expand metric coverage during closeout.
- Do not hide missing device QA.
- Do not claim production readiness.

## Acceptance Criteria

- MR-C closeout exists.
- Device QA matrix is updated honestly.
- Mapping backlog exists.
- Validation results are recorded.
- No-fake-success and gate enforcement are confirmed.
- MR-D readiness is classified.
- Any missing manual QA is explicitly NOT_EXECUTED/BLOCKED, not implied pass.

## Required Safety Gates

No real native write may occur unless all are true:

```text
dry_run_completed
AND payload_source_verified
AND capability_checked
AND permission_resolved_or_granted
AND explicit_confirmation
```

Denied/unsupported/invalid operations must be skipped with a reason and not attempted.

Success can only be recorded after native platform success.

## Validation Expectations

- Run typecheck, lint, and unit tests where available.
- Run app build/start validation if local toolchain is available.
- Run iOS/Android native build validation where applicable and available.
- Run framework/context validation where available.
- Run markdown/internal link validation where available for docs changes.
- Grep/check no Google Fit/vendor SDK/RBAC/admin/authoring scope leaked in.
- Grep/check no fake native success path exists.
- Honestly state unavailable validators/tools.

## Human Approval Triggers

Stop and ask for human approval if:

- Per-operation payload source is missing.
- Native writer requires unapproved metric/record types.
- HealthKit/Health Connect mapping is uncertain but implementation would assume writability.
- Permission or confirmation gates cannot be enforced.
- Tooling/device QA cannot validate a real write but closeout would need to claim it.
- Work requires changing Master REQ/product boundary.
- Work requires MR-D run orchestration/reporting scope.

## Commit Requirement

Commit subject must be:

`MR-C STORY-native-writer-qa-closeout-mapping-backlog`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, device QA status when relevant, and P0/P1/P2 followups.

---
story_id: MWR-MRC-002
phase: MR-C
order: 2
title: "iOS HealthKit Capability + Permission + Bridge"
depends_on: ["MWR-MRC-001"]
status: ready
---

# MWR-MRC-002 — iOS HealthKit Capability + Permission + Bridge

## Phase

`MR-C — Native Writer MVP: iOS + Android`

## Goal

Implement the guarded iOS HealthKit substrate for availability, permission explanation/status, and native bridge seams without broad metric coverage.

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

## Scope

- Proceed only if MWR-MRC-001 payload/readiness gate is not blocking.
- Implement iOS HealthKit availability/capability check for the approved MR-C metric set.
- Implement permission explanation before any native permission prompt.
- Implement permission status model: not_requested, granted, denied, partial, unavailable, unknown.
- Implement guarded native bridge seam for HealthKit write calls.
- Ensure bridge returns structured native success/failure/error codes; no fake success.
- Wire iOS capability/permission UI only for MR-C approved flow.
- Add tests/mocks for capability/permission state handling where feasible.
- Document simulator limitations and real-device requirement.

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
- Do not implement full HealthKit mapping.
- Do not implement Android Health Connect.
- Do not support derived/vendor-only metrics.

## Acceptance Criteria

- iOS capability check exists.
- Permission explanation appears before OS prompt.
- Permission status is represented without silent assumptions.
- HealthKit bridge seam exists and is guarded.
- No write success is returned without actual native success.
- Only approved MR-C metrics are in scope.
- No Android writer code is implemented in this story.

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

`MR-C STORY-ios-healthkit-capability-permission-bridge`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, device QA status when relevant, and P0/P1/P2 followups.

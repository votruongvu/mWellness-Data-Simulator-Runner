---
story_id: MWR-MRC-003
phase: MR-C
order: 3
title: "iOS Guarded HealthKit Write POC"
depends_on: ["MWR-MRC-001", "MWR-MRC-002"]
status: ready
---

# MWR-MRC-003 — iOS Guarded HealthKit Write POC

## Phase

`MR-C — Native Writer MVP: iOS + Android`

## Goal

Perform a tightly guarded HealthKit write proof-of-concept for the approved minimal metric set, with dry-run and confirmation gates enforced.

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

## Scope

- Proceed only after iOS capability/permission bridge is available and payload contract is satisfied.
- Map approved MR-C operations to HealthKit write requests.
- Require dry-run completed before write.
- Require capability checked before write.
- Require permission resolved/granted before write.
- Require explicit confirmation before write.
- Implement guarded write execution for approved metric set only.
- Return per-operation status: succeeded, failed, skipped_permission, skipped_unsupported, skipped_invalid_payload, cancelled.
- Show result summary distinct from dry-run result.
- Add tests for gate enforcement and no-write when gates are unmet.

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
- Do not write unapproved metrics.
- Do not bypass confirmation for developer convenience.
- Do not claim production readiness.

## Acceptance Criteria

- HealthKit write path is guarded by dry-run/capability/permission/confirmation.
- Only approved minimal metrics can be written.
- Denied/unsupported/invalid operations are skipped with reason, not attempted.
- Success is reported only after native success.
- Partial success is distinct from success.
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

`MR-C STORY-ios-guarded-healthkit-write-poc`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, device QA status when relevant, and P0/P1/P2 followups.

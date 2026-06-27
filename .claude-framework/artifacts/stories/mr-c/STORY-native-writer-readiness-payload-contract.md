---
story_id: MWR-MRC-001
phase: MR-C
order: 1
title: "Native Writer Readiness + Payload Contract"
depends_on: []
status: done
---

# MWR-MRC-001 — Native Writer Readiness + Payload Contract

## Phase

`MR-C — Native Writer MVP: iOS + Android`

## Goal

Resolve the hard gate before native writing: where per-operation values come from, which minimal metric set is allowed, and how MR-C avoids fabricated write payloads.

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

- None

## Scope

- Review MR-B closeout and confirm current limitation: scenario list is metric-level; full per-scenario payload is not yet available through MR-B read routes.
- Define the exact source of per-operation write values for MR-C: backend route, existing scenario payload source, or explicit BACKEND_GAP/PAYLOAD_GAP.
- If no real per-operation payload source exists, stop and classify MR-C as BLOCKED/BACKEND_GAP/PAYLOAD_GAP instead of fabricating values.
- Create/update `docs/contracts/MR_C_NATIVE_WRITER_PAYLOAD_CONTRACT.md`.
- Define minimal writer MVP metric set for iOS and Android using only metrics with real payload values and credible native writability.
- Classify each candidate as approved_for_mrc, to_verify, unsupported, blocked_no_payload, or blocked_no_native_mapping.
- Define no-fake-success rule: native success can only be reported after actual native API success.
- Define real-write gate chain for MR-C: dry-run completed, payload source verified, capability checked, permission resolved, explicit confirmation.
- Define MR-C manual approval and QA requirements before any real write.

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
- Do not implement native bridges in this story unless the payload gate is already passed and explicitly approved.
- Do not invent scenario values from metric metadata.
- Do not expand to full metric universe.

## Acceptance Criteria

- Payload contract exists.
- Per-operation value source is explicit.
- If payload source is missing, MR-C stops as BACKEND_GAP/PAYLOAD_GAP and does not proceed to native write stories.
- Minimal metric set is intentionally small and classified.
- No fabricated values are allowed.
- Real-write gate chain is documented.
- No native writer code is added in this story unless payload readiness is clear and explicitly approved.

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

`MR-C STORY-native-writer-readiness-payload-contract`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, capability impact, validation results, device QA status when relevant, and P0/P1/P2 followups.

---

## Execution Record — MR-C phase loop
- **Executed:** 2026-06-27 · branch `main` · via `.claude/commands/run-phase-loop.md`. **Status:** DONE.
- **Decision: `PAYLOAD_GAP` — MR-C BLOCKED before native write implementation.** Deliverable: `docs/contracts/MR_C_NATIVE_WRITER_PAYLOAD_CONTRACT.md`.
- **Finding:** no verified GET route exposes concrete per-operation scenario values (scenarios=summaries only; scenario-template/download=structure template + out-of-scope; upload/reorder=writes). Per-operation payload source = unavailable → PAYLOAD_GAP. No values fabricated.
- **Documented:** minimal candidate metric/record set (steps/heart_rate/distance/active_energy/body_mass/sleep) all `blocked_no_payload`, native mapping `to_verify`; no-fake-success rule; 5-gate real-write chain (payload_source_verified currently FALSE); other blockers (no native substrate, gates #1/#2/#3/#9, device QA NOT_EXECUTED); resume conditions; mapping backlog.
- **Per story rule:** native bridges/write POCs (MWR-MRC-002…005) are NOT implemented — the payload gate did not pass. No native write code added.
- **Validation:** `validate-framework.sh` PASS; markdown/links OK.
- **Non-goals preserved:** no fabricated values; no fake native success; no native/permission/write code; no MR-D orchestration; no Google Fit/vendor/RBAC.
- **Followups:** see phase closeout (P0 payload source; P1 native substrate + gate approvals + device QA).

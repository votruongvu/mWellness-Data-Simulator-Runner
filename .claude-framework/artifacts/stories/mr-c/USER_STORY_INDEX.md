# USER_STORY_INDEX.md — MR-C Native Writer MVP: iOS + Android

Project: `mWellness-Mobile-Runner`  
Phase: `MR-C — Native Writer MVP: iOS + Android`  
Story granularity: capability-slice milestones, not file-level tasks

This index is the canonical execution order for `.claude/commands/run-phase-loop.md`.

## Phase Boundary

MR-C should unlock:

- per-operation payload contract/readiness
- minimal approved native metric/record set
- iOS HealthKit capability and permission flow
- iOS guarded write POC
- Android Health Connect availability and permission flow
- Android guarded write POC
- native writer QA closeout
- mapping backlog
- MR-D readiness

MR-C should not attempt:

- full metric universe coverage
- full end-to-end run orchestration
- backend run reporting as completed behavior
- advanced diagnostics/export
- production readiness
- vendor SDKs or Google Fit

## Hard Payload Rule

MR-C must not fabricate write values.

If no real per-operation payload source exists, stop with `BACKEND_GAP` or `PAYLOAD_GAP` before native write implementation.

## Hard Native Write Gate

No native write unless:

```text
dry_run_completed
AND payload_source_verified
AND capability_checked
AND permission_resolved_or_granted
AND explicit_confirmation
```

## Canonical Execution Order

| Order | Story ID | Story File | Depends On | Execution Notes |
|---:|---|---|---|---|
| 01 | MWR-MRC-001 | `STORY-native-writer-readiness-payload-contract.md` | none | Resolve the hard gate before native writing: where per-operation values come from, which minimal metric set is allowed, and how MR-C avoids fabricated write payloads. |
| 02 | MWR-MRC-002 | `STORY-ios-healthkit-capability-permission-bridge.md` | MWR-MRC-001 | Implement the guarded iOS HealthKit substrate for availability, permission explanation/status, and native bridge seams without broad metric coverage. |
| 03 | MWR-MRC-003 | `STORY-ios-guarded-healthkit-write-poc.md` | MWR-MRC-001, MWR-MRC-002 | Perform a tightly guarded HealthKit write proof-of-concept for the approved minimal metric set, with dry-run and confirmation gates enforced. |
| 04 | MWR-MRC-004 | `STORY-android-health-connect-capability-permission-write-poc.md` | MWR-MRC-001 | Implement the guarded Android Health Connect MVP equivalent: availability, permission, bridge seam, and minimal approved record writes. |
| 05 | MWR-MRC-005 | `STORY-native-writer-qa-closeout-mapping-backlog.md` | MWR-MRC-001, MWR-MRC-002, MWR-MRC-003, MWR-MRC-004 | Validate MR-C native writer MVP, record real-device QA status, produce mapping backlog, and classify MR-D readiness. |

## Commit Rule

Each completed story must be committed separately.

```text
MR-C <story-file-name-without-md>
```

## Phase Closeout Rule

After all stories are complete:

- summarize story statuses
- list commit hashes
- list validation results
- list files created/updated
- summarize payload/readiness decision
- summarize iOS HealthKit capability/permission/write POC
- summarize Android Health Connect capability/permission/write POC
- summarize device QA status
- summarize mapping backlog
- confirm no fake native success
- confirm no write without required gates
- confirm no MR-D/full orchestration scope leaked in
- classify MR-D readiness
- stop for human review

## Execution Status (run-phase-loop, 2026-06-27, branch main)
**Phase result: BLOCKED (PAYLOAD_GAP).** Story 001 (payload contract) DONE; native write stories 002–005 NOT started (payload gate did not pass; native substrate/device/gates pending).

| Order | Story ID | Status |
|---:|---|---|
| 01 | MWR-MRC-001 | DONE — PAYLOAD_GAP |
| 02 | MWR-MRC-002 | BLOCKED |
| 03 | MWR-MRC-003 | BLOCKED |
| 04 | MWR-MRC-004 | BLOCKED |
| 05 | MWR-MRC-005 | BLOCKED |

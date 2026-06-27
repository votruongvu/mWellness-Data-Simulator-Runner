# USER_STORY_INDEX.md — MR-DESIGN-00 Design Handoff Normalization

Project: `mWellness-Mobile-Runner`  
Phase: `MR-DESIGN-00 — Design Handoff Normalization`  
Purpose: Canonical execution order for normalizing Claude Designer output into implementation-ready design artifacts.

This index is the phase execution source for `.claude/commands/run-phase-loop.md`.

## Phase Boundary

This phase creates design/docs artifacts only.

Allowed:
- archive accepted/refined design package
- screen map
- end-to-end flow specification
- component kit
- state matrix
- safety UX matrix
- implementation handoff
- design closeout and traceability
- context updates if design decisions affect implementation

Not allowed:
- product code
- React Native app scaffold
- backend API implementation
- HealthKit or Health Connect native write implementation
- MR0/MR1/later phase story generation
- mobile authoring/editing features
- export-bundle primary flow

## Core Design Direction

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

## Canonical Execution Order

| Order | Story ID | Story File | Depends On | Execution Notes |
|---:|---|---|---|---|
| 01 | MWR-DESIGN-001 | `STORY-import-and-archive-accepted-design-package.md` | none | Archive the accepted/refined Claude Designer package and review notes as traceable design evidence without making design higher authority than Master REQ. |
| 02 | MWR-DESIGN-002 | `STORY-create-final-core-screen-map.md` | MWR-DESIGN-001 | Normalize the final screen inventory into primary, secondary, and error-state screens with simplified environment handling. |
| 03 | MWR-DESIGN-003 | `STORY-create-end-to-end-flow-specification.md` | MWR-DESIGN-002 | Create the normalized end-to-end flow map for core runner, dry-run, real-write, permission, unsupported metric, and backend error paths. |
| 04 | MWR-DESIGN-004 | `STORY-create-component-kit-and-state-matrix.md` | MWR-DESIGN-002, MWR-DESIGN-003 | Define reusable mobile UI components and critical screen states for implementation. |
| 05 | MWR-DESIGN-005 | `STORY-create-safety-gate-ux-matrix.md` | MWR-DESIGN-003, MWR-DESIGN-004 | Create implementation-ready UX rules for dry-run, capability, permission, confirmation, partial run, unsupported metrics, and no-fake-success messaging. |
| 06 | MWR-DESIGN-006 | `STORY-create-implementation-handoff.md` | MWR-DESIGN-002, MWR-DESIGN-003, MWR-DESIGN-004, MWR-DESIGN-005 | Map design screens, components, states, API dependencies, and native dependencies to future MR implementation phases. |
| 07 | MWR-DESIGN-007 | `STORY-close-design-handoff-loop.md` | MWR-DESIGN-001, MWR-DESIGN-002, MWR-DESIGN-003, MWR-DESIGN-004, MWR-DESIGN-005, MWR-DESIGN-006 | Finalize design handoff traceability, update framework context, and classify readiness for MR0/MR1. |

## Commit Rule

Each completed story must be committed separately.

Commit subject format:

```text
MR-DESIGN-00 <story-file-name-without-md>
```

## Phase Closeout Rule

After all stories are complete:

- summarize story statuses
- list commit hashes
- list validation results
- list files created/updated
- confirm design remains subordinate to Master REQ
- confirm environment UX is simplified
- confirm iOS and Android happy paths are covered
- confirm safety gates remain mandatory
- confirm no product/native/backend code was added
- classify readiness for MR0 and MR1
- stop for human review

## Execution Status (run-phase-loop, 2026-06-27, branch mr-design-00-stories)

| Order | Story ID | Commit | Status |
|---:|---|---|---|
| 01 | MWR-DESIGN-001 | `302a7ac` | DONE |
| 02 | MWR-DESIGN-002 | `e99d362` | DONE |
| 03 | MWR-DESIGN-003 | `56cd461` | DONE |
| 04 | MWR-DESIGN-004 | `6972cbb` | DONE |
| 05 | MWR-DESIGN-005 | `74224a5` | DONE |
| 06 | MWR-DESIGN-006 | `97205e8` | DONE |
| 07 | MWR-DESIGN-007 | (closeout commit) | DONE |

Phase result: **all 7 stories DONE**. Loop stops for human review. Design subordinate to Master REQ; MCP `v2.dc.html` not retrievable (PDF+spec archived). Readiness: MR0 READY, MR1 READY_WITH_FOLLOWUPS.

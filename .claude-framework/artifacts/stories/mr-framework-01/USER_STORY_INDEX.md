# USER_STORY_INDEX.md — MR-FRAMEWORK-01 Context Completeness & MR0 Readiness

Project: `mWellness-Mobile-Runner`  
Phase: `MR-FRAMEWORK-01 — Context Completeness & MR0 Readiness`

## Phase Boundary

This phase is framework/readiness/docs-only.

Allowed:
- source-of-truth audit
- legacy contamination audit
- safety gate audit
- roadmap/phase queue alignment
- design handoff readiness audit
- MR0 contract readiness checklist
- device QA matrix placeholder
- validation and closeout

Not allowed:
- product code
- React Native app scaffold
- backend API implementation
- HealthKit or Health Connect native write implementation
- MR0/MR1/later story generation
- changing Master REQ scope
- design becoming higher authority than Master REQ

## Expected State

```text
MR-FRAMEWORK-00 = complete / approved
MR-DESIGN-00 = complete / approved with followups
MR-FRAMEWORK-01 = this phase
MR0 = not started, hard human approval gate
MR1 = not started
```

## Canonical Execution Order

| Order | Story ID | Story File | Depends On | Execution Notes |
|---:|---|---|---|---|
| 01 | MWR-FW1-001 | `STORY-audit-source-of-truth-and-legacy-contamination.md` | none | Verify source hierarchy, Master REQ canonical status, design subordinate status, and old DM1 legacy-only status. |
| 02 | MWR-FW1-002 | `STORY-audit-mobile-safety-gates-and-human-approval.md` | MWR-FW1-001 | Verify P0 mobile health-write safety gates, approval triggers, and no-fake-success rules before MR0 and later native work. |
| 03 | MWR-FW1-003 | `STORY-audit-roadmap-phase-queue-and-design-placement.md` | MWR-FW1-001 | Verify roadmap/phase queue reflects MR-FRAMEWORK-00, MR-DESIGN-00, MR-FRAMEWORK-01, MR0, and MR1 correctly. |
| 04 | MWR-FW1-004 | `STORY-audit-design-handoff-readiness.md` | MWR-FW1-001, MWR-FW1-003 | Verify MR-DESIGN-00 artifacts are complete enough to inform MR0 and MR1 without overpowering Master REQ. |
| 05 | MWR-FW1-005 | `STORY-audit-backend-api-and-contract-readiness-for-mr0.md` | MWR-FW1-001, MWR-FW1-004 | Identify contract topics MR0 must lock before implementation. |
| 06 | MWR-FW1-006 | `STORY-create-device-qa-matrix-placeholder.md` | MWR-FW1-002, MWR-FW1-005 | Create the platform/device QA matrix placeholder required by previous P1 followup. |
| 07 | MWR-FW1-007 | `STORY-validate-framework-context-and-close-mr-framework-01.md` | MWR-FW1-001, MWR-FW1-002, MWR-FW1-003, MWR-FW1-004, MWR-FW1-005, MWR-FW1-006 | Run final framework validations, update traceability, and classify readiness for MR0 and MR1. |

## Commit Rule

Each completed story must be committed separately.

```text
MR-FRAMEWORK-01 <story-file-name-without-md>
```

## Phase Closeout Rule

After all stories are complete, summarize story statuses, commit hashes, validations, files changed, source hierarchy, safety readiness, design readiness, MR0/MR1 readiness, and stop for human review.

## Execution Status (run-phase-loop, 2026-06-27, branch mr-framework-01-stories)
| Order | Story ID | Commit | Status |
|---:|---|---|---|
| 01 | MWR-FW1-001 | `680c643` | DONE |
| 02 | MWR-FW1-002 | `4466189` | DONE |
| 03 | MWR-FW1-003 | `ab1bd84` | DONE |
| 04 | MWR-FW1-004 | `7bf050a` | DONE |
| 05 | MWR-FW1-005 | `bcfc573` | DONE |
| 06 | MWR-FW1-006 | `19a027c` | DONE |
| 07 | MWR-FW1-007 | (closeout) | DONE |

Phase result: **7/7 DONE**. MR0 readiness: READY_WITH_FOLLOWUPS. MR1 readiness: READY_WITH_FOLLOWUPS. Loop stops for human review.

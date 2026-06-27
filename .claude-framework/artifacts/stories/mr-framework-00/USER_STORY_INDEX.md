# USER_STORY_INDEX.md — MR-FRAMEWORK-00 Claude Framework Bootstrap

Project: `mWellness-Mobile-Runner`  
Phase: `MR-FRAMEWORK-00 — Claude Framework Bootstrap`  
Purpose: Canonical execution order for bootstrapping the dedicated Mobile Runner Claude Framework.

This index is the phase execution source for `.claude/commands/run-phase-loop.md`.

## Phase Boundary

This phase creates framework/docs only.

Allowed:
- old framework extraction audit
- new Mobile Runner Claude Framework skeleton
- Master REQ canonicalization
- adapter docs
- source-of-truth/current-decisions/known-risks/human gates
- phase loop/closeout/context refresh commands
- mobile safety guardrails
- core docs for architecture/contracts/safety/roadmap
- adapted checklists/agents/validators
- validation and closeout

Not allowed:
- product code
- React Native app scaffold
- MR0/MR1/later phase story generation
- HealthKit or Health Connect native write implementation
- Google Fit/vendor SDK integration
- RBAC/tenant/billing/admin scope
- preserving old DM1 REQ as canonical truth

## Canonical Product Direction

```text
Backend runnable scenario contract
→ Mobile execution plan
→ Dry-run
→ Permission/capability gate
→ Platform writer
→ Run orchestration
→ Result reporting
```

## Canonical Execution Order

| Order | Story ID | Story File | Depends On | Execution Notes |
|---:|---|---|---|---|
| 01 | MWR-FW-001 | `STORY-extract-old-framework-reusable-assets.md` | none | Inspect the old mobile framework archive and classify reusable, rewrite-required, and legacy-only framework assets for the new Mobile Runner repo. |
| 02 | MWR-FW-002 | `STORY-bootstrap-mobile-runner-framework-skeleton.md` | MWR-FW-001 | Create the dedicated Claude Framework skeleton for mWellness-Mobile-Runner using the new Master REQ as canonical source. |
| 03 | MWR-FW-003 | `STORY-add-mobile-safety-guardrails-and-human-gates.md` | MWR-FW-002 | Add mandatory mobile-native safety guardrails, approval gates, and risk docs for health data writes and backend authority. |
| 04 | MWR-FW-004 | `STORY-add-phase-loop-closeout-and-context-refresh-process.md` | MWR-FW-002, MWR-FW-003 | Create or adapt mobile framework commands for story-by-story execution, context refresh, traceability, and close-task-style review. |
| 05 | MWR-FW-005 | `STORY-create-mobile-runner-framework-core-docs.md` | MWR-FW-002, MWR-FW-003 | Create core architecture, contract, safety, and roadmap docs required by future MR-DESIGN-00 and MR0 loops. |
| 06 | MWR-FW-006 | `STORY-adapt-mobile-framework-checklists-agents-and-validators.md` | MWR-FW-001, MWR-FW-003, MWR-FW-004 | Adapt reusable old framework checklists, agents, hooks, and validators to Mobile Runner semantics. |
| 07 | MWR-FW-007 | `STORY-validate-framework-bootstrap-and-close-mr-framework-00.md` | MWR-FW-001, MWR-FW-002, MWR-FW-003, MWR-FW-004, MWR-FW-005, MWR-FW-006 | Validate the bootstrapped Mobile Runner Claude Framework, update traceability, and prepare close-task-style review. |

## Commit Rule

Each completed story must be committed separately.

Commit subject format:

```text
MR-FRAMEWORK-00 <story-file-name-without-md>
```

## Phase Closeout Rule

After all stories are complete:

- summarize story statuses
- list commit hashes
- list validation results
- list files created/updated
- confirm Master REQ is canonical
- confirm old DM1 REQ is legacy/superseded
- confirm no product/native write code changed
- classify readiness for MR-FRAMEWORK-01
- stop for human review

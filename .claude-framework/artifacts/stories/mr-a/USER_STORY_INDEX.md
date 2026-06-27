# USER_STORY_INDEX.md — MR-A Foundation + Contracts + Auth Shell

Project: `mWellness-Mobile-Runner`  
Phase: `MR-A — Foundation + Contracts + Auth Shell`  
Story granularity: capability-slice milestones, not file-level tasks

This index is the canonical execution order for `.claude/commands/run-phase-loop.md`.

## Phase Boundary

MR-A merges the old MR0 + MR1 intent into one smaller, useful loop.

MR-A should unlock:

- minimal contract baseline
- React Native app foundation
- navigation shell
- auth/session
- secure storage
- backend client base
- dashboard shell
- backend/session error states
- MR-B readiness

MR-A should not attempt:

- runnable test case browser
- scenario detail
- execution plan
- dry-run
- native permissions
- native writes
- run orchestration
- full diagnostics/export

## Design Philosophy

The goal is to reduce overhead by reducing loop scope, not merely reducing the number of stories. Each story is a reviewable capability slice and may update multiple files.

## Canonical Execution Order

| Order | Story ID | Story File | Depends On | Execution Notes |
|---:|---|---|---|---|
| 01 | MWR-MRA-001 | `STORY-minimal-contract-baseline.md` | none | Lock only the minimum contracts required to start mobile implementation: product boundary, source-of-truth, auth/session API assumptions, runnable data API shape, core DTOs, and error/correlation behavior. |
| 02 | MWR-MRA-002 | `STORY-react-native-app-foundation-navigation-shell.md` | MWR-MRA-001 | Scaffold the mobile app foundation, core project structure, navigation shell, providers, basic app boot flow, and validation baseline. |
| 03 | MWR-MRA-003 | `STORY-auth-session-secure-storage-backend-client.md` | MWR-MRA-001, MWR-MRA-002 | Implement the minimal auth/session flow, secure token storage, backend API client base, backend status handling, and error envelope mapping. |
| 04 | MWR-MRA-004 | `STORY-dashboard-error-states-mr-a-closeout.md` | MWR-MRA-001, MWR-MRA-002, MWR-MRA-003 | Complete the first reviewable app milestone: dashboard shell, lightweight backend/platform status, session/backend error states, validation, traceability, and MR-B readiness. |

## Commit Rule

Each completed story must be committed separately.

```text
MR-A <story-file-name-without-md>
```

## Phase Closeout Rule

After all stories are complete:

- summarize story statuses
- list commit hashes
- list validation results
- list files created/updated
- summarize minimal contract baseline
- summarize app foundation/auth/backend client
- confirm no MR-B/MR-C scope leaked in
- confirm no native write code was added
- classify MR-B readiness
- stop for human review

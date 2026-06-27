---
description: Full-lane MWR preset — compose → execute → review → close with all matching gates.
---

**Lane preset** (command-only shim). Runs the full lifecycle for a
multi-surface or high-risk MWR task. Owns orchestration; waives no gate.

User input: $ARGUMENTS

## Agent crew
Full lifecycle crew: `mwr-prompt-composer` (brief) →
`mwr-implementation-agent` (execute) → the review fanout matching the
touched surface (`mwr-backend-api-reviewer`, `mwr-execution-plan-reviewer`,
`mwr-apple-health-write-reviewer`, `mwr-health-connect-write-reviewer`,
`mwr-rn-architecture-reviewer`, `mwr-test-reviewer`,
`mwr-doc-sync-reviewer`, plus **`mwr-test-data-and-health-write-safety-reviewer`**
on any safety surface) → `/close-task`.

## Sequence
`/compose-task` (Lane Gate + Risk-First + `SCOPE_SPLIT_GATE`) →
`/execute-task` → `/review-task` (fanout) → `/close-task` (Acceptance +
`CONTEXT_PROMOTION_GATE`).

## Gates
All gates matching the touched surfaces
([`gates.md`](.claude-framework/framework/rules/gates.md)); on any high-risk
MWR surface `DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` +
`CAPABILITY_PERMISSION_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE` +
`TEST_DATA_SAFETY_GATE` always apply. A real Apple Health / Health Connect
write halts for the hard human-approval gate
([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)).

## Output
The artifacts of each lifecycle step, ending in a closeout.

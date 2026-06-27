---
description: Run review + closeout together — fanout review, then Acceptance + Context Promotion.
---

**Preset** (command-only shim) chaining `/review-task` → `/close-task` for
a completed change.

User input: $ARGUMENTS

## Agent crew
The review fanout matching the touched surface
([`mwr-review-fanout-pattern.md`](.claude-framework/framework/context/mwr-review-fanout-pattern.md)):
`mwr-backend-api-reviewer`, `mwr-execution-plan-reviewer`,
`mwr-apple-health-write-reviewer`, `mwr-health-connect-write-reviewer`,
`mwr-rn-architecture-reviewer`, `mwr-test-reviewer`,
`mwr-doc-sync-reviewer`, with
**`mwr-test-data-and-health-write-safety-reviewer`** mandatory on any
safety surface. Then `/close-task` hands promotions to `/refresh-context`.

## Sequence
`/review-task` (multi-lens fanout, one verdict P0/P1/P2) → `/close-task`
(Acceptance Gate + `CONTEXT_PROMOTION_GATE`).

## Gates
Per-route review lenses (test-data-and-health-write-safety mandatory on
safety surfaces); Acceptance + Context Promotion
([`gates.md`](.claude-framework/framework/rules/gates.md)).

## Output
A `REVIEW-*.md` + a closure report; durable facts queued in
[`pending-promotions.md`](.claude-framework/adapter/pending-promotions.md).

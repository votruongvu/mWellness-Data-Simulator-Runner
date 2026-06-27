---
id: REVIEW-<slug>
type: review
status: draft
reviews_task: TASK-BRIEF-<slug>
mode: <tiny | focused | full>
tags: [mwellness-mobile-runner, mwr]
---

# REVIEW-<slug> — <title>

> FOCUSED/FULL artifact. TINY reviews use the inline 5-field shape and do
> NOT write this file. Ordering + severity contracts:
> [`report-format.md`](../rules/report-format.md).

## Human Summary
> (FULL only — field contract cited from `report-format.md` R-1.)
- **Result / What changed / What still matters / Recommended next action**

## Recommended next action
```text
Run: <one line, names a command>
Reason: <one sentence>
Do not run: <one line, or "none">
Reason: <one sentence, or "n/a">
```

## Lenses run (cite the fanout registry)
- <e.g. mwr-test-data-and-health-write-safety-reviewer, mwr-execution-plan-reviewer, mwr-apple-health-write-reviewer, mwr-health-connect-write-reviewer, mwr-backend-api-reviewer, mwr-rn-architecture-reviewer, mwr-test-reviewer, mwr-doc-sync-reviewer>

## Blocking before close
> P0 / P1 — severity rubric cited from `report-format.md` §R-4a.
- <finding — file:line — rule/ADR violated>   (or "none")

## Safe to carry
> P2.
- <follow-up — owner — retire-condition>   (or "none")

## Informational / no action needed
- <note>   (or "none")

## Verdict
APPROVED | APPROVED_WITH_FOLLOWUPS | BLOCKED

## Portable handoff summary
> 9-field schema canonical at [`.claude/HANDOFF.md` §3](../../../.claude/HANDOFF.md).

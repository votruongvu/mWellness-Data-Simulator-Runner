# Skill — close-task

## Name
`close-task`

## Purpose
Accept a reviewed change and run the Context Promotion Gate.

## Mode
**CLOSEOUT.** Owns the Acceptance Gate + `CONTEXT_PROMOTION_GATE`. Adapter
edits are applied via `/refresh-context` (the only adapter writer).

## Inputs
A completed `REVIEW-*.md` + its brief.

## Context to load
- The review, [`pending-promotions.md`](../../../.claude-framework/adapter/pending-promotions.md).

## Gates to run
- **Acceptance Gate** (human) — accept the verdict; record who accepts any P1 as a tracked follow-up.
- **`CONTEXT_PROMOTION_GATE`** — identify durable facts; name the target adapter file; record the source artifact; promote only human-approved facts (via `/refresh-context`).

## Step-by-step workflow
1. Confirm the verdict + that no P0 remains (BLOCKED if any P0 or unaddressed P1).
2. Emit the Closure Summary (R-5): final status / accepted-by / open blockers / carried follow-ups / context promotion / next action.
3. Queue durable facts in `pending-promotions.md`; mark which are `needed-now`.
4. Hand promotions to `/refresh-context` for application.

## Output format / artifact
A closure report (R-5) + queued/applied promotions. Compact shape: [`session-closeout-compact.md`](../../../.claude-framework/framework/templates/session-closeout-compact.md).

## Closeout / artifact requirements
Closeout classification APPROVED / APPROVED_WITH_FOLLOWUPS / BLOCKED.

## Escalation triggers
- A durable fact would change a load-bearing decision/invariant → spin a `DECISION-*` brief, do not silently promote.
- A new ADR is implied → record it explicitly (`ADR-MWR-NNN`) and STOP for the human-approval gate ([`human-approval-gates.md`](../../../.claude-framework/adapter/human-approval-gates.md)); not as code.

# Skill — review-task

## Name
`review-task`

## Purpose
Review a diff against its brief via the multi-lens fanout, returning one
verdict with P0/P1/P2.

## Mode
**REVIEW ONLY.** Reads the diff; writes under `artifacts/reviews/`. No
source edits unless explicitly asked.

## Inputs
A diff + its `TASK-BRIEF-*.md`.

## Context to load
- The brief + diff, [`mwr-review-fanout-pattern.md`](../../../.claude-framework/framework/context/mwr-review-fanout-pattern.md), the touched adapter slices.

## Gates to run
- The route's review lenses (fanout registry). **The test-data-and-health-write-safety lens is mandatory** on any fixture/secret/endpoint/real-write/dry-run/permission surface.

## Step-by-step workflow
1. Pick the lenses matching the touched surface (backend-api / execution-plan / apple-health-write / health-connect-write / test-data-and-health-write-safety / test / doc-sync / rn-architecture).
2. Run lenses (read-only, parallel); each returns findings + per-lens verdict with `file:line`.
3. Merge into one verdict; the stricter (safety) lens wins conflicts; dedup.
4. Classify findings P0/P1/P2 ([`report-format.md`](../../../.claude-framework/framework/rules/report-format.md) R-4a).

## Output format / artifact
- Mode 1 TINY: inline 5-field compact.
- Mode 2/3 FOCUSED/FULL: `.claude-framework/artifacts/reviews/REVIEW-<slug>.md` per template.

## Closeout / artifact requirements
Verdict APPROVED / APPROVED_WITH_FOLLOWUPS / BLOCKED. Durable P2s → `known-risks.md` / `pending-promotions.md` with owner + retire-condition.

## Escalation triggers
- Any P0 → BLOCKED, full stop (real PHI/PII, raw secret/token, a dry-run that writes, faked write success, silent metric drop, prod endpoint default, score asserted, "Google HealthKit"/Google Fit).
- A real-write path or permission-prompt change reaches review without the human-approval gate satisfied → BLOCKED ([`human-approval-gates.md`](../../../.claude-framework/adapter/human-approval-gates.md)).
- Discover high-risk scope mid-review → STOP-and-escalate to FULL.

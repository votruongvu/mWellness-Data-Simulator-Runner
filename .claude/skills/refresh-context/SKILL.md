# Skill — refresh-context

## Name
`refresh-context`

## Purpose
Reconcile curated context (`adapter/`) with real repo state and apply
approved Context Promotions. The **only** adapter writer.

## Mode
**CONTEXT-MAINTENANCE.** Edits only `.claude-framework/adapter/*`. No
product code, no artifacts.

## Inputs
Repo state + recent diffs; optionally `--scope=<files>`.

## Context to load
- The changed adapter slices + the changed code.
- [`pending-promotions.md`](../../../.claude-framework/adapter/pending-promotions.md) (scan for `needed-now`).

## Gates to run
- **`CONTEXT_PROMOTION_GATE`** — only human-approved facts promote; name the target adapter file; record the source artifact.
- **`ARTIFACT_TRUTH_GATE`** — adapter = current truth; artifacts = evidence until promoted ([`gates.md`](../../../.claude-framework/framework/rules/gates.md)).

## Step-by-step workflow
1. Diff curated truth vs real repo for the changed slices ("code wins" for DESCRIPTIVE facts only; a decision/Master REQ/safety rule is never silently superseded).
2. Scan `pending-promotions.md`; surface any unresolved `needed-now` blocking the next task.
3. Apply only human-approved promotions into the named adapter file(s); mark `resolved` + link source.
4. Keep `TO_VERIFY` honest; never invent confirmation.
5. For `--scope=`, touch only those files and emit the literal line `No broad adapter rewrite was performed.` (report-format R-6).

## Output format / artifact
Updated `adapter/*` + a refresh report (resolved promotions, remaining `TO_VERIFY`).

## Closeout / artifact requirements
Adapter edits only. No artifact file.

## Escalation triggers
- A load-bearing fact moved across ≥3 adapter files → flag the breadth for human review before applying.
- MWR safety-invariant drift (e.g. a doc now implies dry-run writes, success is faked, or says "Google HealthKit"/Google Fit) → STOP, surface as a defect.

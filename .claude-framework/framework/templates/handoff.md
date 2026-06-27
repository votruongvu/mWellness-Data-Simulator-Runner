---
id: HANDOFF-<slug>
type: handoff
tags: [mwellness-mobile-runner, mwr]
---

# HANDOFF-<slug> — <title>

A portable context hand-off — usable verbatim by a human, a future Claude
turn, or another reviewer. The canonical 9-field schema lives at
[`.claude/HANDOFF.md` §3](../../../.claude/HANDOFF.md); this template
instantiates it.

## Portable handoff summary
```text
Task:                       <one-line — slug + short title>
Verdict:                    <approve | approve-with-followups | request-changes | accepted | blocked | …>
Files changed:              <bullet list, or "none">
Tests run:                  <command + result per line, or "none">
Blocking issues:            <P0/P1 list, or "none">
Non-blocking follow-ups:    <P2/P3 list, or "none">
Context promotion needed:   <yes | no — if yes, name target adapter file(s)>
Recommended next action:    <one line, names a command>
Question for architect:     <open question, or "none">
```

## MWR carry-over (when relevant)
- Open ADRs blocking next step: <ADR-MWR-00x, or none>
- Hard human-approval gate pending: <real Apple Health / Health Connect write · permission-prompt timing/copy · bypassing dry-run/confirmation · token storage · new vendor/Google Fit · backend API gap · release-readiness · new/changed ADR · UX flow — or none>
- Real-write / device test still owed: <yes/no — env-gated, dry-run wrote nothing>
- Adapter docs to update: <…>

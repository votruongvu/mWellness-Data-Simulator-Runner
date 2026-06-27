---
id: REVIEW-<slug>
type: task-review-compact
mode: tiny
tags: [mwellness-mobile-runner, mwr]
---

# Review (compact) — <title>

TINY / FOCUSED inline review shape (no Human Summary / Portable handoff;
see `report-format.md` R-9). Discover high-risk scope mid-review →
STOP-and-escalate to FULL.

```text
Verdict:       approve | approve-with-followups | request-changes
Blocking:      <P0/P1 findings — file:line — rule/ADR, or "none">
Non-blocking:  <P2 findings, or "none">
Tests checked: <focused tests + result>
Recommendation: <one line, names a command>
```

MWR quick checks: backend authority respected · scenario contract not
mutated/reordered · execution plan classified (reason_code on blocked ops)
· dry-run wrote nothing · capability+permission fail closed · no fake
success · no real PHI/PII · no raw secret/token (redacted) · unsupported
metric surfaced not dropped · Android target is Health Connect (never
"Google HealthKit").

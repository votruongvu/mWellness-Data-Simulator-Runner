---
id: CLOSEOUT-<slug>
type: session-closeout-compact
tags: [mwellness-mobile-runner, mwr]
---

# Closeout — <title>

Compact session/task closeout. Full `/close-task` uses the R-5 Closure
Summary; this is the lightweight shape.

```text
Final status:        APPROVED | APPROVED_WITH_FOLLOWUPS | BLOCKED
Accepted by:         <Human Decision Owner>
Open blockers:       <P0/P1 list, or "none">
Carried follow-ups:  <P2 list with owner + retire-condition, or "none">
Context promotion:   applied | proposed | deferred | not-needed  (target adapter file if any)
Next action:         <one line, names a command>
```

## MWR notes
- Gates exercised: <gate names from gates.md>
- Run mode: dry-run only (default) / real-write enabled (env-gated, human-confirmed)
- No fake success / capability+permission honored: <yes/no>
- Replay determinism / regression fixtures touched: <yes/no>
- Hard human-approval gate hit: <which, or none>
- Adapter promotions queued: <PP-MWR-* IDs, or none>

# mWellness-Mobile-Runner — Pending Promotions

Backlog of deferred **Context Promotions** — durable facts discovered during
work that are not yet promoted into curated context. Owned by `close-task`;
applied via `refresh-context`. Seeded at framework bootstrap
(MR-FRAMEWORK-00, 2026-06-27).

> **The queue is empty.** No facts are pending promotion at bootstrap. New
> rows are added as work surfaces durable facts.

## Promotion convention

A working artifact becomes durable truth only after promotion through the
**Context Promotion** gate:

```text
close-task  ->  human-approved fact(s)  ->  named adapter file
```

1. `close-task` identifies a durable fact discovered during the task and
   records it here as a candidate (status `deferred` or `needed-now`).
2. The **Human Decision Owner** approves the fact (`CONTEXT_PROMOTION_GATE`:
   only human-approved facts promote; the source artifact is recorded).
3. `refresh-context` writes the approved fact into the **named** target
   adapter file (e.g. `current-decisions.md`, `repository-map.md`,
   `wiring-paths.md`, …) and flips the row to `resolved` with a link.

Until promoted, the fact lives in artifacts as **evidence**, not current
truth (`ARTIFACT_TRUTH_GATE`).

## Status enum

- `deferred` — noted, not needed yet.
- `needed-now` — blocks current/next work; promote before proceeding.
- `resolved` — promoted into curated context (link the target file).

## Promotion queue

| ID | Status | Candidate fact to promote | Target adapter file | Trigger |
|---|---|---|---|---|
| _(empty)_ | — | — | — | — |

## Scan contract

`refresh-context` scans this file for `needed-now` rows; any unresolved
`needed-now` row that blocks the current task surfaces as a gate before
execution. At bootstrap there are none.

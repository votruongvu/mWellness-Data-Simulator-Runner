# Refactor Rules — mWellness-Mobile-Runner (MWR)

Refactors change structure, not behavior.

## RF-1 — Behavior preserved + proven
A refactor proves no behavior change: tests are unchanged-or-stronger and
pass before and after. Golden plan-replays must be byte-identical across the
refactor (a diff there means behavior changed — stop).

## RF-2 — Pipeline boundary preserved
Refactors never let a platform-writer shape leak back into the
scenario-contract or execution-plan models, never move a real-write call onto
the dry-run path, and never collapse the boundary (scenario contract ->
execution plan -> platform writer stays intact and one-way).

## RF-3 — Single-objective, scoped
A refactor declares its scope and stays in it. Spanning modules or touching a
denylist category escalates the lane (see
[`lane-classification.md`](lane-classification.md)).

## RF-4 — No silent supersede
A refactor never silently changes a governance invariant (dry-run-no-write,
no-fake-success, secret/endpoint safety, capability/permission, scenario
contract, platform-writer contract). That is a decision-change requiring an
ADR, not a refactor.

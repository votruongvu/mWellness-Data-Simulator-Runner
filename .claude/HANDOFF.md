# HANDOFF — mWellness-Mobile-Runner Claude framework

Rolling human-facing handoff for the MWR Claude operating module. Keep the
top section current; append session notes below.

## Where the framework stands

| Part | Scope | Status |
|---|---|---|
| **Current phase** | **MR-FRAMEWORK-00 — Claude Framework bootstrap** (docs/framework only) | **IN PROGRESS / bootstrapped** |
| Adapter Context Layer | `project-source-of-truth`, `current-decisions` (ADR-MWR-*), `known-risks` (R-MWR-*), `human-approval-gates`, `repository-map`, `settings-map`, `test-map`, `wiring-paths`, `regression-fixtures`, `pending-promotions`, `prompt-overrides`, `known-legacy`, `milestone-log` | DONE (seeded) |
| Product code | RN app, native projects, health writers | **NONE — not scaffolded; not started** |
| **Next phase** | **MR0 — Mobile Runner Contract Alignment** | NOT STARTED |

## Operating principle (load-bearing)

> **Backend runnable scenario contract first -> mobile execution plan
> second -> platform writer third.**

Source of truth = the **MWDS Web App + Go backend** (upstream authority) +
the **Mobile Runner Master REQ**
([`docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`](../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html)).

## What exists now (bootstrap)

- Root [`CLAUDE.md`](../CLAUDE.md) — the MWR operating contract.
- `.claude/` surface: commands, skills, agents, hooks, state (this
  HANDOFF lives here).
- `.claude-framework/`: 13 `adapter/` files (curated current truth),
  `framework/{rules,checklists,templates,context}/`, the `execution/` loop
  layer, `artifacts/` (evidence), `scripts/` (validators).
- `docs/`: canonical Master REQ + architecture/contracts/safety/roadmap/
  platform docs.

## How to drive the next work

- The autonomous loop layer is
  [`.claude-framework/execution/`](../.claude-framework/execution/)
  (controller / state / runbook / human-approval-gates / closeout / stop /
  phase-queue). It executes phase-by-phase, commits per story, validates per
  story, and **stops for human classification** at any hard gate.
- The hard human-approval gates are
  [`.claude-framework/adapter/human-approval-gates.md`](../.claude-framework/adapter/human-approval-gates.md)
  (canonical, 10 gates).
- Per-surface behavioral rules every task brief must answer:
  [`.claude-framework/adapter/prompt-overrides.md`](../.claude-framework/adapter/prompt-overrides.md).

## Important deferrals (do not treat as done)

- **No RN app is scaffolded.** All `src/`, `ios/`, `android/` paths in
  `repository-map.md` / `settings-map.md` / `wiring-paths.md` are
  `TO_VERIFY` until their phase lands them.
- **No health-write code exists.** Apple Health + Health Connect writers are
  contract-only; any real write is a hard human-approval gate (#1/#2).
- **MR0 locks contracts before implementation**; the MR3 dry-run plan exists
  before the MR4/MR5 real writers (Master REQ §17).

## Open `TO_VERIFY` (Master REQ §16)

Exact backend endpoints · token refresh/storage strategy · per-platform
writable metrics (iOS / Android) · run-reporting before MR6 · real-write
gating (DEV flag / env flag / both) · run scope (one scenario / whole list /
both) · RN baseline + native-module prefix (`Mwr<Capability>`). Resolve or
accept-as-delivery-risk at MR0.

## Validation

```bash
bash .claude-framework/scripts/validate-framework.sh
```

## Session log

- **MR-FRAMEWORK-00 (2026-06-27):** bootstrapped the MWR Claude operating
  module — reused a prior framework's mechanics, authored fresh MWR truth
  (no prior product truth carried; the superseded framework is named only in
  [`.claude-framework/adapter/known-legacy.md`](../.claude-framework/adapter/known-legacy.md)).
  Seeded CLAUDE.md, HANDOFF, the framework README, and the 13 adapter files.
  No product code; the RN app does not exist. Next: MR0 contract alignment.

# `.claude-framework/` — mWellness-Mobile-Runner operating module

The rules / checklists / templates / context / Context-Layer (`adapter/`) /
execution-loop / artifacts / scripts half of the Claude operating module for
**MWR — the mWellness Mobile Runner**. The live workflow surface (commands,
skills, agents, hooks, state, HANDOFF) lives in [`.claude/`](../.claude/).

Neither directory is MWR app runtime code. Nothing here is imported by the
React Native app, ships in a build, or affects the bundle — it is
**markdown-first** plus a small set of shell/python validators.

## Directory layout

```text
adapter/      curated CURRENT TRUTH (the Context Layer): source-of-truth, decisions (ADR-MWR-*),
              risks (R-MWR-*), human-approval-gates, repository/settings/test maps,
              wiring-paths (W-MWR-*), regression-fixtures, pending-promotions, prompt-overrides,
              known-legacy, milestone-log
execution/    autonomous loop layer: MWR_EXECUTION_CONTROLLER / _STATE / _LOOP_RUNBOOK /
              _HUMAN_APPROVAL_GATES / _LOOP_CLOSEOUT_TEMPLATE / _STOP_CONDITIONS / _PHASE_QUEUE (MR0–MR7)
framework/
  context/    mental model, skill/command anatomy, review-fanout pattern, framework guide,
              context-pack registry, skill registry
  rules/      operating principles, gates (single definition), lane classification, report format,
              + MWR domain rules (backend-api, execution-plan, platform-writer, test-data-safety,
              secret-endpoint-safety, rn-testing/performance/ui-quality, …)
  checklists/ actionable per-surface checklists (apple-health-write, health-connect-write,
              dry-run-no-write, no-fake-success, capability-permission, secret-endpoint-safety,
              test-data-safety, scenario-contract, execution-plan-runner, backend-api-contract,
              run-reporting, wiring-audit, rn-*, …)
  templates/  artifact templates (requirement, story, task, brief, review, decision-brief,
              handoff, test-case-set, mobile-qa-report, …)
artifacts/    working evidence/history (requirements mirror, stories, tasks, reviews, …) — NOT current truth
scripts/      validate-framework.sh + validate_context_pack_paths.py
```

## First reads (in order)

1. Root [`CLAUDE.md`](../CLAUDE.md) — the operating contract.
2. [`adapter/project-source-of-truth.md`](adapter/project-source-of-truth.md)
   — the one-page router (identity, operating principle, ownership
   boundaries, source hierarchy).
3. [`framework/context/mwr-framework-guide.md`](framework/context/mwr-framework-guide.md)
   — the handbook index.

For routing, [`adapter/human-approval-gates.md`](adapter/human-approval-gates.md)
(hard gates), [`framework/rules/gates.md`](framework/rules/gates.md) (the
single gate definition), and
[`adapter/prompt-overrides.md`](adapter/prompt-overrides.md) (per-surface
mandatory rules) are consulted on demand.

## Truth model

- **`adapter/` = current truth.** The curated Context Layer — current
  decisions, risks, wiring, maps.
- **`artifacts/` = evidence.** Working records / history; a working artifact
  becomes durable truth only after **Context Promotion** into the adapter
  (owned by `close-task`, applied via `refresh-context`).

The operating principle —
**backend runnable scenario contract first -> mobile execution plan second
-> platform writer third** — and the MWDS-backend-is-upstream-authority
boundary govern every file here.

## Validate

```bash
bash .claude-framework/scripts/validate-framework.sh
```

The structural validator (existence + non-empty + leakage + terminology
check) lives in [`scripts/`](scripts/).

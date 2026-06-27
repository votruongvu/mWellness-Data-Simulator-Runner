# `framework/context/` — mWellness-Mobile-Runner (MWR) methodology layer

Methodology references + the two routing registries. This is the
**orientation entry point** to the context layer. Pull files on demand; do
**not** default-load them.

## First reads (in order)
1. Root [`CLAUDE.md`](../../../CLAUDE.md) — operating contract, authority boundaries, lane model, terminology guard.
2. [`project-source-of-truth.md`](../../adapter/project-source-of-truth.md) — MWR identity; MWDS backend = upstream authority; the operating principle.
3. [`mental-model.md`](mental-model.md) — the four-layer model, one page.
4. [`mwr-framework-guide.md`](mwr-framework-guide.md) — how the whole operating module fits together.

Then pull the registry/anatomy/fanout file the current task needs.

| File | What it is |
|---|---|
| [`mental-model.md`](mental-model.md) | The four-layer model (Command/Skill/Agent/Tool), mapped to the MWR run pipeline. |
| [`mwr-framework-guide.md`](mwr-framework-guide.md) | Handbook index: what MWR is, the pipeline, governance attach points, lifecycle. |
| [`mwr-skill-command-anatomy.md`](mwr-skill-command-anatomy.md) | The shape every command (thin shim) + skill (playbook) follows. |
| [`mwr-review-fanout-pattern.md`](mwr-review-fanout-pattern.md) | Multi-lens review fanout; lens → `mwr-*` reviewer agent registry. |
| [`context-pack-registry.md`](context-pack-registry.md) | Selective-loading packs (entry criteria + minimal files) + task-routing. |
| [`skill-registry.md`](skill-registry.md) | Per-skill mode / minimal reads / gates / risk level. |

## Truth model (resolve disagreements in this order)
1. Real repo state — descriptive current-state facts.
2. Mobile Runner Master REQ — canonical product requirements (`docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`).
3. `.claude-framework/adapter/*` — the **Context Layer**, current truth.
4. `.claude-framework/artifacts/*` — evidence/history, not current truth.

Always-on baseline (every task): root [`CLAUDE.md`](../../../CLAUDE.md) +
[`project-source-of-truth.md`](../../adapter/project-source-of-truth.md).

> **Operating principle (verbatim):** Backend runnable scenario contract
> first → mobile execution plan second → platform writer third.

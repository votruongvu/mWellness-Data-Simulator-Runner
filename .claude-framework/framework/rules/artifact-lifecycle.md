# Artifact Lifecycle — mWellness-Mobile-Runner (MWR)

Governance for framework artifacts vs curated truth.

## The truth model
- **Curated context** (`.claude-framework/adapter/`) = **current truth** (the
  Context Layer).
- **Artifacts** (`.claude-framework/artifacts/`) = working records / evidence
  — REQs, stories, tasks, briefs, reviews, decision-briefs, handoffs. **Not
  current truth until promoted.**
- `docs/` = supporting reference, below curated context in the source
  hierarchy. The canonical Master REQ lives under `docs/requirements/`.

This is the **`ARTIFACT_TRUTH_GATE`** (see [`gates.md`](gates.md)): never cite
an artifact as current truth; cite the adapter file it was promoted into.

## Lifecycle states
```text
draft -> proposed -> accepted -> (promoted) -> superseded | archived
```
- An artifact records what was true/decided **at its time**.
- Acceptance happens at a human gate; promotion happens via the
  **`CONTEXT_PROMOTION_GATE`** (owned by `close-task`, applied by
  `refresh-context`).

## Promotion convention
- A durable fact becomes current truth only after the human approves
  promotion into a named adapter file; record the source artifact.
- [`pending-promotions.md`](../../adapter/pending-promotions.md) is the queue
  (`deferred` / `needed-now` / `resolved`).

## Supersede / retention
- Superseding an artifact links the replacement; do not delete history.
- Artifacts are retained as evidence; they are not rewritten to match new
  truth (the adapter carries current truth instead).

## Allowed write locations by mode
- Compose skills -> `artifacts/{requirements,stories,tasks}/`.
- review-task -> `artifacts/reviews/`.
- Read-only audits (`execute-task`) -> `.claude/task-runs/<slug>.md`.
- refresh-context -> `adapter/*` (the only adapter writer).
- direct-patch -> no artifact file (inline 5-field shape).

## Inheritance note (MWR)
This module **reuses the mechanics** of a prior, now-superseded Claude
framework, but carries **none** of its product truth. That superseded
framework's requirements / decisions / reviews are **not** MWR evidence and
must never be cited as MWR truth (see
[`known-legacy.md`](../../adapter/known-legacy.md)). MWR's only canonical
requirement source is the Mobile Runner Master REQ.

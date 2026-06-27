# Skill — compose-task

## Name
`compose-task`

## Purpose
Turn a task into an executable implementation **brief**, grounded in
decisions + risks + mandatory gates, with lane triage and (for high-risk)
a risk-first pass and scope-split check.

## Mode
**BRIEF-AUTHORING.** Writes a `TASK-BRIEF-*.md`. No product code.

## Inputs
- A task idea or `TASK-*.md` + a route (see `context-pack-registry.md`).

## Context to load
- The matching **context pack** + its named adapter slices (not the whole adapter).
- [`prompt-overrides.md`](../../../.claude-framework/adapter/prompt-overrides.md) — mandatory rules + lane policy.
- [`lane-classification.md`](../../../.claude-framework/framework/rules/lane-classification.md) — lane vocabulary + denylist (cite, never inline).
- `framework/templates/task-brief.md`.

## Gates to run
- **Lane Gate** — emit a Lane Triage block; STOP for human `lane=` confirmation. Never self-route.
- **Risk-First Pass** — for high-risk surfaces (backend client/auth, scenario interpretation/contract, execution plan, dry-run, capability/permission, a platform writer, any real-write path, secrets/endpoints), name the failure modes + the test that proves each, before design.
- **`SCOPE_SPLIT_GATE`** — Full/high-risk only: count major surfaces; recommend split when ≥3 surfaces or (scenario-contract change + platform-writer change).
- The route's mandatory gates from `gates.md` / `prompt-overrides.md`.

## Step-by-step workflow
1. Classify the route + recommend a lane; emit Lane Triage; STOP for confirmation.
2. On `lane=tiny`, recommend `/direct-patch` instead.
3. For high-risk, run the Risk-First Pass + `SCOPE_SPLIT_GATE`.
4. Compose the brief: objective, confirmed-context-vs-open-assumptions, files/surface, wiring path, gates, named tests, acceptance (verifiable), non-goals, risks, rollback, reviewer lenses, the MWR impact block.
5. Mark unknown paths `TO_VERIFY`; cite (don't inline) gate/denylist sources.

## Output format / artifact
A full task brief (per template) incl. Lane Triage + named test set +
acceptance + non-goals + MWR impact block.

## Closeout / artifact requirements
`.claude-framework/artifacts/tasks/TASK-BRIEF-<slug>.md`, ready for `/execute-task`.

## Escalation triggers
- Any backend-client/auth, scenario-contract, execution-plan, dry-run, capability/permission, platform-writer, real-write, or secret/endpoint surface → full lane, mandatory specialist + test-data-and-health-write-safety reviewers named.
- A real Apple Health / Health Connect write, permission-prompt timing/copy, token storage, or backend-API gap → STOP for the human-approval gate ([`human-approval-gates.md`](../../../.claude-framework/adapter/human-approval-gates.md)).
- `SCOPE_SPLIT_GATE` fires → compose only the first CR; list the rest.

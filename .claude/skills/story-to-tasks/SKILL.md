# Skill — story-to-tasks

## Name
`story-to-tasks`

## Purpose
Turn an approved story into one or more single-objective tasks with a
route.

## Mode
**COMPOSE/ARTIFACT-AUTHORING.** Writes `TASK-*.md` under
`artifacts/tasks/`. No source edits.

## Inputs
An approved story.

## Context to load
- The story, [`repository-map.md`](../../../.claude-framework/adapter/repository-map.md), [`context-pack-registry.md`](../../../.claude-framework/framework/context/context-pack-registry.md) (routing).

## Gates to run
- **Definition Gate** (human) — each task has a single, clear objective + a route.

## Step-by-step workflow
1. Decompose the story into single-objective tasks.
2. Assign each a route from the routing table (BACKEND_API_CLIENT / SCENARIO_LOADING / INTERPRET_PLAN / DRY_RUN / CAPABILITY_PERMISSION / APPLE_HEALTH_WRITE / HEALTH_CONNECT_WRITE / RUN_REPORTING / …).
3. Name the wiring path(s) (`W-MWR-00x`), expected tests, gates triggered, and any Open-ADR blocker.

## Output format / artifact
`.claude-framework/artifacts/tasks/TASK-<slug>.md` per template.

## Closeout / artifact requirements
Tasks ready for `/compose-task`.

## Escalation triggers
- A task spans ≥3 surfaces → flag for the `SCOPE_SPLIT_GATE` at `/compose-task`.
- A task is blocked by an Open ADR → mark the dependency; do not assume a resolution.

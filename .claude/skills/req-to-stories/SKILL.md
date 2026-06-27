# Skill — req-to-stories

## Name
`req-to-stories`

## Purpose
Break an approved REQ into stories that each trace to exactly one REQ and
one MWR surface.

## Mode
**COMPOSE/ARTIFACT-AUTHORING.** Writes `STORY-*.md` under
`artifacts/stories/`. No source edits.

## Inputs
An approved REQ.

## Context to load
- The REQ, `framework/templates/story.md`.

## Gates to run
- **Scope Gate** (human) — each story is one bounded surface and traces to one REQ.

## Step-by-step workflow
1. Identify the surfaces the REQ implies (auth/session, backend client/scenario loading, scenario interpretation, execution plan, dry-run, capability/permission, Apple Health writer, Health Connect writer, run reporting, QA, release).
2. Write one story per surface; each names the MWR safety invariants it must preserve (dry-run-no-write, no-fake-success, capability + permission, unsupported-surfaced, secrets redacted, no real PHI).
3. Ensure each story traces to exactly one REQ; no story spans multiple surfaces.

## Output format / artifact
`.claude-framework/artifacts/stories/STORY-<slug>.md` per template.

## Closeout / artifact requirements
Stories ready for `/story-to-tasks`.

## Escalation triggers
- A story can't trace to one REQ → back to `/compose-req`.
- A story spans ≥3 surfaces → it's a candidate for the `SCOPE_SPLIT_GATE` downstream.

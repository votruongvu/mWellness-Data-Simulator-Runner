---
description: Turn an approved story into single-objective tasks with a route.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/story-to-tasks/SKILL.md](.claude/skills/story-to-tasks/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
May delegate read-only mapping to
[`mwr-codebase-explorer`](.claude/agents/mwr-codebase-explorer.md).

## Gates
Definition Gate (human) — single, clear objective + a route from
[`context-pack-registry.md`](.claude-framework/framework/context/context-pack-registry.md).

## Output
`.claude-framework/artifacts/tasks/TASK-<slug>.md`.

---
description: Compose an executable task brief with Lane Gate, Risk-First Pass, and Scope Split Gate.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/compose-task/SKILL.md](.claude/skills/compose-task/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
May delegate brief drafting to
[`mwr-prompt-composer`](.claude/agents/mwr-prompt-composer.md)
(read-only) once the lane is confirmed.

## Gates
Lane Gate (STOP for human `lane=`), Risk-First Pass (high-risk),
`SCOPE_SPLIT_GATE` (Full/high-risk), plus the route's mandatory gates from
[`gates.md`](.claude-framework/framework/rules/gates.md) /
[`prompt-overrides.md`](.claude-framework/adapter/prompt-overrides.md). High-risk
surfaces are classified in
[`lane-classification.md`](.claude-framework/framework/rules/lane-classification.md)
(cited, never re-inlined). On `lane=tiny`, recommend `/direct-patch`.

## Output
`.claude-framework/artifacts/tasks/TASK-BRIEF-<slug>.md`.

---
description: Break an approved REQ into stories that each trace to one REQ and one MWR surface.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/req-to-stories/SKILL.md](.claude/skills/req-to-stories/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
May delegate drafting to
[`mwr-prompt-composer`](.claude/agents/mwr-prompt-composer.md) (read-only).

## Gates
Scope Gate (human) — one bounded MWR surface per story (auth/backend-load,
scenario-interpret/plan, dry-run, capability/permission, Apple Health
write, Health Connect write, run-report), traces to one REQ.

## Output
`.claude-framework/artifacts/stories/STORY-<slug>.md`.

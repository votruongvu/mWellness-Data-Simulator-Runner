---
description: Compose a grounded MWR requirement (REQ) from the Master REQ or a backend-contract slice.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/compose-req/SKILL.md](.claude/skills/compose-req/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
May delegate drafting to
[`mwr-prompt-composer`](.claude/agents/mwr-prompt-composer.md) (read-only).

## Gates
Intent Gate (human) + `PROMPT_OVERRIDE_GATE` for any MWR safety invariant
touched ([`prompt-overrides.md`](.claude-framework/adapter/prompt-overrides.md)).
A backend API gap that would force fabricating local test data STOPs for
human approval ([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)).

## Output
`.claude-framework/artifacts/requirements/REQ-<slug>.md`.

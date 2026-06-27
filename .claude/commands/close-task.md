---
description: Accept a reviewed change and run the Acceptance + Context Promotion gates.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/close-task/SKILL.md](.claude/skills/close-task/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
Hands approved promotions to `/refresh-context` (the only adapter writer).

## Gates
Acceptance Gate (human; record who accepts any P1 follow-up) +
`CONTEXT_PROMOTION_GATE` (only human-approved facts promote; name the
target adapter file; record the source artifact) —
[`gates.md`](.claude-framework/framework/rules/gates.md).

## Output
Closure report (report-format R-5) + queued/applied promotions in
[`pending-promotions.md`](.claude-framework/adapter/pending-promotions.md).

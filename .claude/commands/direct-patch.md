---
description: Tiny-lane shortcut — narrow, pre-declared, low-risk fix; 5-field compact output.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/direct-patch/SKILL.md](.claude/skills/direct-patch/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
No agents, no adapter context (L0). Main Claude applies the patch directly.

## Gates
Tiny preflight (denylist + size cap) + STOP-and-escalate
([`lane-classification.md`](.claude-framework/framework/rules/lane-classification.md)).
**Never** route a backend-client/auth, scenario-interpretation/contract,
execution-plan, dry-run, capability/permission, Apple Health or Health
Connect writer, any real-write path, no-fake-success reporting,
secret/token/endpoint, or native iOS/Android surface here.

## Output
5-field compact (Result / Files / Tests / Risk / Next) — report-format R-8.

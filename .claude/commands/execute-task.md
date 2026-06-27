---
description: Implement an approved task brief within its declared scope; STOP-and-escalate on a denylist hit.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/execute-task/SKILL.md](.claude/skills/execute-task/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
Delegates implementation to the only execution-capable agent,
[`mwr-implementation-agent`](.claude/agents/mwr-implementation-agent.md);
may use [`mwr-codebase-explorer`](.claude/agents/mwr-codebase-explorer.md)
for read-only mapping first.

## Gates
Execution Gate, mid-patch denylist STOP-and-escalate
([`lane-classification.md`](.claude-framework/framework/rules/lane-classification.md)),
plus the brief's mandatory gates ([`gates.md`](.claude-framework/framework/rules/gates.md)).
MWR safety invariants (dry-run-no-write, no-fake-success, capability +
permission, secret/endpoint safety) are never relaxed. A real Apple Health
or Health Connect write halts for the human-approval gate
([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)).

## Output
Code diff + run results (full-lane report per report-format.md).

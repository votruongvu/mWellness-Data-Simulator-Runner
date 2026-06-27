---
description: Reconcile curated context (adapter/) with real repo state and apply approved Context Promotions.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/refresh-context/SKILL.md](.claude/skills/refresh-context/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
May delegate read-only mapping to
[`mwr-codebase-explorer`](.claude/agents/mwr-codebase-explorer.md). The
**only** adapter writer.

## Gates
`CONTEXT_PROMOTION_GATE` (only human-approved facts promote; name the
target adapter file; record the source artifact) +
`ARTIFACT_TRUTH_GATE` ([`gates.md`](.claude-framework/framework/rules/gates.md)).
With `--scope=`, emit `No broad adapter rewrite was performed.`
(report-format R-6).

## Output
Updated `.claude-framework/adapter/*` + a refresh report.

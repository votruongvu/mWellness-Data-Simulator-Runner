---
description: Review a diff against its brief via the multi-lens fanout; one verdict with P0/P1/P2.
---

Command entrypoint — the canonical playbook lives in
[.claude/skills/review-task/SKILL.md](.claude/skills/review-task/SKILL.md).
Read it and follow it as authoritative. This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
Fans out the lenses matching the touched surface (read-only, parallel) per
the [review fanout registry](.claude-framework/framework/context/mwr-review-fanout-pattern.md):
`mwr-backend-api-reviewer`, `mwr-execution-plan-reviewer`,
`mwr-apple-health-write-reviewer`, `mwr-health-connect-write-reviewer`,
`mwr-rn-architecture-reviewer`, `mwr-test-reviewer`,
`mwr-doc-sync-reviewer`, and
**`mwr-test-data-and-health-write-safety-reviewer` (mandatory** on any
fixture/secret/endpoint/real-write/dry-run/permission surface). Main Claude
merges.

## Gates
Per-route review lenses; the stricter (safety) lens wins conflicts
([`gates.md`](.claude-framework/framework/rules/gates.md)).

## Output
`.claude-framework/artifacts/reviews/REVIEW-<slug>.md` (FOCUSED/FULL) or
inline 5-field (TINY). Verdict APPROVED / APPROVED_WITH_FOLLOWUPS / BLOCKED.

---
description: Naming-parity shim for adapter maintenance — points at /refresh-context.
---

**Command-only shim.** "Updating the source of truth" = running
`/refresh-context`, the only adapter writer. This alias exists for naming
parity; it delegates to that skill.

User input: $ARGUMENTS

## Agent crew
None directly — delegates to `/refresh-context`, which may use
[`mwr-codebase-explorer`](.claude/agents/mwr-codebase-explorer.md) for
read-only mapping.

## Delegates to
[.claude/skills/refresh-context/SKILL.md](.claude/skills/refresh-context/SKILL.md)
— reconcile `adapter/*` with real repo state and apply approved Context
Promotions (`CONTEXT_PROMOTION_GATE`).

## Note
Direct edits to `.claude-framework/adapter/*` outside `/refresh-context`
are not allowed (the protected-edit-guard hook blocks them on the Tiny
route). Promotion is human-approved only.

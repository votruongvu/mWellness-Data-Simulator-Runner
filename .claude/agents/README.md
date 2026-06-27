# `.claude/agents/` — mWellness-Mobile-Runner (MWR) specialist subagents

Curated specialist leaf workers. The **command layer**
([`.claude/commands/`](../commands/)) owns orchestration and delegates to
these agents; **skills** ([`.claude/skills/`](../skills/)) are playbooks
and do **not** invoke agents themselves.

Mental model:
[`mental-model.md`](../../.claude-framework/framework/context/mental-model.md).

```text
Command  = workflow entrypoint (slash command) + orchestration surface.
Skill    = playbook / methodology / template / checklist set.
Agent    = specialist worker with tight tools + role context.
Tool     = the actual action (Read, Edit, Bash, etc.).
```

## Operating principle (load-bearing)

> **Backend runnable scenario contract first -> mobile execution plan
> second -> platform writer third.**

Mobile interprets a backend-validated contract into an execution plan,
previews it via dry-run, and executes it through a platform writer. A write
is never authored on device; a value is never fabricated to fill a backend
gap. MWR does deterministic **replay** of an execution plan — never data
**generation**.

## Boundary (load-bearing)

- **Agents are leaf workers** — scoped tools, their own context window.
- **Agents do not spawn other agents** — no agent holds the `Agent` tool.
- **The command layer decides which agents run, and when.**
- **Skills are playbooks and do not execute agents.**
- Only `mwr-implementation-agent` may Edit/Write; every reviewer is READ-ONLY.

## Naming convention

Every file is `mwr-<role>.md`. The `mwr-` prefix scopes these
mWellness-Mobile-Runner specialists; it never carries forward the
superseded DM1 (`mwdm1-`) roster, which described an on-device synthetic
data generator MWR is not.

## Roster

**Workers**
- [`mwr-prompt-composer`](mwr-prompt-composer.md) — drafts task briefs (read-only).
- [`mwr-codebase-explorer`](mwr-codebase-explorer.md) — maps files + wiring before edits (read-only).
- [`mwr-implementation-agent`](mwr-implementation-agent.md) — applies patches (the only execution-capable agent).

**Reviewers** (lenses — see the [review fanout registry](../../.claude-framework/framework/context/mwr-review-fanout-pattern.md))
- [`mwr-rn-architecture-reviewer`](mwr-rn-architecture-reviewer.md)
- [`mwr-backend-api-reviewer`](mwr-backend-api-reviewer.md)
- [`mwr-execution-plan-reviewer`](mwr-execution-plan-reviewer.md)
- [`mwr-apple-health-write-reviewer`](mwr-apple-health-write-reviewer.md) — crown-jewel writer lens (iOS).
- [`mwr-health-connect-write-reviewer`](mwr-health-connect-write-reviewer.md) — crown-jewel writer lens (Android).
- [`mwr-test-data-and-health-write-safety-reviewer`](mwr-test-data-and-health-write-safety-reviewer.md) — mandatory on any fixture/secret/endpoint/real-write/dry-run/permission/capability surface.
- [`mwr-test-reviewer`](mwr-test-reviewer.md)
- [`mwr-doc-sync-reviewer`](mwr-doc-sync-reviewer.md)

## Review fanout

Fanout matches the touched surface to its lens: RN architecture, backend
API, scenario/execution plan, Apple Health write, Health Connect write,
test-data & health-write safety, tests, docs. The safety reviewer is
**mandatory** whenever a fixture, secret, endpoint, real-write path,
dry-run flag, permission, or capability check is touched. See
[`mwr-review-fanout-pattern.md`](../../.claude-framework/framework/context/mwr-review-fanout-pattern.md).

## Severity (every reviewer)

P0 block-now · P1 must-fix-before-merge · P2 follow-up. Verdict:
`approve` / `approve-with-followups` / `request-changes`. Cite `file:line`;
do not paste large blocks. No `Agent` tool — agents never recurse.

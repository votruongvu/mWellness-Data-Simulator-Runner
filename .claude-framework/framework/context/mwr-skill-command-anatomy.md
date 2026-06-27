# Command + Skill Anatomy — mWellness-Mobile-Runner (MWR)

The shape every command and skill follows. Keep both small; the playbook
detail lives in the skill, not the command.

## Command (`.claude/commands/<name>.md`)

A thin slash-command shim. Owns **orchestration**, not methodology.

```md
---
description: <one line — what the operator gets>
---

Command entrypoint — the canonical playbook lives in
.claude/skills/<name>/SKILL.md. Read it and follow it as authoritative.
This command owns orchestration.

User input: $ARGUMENTS

## Agent crew
<which mwr-* reviewer/worker agents may run, by surface — resolve via
 mwr-review-fanout-pattern.md>

## Gates
<which gates apply — cite gates.md / prompt-overrides.md; do NOT re-inline gate text>

## Output
<where the artifact lands in artifacts/>
```

The **`## Agent crew`** heading belongs to the command layer **only** — it
must **never** appear in a skill (skills are not agent routers; the
structural validator enforces this).

## Skill (`.claude/skills/<name>/SKILL.md`)

The playbook. Carries the **how**: required reads, steps, gates, output
contract, closeout shape.

```md
# Skill — <skill-name>

## Name
## Purpose
## Mode                       (CONTEXT-MAINTENANCE | COMPOSE | EXECUTION-CAPABLE | REVIEW-ONLY)
## Inputs
## Context to load            (cite adapter slices + the right context pack — smallest set)
## Gates to run               (cite gates.md + prompt-overrides.md + lane-classification.md)
## Step-by-step workflow
## Output format / artifact   (which template; where it lands in artifacts/)
## Closeout / artifact requirements   (cite report-format.md; APPROVED/…/BLOCKED, P0/P1/P2)
## Escalation triggers        (when to STOP and escalate lane / emit a Human Approval Request)
```

## Authoring rules

- **Single-source:** never re-inline the lane denylist or gate text — cite
  [`lane-classification.md`](../rules/lane-classification.md) /
  [`gates.md`](../rules/gates.md).
- **Minimal reads:** list the *smallest* set of files; default to the
  matching context pack, not the whole adapter.
- **Skills are not routers:** agent orchestration is named in the command's
  `## Agent crew`, applied by main Claude — never invoked from inside a
  skill. `## Agent crew` in a skill is a validator failure.
- **Safety discipline:** any command or skill that can touch the backend
  client/auth, scenario interpretation, the execution plan, dry-run, a
  platform writer, a real-write path, capability/permission, or
  secrets/endpoints must name the **high-risk escalation** and the relevant
  hard human-approval gate (it STOPs, never self-waives).
- **Terminology guard:** Android health store is **Health Connect** —
  never "Google HealthKit", never Google Fit. MWR does deterministic
  **replay**, not generation.

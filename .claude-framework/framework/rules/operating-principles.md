# Operating Principles — mWellness-Mobile-Runner (MWR)

Load-bearing rules for every Claude workflow in this repo. If a skill or
task brief contradicts a principle here, the principle wins.

## 1. Module boundary
`.claude-framework/` and `.claude/` are **not** MWR app runtime code. They
must never be imported by the RN app, shipped in a build, or affect the
bundle. They exist only for Claude workflows, prompts, decisions, audits,
briefs, and handoffs.

## 2. Markdown-first
All workflow content is markdown: a command is an `.md`, a skill a
`SKILL.md`, an agent `mwr-<role>.md`, a rule an `.md`, a template an `.md`.
Validators are shell/python scripts.

## 3. The operating principle (verbatim — load-bearing, never reorder)
> **Backend runnable scenario contract first -> mobile execution plan
> second -> platform writer third.**

The MWDS backend authors and validates the scenario contract. The mobile
app *interprets* that contract into an execution plan, *previews* it via
dry-run, and *executes* it through a platform writer (Apple Health on iOS /
Health Connect on Android). A write is never authored on device; a value is
never fabricated to fill a backend gap. MWR does deterministic **replay** of
an execution plan — never data **generation**.

## 4. Mode discipline
Every workflow declares a mode and stays in it:
- **CONTEXT-MAINTENANCE** — `refresh-context`. Edits only `adapter/`.
- **COMPOSE/ARTIFACT-AUTHORING** — `compose-req`, `req-to-stories`, `story-to-tasks`, `compose-task`. Writes only under `artifacts/`. No source edits.
- **EXECUTION-CAPABLE** — `execute-task` (+ `direct-patch` for Tiny). Edits RN source only within an approved brief's scope.
- **REVIEW ONLY** — `review-task`. Reads the diff; writes under `artifacts/reviews/`. No source edits unless explicitly asked.

## 5. Explicit unknowns over guesses
Verify every file/module reference against the real repo. When a path or
fact cannot be confirmed, mark `TO_VERIFY` (or `UNKNOWN — needs human
confirmation`) and surface it. **The RN app is not yet scaffolded** — treat
its paths as `TO_VERIFY`, never as fact. Platform capability facts (Apple
Health quantity/category/workout types + units; Health Connect record types
+ units; backend API routes/schemas) are confirmed against **current
official docs / the backend contract** before use, never assumed. Per-metric
writability is `TO_VERIFY` until confirmed per phase.

## 6. No silent decisions
An unresolved contract/writer/architecture decision is surfaced as an
`OPEN ASSUMPTION`; it becomes an explicit ADR (`ADR-MWR-NNN`) in
[`current-decisions.md`](../../adapter/current-decisions.md), not an implicit
code choice. Open ADRs (token-storage strategy, backend routes, native
module prefix, RN baseline) are never baked into implementation. Code never
silently supersedes a decision/governance document — see the source
hierarchy in root [`CLAUDE.md`](../../../CLAUDE.md).

## 7. Current state over stale snapshots
Real repo state is the source of truth for descriptive facts; adapter files
may drift. But code **never silently supersedes** a
`DRY_RUN_NO_WRITE_GATE` / `NO_FAKE_SUCCESS_GATE` /
`SECRET_AND_ENDPOINT_SAFETY_GATE` / `TEST_DATA_SAFETY_GATE` /
scenario-contract / platform-writer rule — that divergence is a defect or an
explicit decision-change candidate.

## 8. Human-led gates
The Human Decision Owner owns Intent / Scope / Definition / Execution /
Acceptance / Context Promotion, plus the hard human approval gates
([`human-approval-gates.md`](../../adapter/human-approval-gates.md)). Claude
enriches, structures, challenges, drafts, and queries context — but never
silently decides a human gate, and a gate is never self-waived by the loop
or the task budget.

## 9. Minimal-by-default
Load only what the task needs (budgets in
[`context-pack-registry.md`](../context/context-pack-registry.md)). Cite
single-source files (lane denylist, report format, gates); never inline
their text.

## 10. Safety-first (MWR invariants)
Any task touching the backend client/auth/session, scenario interpretation,
the execution plan, dry-run, a platform writer (Apple Health / Health
Connect), a real-write path, capability/permission, or secrets/endpoints is
**high-risk / full-lane**. The standing invariants:
**no real write without dry-run + capability check + permission check +
explicit confirmation; dry-run never writes; success is never faked (it
reflects the actual platform write/insert result); no unsupported metric is
silently dropped (skip with a `reason_code`, surface it); no raw token/log
leakage; mobile never authors/validates/mutates/reorders scenarios and never
computes an authoritative wellness score; the Android target is Health
Connect, never "Google HealthKit" and never Google Fit; no Google Fit / no
vendor SDK unless human-approved.** Gate detail and composition live in
[`gates.md`](gates.md).

## 11. Product-code boundary
Framework files never implement product features. Native HealthKit / Health
Connect write code, a backend client, secret material, or any RN app code
happen only under an explicit implementation brief via `/execute-task` —
never as a side effect of framework setup.

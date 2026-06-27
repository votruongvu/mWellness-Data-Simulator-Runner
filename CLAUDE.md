# mWellness-Mobile-Runner — Claude operating contract

mWellness-Mobile-Runner (**MWR** — the mWellness Mobile Runner) is a
**React Native + TypeScript MOBILE RUNTIME** (iOS + Android). After login it
loads **validated runnable test cases/scenarios directly from the
`mWellness-Data-Simulator` (MWDS) Go backend**, interprets them into an
execution plan, dry-runs the plan, requests health permissions, writes via
**Apple Health** (iOS) / **Health Connect** (Android), and reports run
results. MWR is **not** an authoring system — it executes a
backend-validated scenario contract; it never generates or seeds data.

This file is the root entry for Claude work in this repository. The one-page
anchor every workflow reads first is
[`.claude-framework/adapter/project-source-of-truth.md`](.claude-framework/adapter/project-source-of-truth.md).

> **Status:** framework bootstrap (MR-FRAMEWORK-00). The RN app is **not yet
> scaffolded** — app paths are `TO_VERIFY` until then. This module is docs +
> validators only. Files marked `TO_VERIFY` are intentional placeholders,
> not confirmed facts. MWR **reuses the mechanics** of a prior, now-superseded
> Claude framework but carries **none** of its product truth — the superseded
> framework is named, with its terminology corrections, only in
> [`.claude-framework/adapter/known-legacy.md`](.claude-framework/adapter/known-legacy.md).

## Operating principle (verbatim — load-bearing, never reorder)

> **Backend runnable scenario contract first -> mobile execution plan
> second -> platform writer third.**

The backend authors and validates the scenario contract. The mobile app
*interprets* that contract into an execution plan, *previews* it via
dry-run, and *executes* it through a platform writer. A write is never
authored on device; a value is never fabricated to fill a backend gap.

## Source of truth

The **source of truth** is the **MWDS Web App + Go backend** (upstream
authority) together with the **Mobile Runner Master REQ**
([`docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`](docs/requirements/MOBILE_RUNNER_MASTER_REQ.html),
canonical product requirements). The MWDS backend owns the catalog, scenario
authoring, scenario validation, the scenario seed library/applicability, and
versioning/scenario-ordering. Mobile loads the backend-validated runnable
contract and executes it.

## Authority boundaries (load-bearing — never violate)

**Mobile OWNS:** mobile auth/session; the backend API client; runnable test
case/scenario loading; scenario interpretation; execution plan generation;
dry-run; platform capability checks; the permission flow; the Apple Health /
Health Connect writer adapters; run progress/result reporting; mobile
diagnostics.

**Mobile does NOT own:** the catalog source of truth; scenario validation
authority; test case authoring; the scenario seed library/applicability;
versioning/scenario-ordering authority; RBAC/tenant/billing/admin; Google
Fit or vendor SDKs unless human-approved. Mobile **never authors, validates,
mutates, or reorders scenarios**, and never computes/asserts an authoritative
wellness score.

## Source hierarchy / the Context Layer

The **Context Layer** is `.claude-framework/adapter/` — a curated,
markdown-first logical knowledge base that is **current truth**. When sources
disagree, resolve in this order:

```text
1. Real repo state — descriptive current-state facts (code wins over docs for DESCRIPTIVE facts only).
2. Mobile Runner Master REQ — canonical product requirements (docs/requirements/MOBILE_RUNNER_MASTER_REQ.html).
3. .claude-framework/adapter/* — current decisions / risks / wiring (the Context Layer; current truth).
4. .claude-framework/artifacts/* — evidence / history, NOT current truth.
```

**Governance exception:** "code wins over docs" applies only to
current-state *descriptive* facts (a doc that fell behind the code). Code
**never silently supersedes** a decision/governance document — an ADR, the
Master REQ, or a `DRY_RUN_NO_WRITE` / `NO_FAKE_SUCCESS` /
`SECRET_AND_ENDPOINT_SAFETY` / `TEST_DATA_SAFETY` rule. Such a divergence is
a defect or an explicit decision-change candidate: reconcile by fixing the
code or by an explicit ADR/update before it becomes canonical. A path or fact
that cannot be verified against the real repo is marked `TO_VERIFY` or
`UNKNOWN — needs human confirmation`.

## Artifact truth rule

**Artifact truth rule:** artifacts under `.claude-framework/artifacts/` are
working records / evidence; the curated Context Layer (`adapter/`) is current
truth; a working artifact becomes durable truth only after promotion into
curated context.

## Context Promotion (via the human gate)

**Context Promotion** moves a human-approved fact from an artifact into the
named adapter file:

```text
close-task  ->  human-approved fact(s)  ->  named adapter file   (applied via refresh-context)
```

Only **human-approved** facts promote; the target adapter file is named and
the source artifact is recorded (`CONTEXT_PROMOTION_GATE`). Claude proposes;
the **Human Decision Owner** approves. The promotion backlog lives in
[`.claude-framework/adapter/pending-promotions.md`](.claude-framework/adapter/pending-promotions.md).

## Mandatory safety guardrails (always in force)

- **No accidental health data writes.**
- **No real write without dry-run + capability check + permission check +
  explicit confirmation.**
- **No fake native write success** — success must reflect the actual platform
  write/insert result.
- **No silent HealthKit / Health Connect permission prompt** — explain before
  the OS prompt.
- **No unsupported metric silently ignored** — skip with a `reason_code` and
  surface it.
- **No raw token / log leakage** — redaction on every log path; diagnostics
  dev-gated only.
- **No backend authority bypass** — runnable data comes from the
  authenticated API; a missing backend API is documented and STOPs for human
  approval, never fabricated.
- **No mock test cases/scenarios marked as complete product behavior.**
- **No Google Fit. No direct vendor SDK unless human-approved.**

Composition: the stricter of `DRY_RUN_NO_WRITE_GATE` /
`NO_FAKE_SUCCESS_GATE` / `SECRET_AND_ENDPOINT_SAFETY_GATE` /
`TEST_DATA_SAFETY_GATE` wins on conflict.

## Human approval gate

The hard **human approval gate** set is the canonical list in
[`.claude-framework/adapter/human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)
(10 gates — real Apple Health write · real Health Connect write ·
permission-prompt timing/copy · bypassing dry-run/confirmation/capability/
permission · token/session storage strategy · new platform/vendor/Google Fit
· backend API gap forcing fabrication · production/release-readiness claim ·
new/changed ADR or contract break or unvalidated native substrate · UX flow
not in an approved contract). When any gate applies, Claude **STOPs**, does
not execute the task, and emits a Human Approval Request for the **Human
Decision Owner**. A gate is never self-waived by the loop or the task budget.

## High-risk triggers (Tiny lane MUST escalate)

A change touching any of these is **not** Tiny — escalate to Light/Full
(canonical denylist in
[`.claude-framework/framework/rules/lane-classification.md`](.claude-framework/framework/rules/lane-classification.md)):

1. The **backend client / auth / session**.
2. **Scenario interpretation / the scenario contract**.
3. The **execution plan / operation classification**.
4. **Dry-run semantics** (anything that could let dry-run write).
5. The **capability / permission flow**.
6. An **Apple Health or Health Connect writer**, or any **real-write path**.
7. **No-fake-success reporting**.
8. **Secrets / tokens / endpoints**, idempotency, redaction, run-mode
   (dry-run vs real) toggles.
9. **Native iOS/Android code**, entitlements, `Info.plist`,
   `AndroidManifest`.

## Using commands / skills / agents

Daily Claude work runs through a self-contained operating module in two
directories:

```text
.claude/                live workflow surface (commands, skills, agents, hooks, state, HANDOFF)
.claude-framework/      rules, checklists, templates, context, the Context Layer (adapter/), execution loop, artifacts, scripts
```

Four-layer model:

```text
Command  = workflow entrypoint (slash command). Owns orchestration — which agents run, when.
Skill    = playbook / methodology / checklist set. Skills are NOT agent routers.
Agent    = specialist worker with tight tools + role context (.claude/agents/*.md). Leaf workers; no recursion.
Tool     = the actual action (Read, Edit, Bash, …).
```

- **Commands** (`.claude/commands/*.md`) own orchestration; the lifecycle is
  `refresh-context -> compose-req -> req-to-stories -> story-to-tasks ->
  compose-task -> execute-task -> review-task -> close-task` (with
  `direct-patch` for the Tiny lane and `run-phase-loop` for autonomous phase
  execution).
- **Skills** (`.claude/skills/<name>/SKILL.md`) are the playbooks the
  commands invoke. Review fanout delegates to the specialist reviewer
  agent(s) that match the touched surface (backend API, scenario contract,
  execution plan, Apple Health write, Health Connect write, test-data &
  health-write safety, RN architecture, tests, docs).
- **Agents** (`.claude/agents/*.md`) are leaf workers (`mwr-*`).
- Token-aware routing (which minimal files to read per task type) is in
  `.claude-framework/framework/context/context-pack-registry.md` and
  `skill-registry.md` — consult on demand; do not default-load.
- The **execution loop** lives in `.claude-framework/execution/` and consults
  the hard human approval gate set before continuing.

## Product code boundary

**Framework files never implement product features.** This operating module
is docs + scripts only. Do **not** add native HealthKit / Health Connect
write code, a backend client, secret material, or any RN app code as part of
framework work. Product implementation happens only under an explicit
implementation task brief (`/execute-task`), never as a side effect of
framework setup.

## Terminology guard (load-bearing)

The Android health-store target is **Health Connect** (Android Health
Connect / Jetpack Health Connect). It is **never** called "Google HealthKit"
(a wrong term) and **never** Google Fit (R-MWR-010,
[`.claude-framework/adapter/known-legacy.md`](.claude-framework/adapter/known-legacy.md)).
"HealthKit" refers **only** to Apple's iOS framework. MWR does deterministic
**replay** of an execution plan — never data **generation**.

## Pointers

- **Context Layer (current truth):**
  [`.claude-framework/adapter/`](.claude-framework/adapter/) —
  project-source-of-truth, current-decisions, known-risks,
  human-approval-gates, repository-map, settings-map, test-map, wiring-paths,
  regression-fixtures, pending-promotions, prompt-overrides, known-legacy,
  milestone-log.
- **Gates catalog:**
  [`.claude-framework/framework/rules/gates.md`](.claude-framework/framework/rules/gates.md).
- **Prompt overrides (project gates):**
  [`.claude-framework/adapter/prompt-overrides.md`](.claude-framework/adapter/prompt-overrides.md).
- **Human handoff / session state:**
  [`.claude/HANDOFF.md`](.claude/HANDOFF.md).

## Validation

```bash
bash .claude-framework/scripts/validate-framework.sh
```

The structural validator (existence + non-empty + leakage + terminology
check) lives in `.claude-framework/scripts/`.

# mWellness-Mobile-Runner (MWR) Framework Guide — handbook index

How the MWR Claude operating module fits together. Read after root
[`CLAUDE.md`](../../../CLAUDE.md) +
[`project-source-of-truth.md`](../../adapter/project-source-of-truth.md).

## What MWR is

**MWR — the mWellness Mobile Runner** is a **React Native + TypeScript
mobile runtime** (iOS + Android). After login it **loads validated runnable
test cases/scenarios directly from the `mWellness-Data-Simulator` (MWDS) Go
backend**, interprets them into an **execution plan**, **dry-runs** the
plan, requests health permissions, **writes via Apple Health (iOS) /
Health Connect (Android)**, and reports run results. MWR is **not** an
authoring system: it executes a backend-validated scenario contract; it
**never** authors, validates, mutates, or reorders scenarios, never
fabricates data, and never computes an authoritative wellness score. MWR
does deterministic **replay** of an execution plan — never **generation**.

Upstream source of truth = the **MWDS Web App + Go backend**.

**Operating principle (verbatim):** Backend runnable scenario contract
first → mobile execution plan second → platform writer third.

## The pipeline (and where governance attaches)

```text
[login → fetch runnable test cases → select case+version]
     → load ordered scenarios + metric metadata    (BACKEND_API_GATE, SCENARIO_CONTRACT_GATE)
     → interpret into runner models + build plan    (EXECUTION_PLAN_GATE, EXECUTION_DETERMINISM_GATE)
        each op: writable | unsupported | permission_missing | invalid | skipped (+ reason_code)
     → check capability, then permission            (CAPABILITY_PERMISSION_GATE)
        capability before permission; permission explained BEFORE the OS prompt; denied/partial fails closed
     → dry-run (default)                            (DRY_RUN_NO_WRITE_GATE)  ← CROWN JEWEL: zero real writes
     → explicit human confirmation                  (real-write enablement is config-driven + human-confirmed)
     → execute via platform writer                  (APPLE_HEALTH_WRITE_GATE | HEALTH_CONNECT_WRITE_GATE | PLATFORM_WRITER_GATE)
        + SECRET_AND_ENDPOINT_SAFETY_GATE on any secret/endpoint; + TEST_DATA_SAFETY_GATE on any fixture/scenario
     → report run result                            (RUN_REPORTING_GATE, NO_FAKE_SUCCESS_GATE)  ← CROWN JEWEL
        summary{total,succeeded,failed,skipped} + reason_codes; success only if the native write/insert actually succeeded
```

A backend API gap that would force fabricating local data is **documented
and STOPs for human approval** — never filled with fake data.

## How the layers connect

- **Root `CLAUDE.md`** — operating contract + authority boundaries + lane
  model + high-risk triggers + terminology guard.
- **Adapter (`adapter/`)** — the **Context Layer**, current truth:
  decisions (ADR-MWR-*), risks (R-MWR-*), wiring (W-MWR-*), human-approval
  gates, test-map, settings-map, regression-fixtures, prompt-overrides,
  pending-promotions, known-legacy, milestone-log.
- **Rules (`framework/rules/`)** — operating principles, lane
  classification, the [gates catalog](../rules/gates.md), report format,
  and the MWR domain rules (backend-api, execution-plan, platform-writer,
  test-data-safety, secret-endpoint-safety, rn-testing/perf/ui,
  internal-release).
- **Context (`framework/context/`)** — this guide, the
  [mental model](mental-model.md), the
  [context-pack registry](context-pack-registry.md), the
  [skill registry](skill-registry.md), the
  [anatomy](mwr-skill-command-anatomy.md), and the
  [review fanout pattern](mwr-review-fanout-pattern.md).
- **Execution loop (`.claude-framework/execution/`)** — the autonomous
  phase loop (`MWR_EXECUTION_CONTROLLER`, `_STATE`, `_RUNBOOK`,
  `_HUMAN_APPROVAL_GATES`, `_LOOP_CLOSEOUT_TEMPLATE`, `_STOP_CONDITIONS`,
  `_PHASE_QUEUE`), driven by the `run-phase-loop` command.
- **Templates + checklists** — artifact shapes + per-surface checklists.
- **Workflow surface (`.claude/`)** — commands (entrypoints), skills
  (playbooks), agents (`mwr-*` leaf workers), hooks (guardrails).

## Lifecycle

`refresh-context → compose-req → req-to-stories → story-to-tasks →
compose-task → execute-task → review-task → close-task`; `/direct-patch`
for the Tiny lane; `/run-phase-loop` for autonomous phase execution.
Reviews fan out by touched surface; closeouts are APPROVED /
APPROVED_WITH_FOLLOWUPS / BLOCKED with P0/P1/P2.

## Roadmap (phases)

`MR-FRAMEWORK-00` (this bootstrap) → `MR0` Contract Alignment → `MR1`
Foundation/Auth/API → `MR2` Test-Case Browser + Scenario Loader → `MR3`
Scenario Interpreter + Execution Plan → `MR4` Apple Health Writer POC →
`MR5` Health Connect Writer POC → `MR6` Run Orchestration + Result
Reporting → `MR7` Safety QA / Release Candidate. Order constraints (Master
REQ §17): **MR0 locks contracts before implementation; MR3's dry-run plan
exists before the MR4/MR5 real writers.**

## Framework provenance (mechanics only — no product truth)

MWR reuses the **mechanics** of a prior, now-superseded Claude framework
(lanes, gate structure, lifecycle, context-pack routing, review fanout,
closeout, context promotion, validators) but carries **none** of its
product truth. The superseded framework — a synthetic-data
generator/seeder — is the opposite product; its terminology corrections are
named only in [`known-legacy.md`](../../adapter/known-legacy.md)
(terminology correction: Health Connect ≠ "Google HealthKit"/Google Fit).

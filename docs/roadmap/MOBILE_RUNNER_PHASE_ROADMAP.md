# mWellness Mobile Runner — Phase Roadmap

> The canonical phase plan for `mWellness-Mobile-Runner` (MWR), from
> [Master REQ §14](../requirements/MOBILE_RUNNER_MASTER_REQ.md#14-recommended-mobile-runner-roadmap)
> with the ordering constraints from §17.
>
> **Do not generate phase user stories yet.** This roadmap names the phases and
> locks the ordering constraints only. Stories are produced later via
> `req-to-stories` / `story-to-tasks` under an approved REQ, and the phase loop
> stops for human classification before each phase.

## Operating principle

> **Backend runnable scenario contract first -> mobile execution plan second ->
> platform writer third.** The roadmap encodes this order: contracts lock first
> (MR0), the dry-run plan exists (MR3) before any real writer (MR4/MR5), and real
> writes are hard-gated.

## Phases

| Phase | Name | Purpose |
|---|---|---|
| MR-FRAMEWORK-00 | Claude Framework Bootstrap | Dedicated mobile framework, guardrails, context, commands. **(Current phase — docs + validators only.)** |
| MR0 | Mobile Runner Contract Alignment | Lock backend/mobile/native contracts and safety gates **before** implementation. |
| MR1 | Mobile Foundation / Auth / API Client | App shell, auth/session, backend client, config. |
| MR2 | Test Case Browser + Scenario Loader | Fetch runnable test cases, versions, ordered scenarios. |
| MR3 | Scenario Interpreter + Execution Plan | Parse scenarios and build the **dry-run** plan. |
| MR4 | Apple Health Writer POC | HealthKit permission/capability/write POC (hard-gated). |
| MR5 | Health Connect Writer POC | Health Connect permission/capability/write POC (hard-gated). |
| MR6 | Run Orchestration + Result Reporting | Run ordered scenarios, progress, result/reporting. |
| MR7 | Safety QA / Release Candidate | Hardening, QA matrix, diagnostics, RC docs. |

## Ordering constraints (load-bearing — from REQ §17)

1. **MR0 locks contracts before implementation.** Backend/mobile/native contracts
   and safety gates are settled before any product code (MR1+).
2. **MR3 dry-run plan exists before MR4/MR5 real writers.** The execution plan and
   dry-run must exist and be exercised before any real Apple Health or Health
   Connect writer POC begins.
3. **MR4 and MR5 are peer POCs**, both following MR3; neither precedes the dry-run
   plan. (MWR does not impose an iOS-first-then-Android ordering on the writers.)
4. **MR4/MR5 real writes are hard-gated.** Any real Apple Health or Health Connect
   write behavior triggers a human-approval gate (gates #1/#2) and STOPs the loop
   for the Human Decision Owner. No writer phase is "done" if it fakes success.
5. **No real-write flow is done** without dry-run + capability check + permission
   check + explicit confirmation.
6. **No MR7 release candidate is production-ready** without a separate
   security/privacy review (human-approval gate #8).

## Phase-loop discipline (REQ §15)

The `run-phase-loop` command executes a phase **story-by-story**: commit per
story, validate per story, prepare a close-task-style phase review, and **stop for
human classification before continuing** to the next phase. Hard human-approval
gates halt the loop regardless of task budget.

## Cross-references

- Master REQ: [`../requirements/MOBILE_RUNNER_MASTER_REQ.md`](../requirements/MOBILE_RUNNER_MASTER_REQ.md)
- Execution model (the MR3 deliverable shape): [`../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`](../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md)
- Backend contract (the MR0 alignment surface): [`../contracts/MOBILE_BACKEND_API_CONTRACT.md`](../contracts/MOBILE_BACKEND_API_CONTRACT.md)
- Health-write safety (governs MR4/MR5): [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)
- Phase queue (execution layer): `.claude-framework/execution/MWR_PHASE_QUEUE.md`

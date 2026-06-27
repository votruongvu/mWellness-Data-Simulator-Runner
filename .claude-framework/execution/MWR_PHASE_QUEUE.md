# MWR_PHASE_QUEUE

> Phase-ordered execution queue for the MWR loop. Derived from the canonical
> Master REQ (`docs/requirements/MOBILE_RUNNER_MASTER_REQ.*`) §14/§17 and the
> phase roadmap (`docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md`) — **no new
> roadmap is invented**. Each phase declares its eligibility (AUTO-RUN vs HARD
> GATE) and binding scope rules. The loop runs ONE phase block (or ≤5 stories
> within the current phase) per invocation (see the controller task budget) and
> STOPs at any hard gate / stop condition.
>
> **This queue does NOT contain per-phase user stories.** Stories are produced
> later (via `req-to-stories` → `story-to-tasks`) once a phase is approved to
> start. The queue defines phase order, scope, and gating only.
>
> Operating principle: `Backend runnable scenario contract first -> mobile
> execution plan second -> platform writer third.`

Legend: **AUTO-RUN** = the loop may execute safe, in-scope work without a hard
human-approval gate (scope + gates.md still enforced). **HARD GATE** = STOP for
explicit human approval before starting (see `MWR_HUMAN_APPROVAL_GATES.md`).

> **STATUS (2026-06-27 — BOOTSTRAP):** `MR-FRAMEWORK-00` is the current phase
> (framework/docs authoring). No product code, no React Native app, no native
> substrate, and no product stories exist yet. The first product phase `MR0` is
> **hard-gated** (it locks contracts and creates ADRs). Live status =
> `MWR_EXECUTION_STATE.md`.

## CRITICAL ordering constraints (REQ §17 — binding)

```text
- MR0 LOCKS CONTRACTS before any implementation phase begins.
- MR3 (scenario interpreter + execution plan, dry-run) EXISTS before MR4/MR5
  real writers. No real-write phase starts until a dry-run plan is in place.
- MR4 (real Apple Health write) and MR5 (real Health Connect write) are HARD
  GATES and must never auto-run.
- The loop advances strictly in phase order.
```

---

## MR-FRAMEWORK-00 — Claude Framework Bootstrap — **AUTO-RUN**

**Scope:** author the Claude Framework for MWR (CLAUDE.md, adapter current-truth
files, execution layer, rules, checklists, templates, context, commands, skills,
agents, hooks, scripts) and the canonical docs (architecture, contracts, safety,
roadmap, platform). Convert/mirror the canonical Master REQ. Framework/docs
bootstrap ONLY.

**Scope rules:** markdown/framework/docs only · **no product code** · **no React
Native app scaffolded** · no native substrate generated · no product stories
created · no old DM1 product truth promoted as current truth (FORBIDDEN tokens
allowed only inside `known-legacy.md` as a historical correction) · mark
anything unverified `TO_VERIFY` · the only canonical requirement source is the
Mobile Runner Master REQ.

**Completion:** the framework manifest is fully authored,
`validate-framework.sh` PASS, and `validate_context_pack_paths.py` PASS. Then
set `CURRENT_PHASE_STATUS = DONE` and STOP at the MR0 hard gate.

---

## MR0 — Mobile Runner Contract Alignment — **HARD GATE (do not auto-run)**

**Scope:** lock the load-bearing contracts before any implementation —
the backend API surface (auth, `GET /mobile/test-cases`, version detail, ordered
scenarios, scenario content, catalog metric metadata, run reporting), the
runnable scenario contract, the execution-plan model
(`operations[].status: writable | unsupported | permission_missing | invalid |
skipped` + `blocked_operations[].reason_code`), the run-result contract, and the
foundational ADRs (e.g. RN baseline, native module prefix, token-storage
direction, real-write gating).

**Gate reason:** MR0 creates/changes ADRs (`HUMAN_APPROVAL_GATE` 9) and may
surface backend API contract gaps (`HUMAN_APPROVAL_GATE` 7). **If a required
backend API is missing, document the gap and STOP for human approval — never
fabricate local test cases/scenarios** (`TEST_DATA_SAFETY_GATE`).

**STOP unless ALL true:** human approval to start MR0 is explicit · ADR
changes are approved · backend contract gaps (if any) are resolved or
risk-accepted · no test data is fabricated to paper over a missing API.

---

## MR1 — Mobile Foundation / Auth / API Client — **HARD GATE on token-storage + ADRs**

**Scope:** scaffold the React Native + TypeScript app (RN baseline decided here,
`TO_VERIFY`); mobile auth/session; the MWDS backend API client (base URL +
endpoints from config; auth via a secure-storage *reference*; ownership checks
not bypassed; error classification; redaction on every log path).

**Gate reasons:** the token/session storage strategy is a hard gate
(`HUMAN_APPROVAL_GATE` 5); scaffolding implies foundational ADRs and possibly
native-substrate work, which is a hard gate while unvalidated
(`HUMAN_APPROVAL_GATE` 9). Backend client/auth is FULL lane and triggers
`BACKEND_API_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE`.

**Scope rules:** no raw secret/token committed (reference name only) · no
production endpoint default · redaction mandatory · runnable data comes from the
authenticated API only · no real health write of any kind.

**STOP unless:** token-storage strategy is human-approved · any new/changed ADR
is approved · native-substrate generation (if needed) is approved.

---

## MR2 — Test Case Browser + Scenario Loader — **AUTO-RUN (read-only loading)**

**Scope:** browse runnable test cases; select a case + version; load the ordered
scenarios + catalog metric metadata; interpret validated scenario payloads into
runner models. Read-only loading — **no write of any kind**.

**Gates:** `SCENARIO_CONTRACT_GATE` (interpret only; never author/validate/
mutate/reorder scenarios; an invalid payload BLOCKS the run with a reason) +
`BACKEND_API_GATE`.

**Scope rules:** mobile does not own catalog/scenario validation authority or
ordering · an unsupported/invalid payload is surfaced, never silently accepted ·
list virtualization for large catalogs (`RN_PERFORMANCE_GATE`) · no real or
simulated health write · no execution-plan real-write logic.

**STOP if:** the loader needs the backend to expose data it does not (contract
gap → gate 7) · interpretation would require guessing scenario semantics.

---

## MR3 — Scenario Interpreter + Execution Plan — **AUTO-RUN (dry-run plan only; ZERO real writes)**

**Scope:** build the execution plan from interpreted scenarios + metric
metadata; classify each operation `writable | unsupported | permission_missing |
invalid | skipped`; attach a `reason_code` to every blocked operation and make
blocked operations visible BEFORE any run; implement the dry-run that performs
ZERO real writes and labels its output as dry-run; deterministic replay of a
stored plan (resolve relative time via an injected clock; no ambient
`Date.now()` / `Math.random()` in the run path).

**Gates:** `EXECUTION_PLAN_GATE` + `DRY_RUN_NO_WRITE_GATE` (crown jewel) +
`EXECUTION_DETERMINISM_GATE` + `CAPABILITY_PERMISSION_GATE` (capability check
feeds plan classification) + `TEST_DATA_SAFETY_GATE`.

**Scope rules:** dry-run is the DEFAULT and the only mode this phase enables · no
code path bypasses the dry-run flag · no real Apple Health / Health Connect call
· `counts.written` is always 0 in dry-run · no fabricated scenario/test data ·
deterministic in-process and cross-process.

**This phase is the prerequisite for MR4/MR5.** A real write here = P0.

**STOP if:** building the plan would require a real write, a real OS permission
prompt, or guessing a metric's writability (mark `TO_VERIFY`, classify
`unsupported`/`permission_missing` with a `reason_code`, do not assume writable).

---

## MR4 — Apple Health Writer POC — **HARD GATE (real Apple Health write)**

**Scope:** the first REAL Apple Health (HealthKit) write path — map approved
execution-plan operations to the correct `HKQuantityType`/`HKCategoryType`/
workout type + `HKUnit`; respect share authorization; permitted types only;
idempotent (no duplicate samples on re-run); iOS-only.

**Gate reasons:** any real Apple Health write behavior (`HUMAN_APPROVAL_GATE` 1)
+ permission-prompt timing/copy (gate 3) + native-substrate/ADR work (gate 9).
FULL lane: `APPLE_HEALTH_WRITE_GATE` + `DRY_RUN_NO_WRITE_GATE` +
`NO_FAKE_SUCCESS_GATE` (crown jewel) + `CAPABILITY_PERMISSION_GATE` +
`PLATFORM_WRITER_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE` +
`TEST_DATA_SAFETY_GATE`.

**Hard prerequisites:** MR3 dry-run plan exists · capability check before
permission · permission explained BEFORE the native OS prompt · denied/partial
permission fails closed and is surfaced · explicit human-confirmed real-write
enablement · synthetic data only · **a write is reported successful ONLY if the
native write actually succeeded** · Apple Health, never confused with Health
Connect.

**STOP unless** human approval explicitly allows the Apple Health real-write
POC; real-write gates/flags remain off by default; the native substrate is
validated.

---

## MR5 — Health Connect Writer POC — **HARD GATE (real Health Connect write)**

**Scope:** the first REAL Android **Health Connect** write path — map approved
execution-plan operations to the correct Health Connect Record type + unit;
respect write permissions; supported record types only; idempotent via
`clientRecordId` (+ version); handle OS/version differences.

**Gate reasons:** any real Health Connect write behavior
(`HUMAN_APPROVAL_GATE` 2) + permission-prompt timing/copy (gate 3) +
native-substrate/ADR work (gate 9). FULL lane: `HEALTH_CONNECT_WRITE_GATE` +
`DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` (crown jewel) +
`CAPABILITY_PERMISSION_GATE` + `PLATFORM_WRITER_GATE` +
`SECRET_AND_ENDPOINT_SAFETY_GATE` + `TEST_DATA_SAFETY_GATE`.

**Hard prerequisites:** MR3 dry-run plan exists · availability/installation
check before permission · permission explained BEFORE the OS prompt ·
denied/partial fails closed and is surfaced · explicit human-confirmed
real-write enablement · synthetic data only · **a write is reported successful
ONLY if the native insert actually succeeded** · target is **Health Connect**,
never "Google HealthKit" / Google Fit.

**STOP unless** human approval explicitly allows the Health Connect real-write
POC; real-write gates/flags remain off by default; the native substrate is
validated.

---

## MR6 — Run Orchestration + Result Reporting — **HARD GATE on real-write orchestration / run-reporting**

**Scope:** orchestrate the full run lifecycle (`SELECT_TEST_CASE → LOAD_VERSION
→ LOAD_SCENARIOS → LOAD_METRIC_METADATA → CHECK_CAPABILITY → CHECK_PERMISSIONS →
BUILD_PLAN → DRY_RUN → CONFIRM_REAL_WRITE → EXECUTE → COLLECT_RESULTS →
REPORT_RESULT → COMPLETE`); progress reporting; the run-result summary
(`total / succeeded / failed / skipped` + `errors[].reason_code`); optional
backend run report (`POST /mobile/runs`).

**Gate reasons:** orchestrating a confirmed real-write run re-engages the
real-write hard gates (1, 2, 4); adding the run-reporting API is a backend
contract change (gate 7 if the API is missing). FULL lane: `RUN_REPORTING_GATE` +
`NO_FAKE_SUCCESS_GATE` + `DRY_RUN_NO_WRITE_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE`.

**Scope rules:** the run MODE (dry-run vs real-write) is obvious throughout
(`RN_UI_QUALITY_GATE`) · the confirmation step gates real writes · the result
summary never reports a write as succeeded unless it did · redaction; no
token/raw-payload leakage · high-frequency progress updates throttled off the UI
thread (`RN_PERFORMANCE_GATE`) · if `POST /mobile/runs` does not exist, document
the gap and STOP (never fabricate).

**STOP unless** real-write orchestration (if exercised) is human-approved and
the run-reporting API contract is resolved.

---

## MR7 — Safety QA / Release Candidate — **HARD GATE (release-readiness)**

**Scope:** end-to-end safety QA across the run flow (idle / loading /
plan-built / dry-run / confirming / executing / result / error) + invariants
(dry-run no write, no fake success, unsupported surfaced, secrets redacted,
permissions explained before the OS prompt); mobile exploratory QA; release
candidate hardening.

**Gate reason:** **no RC is "production-ready" without a separate
security/privacy review** (`HUMAN_APPROVAL_GATE` 8). Gates: `RN_TESTING_GATE` +
`RN_PERFORMANCE_GATE` + `RN_UI_QUALITY_GATE` + the crown-jewel safety gates +
`DOC_SYNC_GATE`.

**Scope rules:** no loosened test assertions · every run-flow state + invariant
covered · a production/release-readiness claim STOPs the loop for the separate
review.

**STOP unless** a separate security/privacy review is requested and approved
before any production-ready claim.

---

## Eligibility summary

| Phase | Eligibility |
|---|---|
| MR-FRAMEWORK-00 | AUTO-RUN (framework/docs only) |
| MR0 | HARD GATE — locks contracts + creates ADRs (gates 9, 7) |
| MR1 | HARD GATE — token-storage strategy + ADRs/substrate (gates 5, 9) |
| MR2 | AUTO-RUN — read-only loading + interpretation (no write) |
| MR3 | AUTO-RUN — dry-run plan only (ZERO real writes); prerequisite for MR4/MR5 |
| MR4 | HARD GATE — real Apple Health write (gates 1, 3, 9) |
| MR5 | HARD GATE — real Health Connect write (gates 2, 3, 9) |
| MR6 | HARD GATE — real-write orchestration / run-reporting API (gates 1, 2, 4, 7) |
| MR7 | HARD GATE — release-readiness needs a separate security/privacy review (gate 8) |

The loop advances strictly in phase order; within an AUTO-RUN phase it may take
up to 5 stories or the whole phase block (whichever is smaller) per invocation,
and STOPs at any hard gate or stop condition.

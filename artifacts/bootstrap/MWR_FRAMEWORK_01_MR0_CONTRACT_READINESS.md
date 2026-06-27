# MWR-FRAMEWORK-01 — MR0 Contract Readiness Checklist

**Story:** MWR-FW1-005 · **Phase:** MR-FRAMEWORK-01 · **Date:** 2026-06-27 · **Purpose:** identify the contract topics **MR0 must lock** before any implementation. This phase **identifies gaps only — it does not solve them**.

Sources: Master REQ §6/§9/§10, `docs/contracts/*`, `MOBILE_RUNNER_IMPLEMENTATION_HANDOFF.md`, `adapter/current-decisions.md`, `adapter/known-risks.md`.

## A. Backend API routes to lock (all `TO_VERIFY` — follow real MWDS)
| Capability | Expected shape (REQ §9) | MR0 action |
|---|---|---|
| Auth / session | `POST /auth/login` + refresh / logout / me | Lock exact routes + session model |
| Runnable test cases | `GET /mobile/test-cases` (or existing) | Lock route + filters/pagination |
| Version detail | `GET /test-cases/{id}/versions/{vid}` | Lock route + config snapshot DTO |
| Ordered scenarios | `GET …/versions/{vid}/scenarios` | Lock route; **order authoritative** |
| Scenario content | existing content endpoint | Lock route + payload shape |
| Metric metadata | catalog metric API | Lock route + unit/data_shape/platform support |
| Run reporting (optional, MR6) | `POST /mobile/runs` | Confirm exists or record gap (hard gate #7) |

## B. DTOs to ratify (REQ §10)
`RunnableTestCase`, `RunnableTestCaseVersion`, `RunnableScenario`, `ScenarioContent`,
`MetricDefinition`, `ExecutionPlan` (ops `writable|unsupported|permission_missing|invalid|skipped` + `reason_code`), `RunResult` (`succeeded`=native success only). **Action:** ratify field-level shapes + the **final reason_code set** (currently `TO_VERIFY` at MR3).

## C. Error envelope & correlation
Define the API error envelope, **request ID / run ID** propagation, auth-expiry →
re-login, and `BACKEND_UNAVAILABLE` handling (design E02/S04 already depict request IDs).

## D. Per-metric writability (iOS + Android) — MR0/MR4/MR5 dependency
The HealthKit/Health Connect capability matrix marks **every** per-metric writability
`TO_VERIFY` (`ADR-MWR-009`, `R-MWR-005`). **Action:** MR0 records the per-metric verdicts
to confirm against current Apple/Jetpack docs at MR3/MR4/MR5; the framework must not
assume any metric is writable.

## E. Token / session storage — **HARD human-approval gate (#5)**
Secrets are by-reference only today (`ADR-MWR-006`). **Action:** MR0 decides the
Keychain/Keystore strategy + refresh model + whether session persists — approval required.

## F. Real-write gating & run scope
**Action:** MR0 decides real-write enablement (DEV build flag / env flag / both;
`R-MWR`-tracked open) and run scope (single scenario vs whole ordered list vs both).

## G. QA / device matrix
See `docs/platform/MWR_DEVICE_QA_MATRIX.md` (created this phase). **Action:** MR0 finalizes
named devices/OS versions before MR4/MR5 real-write approval.

## MR0 readiness summary
| Topic | State |
|---|---|
| Execution model / safety / run lifecycle | **locked** (design + contracts) |
| Backend routes (A) · DTOs (B) · error envelope (C) | **Open — MR0 locks** |
| Per-metric writability (D) | **Open / TO_VERIFY — MR0 records, MR3/4/5 confirms** |
| Token storage (E) · real-write gating + run scope (F) | **Open — hard gate / MR0 decides** |
| Device QA matrix (G) | **placeholder created — MR0 finalizes** |

**These are MR0's deliverables, captured honestly as Opens. No backend implementation or MR0 stories were created.** A backend API gap that would force local fabrication is a hard human-approval gate — document + STOP, never fabricate.

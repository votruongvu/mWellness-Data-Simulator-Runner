# Test-Data Safety Rules — mWellness-Mobile-Runner (MWR)

Safety for scenario / test data and for honest write reporting.
Operationalizes `TEST_DATA_SAFETY_GATE`, `SCENARIO_CONTRACT_GATE`, and
`NO_FAKE_SUCCESS_GATE`. Mobile **consumes** a backend-validated scenario
contract and **executes** it; it never authors data.

## TD-1 — No real PHI/PII — ever
All scenario/test data is fabricated. No real person, real account, real
device id, real token, or real medical record may appear in a fixture,
scenario, plan, log, or commit. Synthetic identifiers are clearly synthetic
(e.g. `synthetic-user-01`, sandbox device ids). A violation is a **P0**.

## TD-2 — Plausible-but-bounded
Synthetic values stay within declared plausibility ranges unless a scenario
explicitly models an anomaly (and labels it). MWR never implies these values
are real or clinically meaningful.

## TD-3 — Mobile never authors/validates/mutates/reorders scenarios
The MWDS backend owns scenario authoring, validation, the seed
library/applicability, and versioning/ordering. Mobile **interprets**
backend-validated scenario payloads + metric metadata into runner models and
nothing more. It never authors a scenario, never re-validates one as
authoritative, never mutates a scenario's content, and never reorders the
backend's scenario order. An invalid payload **blocks the run with a reason**;
it is never silently corrected.

## TD-4 — Mobile never fakes write success
A write/insert is reported successful **only if** the native platform
(Apple Health / Health Connect) actually performed it. A denied, failed, or
partial write is reported honestly (failed / skipped + `reason_code`). A
negative-verification test must prove a denied/failed write is not reported as
success. Faking success is a **P0** (`NO_FAKE_SUCCESS_GATE`).

## TD-5 — Mobile is not the score engine
MWR holds **inputs** (steps, heart rate, sleep, etc., as defined by backend
metric metadata). It **never** computes, ranks, asserts, or stores an
authoritative wellness score, fusion, or classification.

## TD-6 — No mock presented as complete behavior
A mock/stub test case or scenario used during development is clearly labelled
and is **never** presented as complete product behavior or as evidence that a
real write path works.

## TD-7 — Safety scan travels with fixtures
A `no-real-phi` scan and a `no-secret` scan travel with scenario fixtures
(see [`security-rules.md`](security-rules.md) SEC-3/SEC-4 and
[`testing-rules.md`](testing-rules.md) T-1).

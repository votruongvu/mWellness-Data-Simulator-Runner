# Backend API Rules — mWellness-Mobile-Runner (MWR)

The backend client is the **only** source of runnable data and the channel
for run reporting. Operationalizes `BACKEND_API_GATE` and
`RUN_REPORTING_GATE`, reinforced by `SECRET_AND_ENDPOINT_SAFETY_GATE`. The
MWDS Web App + Go backend is the upstream source of truth; mobile loads a
backend-validated runnable contract and executes it.

## BA-1 — The backend client owns these responsibilities
- **Auth / session** — login / refresh / logout / current-user; session token
  resolved from secure storage by reference (never raw in source).
- **Loading** — runnable test cases, a test-case version, the version's
  **ordered** scenarios, scenario content, and catalog **metric metadata**.
- **Run reporting** — an optional run result report to the backend (MR6).

Mobile interprets what it loads into runner models; it never authors,
validates, mutates, or reorders scenarios (`SCENARIO_CONTRACT_GATE`).

## BA-2 — Backend authority is not bypassed
Runnable data comes only from the authenticated backend API. Backend
ownership / RBAC / tenant authority is enforced upstream and **not bypassed**
on device. Mobile does not own the catalog, scenario validation, the seed
library/applicability, or versioning/ordering.

## BA-3 — Missing API STOPs — never fabricate
If a required API is missing or its contract is unknown, **document the gap
and STOP for human approval** (a human approval gate). Mobile **never**
fabricates local test cases/scenarios/metric metadata to fill a backend gap.
A fabricated-to-fill-gap path is a **P0**.

## BA-4 — Base URL + endpoints from config
The base URL and endpoint paths come from configuration, never hardcoded. No
production endpoint is a default; an unknown environment defaults to dry-run
(see [`secret-endpoint-safety-rules.md`](secret-endpoint-safety-rules.md)).
Exact routes are `TO_VERIFY` until confirmed against the backend contract.

## BA-5 — Secrets by reference, resolved at runtime
The client holds a `secretRefName` only; the session/refresh token value is
resolved at runtime from Keychain / Keystore and never written to source,
logs, snapshots, or plain app storage. Token/session storage strategy is a
human approval gate.

## BA-6 — Responses validated + error-classified
Every response is validated against the expected schema/status and mapped to
the error taxonomy (e.g. `AUTH`, `VALIDATION`, `TRANSIENT`, `CONFIG`,
`UNKNOWN`). An invalid/blocking response blocks the run with a reason; it is
never silently treated as success.

## BA-7 — Redaction on every log path
Request/response logging routes through the redaction boundary: never log a
raw token, raw `Authorization` header, or a full identifier-bearing payload.
Only allowlisted headers are sent (`SECRET_AND_ENDPOINT_SAFETY_GATE`).

## BA-8 — Run reporting is honest + redacted
A run report carries the result summary (`total / succeeded / failed /
skipped` + `reason_code`s) reflecting the **actual** platform write results
(`NO_FAKE_SUCCESS_GATE`). It contains no raw token / no raw payload / no real
PHI and is sent through the redacted client (`RUN_REPORTING_GATE`). Reporting
is optional and never gates or fakes the local result.

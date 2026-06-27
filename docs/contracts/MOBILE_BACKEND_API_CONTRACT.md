# mWellness Mobile Runner — Backend API Contract

> The contract between MWR and the upstream **MWDS Web App + Go backend**, derived
> from [Master REQ §9](../requirements/MOBILE_RUNNER_MASTER_REQ.md#9-backend-api-requirements)
> and [§10](../requirements/MOBILE_RUNNER_MASTER_REQ.md#10-data-contracts).
> The backend is the **source of truth**: it owns the catalog, scenario authoring,
> scenario validation, the scenario seed library/applicability, and
> versioning/scenario-ordering. Mobile **loads** the backend-validated runnable
> contract and executes it.
>
> **Route shapes below are `TO_VERIFY` — follow the real MWDS routes at MR0.** The
> exact endpoints are an MR0 contract-alignment deliverable and an open question
> (REQ §16 Q1).

## Operating principle

> **Backend runnable scenario contract first -> mobile execution plan second ->
> platform writer third.**

Mobile never authors, validates, mutates, or reorders scenarios. Runnable data
comes only from the authenticated backend API.

## Backend authority gap rule (load-bearing)

> If a required backend API is **missing**, the mobile framework must **document
> the gap and STOP for human approval** before creating any fake local data. A
> missing backend API is never papered over with fabricated test cases/scenarios.
> This is human-approval gate #7 (backend API contract gap forcing fabrication).

## Backend capabilities

| Capability | Expected route shape (`TO_VERIFY` — follow MWDS) | Owner | Notes |
|---|---|---|---|
| Login | `POST /api/v1/auth/login` | Backend | Exact route follows MWDS. Returns session/token material. |
| Refresh | refresh equivalent (`TO_VERIFY`) | Backend | Token refresh model is a human-approval gate (token/session storage). |
| Logout | logout equivalent (`TO_VERIFY`) | Backend | Clears server session as applicable; client clears local state. |
| Me / session | `me` equivalent (`TO_VERIFY`) | Backend | Identifies the authenticated user. |
| Runnable test cases | `GET /api/v1/mobile/test-cases` or compatible existing route | Backend | May reuse an existing API. Scoped to authenticated user. |
| Version detail | `GET /api/v1/test-cases/{id}/versions/{version_id}` | Backend | Includes the immutable config snapshot. |
| Ordered scenarios | `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios` | Backend | **Backend order is authoritative**; mobile never reorders. |
| Scenario content | existing scenario content/detail endpoint (`TO_VERIFY`) | Backend | Concrete validated payloads required for interpretation. |
| Metric metadata | catalog metric API (`TO_VERIFY`) | Backend Catalog | Unit / data_shape / platform support required. |
| Run reporting | `POST /api/v1/mobile/runs` or equivalent (`TO_VERIFY`) | Backend | Recommended by MR6; may be a backend gap (REQ §16 Q5). |

## Client safety requirements (BACKEND_API_GATE)

- Base URL / endpoints come from **config**, never a hardcoded production default.
- Auth uses a **secure-storage reference** (`secretRefName`), resolved at runtime
  from Keychain/Keystore — no raw token committed or in plain storage.
- **Redaction on every log path:** no tokens, auth headers, or raw payloads in
  logs; raw scenario payloads are dev-gated only.
- Mobile must **not bypass backend ownership checks** (MR-SEC-003); runnable data
  comes from the authenticated API.
- Errors are classified (auth, network, validation, not-found, server) and
  surfaced; a missing required API STOPs for human approval.

## Data contracts

### Runnable Test Case Summary

```json
{
  "test_case_id": "uuid",
  "test_case_slug": "active-day-basic",
  "name": "Active Day Basic",
  "status": "active",
  "latest_version": {
    "version_id": "uuid",
    "version_number": 3,
    "is_current": true,
    "destination_slug": "apple_health",
    "profile_slugs": ["apple_watch"],
    "metric_slugs": ["steps", "heart_rate"],
    "scenario_count": 4,
    "validation_status": "valid"
  }
}
```

### Runnable Scenario

```json
{
  "scenario_id": "uuid",
  "scenario_slug": "poor_sleep_recovery_day",
  "scenario_name": "Poor Sleep Recovery Day",
  "order_index": 1,
  "validation_status": "valid",
  "metric_slugs": ["sleep_duration", "heart_rate_variability"],
  "content_url": "/api/v1/scenarios/{id}/content"
}
```

> The scenario `content_url` resolves to the concrete validated payload that the
> interpreter consumes. `validation_status` must be `valid` for the scenario to be
> runnable; mobile does not re-validate authority, but an invalid/missing payload
> blocks the run with a reason (see the execution model doc).

### Run Reporting payload (MR6)

The mobile-produced **Run Result** (see
[`MOBILE_SCENARIO_EXECUTION_MODEL.md`](MOBILE_SCENARIO_EXECUTION_MODEL.md)) is the
body of the optional run-reporting call. Reporting is redacted (no token / raw
payload leakage) and is recommended by MR6. If the backend lacks a run-reporting
endpoint, that is a documented gap — STOP for human approval (REQ §16 Q5).

## Open questions carried to MR0 (REQ §16)

1. Which exact backend endpoints will mobile use (reuse existing MWDS routes vs new `/mobile/*`)?
2. What token refresh/storage strategy is approved?
5. Should run reporting (`POST /mobile/runs`) be added to the backend before MR6?

## Cross-references

- Execution model + JSON contracts: [`MOBILE_SCENARIO_EXECUTION_MODEL.md`](MOBILE_SCENARIO_EXECUTION_MODEL.md)
- Architecture (backend client lives in `src/backend/`): [`../architecture/MOBILE_RUNNER_ARCHITECTURE.md`](../architecture/MOBILE_RUNNER_ARCHITECTURE.md)
- Secret/endpoint safety: [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)

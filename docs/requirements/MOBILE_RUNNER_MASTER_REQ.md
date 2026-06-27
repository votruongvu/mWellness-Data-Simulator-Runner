# mWellness Mobile Runner — Master Requirements Specification

> **Canonical requirement source for this repository.** This Markdown file is a
> faithful conversion of the canonical HTML document
> [`MOBILE_RUNNER_MASTER_REQ.html`](MOBILE_RUNNER_MASTER_REQ.html). The HTML and
> this `.md` are the **single canonical requirement source** for
> `mWellness-Mobile-Runner` (MWR). Per the repo source hierarchy, the Master REQ
> sits directly below real repo descriptive state and above the Context Layer
> (`.claude-framework/adapter/*`). When this file and the HTML diverge, the HTML
> is authoritative; reconcile by re-converting, never by drifting.

- **Document ID:** MWR-MASTER-REQ-v1.0
- **Version:** 1.0
- **Status:** Draft for Framework Bootstrap
- **Target Repo:** mWellness-Mobile-Runner
- **Upstream:** mWellness-Data-Simulator (MWDS)
- **Purpose:** Canonical requirements baseline for creating a dedicated Claude
  Framework and repository for the mobile runner.
- **Primary Scope:** React Native mobile runtime that authenticates users, loads
  runnable test cases/scenarios from the MWDS backend, prepares execution plans,
  writes/simulates wellness data via Apple Health / Health Connect, and reports
  run results.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Boundary](#2-product-boundary)
3. [System Context](#3-system-context)
4. [Scope and Non-Scope](#4-scope-and-non-scope)
5. [Target Architecture](#5-target-architecture)
6. [Domain Model](#6-domain-model)
7. [Functional Requirements](#7-functional-requirements)
8. [Platform Requirements](#8-platform-requirements)
9. [Backend API Requirements](#9-backend-api-requirements)
10. [Data Contracts](#10-data-contracts)
11. [Security, Privacy, and Safety](#11-security-privacy-and-safety)
12. [Mobile UX Requirements](#12-mobile-ux-requirements)
13. [Testing and QA](#13-testing-and-qa)
14. [Recommended Mobile Runner Roadmap](#14-recommended-mobile-runner-roadmap)
15. [Claude Framework Requirements](#15-claude-framework-requirements)
16. [Risks and Open Questions](#16-risks-and-open-questions)
17. [Master Acceptance Criteria](#17-master-acceptance-criteria)

---

## 1. Executive Summary

**mWellness Mobile Runner** is a dedicated mobile runtime for executing validated
wellness test scenarios authored and managed by the upstream
`mWellness-Data-Simulator` Web App and Backend.

The mobile app is **not the authoring system**. It authenticates the user,
fetches test cases and selected test case versions from backend APIs, loads
ordered concrete scenarios, prepares a platform-specific execution plan, requests
explicit permissions, writes or simulates supported wellness data through Apple
Health or Health Connect, and reports execution results.

> **Primary direction:** Mobile loads runnable data directly from backend APIs
> after login. Exported bundles can be optional later, but they are **not** the
> primary mobile runner data source.

> **Safety rule:** The runner must never silently write health data. Real writes
> require environment gating, capability checks, permission checks, dry-run
> preview, and user confirmation.

---

## 2. Product Boundary

| Item | Definition |
|---|---|
| Product | mWellness Mobile Runner |
| Repository | `mWellness-Mobile-Runner` |
| Primary stack | React Native + TypeScript + native iOS/Android modules |
| Upstream | `mWellness-Data-Simulator` Web App + Go Backend |
| Users | Internal DEV/QA testers, mobile developers, backend developers, QA leads |

**Mobile owns**

- Login/session on mobile
- Runnable test case loading
- Scenario loading and interpretation
- Execution plan generation
- Platform capability checks
- Health permission flow
- HealthKit / Health Connect writer adapters
- Dry-run and write safety gates
- Run progress and result reporting

**Mobile does not own**

- Catalog source of truth
- Scenario validation authority
- Test case authoring
- Versioning and scenario ordering authority
- Scenario seed library and applicability
- RBAC/tenant/billing/admin
- Google Fit or vendor SDK integrations unless approved

---

## 3. System Context

```text
MWDS Web App/Backend
  - Auth
  - Catalog and metrics
  - Test cases and versions
  - Ordered scenarios
  - Scenario validation
  - Optional run reporting
        |
        | HTTPS + authenticated APIs
        v
mWellness Mobile Runner
  - Login/session
  - Fetch runnable data
  - Build execution plan
  - Dry-run preview
  - Request permissions
  - Execute writes
  - Report results
        |
        +--> iOS HealthKit / Apple Health
        +--> Android Health Connect
```

### Primary Flow

1. User logs in.
2. Mobile fetches runnable test cases.
3. User selects test case and version.
4. Mobile loads ordered scenarios and metric metadata.
5. Mobile checks platform support and permissions.
6. Mobile builds execution plan.
7. User runs dry-run and confirms real write if enabled.
8. Mobile writes/simulates data.
9. Mobile shows and optionally reports run result.

---

## 4. Scope and Non-Scope

### In Scope

- Dedicated mobile repo and Claude Framework.
- React Native mobile app foundation.
- Auth/session and secure storage.
- Backend API client.
- Test case browser and scenario loader.
- Scenario interpreter and execution plan builder.
- Dry-run mode.
- Apple Health writer POC and hardening.
- Health Connect writer POC and hardening.
- Run orchestration, progress, result reporting.
- Diagnostics and QA tooling.

### Out of Scope

- Web App authoring features.
- Catalog/test case/scenario seed editing on mobile.
- Scenario Seed Library and Applicability.
- Mobile as a full scenario editor.
- Billing, tenant, RBAC, admin, SaaS control plane.
- Google Fit.
- Direct vendor SDKs unless approved.
- Background autonomous writes.
- Silent health data writes.
- Production consumer release without later review.

---

## 5. Target Architecture

| Layer | Recommendation | Notes |
|---|---|---|
| App | React Native + TypeScript | Dedicated mobile repository. |
| iOS native | Swift module | HealthKit capability/permission/write adapter. |
| Android native | Kotlin module | Health Connect capability/permission/write adapter. |
| Server state | TanStack Query or equivalent | Fetch/cache backend data. |
| Secure storage | Keychain/Keystore-backed | For persistent session material if used. |
| Logging | Structured local logs | No tokens; raw scenario payloads dev-gated only. |

```text
src/
  auth/
  backend/
  catalog/
  testCases/
  runner/
    interpreter/
    executionPlan/
    runState/
  health/
    common/
    appleHealth/
    healthConnect/
  safety/
  diagnostics/
  shared/
```

**UI must not call native writers directly.** Native writers implement a common
interface and are reachable **only after safety gates pass**.

---

## 6. Domain Model

| Object | Description | Owner |
|---|---|---|
| UserSession | Authenticated mobile session. | Mobile/Auth + Backend |
| RunnableTestCase | Backend-provided runnable test case summary. | Backend |
| RunnableTestCaseVersion | Immutable version configuration snapshot. | Backend |
| RunnableScenario | Concrete ordered scenario attached to a version. | Backend |
| MetricDefinition | Metric metadata, unit, data shape, platform support. | Backend Catalog |
| PlatformCapability | Local platform availability and write support. | Mobile |
| PermissionState | OS permission state per platform/metric type. | Mobile/OS |
| ExecutionPlan | Planned write/simulate operations. | Mobile |
| RunSession | Local runtime state for selected version/scenario set. | Mobile |
| RunResult | Run success/failure/skipped summary. | Mobile, optional Backend report |

### Run Lifecycle State Machine

```text
SELECT_TEST_CASE -> LOAD_VERSION -> LOAD_SCENARIOS
-> LOAD_METRIC_METADATA -> CHECK_CAPABILITY -> CHECK_PERMISSIONS
-> BUILD_PLAN -> DRY_RUN -> CONFIRM_REAL_WRITE
-> EXECUTE -> COLLECT_RESULTS -> REPORT_RESULT -> COMPLETE
```

---

## 7. Functional Requirements

### Authentication

| ID | Requirement | Acceptance |
|---|---|---|
| MR-AUTH-001 | User can log in using MWDS backend credentials/session flow. | Valid user reaches protected screens. |
| MR-AUTH-002 | Persistent token/session material uses secure storage. | No raw tokens in plain storage or logs. |
| MR-AUTH-003 | Expired sessions are handled clearly. | Refresh or re-login flow works. |
| MR-AUTH-004 | Logout clears local session state. | Protected data unavailable after logout. |

### Test Case and Scenario Loading

| ID | Requirement | Acceptance |
|---|---|---|
| MR-TC-001 | Fetch runnable test cases for authenticated user. | List uses real backend API. |
| MR-TC-002 | Show test case summary and latest/current version. | User can select runnable target. |
| MR-TC-003 | Load selected version config snapshot. | Destination/profiles/metrics visible. |
| MR-TC-004 | Load ordered scenarios for selected version. | Order matches backend. |
| MR-TC-005 | Do not locally mutate version or scenario order. | Mobile is runner, not authoring authority. |

### Scenario Interpretation and Execution Plan

| ID | Requirement | Acceptance |
|---|---|---|
| MR-PLAN-001 | Parse validated scenario payloads into internal runner models. | Invalid payload blocks run with reason. |
| MR-PLAN-002 | Resolve relative time model to absolute timestamps. | Planned operations have concrete timestamps. |
| MR-PLAN-003 | Classify each operation: writable, unsupported, permission_missing, invalid, skipped. | Blocked operations visible before run. |
| MR-PLAN-004 | Support dry-run mode without native write. | Dry-run produces plan/result without writing. |

### Run Execution

| ID | Requirement | Acceptance |
|---|---|---|
| MR-RUN-001 | Real write requires explicit confirmation. | No accidental write from list/detail. |
| MR-RUN-002 | Execute writable operations through platform writer adapter. | Native adapter receives only approved operations. |
| MR-RUN-003 | Show run progress by scenario/metric. | User sees completed/failed/skipped operations. |
| MR-RUN-004 | Generate run result summary. | Success/failure/skipped counts and reasons visible. |

---

## 8. Platform Requirements

### Apple Health / HealthKit

| ID | Requirement |
|---|---|
| MR-IOS-001 | Check HealthKit availability before permission request. |
| MR-IOS-002 | Request permissions only after explanatory user action. |
| MR-IOS-003 | Map supported metrics to HealthKit quantity/category/workout types. |
| MR-IOS-004 | Never report success unless native HealthKit write succeeds. |
| MR-IOS-005 | Expose permission denied/partial states clearly. |

### Health Connect

| ID | Requirement |
|---|---|
| MR-AND-001 | Check Health Connect availability/installation state. |
| MR-AND-002 | Request permissions only after explanatory user action. |
| MR-AND-003 | Map supported metrics to Health Connect record types. |
| MR-AND-004 | Never report success unless native Health Connect insert succeeds. |
| MR-AND-005 | Handle OS/API/version availability differences gracefully. |

> Exact metric write support must be verified in MR0/MR3/MR4/MR5. **The framework
> must not assume every catalog metric is writable.**

---

## 9. Backend API Requirements

| Capability | Expected Shape | Notes |
|---|---|---|
| Login/session | `POST /api/v1/auth/login` and refresh/logout/me equivalents | Exact routes follow MWDS. |
| Runnable test cases | `GET /api/v1/mobile/test-cases` or compatible existing route | May reuse existing API. |
| Version detail | `GET /api/v1/test-cases/{id}/versions/{version_id}` | Includes config snapshot. |
| Ordered scenarios | `GET /api/v1/test-cases/{id}/versions/{version_id}/scenarios` | Backend order authoritative. |
| Scenario content | Existing scenario content/detail endpoint | Concrete payloads required. |
| Metric metadata | Catalog metric API | Unit/data_shape/platform support required. |
| Run reporting | `POST /api/v1/mobile/runs` or equivalent | Recommended by MR6. |

> If required backend APIs are missing, the mobile framework must **document the
> gap and stop for human approval before creating fake local data.**

---

## 10. Data Contracts

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

### Execution Plan

```json
{
  "run_id": "local-uuid",
  "mode": "dry_run",
  "platform": "ios",
  "destination_slug": "apple_health",
  "operations": [
    {
      "operation_id": "local-op-1",
      "scenario_id": "uuid",
      "metric_slug": "heart_rate",
      "status": "writable",
      "target_type": "healthkit.quantity.heart_rate",
      "timestamp": "2026-06-27T10:00:00Z",
      "value": 92,
      "unit": "count/min"
    }
  ],
  "blocked_operations": [
    {
      "metric_slug": "recovery_score",
      "status": "unsupported",
      "reason_code": "METRIC_NOT_WRITABLE_ON_PLATFORM"
    }
  ]
}
```

### Run Result

```json
{
  "run_id": "local-uuid",
  "mode": "real_write",
  "platform": "ios",
  "summary": {
    "total_operations": 28,
    "succeeded": 25,
    "failed": 1,
    "skipped": 2
  },
  "errors": [
    {
      "operation_id": "local-op-9",
      "metric_slug": "sleep_stage_deep",
      "reason_code": "NATIVE_WRITE_FAILED"
    }
  ]
}
```

---

## 11. Security, Privacy, and Safety

| ID | Requirement | Acceptance |
|---|---|---|
| MR-SEC-001 | Tokens and credentials must not be logged. | Redaction checks exist. |
| MR-SEC-002 | Persistent tokens use secure storage. | No raw token in plain storage. |
| MR-SEC-003 | Mobile must not bypass backend ownership checks. | Runnable data comes from authenticated API. |
| MR-SAFE-001 | Dry-run exists before real-write. | Plan can be previewed without writes. |
| MR-SAFE-002 | Real write requires explicit confirmation. | No accidental writes. |
| MR-SAFE-003 | Unsupported metrics are blocked/skipped with reason. | No silent ignore. |
| MR-SAFE-004 | Native write success must reflect actual platform result. | No fake success. |

> **Claude guardrail:** Any task that writes to Apple Health or Health Connect
> must include permission, capability, dry-run, confirmation, and no-fake-success
> checks. If any are missing, the task is blocked.

---

## 12. Mobile UX Requirements

- Login screen
- Environment/status screen
- Test case list
- Test case detail
- Version/scenario list
- Execution plan preview
- Permission/capability check screen
- Run confirmation screen
- Run progress screen
- Run result screen
- DEV diagnostics screen

UX must make **target platform and run mode obvious**. Dry-run vs real-write must
be visible throughout the run flow. Permission prompts must be **explained before
native OS prompts appear**.

---

## 13. Testing and QA

| Category | Coverage |
|---|---|
| Unit | Scenario interpretation, time model resolution, plan builder, capability classification. |
| Component | Screen states, confirmation gates, permission states, errors. |
| API integration | Auth, test case fetch, version/scenario fetch, error handling. |
| Native adapter | Capability, permission, write success/failure mapping where feasible. |
| Manual QA | Real iOS/Android devices, dry-run, permissions, write POC, result verification. |

> **No-fake-success rule:** writer POCs must include negative verification that
> denied/failed native writes are not reported as success.

---

## 14. Recommended Mobile Runner Roadmap

| Phase | Name | Purpose |
|---|---|---|
| MR-FRAMEWORK-00 | Claude Framework Bootstrap | Dedicated mobile framework, guardrails, context, commands. |
| MR0 | Mobile Runner Contract Alignment | Backend/mobile/native contracts and safety gates. |
| MR1 | Mobile Foundation / Auth / API Client | App shell, auth, backend client, config. |
| MR2 | Test Case Browser + Scenario Loader | Fetch runnable test cases, versions, ordered scenarios. |
| MR3 | Scenario Interpreter + Execution Plan | Parse scenarios and build dry-run plan. |
| MR4 | Apple Health Writer POC | HealthKit permission/capability/write POC. |
| MR5 | Health Connect Writer POC | Health Connect permission/capability/write POC. |
| MR6 | Run Orchestration + Result Reporting | Run ordered scenarios, progress, result/reporting. |
| MR7 | Safety QA / Release Candidate | Hardening, QA matrix, diagnostics, RC docs. |

---

## 15. Claude Framework Requirements

### Required context files

- `CLAUDE.md`
- `.claude/commands/run-phase-loop.md`
- `.claude-framework/adapter/current-decisions.md`
- `.claude-framework/adapter/known-risks.md`
- `.claude-framework/adapter/source-of-truth.md`
- `.claude-framework/adapter/human-approval-gates.md`
- `docs/requirements/MOBILE_RUNNER_MASTER_REQ.md`
- `docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md`
- `docs/contracts/MOBILE_BACKEND_API_CONTRACT.md`
- `docs/contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`

> **Naming note (current truth):** the existing adapter convention names the
> source-of-truth file `project-source-of-truth.md`. This is kept, and a
> `human-approval-gates.md` is added alongside it, satisfying the REQ's intent.

### Mandatory guardrails

- No accidental health data writes.
- No real write without dry-run, permission check, capability check, and confirmation.
- No fake native write success.
- No silent HealthKit / Health Connect permission prompt.
- No Google Fit.
- No vendor SDK unless approved.
- No backend authority bypass.
- No mock test cases/scenarios marked as complete product behavior.
- No raw token/log leakage.
- No unsupported metric silently ignored.

> Phase loop must execute story-by-story, commit per story, validate per story,
> prepare close-task-style phase review, and **stop for human classification
> before continuing.**

---

## 16. Risks and Open Questions

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| MR-RISK-001 | Accidental real health writes. | P0 | Dry-run, confirmation, safety gates. |
| MR-RISK-002 | Fake native write success. | P0 | No-fake-success tests. |
| MR-RISK-003 | Mobile duplicates backend authoring logic. | P1 | Backend remains source of truth. |
| MR-RISK-004 | Metric support differs by platform. | P1 | MR0 mapping contract and capability checks. |
| MR-RISK-005 | Tokens/raw payloads leak through logs. | P0 | Redaction and dev-gated diagnostics. |

### Open Questions

1. Which exact backend endpoints will mobile use?
2. What token refresh/storage strategy is approved?
3. Which metrics are truly writable on iOS HealthKit for POC?
4. Which metrics are truly writable on Android Health Connect for POC?
5. Should run reporting be added to backend before MR6?
6. Should real-write mode require DEV build flag, environment flag, or both?
7. Should mobile run one scenario, whole ordered list, or both?
8. What real devices/OS versions are required for QA?

---

## 17. Master Acceptance Criteria

- Dedicated mobile repo has Claude Framework with mobile-native guardrails.
- Master REQ is copied/converted into canonical repo docs.
- Source of truth states MWDS backend is upstream authority.
- Known risks include native write safety, permission, metric mapping, token storage, and no-fake-success.
- MR0 locks backend/mobile/native contracts before product implementation.
- MR3 dry-run execution plan exists before MR4/MR5 real writer POCs.
- No native writer phase is done if it fakes write success.
- No real-write flow is done without dry-run, capability check, permission check, and explicit confirmation.
- No release candidate is production-ready without separate security/privacy review.

---

*mWellness Mobile Runner — Master REQ v1.0 · Markdown conversion of the canonical HTML for Claude Framework Bootstrap.*

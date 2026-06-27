# MOBILE_RUNNER_CONTRACT_BASELINE.md

**Phase:** MR-A (Foundation + Contracts + Auth Shell) · **Story:** MWR-MRA-001 · **Date:** 2026-06-27.

The **minimum** binding contract baseline needed to start MR-A/MR-B mobile
implementation. This is the MR0-equivalent lock folded into MR-A — it covers only
auth/session + the runnable-data API *shape* + core DTOs + error/correlation
behavior. **Master REQ is canonical** (`docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`);
this baseline does not expand product scope. Exact routes are **`TO_VERIFY`** against
the real MWDS backend (none reachable in this environment) — a backend gap is
documented and **STOPs**, never faked (`BACKEND_API_GATE`, human-approval gate #7).

## 1. Product boundary (restated, binding)
Mobile **owns**: auth/session, backend API client, runnable test case/scenario
loading (MR-B+), scenario interpretation/execution plan/dry-run (MR-C+), platform
capability + permission (MR-D+), Apple Health / Health Connect writers (later),
run progress/result reporting, diagnostics. Mobile **does NOT own**: catalog,
scenario authoring/validation/ordering, seed library, RBAC/tenant/billing/admin,
Google Fit/vendor SDKs. **MR-A implements only auth/session + backend client base +
app shell.**

## 2. Source-of-truth priority (binding for MR-A)
```
Master REQ (canonical) > MR-A contract baseline (binding minimum) >
MR-DESIGN-00 artifacts (UI/UX input) > framework adapter (operating truth) >
old DM1/app truth (legacy/superseded only)
```

## 3. Auth / session contract (minimum)
| Capability | Shape (TO_VERIFY — follow MWDS) | MR-A behavior |
|---|---|---|
| Login | `POST {baseUrl}/auth/login` → `{ access_token, refresh_token?, expires_in, user }` | client implemented; **blocked with a documented gap if no backend configured** (no fake login) |
| Session restore | token from secure storage → `GET /auth/me` | restore if token valid; else unauthenticated |
| Refresh | `POST /auth/refresh` (if backend supports) | optional; not over-built in MR-A |
| Logout | `POST /auth/logout` + clear local session | clears secure storage |

**Token storage (ADR-MWR-006 + gate #5):** tokens are held in **OS-backed secure
storage (Keychain/Keystore via `react-native-keychain`)** — **never** plain
AsyncStorage, never logged, never committed. Redaction on every log path.

## 4. Runnable-data API shape (declared, not implemented in MR-A)
Declared so MR-B can implement against it; **not built in MR-A**: `GET /mobile/test-cases`,
`GET /test-cases/{id}/versions/{vid}`, `GET …/versions/{vid}/scenarios`, scenario
content, catalog metric metadata, optional `POST /mobile/runs`. All `TO_VERIFY`.

## 5. Core DTOs (minimum, from Master REQ §10)
```ts
// MR-A uses UserSession + the auth shapes; the rest are declared for MR-B+.
UserSession           { userId; displayName?; accessToken(ref); expiresAt; env }
RunnableTestCase      { test_case_id; test_case_slug; name; status; latest_version }   // MR-B
RunnableScenario      { scenario_id; scenario_slug; order_index; validation_status; metric_slugs; content_url }  // MR-B
MetricDefinition      { slug; unit; data_shape; platform_support }   // MR-B+
ExecutionPlan / RunResult                                            // MR-C+ (not in MR-A)
```
Operation classification (`writable|unsupported|permission_missing|invalid|skipped`)
+ reason_codes are **MR-C+**, not MR-A.

## 6. Error envelope & correlation (binding for the client base)
```ts
ApiError { code: string; message: string; requestId?: string; httpStatus: number }
// codes: AUTH_EXPIRED · BACKEND_UNAVAILABLE · FORBIDDEN · NOT_FOUND · VALIDATION · UNKNOWN
```
- Every response captures a **request ID** (header `x-request-id` TO_VERIFY) and surfaces it in error states + sanitized diagnostics.
- `AUTH_EXPIRED` → Session Expired state (design E01). `BACKEND_UNAVAILABLE` → Backend Unavailable state (design E02). **No fabricated success on any error.**

## 7. Environment handling (lightweight — binding)
A single **env badge** + a base-URL config seam. **No** local/dev/staging/prod
management UX as a primary screen (MR-DESIGN-00 normalization). Base URL comes from
config; no secret/token is ever a default or committed.

## 8. Out of scope for MR-A (deferred)
Test case browser/detail, version/scenario detail, execution plan, dry-run, native
capability/permission/writes, run orchestration, full diagnostics/export, device QA
execution, full backend coverage beyond the above. No Google Fit/vendor/RBAC/
authoring/catalog/seed/upload/reorder/export-bundle.

## 9. Open items MR-A surfaces (carry to MR-B / backend)
- **P1:** exact MWDS routes + auth response shape + `x-request-id` header (`TO_VERIFY`); no backend reachable in this environment → login is a **documented gap**, not faked.
- **P1:** token refresh model (if backend supports) — kept minimal in MR-A.

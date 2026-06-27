# MR_B_BACKEND_ROUTE_ADDENDUM.md

MR-B (Runnable Data Loading + Dry-run Planner) backend-route addendum.
Supplements `MOBILE_BACKEND_API_CONTRACT.md` and `MOBILE_RUNNER_CONTRACT_BASELINE.md`
with the **verified** MWDS routes/shapes used by the mobile runner, and records
the deltas the MR-A client was reconciled to.

> Verified live against `http://localhost:8080` (MWDS Go backend). All MR-B read
> routes exist and are auth-gated (401 without a bearer token). Shapes below are
> from the MWDS OpenAPI.

## Read-only scope (load-bearing)

MR-B consumes ONLY the routes listed here plus `POST /auth/login` and
`POST /auth/logout`. It **never** calls create / update / delete / archive /
duplicate / version-create / scenario-template / download / upload / reorder /
seed / apply-seed / admin routes, and **no client method for those exists** in
the app. Test cases, versions, scenarios, and the catalog are authored and
validated upstream in the MWDS Web App; the runner only reads them.

## Error envelope (response body on ANY error)

```json
{ "error": { "code": "string", "message": "string", "request_id": "string",
  "details": [ {"path":"","code":"","message":"","expected":null,"actual":null,"severity":""} ] } }
```

The mobile client parses this envelope from the **response body**. The
`x-request-id` response header is kept only as a **fallback** correlation id
when `error.request_id` is absent.

## Auth

| Method | Path | Request | Success | Errors |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | `{ username, password }` | 200 `{ token, token_type:"Bearer", expires_at:ISO, user:{id,username,name,role} }` | 401 / 400 envelope |
| GET | `/api/v1/auth/me` | — | `{ user:{id,username,name,role} }` | 401 envelope |
| POST | `/api/v1/auth/logout` | — | 204 | — |

There is **no refresh route** in the verified contract; the app does not invent one.

## Catalog (read)

| Method | Path | Query | Success |
|---|---|---|---|
| GET | `/api/v1/catalog/destinations` | — | `{ destinations: {slug,display_name,platform,description,is_active}[] }` |
| GET | `/api/v1/catalog/profiles` | `destination_slug` | `{ profiles: {slug,display_name,description,is_active,compatible,support_reason}[] }` |
| GET | `/api/v1/catalog/metrics` | `destination_slug`, `profile_slugs` (csv) | `{ metrics: Metric[] }` |

`Metric = {slug,display_name,unit,value_type,category,data_shape,derived,vendor_specific,synthetic_supported,is_active,selectable,reason,supporting_profile_slugs[]}`.
`reason ∈ "" | destination_not_supported | profile_not_supported | inactive_metric | no_selected_profile_supports_metric`.

## Test cases / versions / scenarios (read)

| Method | Path | Success |
|---|---|---|
| GET | `/api/v1/test-cases?page&page_size&q&status(active\|archived)&sort&order` | `{ data: TestCase[], pagination:{page,page_size,total_items,total_pages} }` |
| GET | `/api/v1/test-cases/{id}` | `{ test_case: TestCase }` |
| GET | `/api/v1/test-cases/{id}/versions` | `{ versions: Version[] }` |
| GET | `/api/v1/test-cases/{id}/versions/{version_id}` | `{ version: Version }` |
| GET | `/api/v1/test-cases/{id}/versions/{version_id}/scenarios` | `{ scenarios: ScenarioSummary[] }` |

- `TestCase = {id,name,description,tags[],status,archived_at?,created_at,updated_at}`.
- `Version = {id,test_case_id,destination_slug,profile_slugs[],metric_slugs[],catalog_revision_hash,display:{destination:SlugName,profiles:SlugName[],metrics:SlugName[]},status(active|superseded),version_number,change_reason,parent_version_id?,scenario_count,is_current,created_at,updated_at}`; `SlugName = {slug,display_name}`.
- `ScenarioSummary = {scenario_slug,scenario_name,validation_status(valid|invalid),order_index?,file_name,uploaded_at}`.

## Deltas reconciled from the MR-A contract baseline

The MR-A client used pre-verification assumptions. MR-B corrected them:

| Area | MR-A assumption | Verified reality (MR-B) |
|---|---|---|
| Login request | `{ email, password }` | `{ username, password }` |
| Login response token | `access_token` (+ `refresh_token`) | `token` (single bearer; **no refresh token**) |
| Login response expiry | `expires_in` (seconds) | `expires_at` (ISO timestamp; parsed to epoch ms locally) |
| `/auth/me` | `{ user }` (assumed display_name/email) | `{ user:{id,username,name,role} }` |
| Error shape | message/error at body top level; `x-request-id` header | `{ error:{code,message,request_id,details?} }` in the body; header is fallback |
| Refresh | speculative `POST /auth/refresh` | route does not exist — helper removed |
| Listing | n/a | `{ data, pagination }` envelope |

Client changes: `src/backend/types.ts` (ApiError carries `backendCode`,
`requestId`, `details`; added `BackendErrorEnvelope` + guard), `apiClient.ts`
(body-envelope parsing, query support, `request_id` preferred over header),
`authApi.ts` (username/token/expires_at/user, refresh removed),
`secureStorage.ts` + `SessionContext.tsx` (token/expiresAt/user fields),
`LoginScreen.tsx` (username field).

## Scenario-payload boundary (honest)

The MR-B read routes provide scenario **summaries** + version `metric_slugs` +
catalog metric metadata, but **NOT** full per-scenario payloads (operation
values, timestamps, per-segment detail). Those are only reachable via the
out-of-scope template / download / upload routes.

Therefore the MR-B interpreter, execution plan, and dry-run operate at the
**version-metric level**: each version metric is classified per the destination
platform using catalog metric metadata. Per-scenario per-operation detail and
exact operation counts are **deferred (scenario payload not in MR-B read scope)
to MR-C**. Operation counts that are not directly returned by the backend are
labeled **estimated / deferred**, never asserted, and no per-segment values or
timestamps are fabricated.

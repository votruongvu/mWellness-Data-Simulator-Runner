# mWellness-Mobile-Runner — Wiring Paths

Canonical data-flow paths (`W-MWR-NNN`). Each names the hops a feature flows
through so reviews can audit the full chain end to end. Seeded at framework
bootstrap (MR-FRAMEWORK-00, 2026-06-27).

> RN-side module/file names per hop are `TO_VERIFY` until the app is
> scaffolded ([`repository-map.md`](repository-map.md)). The *shape* of each
> path is authoritative now; the concrete files land with their phase. Each
> path follows the operating principle: **backend runnable scenario
> contract first -> mobile execution plan second -> platform writer
> third.**

## W-MWR-001 — Login -> session

Credentials/session flow -> MWDS auth API -> `UserSession` -> token/session
material stored **by reference** in Keychain/Keystore.

Rule: tokens never logged or stored in plain storage; secret-by-reference
only; expired sessions handled (refresh or re-login); logout clears local
session state.

## W-MWR-002 — Fetch test cases -> version -> ordered scenarios -> metric metadata

Authenticated session -> `GET` runnable test cases -> select case +
version -> load the immutable version config snapshot -> load **ordered**
scenarios -> load catalog **metric metadata** (unit / data shape / platform
support).

Rule: data comes from the authenticated backend API (no fabrication);
backend order is authoritative; mobile does not mutate version or scenario
order; a missing backend API is documented and STOPs for human approval —
never fabricated.

## W-MWR-003 — Interpret -> execution plan

Validated scenario payloads + metric metadata -> interpreter (parse into
runner models) -> execution plan builder -> classify each operation
`writable | unsupported | permission_missing | invalid | skipped`; blocked
operations carry a `reason_code`.

Rule: never author/validate/mutate/reorder scenarios; an invalid payload
blocks the run with a reason; relative time resolves to absolute via an
injected clock (deterministic replay; no ambient `Date.now()`/`Math.random()`).

## W-MWR-004 — Dry-run preview

Execution plan -> dry-run executor -> computes/labels **what would be
written** per operation -> dry-run result (ZERO real writes).

Rule: dry-run performs no native write/network mutation; output is clearly
labelled dry-run; dry-run is the default; no code path bypasses the dry-run
flag.

## W-MWR-005 — Capability + permission check

Selected platform/metrics -> capability check (platform availability +
write support) -> permission state check -> **explain to the user** ->
native OS permission request -> capability + permission result feeds plan
classification.

Rule: check capability **before** requesting permission; permission is
explained BEFORE the native OS prompt; denied/partial permission **fails
closed** and is surfaced (`permission_missing`).

## W-MWR-006 — Apple Health write (iOS)

Approved (writable) plan operations -> Apple Health writer adapter -> map to
`HKQuantityType`/`HKCategoryType`/workout type + `HKUnit` -> request/respect
**share authorization** -> native write (permitted types only) -> uniform
result (succeeded | skipped_unsupported+`reason_code` | failed+`reason_code`).

Rule: correct type + unit; idempotent (no duplicate samples on re-run);
denied type fails closed; **never report success unless the native write
actually succeeded**; HealthKit is **iOS only**, never confused with Health
Connect; entitlement + `Info.plist` usage strings added only with the
writer.

## W-MWR-007 — Health Connect write (Android)

Approved (writable) plan operations -> Health Connect writer adapter -> map
to the correct **Record type** + unit -> request/respect **write
permissions** -> native insert (supported record types only;
`clientRecordId`(+version) for idempotency) -> uniform result.

Rule: correct Record type + unit; idempotent via `clientRecordId`; denied
permission fails closed; **never report success unless the native insert
actually succeeded**; **target is Health Connect — never "Google
HealthKit", never Google Fit**; manifest WRITE_* perms added only with the
writer.

## W-MWR-008 — Run result -> optional backend report

Per-operation writer results -> aggregate run result (`summary{total,
succeeded, failed, skipped}` + `errors[].reason_code`) -> show in the UI ->
**optionally** report to the backend (`POST /mobile/runs`, MR6).

Rule: run mode (dry-run vs real) is honest in the result; partial success
surfaced; redacted (no token/raw-payload leakage); a dry-run never claims a
real write; if the run-reporting API is absent, document the gap — do not
fabricate.

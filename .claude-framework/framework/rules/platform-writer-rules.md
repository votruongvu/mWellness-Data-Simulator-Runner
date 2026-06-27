# Platform Writer Rules — mWellness-Mobile-Runner (MWR)

The platform writer boundary and the two writer contracts: **Apple Health /
HealthKit (iOS)** and **Android Health Connect**. Operationalizes
`PLATFORM_WRITER_GATE`, `APPLE_HEALTH_WRITE_GATE`,
`HEALTH_CONNECT_WRITE_GATE`, `CAPABILITY_PERMISSION_GATE`, and
`NO_FAKE_SUCCESS_GATE`.

## PW-0 — The only two write destinations
MWR writes to exactly two destinations:
- **Apple Health / HealthKit** on iOS (PW-4).
- **Android Health Connect** on Android (PW-5).

There is **no** vendor SDK, **no** Google Fit, and **no** internal/file-export
write destination. A new platform/destination/vendor is a human approval gate.
The **backend run-reporting client** is **not** a write destination — it is a
separate concern; see [`backend-api-rules.md`](backend-api-rules.md).

## PW-1 — The writer boundary
A platform writer consumes **approved execution-plan operations only** (see
[`execution-plan-rules.md`](execution-plan-rules.md)) and emits the platform's
native shape. The boundary is one-way: **execution plan -> writer adapter ->
native health store**. Plan/contract code never imports a platform SDK; writer
code never authors plan operations or scenario values.

```text
approved execution-plan operation -> [mapper: operation -> native shape] -> [writer: native write/insert] -> result (status + reason_code)
```

## PW-2 — Mapping is explicit, typed, and unsupported-surfaced
Each writer declares an explicit, typed mapping from a plan operation's metric
-> native type + unit / record. If a metric is **unsupported** by the
platform, the writer **surfaces it and skips it with a `reason_code`
(`unsupported`) — it is never silently dropped** (silent drop = P0). Unit
conversions are explicit and tested. Per-metric handling is honored.

## PW-3 — Capability + permission + dry-run honored at the boundary
Before any real write the writer requires: a platform **capability** check, a
**permission** check (the permission explained before the OS prompt), and the
**dry-run** flag. A denied/partial permission **fails closed** (no write) and
is surfaced. Under dry-run the writer produces the mapped native payload + a
"would write" result, **never a real write**.

## PW-4 — Apple Health / HealthKit writer contract (iOS)
- Maps a plan operation -> `HKQuantitySample` / `HKCategorySample` / workout
  with the correct `HKQuantityType`/`HKCategoryType`/workout type + `HKUnit`.
- Requests + respects HealthKit **share (write) authorization**; a denied type
  **fails closed**.
- Writes only **permitted** types; **idempotent** (no duplicate samples on
  re-run — track written sample identity).
- **HealthKit is Apple/iOS only.** It is never an Android target and is never
  confused with Health Connect.
- Entitlement + `Info.plist` usage strings are added **only with** the writer.
- **Never reports success unless the native write actually succeeded.**

## PW-5 — Android Health Connect writer contract
- Maps a plan operation -> Health Connect **Record** types (e.g.
  `StepsRecord`, `HeartRateRecord`, `SleepSessionRecord`) with correct units.
- Requests + respects Health Connect **write permissions**; a denied
  permission **fails closed**.
- Writes only supported record types; **idempotent** via `clientRecordId`
  (+version) — a re-run updates/dedupes, never blind-duplicates.
- **The target is Android Health Connect.** It is **never** "Google HealthKit"
  and **never** Google Fit (R-MWR-010; P0 terminology defect in current
  truth).
- `AndroidManifest` write permissions are added **only with** the writer.
- **Never reports success unless the native insert actually succeeded.**

## PW-6 — Writer results are uniform + honest
Every writer returns a uniform result: per-operation status (`written` /
`would_write` (dry-run) / `skipped` (+`reason_code`, e.g. `unsupported` /
`permission_missing`) / `failed` (+ error class)), and counts. Partial success
is represented honestly; nothing is reported as success that did not natively
succeed (`NO_FAKE_SUCCESS_GATE`). The aggregate feeds run reporting (see
backend-api-rules `RUN_REPORTING_GATE`).

## PW-7 — Per-platform writability is verified, not assumed
Whether a given catalog metric is writable on a given platform is verified
**per phase** and recorded; the framework never assumes every metric is
writable. Until confirmed, writability is `TO_VERIFY`.

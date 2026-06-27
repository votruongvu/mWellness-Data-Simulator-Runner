# mWellness-Mobile-Runner — Test Map

Planned test suites for the MWR app + the safety/invariant tests that must
travel with the surface they protect. Seeded at framework bootstrap
(MR-FRAMEWORK-00, 2026-06-27).

> **The app + test suite do not exist yet.** All suites below are **to be
> created during MR1+** (the phase that lands the surface). The *categories*
> and required coverage are authoritative now; the test runner/harness
> (Jest / React Native Testing Library / native harness) is `TO_VERIFY`
> until the RN baseline is set.

## Test categories (to be created during MR1+)

| Category | Required coverage |
|---|---|
| **Unit** | Scenario interpretation, relative->absolute time resolution, plan builder, capability classification, error/`reason_code` derivation. |
| **Component (RNTL)** | Run-flow states (idle/loading/plan-built/dry-run/confirming/executing/result/error); confirmation gates; permission states; error states. |
| **API integration** | Auth (login/refresh/logout/me); test case fetch; version/scenario fetch; metric metadata; error handling; redaction. |
| **Native adapter** *(where feasible)* | Capability, permission, and write success/failure mapping for Apple Health / Health Connect. |
| **Manual QA** | Real iOS/Android devices: capability -> explained permission -> dry-run preview -> confirmed write -> result verification. |

## Mandatory invariant tests (travel with the surface)

These are the safety/invariant tests that **must** accompany the surface
they protect. Each maps to a crown-jewel gate
([`../framework/rules/gates.md`](../framework/rules/gates.md)).

| Invariant test | Protects | Gate |
|---|---|---|
| `dry-run-no-write` | Dry-run performs ZERO real writes; output labelled dry-run; dry-run is the default; no path bypasses the flag. | `DRY_RUN_NO_WRITE_GATE` |
| `no-fake-success` | A write is reported successful only if the native write/insert actually succeeded; denied/failed writes are NOT reported as success. | `NO_FAKE_SUCCESS_GATE` |
| `no-real-PHI` | Test data/fixtures/scenarios/logs contain no real PHI/PII, no real token/account/device id. | `TEST_DATA_SAFETY_GATE` |
| `unsupported-surfaced` | An unsupported metric is surfaced + skipped-with-`reason_code`, never silently dropped. | `PLATFORM_WRITER_GATE` |
| `secret-redaction` | No raw token/auth header/raw payload in logs/reports; secret resolved from reference. | `SECRET_AND_ENDPOINT_SAFETY_GATE` |
| `capability/permission fail-closed` | Capability checked before permission request; denied/partial permission fails closed and is surfaced. | `CAPABILITY_PERMISSION_GATE` |
| `execution determinism / replay` | Replaying a stored plan is deterministic; relative time resolves via an injected clock; no ambient `Date.now()`/`Math.random()` in the run path. | `EXECUTION_DETERMINISM_GATE` |

## TO_VERIFY

- Test runner + native test harness availability once the RN baseline is
  confirmed (ADR-MWR-001).
- Concrete regression fixtures: see
  [`regression-fixtures.md`](regression-fixtures.md).
- Real-device / sandbox env configuration for the device categories.

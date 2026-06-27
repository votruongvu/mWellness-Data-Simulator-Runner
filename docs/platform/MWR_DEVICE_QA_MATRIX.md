# MWR Device QA Matrix (placeholder)

> **Planning placeholder** created at MR-FRAMEWORK-01 (story MWR-FW1-006) to close
> the prior P1 follow-up (audit F1). **Manual QA status: `NOT_EXECUTED`** — nothing
> here asserts that any device test has been run. Exact named devices and OS
> versions are **`TO_VERIFY`** and **must be finalized before MR4/MR5 real-write POC
> approval** (hard human-approval gates). Master REQ §13 is canonical.

## Ground rule (load-bearing)
**Simulator / emulator CANNOT be the sole validation for real health writes.** A
real Apple Health write (MR4) and a real Health Connect write (MR5) must be verified
on a **real physical device** with the real health store, under the no-fake-success
rule. Simulator/emulator is acceptable only for dry-run, UI/state, and capability
negative paths.

## iOS — Apple Health / HealthKit
| Dimension | Target (TO_VERIFY) | Notes |
|---|---|---|
| Min iOS version | `TO_VERIFY` (e.g. iOS 16+/17+) | Confirm against HealthKit write API availability for the chosen metrics. |
| Real device (required for MR4) | `TO_VERIFY` (named iPhone) | HealthKit write must be on a real iPhone; **simulator cannot validate real writes**. |
| HealthKit availability | check before permission | Unavailable on iPad/simulator → Unsupported-Platform (iOS) state; Dry-run only. |
| Permission states to test | granted · partial · denied · not-requested | Explain-before-prompt; fail-closed; denied metric skipped (`PERMISSION_MISSING`). |
| Idempotency | re-run no duplicate samples | sample identity; verify on device. |
| Entitlements / Info.plist | gated to the writer brief | `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription` — `TO_VERIFY`. |

## Android — Health Connect
| Dimension | Target (TO_VERIFY) | Notes |
|---|---|---|
| Min Android API | `TO_VERIFY` (e.g. API 30/34+) | Confirm Health Connect availability per OS version. |
| Real device (required for MR5) | `TO_VERIFY` (named Android phone) | Real Health Connect insert must be on a real device. |
| Health Connect installation | check installed/available | Not installed → Unsupported-Platform (Android) state → Install Health Connect / Dry-run only. |
| Permission states to test | granted · partial · denied · not-requested | Health Connect permission UI; fail-closed; denied metric skipped. |
| Idempotency | re-run no duplicate records | `clientRecordId`(+version); verify on device. |
| Manifest permissions | gated to the writer brief | `android.permission.health.WRITE_*` — `TO_VERIFY`. |

## Cross-platform states to cover (manual QA)
dry-run (no write) · capability supported/partial/unsupported · permission
granted/partial/denied · unsupported metric skipped-with-reason · partial success ≠
success · `NATIVE_WRITE_FAILED` surfaced · backend unavailable / session expired ·
redaction (no tokens/PHI in logs).

## Ownership & sign-off (TO_VERIFY)
| Role | Owner |
|---|---|
| iOS device QA | `TO_VERIFY` |
| Android device QA | `TO_VERIFY` |
| Real-write POC sign-off (MR4/MR5) | Human Decision Owner (hard gate) |

## Dependency
**MR4 (Apple Health) / MR5 (Health Connect) real-write POC approval is BLOCKED until
this matrix names concrete devices/OS versions and a real-device QA owner.** Linked
from the roadmap ([`../roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md`](../roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md))
and the health-write safety doc ([`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)).

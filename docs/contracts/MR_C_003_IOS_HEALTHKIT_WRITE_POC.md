# MR-C-003 — iOS Guarded HealthKit Write POC (implemented)

**Story:** MWR-MRC-003 · **Date:** 2026-06-28 · **Scope:** internal/dev POC, **iOS
only**, minimal metric set. **Gates #1/#3/#9/#10 human-approved (ADR-MWR-011).**
**Device QA: `NOT_EXECUTED`** (no real device — the on-device write was not run and
is **not** claimed to have passed; a simulator cannot validate a real health write).

> ## Result: implemented + **iOS build-verified** (compiles + links HealthKit). Runtime write needs a real device.

## What was built
| Layer | File | Notes |
|---|---|---|
| TS bridge (write) | `src/health/healthKitBridge.ts` | `HealthKitBridge.writeQuantitySamples` + `NativeWriteSample`/`NativeWriteResult`/`NativeWriteStatus`; fail-closed default returns `failed` (never success). |
| TS writer | `src/health/healthKitWriter.ts` | `executeGuardedWrite` — enforces the **five-gate chain** (no native write if any gate unmet), classifies ops (writable / skipped_unsupported / skipped_invalid_payload), resolves relative→absolute time via the **injected clock**, maps native results verbatim, computes **partial≠full** success. Minimal set = `stepCount` only. |
| Native module | `ios/mWellnessMobileRunner/MwrHealthKit.{h,mm}` | Obj-C++ `RCTBridgeModule` (prefix `Mwr<Capability>`). `isHealthDataAvailable` / `getShareStatus` / `requestShareAuthorization` (fires the OS prompt) / `writeQuantitySamples` (guarded `HKHealthStore` save). **No fake success** — `succeeded` only inside the save success branch; denied→`skipped_permission`, unsupported→`skipped_unsupported`, incomplete→`skipped_invalid_payload`. Idempotency via `HKMetadataKeySyncIdentifier` = backend `idempotency_key` (+`SyncVersion`). |
| Entitlement | `ios/mWellnessMobileRunner/mWellnessMobileRunner.entitlements` | `com.apple.developer.healthkit` = true. |
| Info.plist | `ios/mWellnessMobileRunner/Info.plist` | `NSHealthUpdateUsageDescription` + `NSHealthShareUsageDescription` — the **approved** readiness-packet §3 copy. |
| Xcode project | `…/project.pbxproj` | `MwrHealthKit.{h,mm}` added (mm in Sources), `HealthKit.framework` linked, `CODE_SIGN_ENTITLEMENTS` set (via the `xcodeproj` gem). |
| UI | `src/screens/HealthWritePocScreen.tsx` (+ nav + a post-dry-run entry on `DryRunResultScreen`) | Real-write mode (danger banner + approved confirm copy + confirm checkbox); capability + permission status; live five-gate checklist; **the write button is DISABLED until all five gates pass**; result summary (succeeded/failed/skipped, partial vs full). |
| Tests | `__tests__/health/healthKitWriter.test.ts` (+11) | gate enforcement (no native call when any gate unmet), skip classification, injected-clock time, **no fake success**, partial≠full. Total **jest 72/72**. |

## Minimal metric set implemented
**`stepCount` only** (`HKQuantityType(.stepCount)` · `HKUnit.count()`). Every other
metric → `skipped_unsupported`. Coverage is intentionally NOT broadened (story non-goal).
An op missing `value`/`unit`/`time`/`idempotency_key` → `skipped_invalid_payload` (never fabricated).

## Write gate enforcement
```
dry_run_completed AND payload_source_verified AND capability_checked
AND permission_resolved_or_granted AND explicit_confirmation   → then a guarded save()
```
`executeGuardedWrite` calls the native bridge ONLY when all five are true (proven by a
test asserting the bridge is never called when any gate is false). The native module
**re-checks** support + `SharingAuthorized` per sample (defense-in-depth) before any save.

## No fake native success (binding)
- Native: `@"succeeded"` is added **only** inside `saveObject:withCompletion:` `if (success)`.
- TS: a sent sample with no native result → `failed` (never assumed success); partial
  success is a distinct terminal state from full success in both the summary and the UI.

## Per-operation result statuses
`succeeded` · `failed` · `skipped_permission` · `skipped_unsupported` ·
`skipped_invalid_payload` · `cancelled`.

## Validation
- `npx tsc --noEmit` clean · `npx jest` **72/72** (12 suites).
- iOS: `bundle exec pod install` OK; **`xcodebuild` (Debug, iphonesimulator, no signing) → `** BUILD SUCCEEDED **`** — `MwrHealthKit.mm` compiles and links `HealthKit.framework`; `.app` produced. (Fixed during bring-up: `concept` is a C++20 keyword → renamed `conceptName`; HealthKit.framework explicitly linked.)
- `validate-framework.sh` PASS · internal links 0 broken · scope guards: no Android/Health Connect/Google Fit, no backend run reporting, no MR-D.
- Lint still blocked by the pre-existing prettier/eslint mismatch (P2, unrelated).

## Device QA — `NOT_EXECUTED`
No real iPhone was available. The **build** is verified (compile + link), but the real
permission prompt, the actual HealthKit write, idempotency on re-run, and the Apple Health
verification were **not** run on a device and are **not** claimed to have passed. Per the
device-QA ground rule, a simulator cannot validate a real write.

## Constraints honored
iOS only · internal/dev · minimal metric set · no production-readiness claim · no Android ·
no Google Fit/vendor · no backend run reporting · no MR-D orchestration · five-gate chain not
weakened · written samples not claimed reversible.

## Followups
- **P1:** real-device QA — run on a named iPhone (record device/iOS/owner, prompt observed,
  write result, Apple Health verification, idempotency on re-run) per the readiness packet §2.
- **P1:** finalize permission UX vs the approved design P10/P11 (gate #10) if any drift.
- **P2:** the pre-existing ESLint prettier-plugin mismatch.

## MR-C-004 readiness
**BLOCKED** — Android Health Connect write POC needs gate #2 (Health Connect write) + a real
Android device + Health Connect; out of scope here (no Android changes).

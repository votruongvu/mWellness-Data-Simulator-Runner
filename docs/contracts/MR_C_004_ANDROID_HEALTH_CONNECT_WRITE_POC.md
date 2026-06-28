# MR-C-004 — Android Health Connect Guarded Write POC (implemented)

**Story:** MWR-MRC-004 · **Date:** 2026-06-28 · **Scope:** internal/dev POC,
**Android only**, minimal metric set. **Gate #2 human-approved (ADR-MWR-012).**
**Device QA: `NOT_EXECUTED`** (no real Android device — the on-device write was not
run and is **not** claimed to have passed). Mirrors the iOS POC
([`MR_C_003_IOS_HEALTHKIT_WRITE_POC.md`](MR_C_003_IOS_HEALTHKIT_WRITE_POC.md)).

> ## Result: implemented + **Android build-verified** (`./gradlew :app:assembleDebug` → `BUILD SUCCESSFUL`, APK produced). Runtime write needs a real device.

## What was built
| Layer | File | Notes |
|---|---|---|
| Shared TS bridge | `src/health/healthKitBridge.ts` | `resolveHealthBridge()` selects the iOS `MwrHealthKit` or Android `MwrHealthConnect` native module (never both → **platform separation**); `normalizeNativeBridge(native, mapStatus)` parametrized by a per-platform status mapper. The `HealthKitBridge` interface is the **shared** write-bridge contract. |
| Shared TS capability | `src/health/healthCapability.ts` (new) | `evaluateHealthCapability({platform, bridgePresent, nativeIsAvailable})` — fail-closed; destination label Apple Health / **Health Connect**. |
| TS status mapper | `src/health/healthPermission.ts` | `mapAndroidShareStatus` (granted→authorized, denied→denied, not_granted→not_determined, else→unavailable, fail-closed). |
| Native module | `android/app/.../MwrHealthConnectModule.kt` + `MwrHealthConnectPackage.kt` | Kotlin `ReactContextBaseJavaModule` + `ActivityEventListener` (prefix `Mwr<Capability>`). `isHealthDataAvailable` (`getSdkStatus == SDK_AVAILABLE`) / `getShareStatus` (`getGrantedPermissions`) / `requestShareAuthorization` (Health Connect permission `ActivityResultContract`) / `writeQuantitySamples` (guarded `insertRecords`). **No fake success** — `succeeded` only when `insertRecords` doesn't throw; denied→`skipped_permission`, unsupported→`skipped_unsupported`, incomplete/non-positive→`skipped_invalid_payload`. Idempotency via `Metadata.clientRecordId` = backend `idempotency_key`. |
| Registration | `MainApplication.kt` | `add(MwrHealthConnectPackage())` in `getPackages()`. |
| Gradle | `android/app/build.gradle` · `android/build.gradle` | `androidx.health.connect:connect-client:1.1.0-alpha07` + `kotlinx-coroutines-android`; **minSdk 23→26** (connect-client floor). |
| Manifest | `AndroidManifest.xml` | `android.permission.health.WRITE_STEPS`; `<queries>` for the Health Connect package; permission-rationale entry points (Android <14 intent-filter + Android 14+ `activity-alias`). |
| UI | `src/screens/HealthWritePocScreen.tsx` (shared) + `DryRunResultScreen` entry | The MR-C-003 write screen is now **shared** via `resolveHealthBridge`; shows the platform write target (Apple Health / Health Connect), capability + permission status, the live five-gate checklist, the confirm checkbox (approved copy), and the result summary. **Write button DISABLED until all five gates pass.** |
| Tests | `__tests__/health/healthConnect.test.ts` (+6) | `mapAndroidShareStatus`, Android capability fail-closed, and **platform separation** (Android binds `MwrHealthConnect`; iOS ignores it; fail-closed gate-pending without the module). Total **jest 78/78**. |

## Minimal metric set implemented
**`stepCount` → Health Connect `StepsRecord`** (`HealthPermission.getWritePermission(StepsRecord::class)`,
unit = count). Every other metric → `skipped_unsupported`. An op missing
`value`/`time`/`idempotency_key`, or a non-positive count → `skipped_invalid_payload` (never fabricated).

## Write gate enforcement
The shared `executeGuardedWrite` enforces the five-gate chain BEFORE any native call (no bridge
call when any gate is unmet — test-proven); the UI disables the write button until all five pass.
The native module **re-checks** `getGrantedPermissions()` per sample (defense-in-depth) before any insert.

## No fake native success (binding)
- Native: `succeeded` is added **only** after `insertRecords(...)` returns without throwing; an
  exception → `failed` with the message; `getSdkStatus != SDK_AVAILABLE` → `failed`.
- TS: a sent sample with no native result / a native throw → `failed`; partial success is distinct
  from full success in summary + UI.

## Per-operation result statuses
`succeeded` · `failed` · `skipped_permission` · `skipped_unsupported` ·
`skipped_invalid_payload` · `cancelled`.

## Validation
- `npx tsc --noEmit` clean · `npx jest` **78/78** (13 suites).
- Android: **`./gradlew :app:assembleDebug` → `BUILD SUCCESSFUL` (50s)** — the Kotlin module
  compiles, `connect-client` resolves, the manifest merges, `app-debug.apk` produced. (Only benign
  Kotlin null-safety warnings.)
- iOS: **native unchanged** (no `MwrHealthKit`/entitlement/Info.plist/pbxproj edits) → **no iOS
  regression**; the shared-TS iOS path is covered by `tsc` + the iOS component/unit tests (all green).
  A full iOS `xcodebuild` was not re-run (no iOS native change; Debug builds don't bundle JS).
- `validate-framework.sh` PASS · internal links 0 broken · scope guards: **no Google Fit, no vendor
  SDK, no backend run reporting, no MR-D**.

## Android Device QA — `NOT_EXECUTED`
No real Android device with Health Connect was available. The **build** is verified, but the real
Health Connect permission flow, the actual `insertRecords` write, idempotency, and Health-Connect-app
verification were **not** run and are **not** claimed to have passed.

## Constraints honored
Android only · internal/dev · minimal metric set · no production-readiness claim · no iOS change
beyond shared TS · no Google Fit/vendor · no backend run reporting · no MR-D · five-gate chain not
weakened · written records not claimed reversible.

## Followups
- **P1:** real-device QA — run on a named Android device with Health Connect (record device/OS/owner,
  permission flow, write result, Health Connect verification, idempotency).
- **P1:** the `minSdk 23→26` bump drops Android 7.x support — confirm acceptable for the product.
- **P2:** clean up the benign Kotlin null-safety warnings; the pre-existing ESLint prettier mismatch.

## MR-C-005 closeout readiness
MR-C-005 (native-writer QA closeout + mapping backlog) can be **STARTED as a docs/closeout task**:
both writers (iOS MR-C-003 + Android MR-C-004) are implemented + build-verified with Device QA
`NOT_EXECUTED`; MR-C-005 would consolidate the per-platform metric mapping backlog + the device-QA
runbooks and record the MR-C phase closeout. It does **not** require a real device to author.

# MR-C-003A — iOS HealthKit Real-Device QA Runbook

**Date:** 2026-06-28 · **Type:** docs/runbook (+ checklist) only — **no new native
feature, no metric expansion, no Android, no backend reporting.** Validates the
MR-C-003 guarded HealthKit write POC ([`../contracts/MR_C_003_IOS_HEALTHKIT_WRITE_POC.md`](../contracts/MR_C_003_IOS_HEALTHKIT_WRITE_POC.md))
on a **real iPhone**.

> ## Current status: **Device QA `NOT_EXECUTED`.**
> A paired **iPhone 13 mini (`iPhone14,4`)** was detected on this Mac (`devicectl`,
> "available (paired)"), but the QA was **not executed**: the steps below are
> interactive human actions (tapping the OS permission sheet, granting/denying,
> visually verifying the Apple Health app) and the HealthKit dev build needs a
> signing team + a HealthKit-enabled App ID/provisioning profile that are not
> configured here. **No real-device pass is claimed.** A human runs this runbook
> and records the result in §6.

## 1. Prerequisites (the human QA owner provides)
| Item | Needed | Detected / status |
|---|---|---|
| Real iPhone (not a simulator) | physical device | **candidate detected:** iPhone 13 mini (`iPhone14,4`), paired — confirm it is an approved DEV/QA device |
| iOS version | iOS 16+ (confirm HealthKit write availability for stepCount) | `TO_VERIFY` |
| Developer Mode | enabled on the device (Settings → Privacy & Security → Developer Mode) | `TO_VERIFY` |
| Apple Developer team | a signing team (`DEVELOPMENT_TEAM`) | `TO_VERIFY` |
| App ID + provisioning | bundle id with the **HealthKit** capability enabled; a device provisioning profile | `TO_VERIFY` (template bundle id `org.reactjs.native.example.mWellnessMobileRunner` must be replaced with a real, HealthKit-enabled id) |
| Backend | MWDS reachable for the F8 payload (login + a test case/version with a `steps` op) | `TO_VERIFY` |
| QA owner | named, accountable person | `TO_VERIFY` |

## 2. Build + install the dev build (one-time)
The HealthKit entitlement requires real signing — easiest via Xcode:
1. `cd ios && bundle exec pod install` (re-integrate Pods).
2. Open `ios/mWellnessMobileRunner.xcworkspace` in Xcode.
3. Target `mWellnessMobileRunner` → Signing & Capabilities: set your **Team**, set a
   **HealthKit-enabled bundle identifier**, confirm the **HealthKit** capability is
   present (it reads `mWellnessMobileRunner.entitlements`).
4. Select the real device; **Run** (⌘R) to build + install + launch.
   - CLI alternative: `xcodebuild -workspace mWellnessMobileRunner.xcworkspace -scheme mWellnessMobileRunner -configuration Debug -destination 'id=<DEVICE_UDID>' -allowProvisioningUpdates DEVELOPMENT_TEAM=<TEAMID> build` then `xcrun devicectl device install app --device <DEVICE_UDID> <path/to/.app>`.
5. Start Metro (`npm start`) so the JS bundle loads, and ensure the app can reach the
   MWDS backend; log in.

## 3. QA steps (each: action → expected → pass criterion)
| # | Step | Action | Expected | Pass criterion |
|---|---|---|---|---|
| 3.1 | HealthKit availability | Open the app on the device; navigate to the write POC | Capability shows **available** (real device) | `available` (not `bridge_unavailable`/`unavailable_device`) |
| 3.2 | Explain-before-prompt | Browse a test case → version → **Run dry-run** (operation path) → "Run guarded iOS write POC" | The pre-prompt **explanation** is shown; **no OS prompt has appeared yet** | Explanation visible BEFORE any system sheet |
| 3.3 | OS prompt fires only on tap | Tap "I understand — continue", then "Request HealthKit permission" | The **iOS HealthKit permission sheet** appears (write access for steps), with the approved Info.plist copy | Sheet appears ONLY after the explicit tap (no silent prompt) |
| 3.4 | Grant permission | Allow **steps** write in the sheet | Permission status → **granted**; `capability_checked` + `permission_resolved_or_granted` gates turn **met** | Both gates met; no error |
| 3.5 | Confirm + write | Tick the confirm checkbox → tap **Run guarded write POC** | The button was **disabled until all five gates met**; one `stepCount` write executes using the **F8 payload value** | Write button was disabled pre-gates; write runs |
| 3.6 | Result status | Read the result summary | **Succeeded = 1** (or **failed** with a native message if HK rejects); **partial ≠ full** rendered distinctly | Succeeded reflects the **actual** native result (no fake success) |
| 3.7 | Apple Health visibility | Open **Health** app → Browse → Activity → Steps (or Sources → this app) | The written step sample is visible with the **F8 payload value** + the run's time window | Sample present, value matches the payload (not fabricated) |
| 3.8 | Idempotency (re-run) | Re-run the same write POC | No **duplicate** sample (same `HKMetadataKeySyncIdentifier` = `idempotency_key`) | Re-run does not double-write |
| 3.9 | Denied path (if practical) | Reset permissions (Settings → Health → this app → turn off Steps) or fresh install → deny in the sheet | Status → **denied**; the write reports **skipped_permission**; **nothing written** | Denied → `skipped_permission`, no fake success, no sample in Health |
| 3.10 | Cancelled path (if practical) | Start the flow, then leave before ticking confirm / tapping write | No write attempted; gate chain shows `explicit_confirmation` unmet | No write without explicit confirmation |

## 4. Safety assertions to confirm on device
- **No silent prompt:** 3.2/3.3 — the explanation always precedes the OS sheet.
- **No fake success:** 3.6/3.9 — a denied/failed write is never shown as success; the
  succeeded count equals the actual HealthKit save count.
- **No write without the five gates:** 3.5/3.10 — the write button is disabled until all
  five gates are met; cancelling leaves nothing written.
- **No fabricated values:** 3.7 — the Apple Health sample value equals the backend F8 value.
- **Not reversible:** an already-written sample is real device data (delete via Health if needed).

## 5. Minimal-set / scope reminder
Only **`stepCount`** is writable in this POC; any other metric is `skipped_unsupported`.
No metric expansion, no Android, no backend run reporting, no MR-D in this QA.

## 6. Results record (fill on execution)
```
Device model ........ ____________________  (candidate detected: iPhone 13 mini / iPhone14,4)
iOS version ......... ____________________
Apple ID / team ..... ____________________
QA owner ............ ____________________
Date ................ ____-__-__

3.1 HealthKit availability ...... PASS / FAIL / N/A   note: __________
3.2 Explain-before-prompt ....... PASS / FAIL / N/A   note: __________
3.3 OS prompt on tap ............ PASS / FAIL / N/A   note: __________
3.4 Grant permission ............ PASS / FAIL / N/A   note: __________
3.5 Confirm + write ............. PASS / FAIL / N/A   note: __________
3.6 Result status ............... PASS / FAIL / N/A   note: __________
3.7 Apple Health visibility ..... PASS / FAIL / N/A   note: __________
3.8 Idempotency (re-run) ........ PASS / FAIL / N/A   note: __________
3.9 Denied path ................. PASS / FAIL / N/A   note: __________
3.10 Cancelled path ............. PASS / FAIL / N/A   note: __________

OVERALL Device QA: PASS / FAIL / NOT_EXECUTED
Failures / limitations: ________________________________________________
```

## 7. Current record
**Device QA: `NOT_EXECUTED`** (2026-06-28). A candidate device was detected
(`iPhone 13 mini / iPhone14,4`, paired) but the interactive on-device steps + the
signing/provisioning setup were not performed here. No real-device write, prompt, or
Apple Health visibility is claimed. The codebase is **not blocked** — MR-C-003 remains
implemented + iOS build-verified; this runbook is ready for a human to execute and
record above (then mirror into [`MWR_DEVICE_QA_MATRIX.md`](MWR_DEVICE_QA_MATRIX.md) §2
and the readiness packet §2).

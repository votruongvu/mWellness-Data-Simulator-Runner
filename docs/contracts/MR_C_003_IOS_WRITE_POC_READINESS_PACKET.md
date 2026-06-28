# MR-C-003 — iOS Guarded HealthKit Write POC · Readiness Packet

**Story (next):** MWR-MRC-003 (`ios-guarded-healthkit-write-poc`) · **Date:** 2026-06-28
· **Type:** docs/planning only. **No native module, no Info.plist/entitlement change,
no permission prompt, no sample write, no real-write button were created by this packet.**

This packet collects the exact human approvals, device-QA details, native
entitlement/Info.plist requirements, and final permission copy a reviewer needs in
order to authorize the first **real** Apple Health (HealthKit) write. It builds on the
MR-C-002 guarded seam ([`MR_C_002_HEALTHKIT_CAPABILITY_PERMISSION_BRIDGE.md`](MR_C_002_HEALTHKIT_CAPABILITY_PERMISSION_BRIDGE.md)).

---

## 0. GO / NO-GO decision — **CONDITIONAL GO** (gates approved 2026-06-28; on-device write BLOCKED pending a named device)
The four human-approval gates are **APPROVED** (Human Decision Owner, 2026-06-28; ADR-MWR-011 + §7).
Implementation of the native scaffolding + the guarded write path may proceed. **But the real
on-device write + QA sign-off remain BLOCKED** — the §2 device-QA fields were submitted as unfilled
placeholders, so no real device/owner is named (not fabricated).

| # | Item | State |
|---|---|---|
| B1 | Human gate **#1** (real Apple Health auth/write) | ✅ APPROVED 2026-06-28 — minimal write POC only |
| B2 | Human gate **#3** (OS prompt timing + the copy in §3) | ✅ APPROVED 2026-06-28 |
| B3 | Human gate **#9** (HealthKit entitlement + Info.plist + native module + ADR-MWR-011) | ✅ APPROVED 2026-06-28 |
| B4 | Human gate **#10** (MR-C-003 permission UX) | ✅ APPROVED 2026-06-28 |
| B5 | A concrete **real iPhone + iOS version + named QA owner** (§2) | ❌ **STILL UNFILLED** (placeholders; not fabricated) |
| B6 | Native **`MwrHealthKit(Writer)`** module exists implementing the seam | ❌ not built (MR-C-003 impl) |
| B7 | Per-metric **writability** confirmed for the candidate set (ADR-MWR-009) | ❌ TO_VERIFY (on the named device) |

> A simulator can never validate a real write (device-QA ground rule). The gates are approved, but
> **without a named real device (§2) the real write cannot be executed or validated** — so the POC's
> defining deliverable stays BLOCKED until B5 is filled. No-fake-success forbids declaring success from a simulator.

---

## 1. Gate approval checklist (#1 / #3 / #9 / #10)
The **Human Decision Owner** approves; approval is recorded in
[`current-decisions.md`](../../.claude-framework/adapter/current-decisions.md). A gate is
never self-waived.

| Gate | Exact decision being requested | Unlocks for MR-C-003 | Status | Approver / date |
|---|---|---|---|---|
| **#1** Real Apple Health / HealthKit write | Approve that MR-C-003 may call a real `HKHealthStore` `requestAuthorization` + `save` on an approved DEV/QA device, under the five-gate chain + no-fake-success | The real-write path (else stays dry-run/seam) | ✅ APPROVED (scoped) | Human Decision Owner · 2026-06-28 |
| **#3** Permission-prompt timing + copy | Approve **(a)** the pre-prompt explanation copy in §3.1, **(b)** the Info.plist OS-prompt strings in §3.2, **(c)** that the prompt fires only on the user's explicit "Continue" tap (P10) | The OS permission prompt may fire | ✅ APPROVED (scoped) | Human Decision Owner · 2026-06-28 |
| **#9** Native substrate / ADR | Approve the §4 entitlement + Info.plist + `HealthKit.framework` link + the native `MwrHealthKit(Writer)` module, ratified by a new **ADR-MWR-011** | The native write module + entitlements | ✅ APPROVED (scoped) | Human Decision Owner · 2026-06-28 |
| **#10** UX not in approved contract | Approve that the MR-C-002 preview screen is reconciled to the **approved design P10 (Permission Explanation) + P11 (Permission Status)** ([`MOBILE_RUNNER_SAFETY_UX_MATRIX.md`](../../artifacts/design/mobile-runner/MOBILE_RUNNER_SAFETY_UX_MATRIX.md)) | The finalized permission/confirmation UX | ✅ APPROVED (scoped) | Human Decision Owner · 2026-06-28 |

*Note — gates #4 (bypass) and the on-device #5 real-write confirmation (P12) are enforced
in code by MR-C-003; they are not separate human sign-offs but must be wired before any write.*

---

## 2. Device QA details (concrete — to fill before approval)
**Manual/device QA is `NOT_EXECUTED`.** Real values are **not available to this packet and
were not fabricated.** Fill these before B5 can clear (mirror into
[`MWR_DEVICE_QA_MATRIX.md`](../platform/MWR_DEVICE_QA_MATRIX.md)).

> **Update 2026-06-28:** the gate approval submitted these fields as **unfilled placeholders**
> (`<real iPhone model>` / `<version>` / `<name>`). They remain `TO_VERIFY` — the real on-device
> write and QA sign-off **cannot proceed** until a concrete device + iOS version + named owner are
> provided. Nothing was fabricated to fill them.

| Field | Proposed target (confirm) | Filled value |
|---|---|---|
| Real iPhone model | iPhone 12 or newer (a physical device — **not** a simulator) | `TO_VERIFY` |
| iOS version | iOS 16+ (confirm HealthKit write availability for the candidate metrics) | `TO_VERIFY` |
| Apple ID / dev account | An approved **DEV/QA** Apple ID + Apple Health (not a personal/production account) | `TO_VERIFY` |
| Provisioning | App ID with **HealthKit** capability enabled + a device provisioning profile | `TO_VERIFY` |
| iOS device QA owner | (named person accountable for the on-device QA run) | `TO_VERIFY` |
| Real-write POC sign-off | Human Decision Owner (hard gate) | `TO_VERIFY` |

**Candidate metric set to QA (writability `TO_VERIFY`, per ADR-MWR-009; concept tokens —
no SDK symbol):** `stepCount`, `heartRate`, `distanceWalkingRunning`, `activeEnergyBurned`,
`bodyMass`, `sleepAnalysis`. Each must be confirmed writable on the named device/OS before it
is `approved_for_mrc`; an unconfirmed metric is surfaced as `unsupported`, never forced.

---

## 3. Final HealthKit permission copy — FOR REVIEW (gate #3)
Proposed final copy, aligned to the approved design copy bank + the terminology guard
(Apple Health = destination; HealthKit = the iOS API; Android = Health Connect, never
"Google HealthKit"/Google Fit). **Not shipped — pending gate #3 approval.**

### 3.1 Pre-prompt explanation screen (design P10 — shown BEFORE the OS prompt)
> **Apple Health write permission**
>
> To replay this backend-validated scenario, mWellness Runner needs permission to **write**
> the selected sample health data types into **Apple Health** on this device. You choose per
> type on the next screen — the iOS permission prompt.
>
> **No silent prompt — nothing is requested until you tap *Continue*.** Denied types are
> skipped, never forced. This writes **test data** on an approved DEV/QA device; no personal
> data is collected or sent.
>
> Types requested (write): {dynamic list of the run's approved concept tokens}
>
> *Primary action:* **Continue** → fires the OS permission prompt. *Secondary:* **Not now** → no prompt fires.

### 3.2 iOS OS-prompt usage strings (`Info.plist` — the system sheet copy)
| Key | Purpose | Proposed value |
|---|---|---|
| `NSHealthUpdateUsageDescription` | **WRITE** (required) | "mWellness Runner writes test (sample) health data into Apple Health to replay a backend-validated test scenario on this device. For approved DEV/QA devices only; no personal data is collected." |
| `NSHealthShareUsageDescription` | **READ** (only if MR-C-003 reads back to verify writes) | "mWellness Runner reads back the test samples it just wrote so it can verify the write actually succeeded (no fake success). For approved DEV/QA devices only." |

*Read scope (reviewer note): any READ is limited to verifying the **samples the app itself
just wrote** in this run — never historical or personal health data. This is consistent with
§3.1's "no personal data is collected or sent."*

### 3.3 Permission status copy (design P11 — after the prompt resolves)
> "{granted} of {total} types granted. Denied operations will be **skipped** (`PERMISSION_MISSING`)
> unless granted in Settings — never written without permission."

---

## 4. Entitlement / Info.plist change plan (gate #9 — PLAN ONLY, not applied)
MR-C-003 would make exactly these native changes (added **only with the writer**, per
[`MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md`](../platform/MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md)). **None are applied by this packet.**

1. **HealthKit capability + entitlement** — enable the HealthKit capability on the
   `mWellnessMobileRunner` target → `ios/mWellnessMobileRunner/mWellnessMobileRunner.entitlements`
   with `com.apple.developer.healthkit` = `true`. (Standard types only — **no** clinical-records
   entitlement.)
2. **Framework link** — link `HealthKit.framework` to the iOS app target.
3. **Info.plist** — add `NSHealthUpdateUsageDescription` (and `NSHealthShareUsageDescription`
   if reading back) with the §3.2 strings.
4. **Native module** — implement the native bridge behind the existing
   [`HealthKitBridge`](../../src/health/healthKitBridge.ts) seam. Naming to finalize in the ADR:
   MR-C-002 uses **`MwrHealthKit`** (capability/permission); the codegen guide names the writer
   **`MwrHealthKitWriter`** (`ios/MwrHealthKitWriter.h/.mm`). Prefix `Mwr<Capability>` (ADR-MWR-010).
   The module implements `isHealthDataAvailable` / `getShareStatus` / `requestShareAuthorization`
   (+ the gated `save`) and returns **structured native success/failure** — never fake success.
5. **Privacy manifest** — review `PrivacyInfo.xcprivacy` for a required health-data declaration.
6. **Provisioning** — the App ID must have HealthKit enabled + a device provisioning profile (§2).
7. **ADR-MWR-011 (new)** — author "Native iOS HealthKit writer module" ratifying the module
   name/prefix, the entitlement/framework, and the codegen approach. (Gate #9 includes any new ADR;
   ADR-MWR-009 per-metric writability also moves toward Active for the confirmed set.)

**Reversibility note:** these changes alter the native iOS project + trigger a re-sign/rebuild;
they belong in MR-C-003 under approval, not here.

---

## 5. Five-gate chain wiring MR-C-003 must enforce (already modeled + tested in MR-C-002)
```
dry_run_completed AND payload_source_verified AND capability_checked
AND permission_resolved_or_granted AND explicit_confirmation   →  then, and only then, a guarded save()
```
Plus: explain-before-prompt (`requestPermissionGuarded`), the on-device real-write confirmation
(design P12, danger banner + confirm checkbox), and no-fake-success (success = the actual native
`save` result; denied/unsupported skipped with `reason_code`). MR-C-003 plugs the native module
into this existing, tested chain — it does not re-implement or weaken it.

---

## 6. MR-C-003 scope preview (what approval authorizes — for the reviewer)
A **single-metric, single-device** guarded write POC: one approved metric (e.g. `stepCount`)
written to Apple Health on the named DEV/QA iPhone, behind the full gate chain, with negative
tests proving a denied/failed write is **not** reported as success and idempotency (no duplicate
samples on re-run). **Not** in MR-C-003: full metric coverage, Android/Health Connect
([story 004](../../.claude-framework/artifacts/stories/mr-c/STORY-android-health-connect-capability-permission-write-poc.md)),
run orchestration/reporting (MR-D), or any production claim.

---

## 7. Sign-off block (Human Decision Owner)
```
Gate #1 (real Apple Health write) ...... APPROVED · Human Decision Owner · 2026-06-28 (minimal write POC only)
Gate #3 (prompt timing + copy §3) ...... APPROVED · Human Decision Owner · 2026-06-28
Gate #9 (entitlement/Info.plist/ADR) ... APPROVED · Human Decision Owner · 2026-06-28 (ADR-MWR-011)
Gate #10 (permission UX P10/P11) ....... APPROVED · Human Decision Owner · 2026-06-28 (MR-C-003 UX only)
Device QA (§2 filled + owner named) .... PENDING · device/iOS/owner still placeholders — must be filled before any real write
```

---

## 8. Closeout classification — **READY_WITH_FOLLOWUPS** (updated 2026-06-28)
Gates **#1/#3/#9/#10 are APPROVED** (2026-06-28; ADR-MWR-011), so MR-C-003 **implementation may
begin**: author ADR-MWR-011's native design, add the HealthKit entitlement + `Info.plist` keys, and
build the guarded `MwrHealthKit` write module behind the five-gate chain (the scaffolding + build +
simulator/CI do not need a real device). **Blocking followup (the POC's defining deliverable):** the
**real on-device write execution + QA sign-off remain BLOCKED** until §2 is filled with a concrete
real iPhone + iOS version + named QA owner (currently unfilled placeholders). No-fake-success forbids
declaring the POC successful from a simulator. Provide the device + owner → the real write is
validated and MR-C-003 moves to fully READY / DONE.

*(History: this packet was **BLOCKED** on 2026-06-28 pending gates; the gates were then approved the
same day with device QA still unfilled → **READY_WITH_FOLLOWUPS**.)*

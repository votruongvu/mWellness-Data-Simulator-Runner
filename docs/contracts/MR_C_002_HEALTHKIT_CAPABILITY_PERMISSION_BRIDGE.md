# MR-C-002 — iOS HealthKit Capability + Permission + Bridge (guarded seam)

**Story:** MWR-MRC-002 · **Date:** 2026-06-28 · **Lane:** Full (native/permission/
gate surface). **No write. No live OS prompt. No native project change.**

> ## Result: guarded TS seam delivered; native activation is GATE-PENDING.
> The iOS HealthKit **capability model, permission-status model, guarded native
> bridge seam, explain-before-prompt flow, the five-gate write chain, a UI
> preview, and tests** are implemented in **pure TypeScript** (concept-token
> boundary). Nothing here touches a real `HKHealthStore`, fires the OS prompt,
> ships approved prompt/explanation copy, or adds the HealthKit entitlement —
> those are **human-approval gates #1 / #3 / #9** (see the request below).

## What was delivered (un-gated)
| Area | File | Notes |
|---|---|---|
| Concept tokens | `src/health/healthKitTypes.ts` | Approved MR-C set (`heartRate`, `stepCount`, `distanceWalkingRunning`, `activeEnergyBurned`, `sleepAnalysis`, `bodyMass`); backend-slug→concept map. **Unqualified concept tokens only — no OS SDK symbol** (capability-matrix boundary). Writability `TO_VERIFY`. |
| Capability | `src/health/healthKitCapability.ts` | Fail-closed `evaluateHealthKitCapability` — `available: true` only when iOS + native bridge present + native says available. |
| Permission status | `src/health/healthPermission.ts` | Story-canonical set `not_requested \| granted \| denied \| partial \| unavailable \| unknown`; `summarizeHealthPermission` (no silent grant); `mapIosShareStatus` (unknown→unavailable, fail-closed). |
| Bridge seam | `src/health/healthKitBridge.ts` | `HealthKitBridge` interface (the native `MwrHealthKit` contract, prefix per ADR-MWR-010) + `gatePendingBridge` default that reports unavailable and returns `gate_pending` — **never `resolved`/success** (NO_FAKE_SUCCESS). `resolveHealthKitBridge()` falls back to the default when no native module is registered. |
| Flow + gates | `src/health/permissionFlow.ts` | `canRequestPermission` / `requestPermissionGuarded` enforce **explain-before-prompt** (no silent prompt, even if a native module is later installed); `evaluateWriteGate` = the **five-gate chain**; `realWriteEnabledInThisBuild()` is hard-`false`. |
| UI preview | `src/screens/HealthPermissionScreen.tsx` | Capability + DRAFT explanation + permission status + read-only gate chain. **No real-write button.** Reachable from the Dashboard ("iOS HealthKit permission (preview)"). |
| Tests | `__tests__/health/*.test.ts` (4 files, +28 tests) | capability fail-closed · permission summarize/mapping · bridge no-fake-success · explain-before-prompt (prompt never reached when blocked) · five-gate chain. |

## Concept-token boundary (held)
The TS/domain layer names **no** OS SDK symbol; qualified HealthKit identifiers
(`HKQuantityType(...)`, `HKHealthStore`, …) appear only in **explanatory comments**
and will resolve **only inside the native `MwrHealthKit` module** after the gates
clear. Verified by grep: no SDK symbol in executable TS.

## The five-gate chain (preserved, not weakened)
```
dry_run_completed AND payload_source_verified AND capability_checked
AND permission_resolved_or_granted AND explicit_confirmation
```
`evaluateWriteGate` requires all five. This is **necessary but not sufficient**: a
real write additionally requires human gate #1 + a native writer + device QA —
none exist here, so `realWriteEnabledInThisBuild()` is hard-`false`.

## No-fake-success (binding)
The default bridge returns `gate_pending` / `unavailable` and **never** `resolved`.
Only a real native prompt result (`outcome: 'resolved'` with concrete per-concept
statuses) updates the granted state; the UI maps outcomes verbatim. A denied type
is surfaced and skipped (`PERMISSION_MISSING`), never forced.

## ⛔ Human Approval Request — gates blocking native activation
To make a **live** capability check, a **real** permission prompt, or any write,
the following must be human-approved (Human Decision Owner) and are **NOT** done here:

| Gate | What it unlocks | Why blocked here |
|---|---|---|
| **#1** Real Apple Health / HealthKit auth/query/write | A native `HKHealthStore` `authorizationStatus`/`requestAuthorization` call | Real health-store interaction must be deliberate. |
| **#3** Permission-prompt timing **and copy** | The OS prompt firing + the **final** pre-prompt explanation copy (currently DRAFT on screen) | The one-shot prompt's timing/wording is trust-defining. |
| **#9** HealthKit entitlement + `Info.plist` (`NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription`) + the native `MwrHealthKit` module (ADR) | Linking HealthKit + the native bridge | Native-substrate/entitlement + ADR change. |
| **#10** (note) Final permission/confirmation UX | The finalized permission screen/flow | The preview reconciles with the approved design's safety-UX screens. |

## Can MR-C-003 (iOS guarded HealthKit write POC) start? **NO — BLOCKED.**
MR-C-003 cannot start until **all** of:
1. gates **#1 / #3 / #9** human-approved (recorded in `current-decisions.md`);
2. the native **`MwrHealthKit`** module exists (read-only capability/status first, then the gated prompt);
3. the **device QA matrix** names a concrete real iPhone + iOS version + a QA owner (currently `TO_VERIFY` / `NOT_EXECUTED` — simulator cannot validate a real write).

When those clear, MR-C-003 plugs the native module into this seam; the five-gate
chain + explain-before-prompt + no-fake-success guards are already in place and tested.

## Validation
`tsc --noEmit` clean · `jest` **52/52** (9 suites) · scope guards: no SDK symbol in
TS, no fake-success path, no Android/Health Connect impl, no Google Fit/vendor, **no
native project file changed**. Lint still blocked by the pre-existing
prettier/eslint mismatch (unrelated; P1).

## Followups
- **P0 (to start MR-C-003):** gates #1/#3/#9 approval + native `MwrHealthKit` module + device QA named.
- **P1:** finalize the pre-prompt explanation copy + permission UX under gate #3/#10 (current copy is DRAFT).
- **P2:** the pre-existing ESLint prettier-plugin mismatch.

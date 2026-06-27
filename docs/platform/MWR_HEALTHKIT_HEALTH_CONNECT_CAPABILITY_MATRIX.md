# MWR — Apple Health (HealthKit) + Health Connect Capability Matrix

> The canonical metric -> platform-type mapping reference for
> `mWellness-Mobile-Runner` (MWR). Two real health stores are targeted: **Apple
> Health via HealthKit (iOS)** and **Health Connect (Android)**. There are **no
> third-party vendor health destinations and no Google Fit.**
>
> **Every per-metric writability below is `TO_VERIFY`.** Per Master REQ §8, exact
> metric write support is verified per phase (MR0/MR3/MR4/MR5); the framework must
> **not** assume every catalog metric is writable. The metric set is owned by the
> **MWDS backend catalog** — the rows below are an illustrative, common starting
> set, not an MWR-authored canonical model.

## Concept-token boundary (load-bearing)

The TypeScript/domain layer carries **unqualified concept tokens** (e.g.
`stepCount`, `Steps`, `count/min`) and names **no** OS SDK symbol. A concept
resolves to its qualified SDK identifier **only inside the native `.swift` / `.mm`
/ `.kt`**, and only after the per-write gate chain passes. The "Qualified type"
columns below are the *target* a gated native writer resolves on-device — they do
not appear in the TS domain. See
[`MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md`](MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md).

## Apple Health / HealthKit (iOS)

| Metric (concept token) | Qualified HealthKit type *(resolved on-device only)* | Unit | Write support | Permission (share) | Idempotency mechanism | Validation concern |
|---|---|---|---|---|---|---|
| `heartRate` | `HKQuantityType(.heartRate)` | `count/min` (`HKUnit.count()/min`) | `TO_VERIFY` | share `heartRate` | stable sample metadata key | instantaneous point sample at start |
| `stepCount` | `HKQuantityType(.stepCount)` | `count` (`HKUnit.count()`) | `TO_VERIFY` | share `stepCount` | stable metadata key; no double-count on re-write | cumulative over [start,end] |
| `distanceWalkingRunning` | `HKQuantityType(.distanceWalkingRunning)` | `m` (`HKUnit.meter()`) | `TO_VERIFY` | share `distanceWalkingRunning` | stable metadata key | cumulative meters; anti-double-count |
| `activeEnergyBurned` | `HKQuantityType(.activeEnergyBurned)` | `kcal` (`HKUnit.kilocalorie()`) | `TO_VERIFY` | share `activeEnergyBurned` | stable metadata key | cumulative kcal over [start,end] |
| `sleepAnalysis` | `HKCategoryType(.sleepAnalysis)` | category (no unit) | `TO_VERIFY` | share `sleepAnalysis` | stable metadata key | category sample over [start,end]; needs a sleep-analysis value |
| `bodyMass` | `HKQuantityType(.bodyMass)` | `kg` (`HKUnit.gramUnit(with:.kilo)`) | `TO_VERIFY` | share `bodyMass` | stable metadata key | instantaneous point sample at start |

## Android Health Connect

| Metric (concept token) | Qualified record *(resolved on-device only)* | Unit | Write support | Permission (write) | Idempotency mechanism | Validation concern |
|---|---|---|---|---|---|---|
| `HeartRate` | `HeartRateRecord` | `bpm` | `TO_VERIFY` | `write:HeartRate` | `clientRecordId` (+version) | one instant sample at start; bpm == count/min |
| `Steps` | `StepsRecord` | `count` | `TO_VERIFY` | `write:Steps` | `clientRecordId` (+version) -> idempotent upsert | interval count |
| `Distance` | `DistanceRecord` | `meters` (`Length.meters`) | `TO_VERIFY` | `write:Distance` | `clientRecordId` (+version) | interval meters |
| `ActiveCaloriesBurned` | `ActiveCaloriesBurnedRecord` | `kcal` (`Energy.kilocalories`) | `TO_VERIFY` | `write:ActiveCaloriesBurned` | `clientRecordId` (+version) | interval kcal |
| `SleepSession` | `SleepSessionRecord` | interval (no unit) | `TO_VERIFY` | `write:SleepSession` | `clientRecordId` (+version) | interval [start,end]; stages optional |
| `Weight` | `WeightRecord` | `kg` (`Mass.kilograms`) | `TO_VERIFY` | `write:Weight` | `clientRecordId` (+version) | instant mass at start |

## Idempotency per platform

- **iOS HealthKit:** sample identity via stable sample metadata — a re-run must not
  produce duplicate samples. (`TO_VERIFY` mechanism finalized at MR4.)
- **Android Health Connect:** `clientRecordId` (plus version) makes an insert an
  idempotent upsert. (`TO_VERIFY` mechanism finalized at MR5.)

## Unsupported-metric honesty

An unmapped / out-of-support metric is **surfaced as unsupported** with a
`reason_code` (e.g. `METRIC_NOT_WRITABLE_ON_PLATFORM`) and **skipped — never
silently dropped** (MR-SAFE-003). Classification happens in the execution plan;
see [`../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`](../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md).

## Status

No real writer is enabled at framework bootstrap. Mappings here are **definitions
to verify**, not enabled writers. Enabling a real writer is a separate,
human-gated step (MR4/MR5), governed by the per-write gate chain in
[`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md).

## Terminology guard

iOS destination = **Apple Health via HealthKit**. Android destination =
**Health Connect** — never "Google HealthKit", never Google Fit.

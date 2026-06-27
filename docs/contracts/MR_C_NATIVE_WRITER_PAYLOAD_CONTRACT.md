# MR_C_NATIVE_WRITER_PAYLOAD_CONTRACT.md

**Phase:** MR-C (Native Writer MVP) · **Story:** MWR-MRC-001 (Native Writer Readiness + Payload Contract) · **Date:** 2026-06-27.

> ## ⟳ F8 RECLASSIFICATION (2026-06-27, one-off unblock patch) — supersedes the original decision below
>
> **Backend F8 added `GET /api/v1/test-cases/{id}/versions/{version_id}/runnable-payload`,
> which returns concrete per-operation values.** This patch verified and consumed it.
>
> **Status: `PAYLOAD_VERIFIED` (route + mobile consuming path) — live-authenticated fetch PENDING.**
> - F8 route **verified present** live: `GET …/runnable-payload` → `401` (registered, auth-gated; a non-existent id also returns 401, not 404).
> - Mobile now has a typed client (`getRunnablePayload`) + DTOs + an adapter guard, an **operation-level execution plan** (`buildExecutionPlanFromPayload`, the **preferred** MR-C input), and an **operation-level dry-run** (`simulateDryRunFromPayload`, strictly no-write) consuming concrete `value/unit/start_time/end_time/idempotency_key/operation_id`.
> - **No fabrication:** an operation missing a required concrete field → classified `invalid` with a `reason_code` (`MISSING_VALUE`/`MISSING_UNIT`/`MISSING_TIME`/`MISSING_IDEMPOTENCY_KEY`/`MISSING_METRIC_REF`) — never dropped, never back-filled.
> - **Honesty caveat (load-bearing):** an **authenticated live fetch** of `runnable-payload` returning real concrete values for a real version was **NOT run in this session (no token)**. The route exists and the mobile path consumes + guards the authoritative contract, but this single live confirmation is the **#1 follow-up** before relying on it for any native write.
> - **MR-C stories 002–005 (native writers) MAY resume** — but remain blocked on: the live-auth payload confirmation above **and** native substrate (`ios/`/`android/` not generated) + human-approval gates #1/#2/#3/#9 + device QA (`NOT_EXECUTED`). **This patch added no native write/permission code.**
> - The minimal candidate metric set (§3) moves from `blocked_no_payload` → **`to_verify_on_write`** (payload source now exists; native mapping/writability + live data still to verify).

---

**(Original decision — historical; superseded by the F8 reclassification above.)**
**Decision: `PAYLOAD_GAP` — MR-C is BLOCKED before native write implementation.**
Per MWR-MRC-001's hard gate, no native writer/bridge code is written in this phase
until a real per-operation payload source is verified and the native-write gates
are human-approved. **No per-operation health values were fabricated.** Master REQ
is canonical.

---

## 1. The hard gate (why this story exists)
A native write needs **concrete per-operation values** (metric, value, unit,
timestamp/segment) for each scenario operation. MR-B proved data loading only at
the **metric level** (version `metric_slugs` + catalog metadata + scenario
*summaries*). MWR-MRC-001 requires resolving where those per-operation values come
from **before** any native write — and stopping with `PAYLOAD_GAP` if they are not
available, rather than inventing them.

## 2. Per-operation value source — verified finding
Reviewed the verified MWDS routes (MR-B route addendum + the authoritative OpenAPI).
The scenario routes are:

| Route | Returns | Usable as a per-operation payload source? |
|---|---|---|
| `GET …/versions/{vid}/scenarios` | `ScenarioSummary[]` (slug, name, validation_status, order_index, file_name, uploaded_at) | **No** — summaries only, no values. |
| `POST …/scenario-template` · `GET …/scenario-template/download` | `ScenarioJSON` **template** (structure: metric keys + time_model) | **No** — a blank/structure template, not the concrete uploaded scenario values; also out of MR-B read scope. |
| `POST …/scenarios/upload` · `POST …/scenarios/reorder` | (writes) | **No** — write/authoring routes, forbidden as MR-C product behavior. |

**There is no verified GET route that returns the concrete per-operation values of
an uploaded scenario.** Therefore the per-operation payload source is **unavailable**
→ **`PAYLOAD_GAP`**. (No `BACKEND_GAP`: the backend is up and the read routes exist;
the gap is specifically the *content/values* payload.)

## 3. Minimal candidate writer metric/record set (classified — NOT approved to write)
The intended MVP set (from the capability matrix), classified per MWR-MRC-001. **All
are currently `blocked_no_payload`; native mapping/writability is `to_verify`
(per-device, ADR-MWR-009) and not device-verified.**

| Metric | iOS · Apple Health (HealthKit) | Android · Health Connect | Classification |
|---|---|---|---|
| steps | `HKQuantityType .stepCount` · `HKUnit.count()` | `StepsRecord` | `blocked_no_payload` · mapping `to_verify` |
| heart_rate | `.heartRate` · `count/min` | `HeartRateRecord` | `blocked_no_payload` · mapping `to_verify` |
| distance | `.distanceWalkingRunning` · `m` | `DistanceRecord` | `blocked_no_payload` · mapping `to_verify` |
| active_energy | `.activeEnergyBurned` · `kcal` | `ActiveCaloriesBurnedRecord` | `blocked_no_payload` · mapping `to_verify` |
| body_mass (weight) | `.bodyMass` · `kg` | `WeightRecord` | `blocked_no_payload` · mapping `to_verify` |
| sleep | `HKCategoryType .sleepAnalysis` | `SleepSessionRecord` | `blocked_no_payload` · mapping `to_verify` |

No metric is `approved_for_mrc` while `PAYLOAD_GAP` holds. The set is intentionally
small; the full metric universe is out of MR-C scope.

## 4. No-fake-success rule (binding)
Native success may be recorded **only** after the actual native API call
(`HKHealthStore` save / Health Connect `insertRecords`) returns success. A denied,
failed, unsupported, or invalid operation is **skipped with a reason_code** and
**never** reported as success. Partial success is distinct from success. (ADR-MWR-005;
`NO_FAKE_SUCCESS_GATE`.)

## 5. Real-write gate chain (binding — all five must be true)
```
dry_run_completed
AND payload_source_verified        <-- currently FALSE (PAYLOAD_GAP)
AND capability_checked
AND permission_resolved_or_granted
AND explicit_confirmation
```
Denied/unsupported/invalid operations are skipped (reason_code), never attempted.
Because `payload_source_verified` is FALSE, **no real write may occur** and stories
MWR-MRC-002…005 do not proceed.

## 6. Other hard blockers (must also clear before a real write)
- **Native substrate absent.** No `ios/`/`android/` RN projects exist (never generated); no Swift/Kotlin; gate #9 (native substrate while unvalidated).
- **Real-write human-approval gates** #1 (Apple Health write), #2 (Health Connect write), #3 (permission-prompt timing/copy) — not yet approved.
- **Device QA `NOT_EXECUTED`.** `docs/platform/MWR_DEVICE_QA_MATRIX.md` names no concrete devices/OS versions; real writes require a real device (simulator/emulator cannot validate real writes). MR4/MR5-equivalent approval is blocked until devices + a QA owner are named.

## 7. MR-C manual approval & QA requirements (before any real write)
1. A verified per-operation **payload source** (a real GET route returning concrete scenario values, or an explicitly approved payload source) — clears `PAYLOAD_GAP`.
2. Human approval of gates **#1/#2/#3/#9** (real Apple Health + Health Connect writes, permission-prompt copy, native substrate).
3. Generated **native projects** (`npx react-native init` template at RN 0.74.5) + a real **iOS device** and **Android device with Health Connect**.
4. Device QA matrix populated with concrete devices/OS versions + a QA owner.
5. The five-gate chain enforced in code with tests proving **no write when any gate is unmet**.

## 8. Resume conditions (what unblocks MR-C)
MR-C proceeds to MWR-MRC-002…005 only after items 1–4 above are satisfied and the
gate chain (§5) can pass for at least one `approved_for_mrc` metric on a real device.
Until then MR-C remains **BLOCKED (`PAYLOAD_GAP`)**.

## 9. Mapping backlog (carried — MWR-MRC-005)
For each candidate metric (§3): confirm exact HealthKit type/unit + Health Connect
Record type/unit against current official docs; confirm per-device writability
(ADR-MWR-009); define idempotency (HK sample identity / HC `clientRecordId`);
define the concrete payload value source. All `to_verify`.

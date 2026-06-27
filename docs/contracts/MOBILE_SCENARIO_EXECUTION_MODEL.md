# mWellness Mobile Runner — Scenario Execution Model

> The mobile execution model: how a backend-validated scenario contract becomes an
> execution plan, is previewed via dry-run, and is executed and reported. Derived
> from [Master REQ §6](../requirements/MOBILE_RUNNER_MASTER_REQ.md#6-domain-model)
> and [§10](../requirements/MOBILE_RUNNER_MASTER_REQ.md#10-data-contracts).

## Operating principle

> **Backend runnable scenario contract first -> mobile execution plan second ->
> platform writer third.**

Mobile interprets the validated contract, builds a plan, previews it (dry-run),
and executes it. MWR does deterministic **replay** of a stored plan — never data
**generation**. Mobile never authors, validates, mutates, or reorders scenarios.

## Run lifecycle state machine

```text
SELECT_TEST_CASE -> LOAD_VERSION -> LOAD_SCENARIOS
-> LOAD_METRIC_METADATA -> CHECK_CAPABILITY -> CHECK_PERMISSIONS
-> BUILD_PLAN -> DRY_RUN -> CONFIRM_REAL_WRITE
-> EXECUTE -> COLLECT_RESULTS -> REPORT_RESULT -> COMPLETE
```

| State | What happens | Notes |
|---|---|---|
| SELECT_TEST_CASE | User picks a runnable test case. | From backend list (MR-TC-001/002). |
| LOAD_VERSION | Load the immutable version config snapshot. | Destination/profiles/metrics visible (MR-TC-003). |
| LOAD_SCENARIOS | Load ordered scenarios. | **Backend order authoritative** (MR-TC-004); no local reorder (MR-TC-005). |
| LOAD_METRIC_METADATA | Load catalog metric metadata. | Unit/data_shape/platform support. |
| CHECK_CAPABILITY | Check platform availability + write support. | Capability before permission. |
| CHECK_PERMISSIONS | Read OS permission state per metric type. | Permission explained before any OS prompt. |
| BUILD_PLAN | Interpret payloads -> classify operations -> resolve time. | Invalid payload blocks run with reason (MR-PLAN-001). |
| DRY_RUN | Produce plan/result **with no native write**. | Default mode; the gate before any real write (MR-PLAN-004 / MR-SAFE-001). |
| CONFIRM_REAL_WRITE | Explicit user confirmation; only if real-write enabled. | No accidental writes (MR-RUN-001 / MR-SAFE-002). |
| EXECUTE | Run writable operations through the platform writer. | Writer receives only approved operations (MR-RUN-002). |
| COLLECT_RESULTS | Gather per-operation native results. | No-fake-success: success reflects the native result (MR-SAFE-004). |
| REPORT_RESULT | Show summary; optionally report to backend. | Counts + reasons visible (MR-RUN-004); optional `POST /mobile/runs`. |
| COMPLETE | Terminal. | — |

## Operation classification (MR-PLAN-003)

Each planned operation is classified into exactly one status. Every blocked
operation carries a `reason_code` and is **visible before the run** — never
silently dropped (MR-SAFE-003).

| Status | Meaning | Surfaced as |
|---|---|---|
| `writable` | Metric maps to a supported platform type; capability + permission present. | In `operations[]`, eligible to execute. |
| `unsupported` | Metric has no writable mapping on this platform. | In `blocked_operations[]` with a `reason_code` (e.g. `METRIC_NOT_WRITABLE_ON_PLATFORM`). |
| `permission_missing` | Mapping exists but OS permission is denied/absent. | Blocked; fail-closed; surfaced with reason. |
| `invalid` | Payload could not be interpreted into a valid operation. | Blocked; run blocked with reason. |
| `skipped` | Deliberately not executed (e.g. dry-run, user choice, prior failure). | Counted in the result summary. |

### Reason codes (non-exhaustive; `TO_VERIFY` final set at MR3)

| reason_code | When |
|---|---|
| `METRIC_NOT_WRITABLE_ON_PLATFORM` | No writable mapping for the metric on the target platform. |
| `PERMISSION_DENIED` | OS permission denied/absent for the metric type. |
| `CAPABILITY_UNAVAILABLE` | Platform health store unavailable/not installed. |
| `INVALID_PAYLOAD` | Scenario payload could not be interpreted. |
| `NATIVE_WRITE_FAILED` | The native platform write/insert failed at execution. |

## Dry-run before real write (crown jewel)

- **Dry-run performs ZERO real writes.** It computes and labels only what *would*
  be written; output is labelled dry-run.
- **Dry-run is the default.** A real write requires explicit, human-confirmed,
  config-driven enablement.
- **No code path bypasses the dry-run flag.** A dry-run that writes is a P0
  defect. MR3 (dry-run plan) precedes MR4/MR5 (real writers).
- See [`docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md).

## Deterministic replay

- Replaying a stored execution plan is **deterministic**.
- Relative time in the scenario resolves to absolute timestamps via an **injected
  clock** (e.g. `simulated_now`); no ambient `Date.now()` / `Math.random()` in the
  run path.
- The plan/scenario version is recorded with the run.

## JSON contracts

### ExecutionPlan

```json
{
  "run_id": "local-uuid",
  "mode": "dry_run",
  "platform": "ios",
  "destination_slug": "apple_health",
  "operations": [
    {
      "operation_id": "local-op-1",
      "scenario_id": "uuid",
      "metric_slug": "heart_rate",
      "status": "writable",
      "target_type": "healthkit.quantity.heart_rate",
      "timestamp": "2026-06-27T10:00:00Z",
      "value": 92,
      "unit": "count/min"
    }
  ],
  "blocked_operations": [
    {
      "metric_slug": "recovery_score",
      "status": "unsupported",
      "reason_code": "METRIC_NOT_WRITABLE_ON_PLATFORM"
    }
  ]
}
```

- `mode` is `dry_run` by default; `real_write` only after explicit confirmation.
- `target_type` is an unqualified concept token in the TS domain; the qualified OS
  SDK identifier resolves only in the native writer.

### RunResult

```json
{
  "run_id": "local-uuid",
  "mode": "real_write",
  "platform": "ios",
  "summary": {
    "total_operations": 28,
    "succeeded": 25,
    "failed": 1,
    "skipped": 2
  },
  "errors": [
    {
      "operation_id": "local-op-9",
      "metric_slug": "sleep_stage_deep",
      "reason_code": "NATIVE_WRITE_FAILED"
    }
  ]
}
```

- `succeeded` counts only operations whose **native write actually succeeded**
  (no-fake-success, MR-SAFE-004).
- The RunResult is the body of the optional MR6 backend run report.

## Cross-references

- Backend contract / source of the validated payloads: [`MOBILE_BACKEND_API_CONTRACT.md`](MOBILE_BACKEND_API_CONTRACT.md)
- Health-write safety / gate chain: [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)
- Architecture (runner lives in `src/runner/`): [`../architecture/MOBILE_RUNNER_ARCHITECTURE.md`](../architecture/MOBILE_RUNNER_ARCHITECTURE.md)

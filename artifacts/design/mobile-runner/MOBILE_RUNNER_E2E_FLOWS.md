# MOBILE_RUNNER_E2E_FLOWS.md

Normalized end-to-end flows for `mWellness-Mobile-Runner`, from the accepted
design package + Master REQ §6 run lifecycle. Screen IDs reference
[`MOBILE_RUNNER_SCREEN_MAP.md`](MOBILE_RUNNER_SCREEN_MAP.md). **Master REQ is canonical.**

## Canonical core direction (load-bearing order)
```
Login → Browse runnable test cases → Select version/scenarios → Build execution plan
→ Dry-run → Check permission/capability → Confirm real write → Run → Result
```
The flows below make it **impossible to jump from the test-case list straight to a real write** — every real-write path passes dry-run + capability + permission + explicit confirmation.

## Flow A — Core happy path, iOS (Apple Health)
```
P01 Splash → P02 Login (env badge) → P03 Runner Dashboard
→ P04 Platform Capability (iOS · Apple Health · HealthKit available)
→ P05 Test Case List → P06 Test Case Detail → P07 Version / Ordered Scenarios
→ P08 Execution Plan Builder → P08 Execution Plan Preview (mode: Dry-run · target iOS · Apple Health)
→ P09 Dry-run Result ("No health data was written")
→ P10 Permission Explanation (explain BEFORE OS prompt) → [OS prompt] → P11 Permission Status (granted)
→ P12 Real-write Confirmation (explicit checkbox) → P13 Run Progress → P14 Run Result (success)
→ (optional) Report result to backend
```

## Flow A′ — Core happy path, Android (Health Connect)
Identical structure to Flow A, platform-substituted (the **Android happy path the baseline lacked**):
```
P04 Platform Capability (Android · Health Connect installed · permissions)
→ … → P08 Execution Plan Preview (target Android · Health Connect)
→ P09 Dry-run Result → P10 Permission Explanation (Health Connect) → [Health Connect permission UI]
→ P11 Permission Status → P12 Real-write Confirmation (target Android · Health Connect)
→ P13 Run Progress → P14 Run Result (success)
```
Android-specific precondition: if **Health Connect is not installed** → E04 (Unsupported Platform — Android) → Install Health Connect / Dry-run only.

## Flow B — Select & dry-run only (no real write)
```
P05 Test Case List → P06 Detail → P07 Version/Scenarios → P08 Plan Builder
→ P08 Plan Preview → P09 Dry-run Result → (stop) Back to plan / Test case
```
Dry-run performs **zero** real writes on either platform; output labelled Dry-run.

## Flow C — Real write with permission granted
(continues from P09 Dry-run Result)
```
P09 → P10 Permission Explanation → P11 Permission Status (all granted)
→ P12 Real-write Confirmation → P13 Run Progress → P14 Run Result
```
Gate chain enforced at P12: **dry-run completed ∧ capability ok ∧ permissions resolved ∧ explicit confirm** — else Confirm is disabled with the blocking reason shown.

## Flow D — Permission denied / partial
```
P10 Permission Explanation → [OS / Health Connect permission UI] → P11 Permission Status (denied or partial)
→ branch:
   • Denied (required) → Run Blocked → remediation (Open Settings / Health Connect) → Re-check
   • Partial → "Continue with partial run" → denied-metric operations are SKIPPED (status permission_missing), never attempted
→ P12 (if partial allowed) → P13 → P14 Run Result (partial success, skipped detail)
```
A denied permission **fails closed**; denied-metric ops are skipped with `reason_code: PERMISSION_MISSING`, never silently dropped, never faked as success.

## Flow E — Unsupported metric
```
P08 Execution Plan Preview → Unsupported Metrics panel (e.g. "Body Temperature is not writable on this platform")
→ user chooses: Dry-run only / Skip unsupported & continue / Cancel
→ if continue: P09 → … → P14 Run Result with SKIPPED details (reason_code METRIC_NOT_WRITABLE_ON_PLATFORM)
```
Unsupported ops are classified at plan time (`status: unsupported`), surfaced, and skipped — never attempted, never faked.

## Flow F — Backend / auth error (cross-cutting)
```
Any protected screen → API error
→ if AUTH_EXPIRED → E01 Session Expired → Login again / Retry session
→ else → E02 Backend Unavailable → show error envelope + request ID → Retry / Change environment / Diagnostics
```
No fabricated/mock backend data is ever shown as completed product behavior; a missing required API STOPs (human-approval gate), it is not invented.

## Flow G — Real-write safety flow (the no-accidental-write guarantee)
```
P08 Execution Plan → dry-run completed → real-write mode selected
→ safety warning banner → platform target shown → write-operation count shown
→ explicit confirm action (checkbox + button) → run starts
```
Cancellation during P13 stops remaining ops where possible; already-written ops cannot necessarily be undone — copy states this. **No background/autonomous write path exists.**

## Flow matrix (coverage)
| Flow | iOS Apple Health | Android Health Connect | Dry-run | Real-write | Permission | Unsupported | Backend err |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| A / A′ core happy | ✔ | ✔ | ✔ | ✔ | granted | — | — |
| B dry-run only | ✔ | ✔ | ✔ | — | — | — | — |
| C real-write granted | ✔ | ✔ | ✔ | ✔ | granted | — | — |
| D permission denied/partial | ✔ | ✔ | ✔ | partial | denied/partial | — | — |
| E unsupported metric | ✔ | ✔ | ✔ | partial | — | ✔ | — |
| F backend/auth error | ✔ | ✔ | — | — | — | — | ✔ |
| G real-write safety | ✔ | ✔ | ✔ | ✔ | required | surfaced | — |

## Safety invariants encoded in the flows
1. Dry-run precedes every real write (no path skips it).
2. Real write requires dry-run-completed + capability-checked + permission-checked + explicit-confirmation.
3. Permission explained before the native OS prompt (no silent prompt).
4. Permission-denied / unsupported ops are **skipped with a reason_code**, never attempted, never silently dropped.
5. Partial success is distinct from success at P14.
6. No fake native write success — success reflects the native HealthKit/Health Connect result.
7. Backend authority is never bypassed; no fabricated data as product behavior.

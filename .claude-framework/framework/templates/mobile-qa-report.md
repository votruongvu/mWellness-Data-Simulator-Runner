---
id: QAREPORT-<slug>
type: mobile-qa-report
tags: [mwellness-mobile-runner, mwr]
---

# Mobile / Exploratory QA Report — <title>

Exploratory / dogfood QA across the MWR run-flow states on a real device
or agent-device. **Synthetic scenarios only; dry-run by default; never a
real write to a production destination, never real PHI.**

## Build / env
- Build: <internal track / dev build>   - Platform: iOS / Android / both
- Platform target exercised: <Apple Health (iOS) | Health Connect (Android)>
- Mode: dry-run (default) / real-write (env-gated, human-confirmed, named target)
- Backend: <auth'd test environment — never production>

## State walk (run-flow; each: steps → expected → observed → verdict)
> Run lifecycle (Master REQ §6): SELECT_TEST_CASE → LOAD_VERSION →
> LOAD_SCENARIOS → LOAD_METRIC_METADATA → CHECK_CAPABILITY →
> CHECK_PERMISSIONS → BUILD_PLAN → DRY_RUN → CONFIRM_REAL_WRITE →
> EXECUTE → COLLECT_RESULTS → REPORT_RESULT → COMPLETE.

| State | Steps | Expected | Observed | Verdict |
|---|---|---|---|---|
| idle / no run | | dashboard empty; dry-run is the default mode | | |
| select test case + version | | loads from authenticated backend; no fabricated data | | |
| load scenarios + metric metadata | | ordered scenarios + metadata loaded; not authored/reordered on device | | |
| check capability | | platform capability checked before any permission request | | |
| check permissions | | permission explained BEFORE the OS prompt; denied/partial fails closed | | |
| build plan | | each op classified writable/unsupported/permission_missing/invalid/skipped; blocked ops show reason_code | | |
| dry-run | | "would write" preview per op; **no real write**; output labelled dry-run | | |
| confirm real-write | | explicit confirmation required; gated/env-flagged | | |
| executing | | progress honest; per-op result reflects the real platform write/insert | | |
| unsupported metric | | surfaced with reason_code, not silently dropped | | |
| partial success | | per-item results honest; nothing claimed succeeded that did not | | |
| result / report | | summary {total,succeeded,failed,skipped} + reason_codes; redacted | | |
| error | | classified; redacted log; no raw secret/token/payload | | |

## Findings (severity per report-format.md R-4a)
- P0: <…, or none>
- P1: <…, or none>
- P2: <…, or none>

## MWR safety confirmations
- No real PHI/PII observed in UI/logs/reports (synthetic scenarios only): <yes/no>
- Dry-run wrote nothing (no real write while in dry-run): <yes/no>
- No fake success — every reported success reflects a real native write/insert: <yes/no>
- Capability + permission honored; denied/partial failed closed: <yes/no>
- No raw secret/token/credential in UI/logs: <yes/no>
- Backend authority respected (no fabricated test data; gaps STOP for approval): <yes/no>
- Health Connect labelled correctly (never "Google HealthKit" / Google Fit): <yes/no>

## Verdict
APPROVED | APPROVED_WITH_FOLLOWUPS | BLOCKED

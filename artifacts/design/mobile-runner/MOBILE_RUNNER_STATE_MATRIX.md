# MOBILE_RUNNER_STATE_MATRIX.md

Critical-screen state matrix for `mWellness-Mobile-Runner` — the states each
screen must implement (input for component tests + MR1+ screen-state coverage).
Screen IDs reference [`MOBILE_RUNNER_SCREEN_MAP.md`](MOBILE_RUNNER_SCREEN_MAP.md).
**Master REQ is canonical.**

## Global state rule
Every data-bound screen renders the full set: **loading · empty · error · success**,
plus its screen-specific states below. No screen may show success while
operations failed/were skipped.

## Per-screen states

| Screen | Required states |
|---|---|
| P01 Splash | loading · session-restored · no-session · config-error · backend-unavailable |
| P02 Login | empty · invalid-input · loading · auth-failed · backend-unavailable · session-expired |
| P03 Runner Dashboard | normal · backend-degraded · platform-unsupported · no-recent-runs |
| P04 Platform Capability | supported · partial · unsupported · **Health-Connect-not-installed (Android)** · permission-unknown · permission-denied |
| P05 Test Case List | loading · empty · no-search-result · backend-error · session-expired · success |
| P06 Test Case Detail | loading · not-found · forbidden · no-runnable-version · success |
| P07 Version / Ordered Scenarios | loading · no-scenarios · invalid-version · validation-warning · success |
| S01 Scenario Payload Preview | loading · content-unavailable · oversized-payload-warning · success |
| P08 Plan Builder | planning · planning-failed · metadata-missing · unsupported-destination · success |
| P08 Plan Preview | all-writable · partial-support · fully-blocked · invalid-payload · platform-unsupported |
| P09 Dry-run Result | dry-run-success · dry-run-with-warnings · dry-run-blocked · dry-run-failed |
| P10 Permission Explanation | not-requested · already-granted · partially-granted · denied · unavailable |
| P11 Permission Status | all-granted · partial · denied · unavailable · unknown |
| P12 Real-write Confirmation | ready · blocked-by-permissions · blocked-by-unsupported · blocked-by-safety-gate · environment-not-allowed |
| P13 Run Progress | starting · running · cancelling · cancelled · failed · completed-with-partial-failures |
| P14 Run Result | success · **partial-success** · failed · cancelled · report-failed · report-pending |
| S04 Run Error Detail | per reason_code (see below) |
| S03 Diagnostics | normal · sanitized (no tokens/PHI) · clearing |
| S05 Settings | normal · real-write-approved · real-write-unavailable |
| E01 Session Expired | default · retrying |
| E02 Backend Unavailable | default · retrying |
| E03/E04 Unsupported Platform | iOS-HealthKit-unavailable · Android-HC-not-installed · OS-unsupported · destination-mismatch |

## Operation classification states (plan + run)
Each planned operation carries exactly one status: **`writable` · `unsupported` ·
`permission_missing` · `invalid` · `skipped`**; blocked operations carry a
`reason_code`. Run results count **succeeded / failed / skipped** where
`succeeded` = native write actually returned success.

## reason_code set (S04 Run Error Detail)
`METRIC_NOT_WRITABLE_ON_PLATFORM` · `PERMISSION_MISSING` · `CAPABILITY_UNAVAILABLE` ·
`SCENARIO_PAYLOAD_INVALID` · `NATIVE_WRITE_FAILED` · `BACKEND_UNAVAILABLE` ·
`AUTH_EXPIRED`. *(Final set ratified at MR3 per the execution model.)*

## Cross-platform parity
Every platform-bearing state has an **iOS (Apple Health / HealthKit)** and an
**Android (Health Connect)** rendering. Android adds `Health-Connect-not-installed`;
iOS adds `HealthKit-unavailable (iPad/simulator)`.

## Safety-state invariants (must be testable)
- Dry-run states never reflect a real write ("No health data was written").
- `P12 ready` is reachable only when dry-run-completed ∧ capability-ok ∧ permission-resolved ∧ confirm-checked.
- `permission_missing` / `unsupported` operations are skipped, surfaced, never attempted.
- `partial-success` is a distinct terminal state from `success`.
- No state path produces a fake success or a silent metric drop.

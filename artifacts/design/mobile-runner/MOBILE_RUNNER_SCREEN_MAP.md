# MOBILE_RUNNER_SCREEN_MAP.md

Normalized screen inventory for `mWellness-Mobile-Runner`, derived from the
accepted Claude Designer package (`Mobile_Runner_UI.pdf`) + `MWR_UI_FLOW_SCREEN_SPEC.md`,
with the MR-DESIGN-00 refinement deltas applied (see
[`DESIGN_PACKAGE_INDEX.md`](DESIGN_PACKAGE_INDEX.md)). **Master REQ is canonical**;
this map is implementation input.

## Normalization rules applied to every screen
- **Environment is lightweight** — a small environment **badge** (e.g. `ENV · dev`) + a minimal connection check, never a `local/dev/staging/prod` management flow as a primary screen. The baseline "Environment Setup" screen is demoted to a secondary, minimal connection panel.
- **`profile` = source/device profile only** (e.g. **Apple Watch**, **Huawei Watch**) — never `profile: athlete`.
- **Terminology:** Destination **Apple Health** / Platform API **HealthKit** / Device **iOS**; Destination **Health Connect** / Platform API **Health Connect** / Device **Android**. Never "Google HealthKit" / Google Fit.
- **iOS Apple Health and Android Health Connect happy paths are both first-class.** Every platform-bearing screen renders an iOS (Apple Health) variant and an Android (Health Connect) variant.
- **Safety gates mandatory**, quiet outside the real-write confirmation. Dry-run precedes real write.

## Tier A — Primary screens (core runner flow)

| # | Screen | Purpose | Platform-aware? | Key normalized elements |
|---|---|---|---|---|
| P01 | Splash / Bootstrap | Startup, session restore, env badge | — | App name, `Internal DEV/QA Runner`, env **badge**, version/build, loading + config-error states. |
| P02 | Login | Auth to MWDS backend | env badge | Email, password, **env badge** (not an env setup form), loading/auth-failed/session-expired states. |
| P03 | Runner Dashboard | Landing after login | iOS + Android | Identity, env badge, **Platform capability card** (iOS · Apple Health / Android · Health Connect), `Safety mode: Dry-run default`, Browse Test Cases, Last run, Diagnostics, Logout. |
| P04 | Platform Capability | Device/destination readiness | iOS + Android | iOS: HealthKit available · OS version · write permission. Android: Health Connect installed · OS version · write permission. Supported categories; unsupported/unknown warnings; Re-check / Continue. |
| P05 | Test Case List | Backend runnable test cases | — | Search, filters (destination, **device/source profile**, metric category, runnable, has-scenarios), cards (name, slug, current version, destination, profile chips, scenario/metric counts, status). **No create/edit/author actions.** |
| P06 | Test Case Detail | Selected case + versions | destination | Status, current version summary, destination, **device profile**, metric summary, version history, "Configuration is managed in MWDS Web App." Open Current Version / View Versions. |
| P07 | Version / Ordered Scenarios | Immutable version + ordered scenarios (read-only) | destination | Version, current marker, **Destination: Apple Health / Health Connect**, **Profile: Apple Watch** (device), catalog revision, metrics grouped, ordered scenario rows (order index, name, slug, metrics, validation), **Build Execution Plan**. **No reorder/edit/upload/seed.** |
| P08 | Execution Plan (Builder → Preview) | Build + preview the dry-run plan | iOS + Android | Builder steps (load metadata → resolve time → map metrics to platform → check capability → classify ops). Preview: **mode badge Dry-run**, target (`iOS · Apple Health` / `Android · Health Connect`), totals, **writable / unsupported / blocked / permission_missing / invalid** counts, per-scenario plan, unsupported note. **Real-write not primary until gates pass.** |
| P09 | Dry-run Result | Prove plan simulates without writing | iOS + Android | "Dry-run completed · No health data was written." Simulated / would-skip / blocked counts, warnings, next = permission check. |
| P10 | Permission Explanation | Explain before the OS prompt | iOS + Android | Destination (Apple Health / Health Connect), why needed, metric types requiring **write**, "No silent prompt — nothing requested until you tap." Request Permissions / Not now. |
| P11 | Permission Status | Per-metric grant result | iOS + Android | Granted / Denied / Not-requested per metric type, affected scenarios, **remediation** (iOS: Settings → Health → Data Access; Android: Health Connect app → permissions), Re-check / Open Settings / Continue-with-partial / Cancel. |
| P12 | Real-write Confirmation | Final explicit gate before writing | iOS + Android | **Mode badge Real-write**, strong warning banner, target (`iOS · Apple Health` / `Android · Health Connect`), account/env, test case/version, **write op count**, skipped/blocked count, permission status, **explicit confirm checkbox**, Confirm-and-start / Back-to-dry-run / Cancel. |
| P13 | Run Progress | Live execution | iOS + Android | Mode badge Real-write, per-scenario progress, current op, counts (ok / fail / skip / left), live errors, Cancel. |
| P14 | Run Result | Final result | iOS + Android | **Status: success / partial success / failed / cancelled** (partial never collapsed to success), Run ID, test case/version, mode·target, duration, op counts, scenario summary, failed/skipped details, backend report status. Re-run dry-run / Re-run real / Report / Diagnostics. |

## Tier B — Secondary screens

| # | Screen | Purpose | Normalized notes |
|---|---|---|---|
| S01 | Scenario Payload Preview | Read-only DEV/QA JSON view | "Backend validation is source of truth · read-only · not logged by default." Copy JSON / Close. Dev-gated. |
| S02 | Environment (lightweight) | Minimal backend connection check | **Demoted from primary.** Backend URL (read-mostly) + connection test + env badge. **No local/dev/staging/prod management UX.** No secret exposure. |
| S03 | Diagnostics / Logs | DEV/QA diagnostics | App version, platform (`iOS 17.4 · HealthKit` / `Android 14 · Health Connect`), env, sanitized run log, request/run IDs. **No tokens / credentials / raw payload / real PHI.** Copy / Export sanitized / Clear. |
| S04 | Run Error Detail | Per-operation troubleshooting | Error code (`NATIVE_WRITE_FAILED`, `PERMISSION_MISSING`, `METRIC_NOT_WRITABLE_ON_PLATFORM`, `SCENARIO_PAYLOAD_INVALID`, `BACKEND_UNAVAILABLE`, `AUTH_EXPIRED`), scenario, metric, **native platform error**, run/request IDs, recommended action, Copy. |
| S05 | Settings | App settings | User, env badge, **Dry-run default** indicator, real-write availability (Approved device), "Safety gates and confirmation cannot be disabled in this build", View master safety rules, Re-check platform, Logout. **No disable-safety / bypass-confirm / force-success.** |

## Tier C — Error-state screens

| # | Screen | Trigger | Normalized notes |
|---|---|---|---|
| E01 | Session Expired | Auth token invalid | Explanation, env badge, Login again / Retry session. |
| E02 | Backend Unavailable | MWDS unreachable | Endpoint, error code (`503 BACKEND_UNAVAILABLE`), **request ID**, Retry / Change environment / Diagnostics. |
| E03 | Unsupported Platform — iOS | HealthKit unavailable (iPad / simulator / device) | Detected platform, missing capability, **Dry-run only** still available; Re-check / Back. |
| E04 | Unsupported Platform — Android | **Health Connect not installed** / OS unsupported | Detected `Android 14`, required destination **Health Connect**, missing capability "App not found", **Install Health Connect**, Re-check, **Dry-run only**. |

## Screen-count reconciliation vs baseline
- Baseline 23 screens → normalized **14 primary + 5 secondary + 4 error = 23**, with the baseline `Environment Setup` primary screen **demoted** to secondary `Environment (lightweight)`, and `Unsupported Platform` **split** into iOS (E03) and Android (E04) variants to make both platform happy/error paths explicit.
- Removed from scope (never designed): authoring, catalog edit, scenario reorder/upload, seed library, export-bundle primary flow, Google Fit, RBAC/tenant/billing/admin.

## Traceability
Maps to Master REQ §12 (UX screens) and §6 run lifecycle. Flows in
[`MOBILE_RUNNER_E2E_FLOWS.md`](MOBILE_RUNNER_E2E_FLOWS.md); states in
[`MOBILE_RUNNER_STATE_MATRIX.md`](MOBILE_RUNNER_STATE_MATRIX.md); safety UX in
[`MOBILE_RUNNER_SAFETY_UX_MATRIX.md`](MOBILE_RUNNER_SAFETY_UX_MATRIX.md).

# MOBILE_RUNNER_COMPONENT_KIT.md

Reusable mobile UI component kit for `mWellness-Mobile-Runner`, normalized from
the accepted design package. Implementation input for MR1+ (React Native +
TypeScript). Names are stable contract tokens; props are indicative (finalized
at implementation). **Master REQ is canonical.**

## Foundations
- **Style:** clean internal QA tool — high clarity over polish; readable cards; status-first.
- **Status semantics (never color-only; always label + icon):** `ready/granted/supported`, `warning/partial`, `blocked/denied/unsupported`, `running`, `completed`, `failed`, `skipped`, `dry-run`, `real-write`.
- **Accessibility:** WCAG AA contrast; label + icon for every status; min 44pt targets; dynamic type.

## Components

| Component | Purpose | Key props | Variants / states |
|---|---|---|---|
| `AppHeader` | Screen title + back + context | `title`, `onBack?`, `trailing?` | default, with-badge |
| `EnvBadge` | Lightweight environment indicator | `env` (`dev`/…), `endpointLabel?` | normal, degraded. **Not** an env-management control. |
| `PlatformBadge` | Device + destination | `platform` (`ios`/`android`), `destination` (`Apple Health`/`Health Connect`) | iOS·Apple Health, Android·Health Connect |
| `ModeBadge` | Run mode | `mode` (`dry_run`/`real_write`) | **Dry-run** (calm), **Real-write** (danger) |
| `StatusBadge` | Generic status pill | `status`, `label` | the 9 status semantics above |
| `SafetyBanner` | Persistent safety context | `mode`, `text` | dry-run info, **real-write danger** |
| `WarningBanner` | Inline caution | `text` | warning, blocking |
| `TestCaseCard` | Test case row | `name`, `slug`, `version`, `destination`, `profile` (device), `scenarioCount`, `metricCount`, `status` | runnable, partial (`N unsupported`), blocked |
| `VersionSummaryCard` | Version meta | `version`, `isCurrent`, `destination`, `profile` (device), `catalogRev` | current, archived |
| `ScenarioRow` | Ordered scenario (read-only) | `orderIndex`, `name`, `slug`, `metrics`, `validation`, `opCount?` | ok, warn, invalid. **No reorder/edit handles.** |
| `MetricChip` | Metric token | `label`, `state?` | supported, unsupported, unknown |
| `MetricCategoryGroup` | Grouped metric chips | `category`, `chips[]` | — |
| `CapabilityCard` | Platform readiness | `platform`, `destination`, `available`, `osSupported`, `writePermission` | supported, partial, unsupported, **not-installed (Android)** |
| `PermissionStateRow` | Per-metric permission | `metric`, `state` | granted, denied, not_requested |
| `ExecutionPlanSummaryCard` | Plan totals | `target`, `scenarios`, `totalOps`, `writable`, `unsupported`, `blocked`, `permissionMissing`, `invalid` | all-writable, partial, fully-blocked |
| `OperationCountTile` | Single count tile | `value`, `label`, `tone` | writable(green), unsupported(amber), blocked(red), skipped, ok/fail/left |
| `ScenarioPlanRow` | Per-scenario plan line | `name`, `okCount`, `total`, `skip?` | ok, partial-skip |
| `UnsupportedMetricPanel` | Unsupported list + actions | `metrics[]`, `onDryRunOnly`, `onSkip`, `onCancel` | — |
| `PermissionExplainCard` | Pre-prompt explanation | `destination`, `metrics[]`, `onRequest`, `onNotNow` | not-requested, partial, denied, granted, unavailable |
| `RealWriteConfirmCard` | Final confirm gate | `target`, `account`, `testCase`, `writeOps`, `skippedBlocked`, `permissionStatus`, `confirmChecked`, `onConfirm` | ready, **blocked** (gate unmet → confirm disabled) |
| `RunProgressRow` | Live op progress | `scenario`, `done`, `total`, `state` | running, ok, fail, skip |
| `RunResultSummaryCard` | Final result | `status`, `runId`, `target`, `mode`, `counts`, `duration` | **success, partial_success, failed, cancelled** (never collapse partial→success) |
| `ErrorDetailPanel` | Per-op error | `code`, `message`, `scenario`, `metric`, `nativeError?`, `runId`, `requestId`, `recommendation` | the reason_codes set |
| `DiagnosticsRow` | Sanitized log line | `ts`, `text` | — (no tokens/PHI) |
| `ConfirmationModal` | Generic confirm | `title`, `body`, `confirmLabel`, `danger?`, `requireCheckbox?` | default, danger |
| `EmptyState` | No content | `title`, `hint` | list-empty, no-results |
| `LoadingState` | Loading | `label?` | spinner, skeleton |
| `RetryErrorState` | Recoverable error | `title`, `code?`, `requestId?`, `onRetry` | backend, generic |
| `SessionExpiredState` | Auth expiry | `env`, `onLogin`, `onRetry?` | — |
| `BackendUnavailableState` | Backend down | `endpoint`, `code`, `requestId`, `onRetry`, `onChangeEnv` | — |
| `InstallHealthConnectState` | Android HC missing | `androidVersion`, `onInstall`, `onDryRunOnly` | — |

## Safety-critical component rules
- `RealWriteConfirmCard` Confirm is **disabled** unless dry-run completed ∧ capability ok ∧ permissions resolved ∧ checkbox checked; the unmet gate is named.
- `ModeBadge=real_write` always pairs with `SafetyBanner` danger.
- `RunResultSummaryCard` must render `partial_success` distinctly; never map partial/failed/skipped to a generic success.
- `DiagnosticsRow` / logs never render tokens, credentials, raw scenario payloads, or real PHI.
- No component offers disable-safety, bypass-confirm, force-success, reorder/edit/upload/seed, or env local/dev/staging/prod management.

## Traceability
Components map to screens in [`MOBILE_RUNNER_SCREEN_MAP.md`](MOBILE_RUNNER_SCREEN_MAP.md);
states in [`MOBILE_RUNNER_STATE_MATRIX.md`](MOBILE_RUNNER_STATE_MATRIX.md);
safety behaviors in [`MOBILE_RUNNER_SAFETY_UX_MATRIX.md`](MOBILE_RUNNER_SAFETY_UX_MATRIX.md).

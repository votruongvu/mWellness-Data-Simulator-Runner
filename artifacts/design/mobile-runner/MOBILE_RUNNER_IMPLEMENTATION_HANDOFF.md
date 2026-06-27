# MOBILE_RUNNER_IMPLEMENTATION_HANDOFF.md

Maps the normalized MR-DESIGN-00 artifacts to the future implementation phases so
MR0/MR1+ stories can be authored later. **This is a handoff map only — it does
NOT create MR0/MR1 stories and does NOT implement code.** Master REQ is canonical;
design is implementation input. Phases per
[`docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md`](../../../docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md).

## Screen → phase → dependency map

| Screen(s) | Phase | Backend API dep | Native dep | Notes |
|---|---|---|---|---|
| P01 Splash, P02 Login, S02 Environment (lightweight) | **MR1** Foundation/Auth/API | auth login/refresh/logout/me | secure storage (Keychain/Keystore) — token by reference | Env stays lightweight (badge + connection); no local/dev/staging/prod UX. Token storage = hard human-approval gate. |
| P03 Runner Dashboard | MR1/MR2 | me, recent runs (optional) | capability probe | Safety-mode banner (Dry-run default). |
| P04 Platform Capability, E03/E04 Unsupported Platform | **MR4/MR5** (capability surfaces) | metric metadata / platform support | HealthKit availability (iOS); Health Connect availability/installation (Android) | Capability check precedes permission. Per-metric writability `TO_VERIFY`. |
| P05 Test Case List, P06 Test Case Detail | **MR2** Browser+Loader | `GET mobile/test-cases`, version detail | — | Read-only; no authoring. |
| P07 Version/Ordered Scenarios, S01 Payload Preview | **MR2** | ordered scenarios, scenario content, metric metadata | — | Read-only; order from backend; no reorder/edit/upload/seed. |
| P08 Execution Plan (Builder+Preview), P09 Dry-run Result | **MR3** Interpreter+Plan | scenario content + metric metadata | — | Build plan; classify ops; dry-run = zero writes. Deterministic replay. |
| P10 Permission Explanation, P11 Permission Status | **MR4** (iOS) / **MR5** (Android) | — | HealthKit authorization (iOS); Health Connect permissions (Android) | Explain before OS prompt; fail-closed. Permission-prompt timing/copy = hard gate. |
| P12 Real-write Confirmation | **MR4/MR5** | — | — | Gate chain; explicit confirm. Bypassing any gate = hard gate. |
| P13 Run Progress, P14 Run Result | **MR4/MR5** then **MR6** orchestration | run reporting (`POST mobile/runs`, optional) | HealthKit write (iOS); Health Connect insert (Android) | Real write = **hard human-approval gate**; no fake success; partial≠success. |
| S04 Run Error Detail, S03 Diagnostics | MR6/MR7 | — | native error surfacing | Redaction; reason_codes; no tokens/PHI. |
| S05 Settings | MR1/MR7 | — | — | Safety not user-disableable. |
| E01 Session Expired, E02 Backend Unavailable | MR1/MR2 cross-cutting | auth/refresh, error envelope + request ID | — | No fabricated backend data. |

## Component → phase
- Foundations (`AppHeader`, `EnvBadge`, `PlatformBadge`, `ModeBadge`, `StatusBadge`, `SafetyBanner`, `WarningBanner`, `EmptyState`, `LoadingState`, `RetryErrorState`): **MR1** (shared kit first).
- Browse/version (`TestCaseCard`, `VersionSummaryCard`, `ScenarioRow`, `MetricChip`, `MetricCategoryGroup`): **MR2**.
- Plan (`ExecutionPlanSummaryCard`, `OperationCountTile`, `ScenarioPlanRow`, `UnsupportedMetricPanel`): **MR3**.
- Permission/safety (`CapabilityCard`, `PermissionStateRow`, `PermissionExplainCard`, `RealWriteConfirmCard`, `ConfirmationModal`): **MR4/MR5**.
- Run/result (`RunProgressRow`, `RunResultSummaryCard`, `ErrorDetailPanel`, `DiagnosticsRow`): **MR4/MR5/MR6**.
- Platform-missing (`InstallHealthConnectState`, `SessionExpiredState`, `BackendUnavailableState`): respective phases.

## State coverage → phase
The per-screen states in [`MOBILE_RUNNER_STATE_MATRIX.md`](MOBILE_RUNNER_STATE_MATRIX.md)
become component-test cases in each owning phase; the operation classification
(`writable|unsupported|permission_missing|invalid|skipped`) + reason_codes are
the MR3 plan-builder + MR4/MR5 writer test surface; `partial_success` and
no-fake-success are MR4/MR5/MR6 acceptance gates.

## API dependencies summary (lock exact routes at MR0 — all `TO_VERIFY`)
auth (login/refresh/logout/me) · `mobile/test-cases` · version detail · ordered
scenarios · scenario content · catalog metric metadata · run reporting
(`POST mobile/runs`, optional/MR6). A missing required API → document gap + STOP
(human-approval gate), never fabricate.

## Native dependencies summary
- iOS: HealthKit availability, authorization (share/write), quantity/category/workout mapping, write, idempotency (sample identity) — **MR4**.
- Android: Health Connect availability/installation, write permissions, Record-type mapping, insert, idempotency (`clientRecordId`) — **MR5**.
- Native substrate (codegen/TurboModule) + entitlements/manifest are hard human-approval gates; per-metric writability `TO_VERIFY`.

## Hard human-approval gates triggered by design surfaces
Real Apple Health write (P12→P13, iOS) · real Health Connect write (P12→P13, Android) ·
permission-prompt timing/copy (P10) · bypassing dry-run/confirm/capability/permission ·
token/session storage (P02) · new platform/vendor (none — no Google Fit) ·
backend API gap forcing fabrication · production/release-readiness · native substrate.

## Readiness for MR0/MR1
- **MR0 (Contract Alignment):** design confirms the screen/flow/contract surface; MR0 must lock exact backend routes, per-metric writability, token storage, real-write gating, run scope, and the QA/device matrix (carried framework follow-up F1).
- **MR1 (Foundation/Auth/API):** foundations kit + P01/P02 + lightweight env + secure-storage token strategy (hard gate) are specified and ready to be storied.
- This handoff is sufficient to author MR1/MR2/MR3 user stories later; MR4/MR5 real-write stories remain behind hard human-approval gates.

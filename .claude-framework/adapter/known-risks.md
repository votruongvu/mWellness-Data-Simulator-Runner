# mWellness-Mobile-Runner — Known Risks

Durable risk register for the **mWellness Mobile Runner** repo. Seeded at
framework bootstrap (MR-FRAMEWORK-00, 2026-06-27) from Master REQ §16 + the
mandatory safety guardrails. These are **MWR's own** risks — not inherited
from any prior framework (see [`known-legacy.md`](known-legacy.md)).

## Severity rubric

- **P0** — blocker; resolve before any work proceeds.
- **P1** — resolve or **explicitly accept** before execution.
- **P2** — may close with follow-ups if the product owner accepts.

## Risk register

| ID | Sev | Risk | Affected | Required handling |
|---|---|---|---|---|
| R-MWR-001 | P0 | **Accidental real health writes.** A list/detail tap, a default, or a stray code path could write to Apple Health / Health Connect without dry-run + capability + permission + confirmation. | all writers, run flow | Dry-run default + explicit confirmation + safety gates (ADR-MWR-004); no real write from list/detail; `DRY_RUN_NO_WRITE_GATE`. P0 if violated. (Master REQ MR-RISK-001) |
| R-MWR-002 | P0 | **Fake native write success.** A write is reported succeeded when the native HealthKit save / Health Connect insert did not actually succeed (or was denied). | both writers, run reporting | Success reflects the actual native result (ADR-MWR-005); negative verification tests prove denied/failed writes are not reported as success; `NO_FAKE_SUCCESS_GATE`. P0 if violated. (Master REQ MR-RISK-002) |
| R-MWR-003 | P0 | **Token / raw-payload log leakage.** A token, auth header, or raw scenario payload is written to a log/diagnostic surface. | auth, backend client, diagnostics | Redaction mandatory on every log path; secrets by reference only (ADR-MWR-006); diagnostics dev-gated; `SECRET_AND_ENDPOINT_SAFETY_GATE`. P0 if violated. (Master REQ MR-RISK-005) |
| R-MWR-004 | P1 | **Mobile duplicates backend authoring logic.** A "convenient" on-device path authors/validates/reorders scenarios or computes a score, breaking the authority boundary. | architecture, interpreter | Backend remains source of truth (ADR-MWR-002); mobile interprets + executes only; `SCENARIO_CONTRACT_GATE`. (Master REQ MR-RISK-003) |
| R-MWR-005 | P1 | **Per-platform metric support differs.** A catalog metric writable on one platform is unsupported on the other (or across OS versions), and the assumption is baked in. | both writers, capability check, plan | Per-metric writability `TO_VERIFY`, confirmed per phase vs current Apple HealthKit / Android Health Connect docs (ADR-MWR-009); unsupported surfaced, never forced; MR0 mapping contract + capability checks. (Master REQ MR-RISK-004) |
| R-MWR-006 | P1 | **Permission denial mishandled.** A denied/partial OS permission is treated as granted, or the run proceeds as if it could write. | capability/permission flow | Permission explained BEFORE the native OS prompt; denied/partial **fails closed** and is surfaced; `CAPABILITY_PERMISSION_GATE`. P0 if a denied permission yields a (fake) success. |
| R-MWR-007 | P1 | **Unsupported metric silently dropped**, so a run looks complete but isn't. | platform writer, plan | Surface `status: unsupported` + `reason_code`; never silently drop (ADR-MWR-009); `PLATFORM_WRITER_GATE`. P0 if a drop is silent. |
| R-MWR-008 | P1 | **Backend API gap forces fabricated local data.** A missing/insufficient backend response tempts the app to invent test cases/scenarios/values locally. | backend client, interpreter | Document the gap and **STOP for human approval — never fabricate** (ADR-MWR-002); `BACKEND_API_GATE` + hard human-approval gate #7. |
| R-MWR-009 | P1 | **Token / session storage strategy unsafe.** Refresh model or secure-storage choice persists a raw token or uses plain storage. | auth, secure storage | Secrets by reference, resolved at runtime from Keychain/Keystore (ADR-MWR-006); the storage/refresh strategy itself is a hard human-approval gate (#5). |
| R-MWR-010 | P1 | **Terminology error: Android Health Connect called "Google HealthKit" / Google Fit.** A wrong term in old notes / user input / prior artifacts could mislead implementation. | docs, writers, capability matrix | **Correction recorded:** Android target = **Health Connect** (Jetpack Health Connect). "Google HealthKit" / "Google Fit" never appear in current truth except in an explicit correction ([`known-legacy.md`](known-legacy.md)). Validator flags the term. |
| R-MWR-011 | P1 | **Non-deterministic replay.** An ambient `Date.now()`/`Math.random()`, locale, timezone, or unordered iteration in the run path breaks deterministic replay of a stored plan. | execution plan, run state | Inject the clock; resolve relative -> absolute time deterministically; no ambient time/random in the run path (ADR-MWR-008); `EXECUTION_DETERMINISM_GATE`; a golden-replay diff is a defect. |
| R-MWR-012 | P1 | **Writer idempotency failure** — re-running a plan double-writes (duplicate HK samples / duplicate HC records). | both writers | iOS sample identity / sync identifier; Health Connect `clientRecordId`(+version); idempotency re-run test. |
| R-MWR-013 | P2 | **Real PHI/PII enters test data.** A fixture/scenario/log/commit contains real personal/health data, a real account/device id, or a real token. | all test-data surfaces | Synthetic-only (`TEST_DATA_SAFETY_GATE`); no-real-PHI scan travels with fixtures; clearly-synthetic identifiers; nothing traceable to a real person. P0 if violated. |
| R-MWR-014 | P2 | **High-frequency run/progress updates degrade the app** (UI jank, unbounded memory on a large ordered run). | run UI, run state | Throttle/batch progress off the UI thread; virtualize lists; bounded memory (`RN_PERFORMANCE_GATE`). |
| R-MWR-015 | P2 | **Production / release-readiness claimed prematurely** — an RC is called production-ready without a separate security/privacy review. | release, governance | No RC is production-ready without a separate security/privacy review (hard human-approval gate #8). |
| R-MWR-016 | P2 | **Native substrate work while unvalidated** — native iOS/Android changes land before the substrate/build is validated. | native modules, build | Native-substrate work while unvalidated is a hard human-approval gate (#9); mark native build state `TO_VERIFY` until proven. |

## TO_VERIFY

- R-MWR-005 (per-platform metric writability), R-MWR-009 (token storage),
  and the Master REQ §16 open questions (endpoints, run-reporting,
  real-write gating, run scope) are Opens — confirm or
  accept-as-delivery-risk before dependent execution (see
  [`current-decisions.md`](current-decisions.md)).

## MR-C payload (2026-06-27 update)
- **R-MWR-017 (was P0, now P1):** MR-C per-operation `PAYLOAD_GAP` — **resolved at the route level** by backend F8 `GET …/runnable-payload` (verified present; consumed by the mobile operation-level plan/dry-run with no-fabrication guards). **Residual P1:** an *authenticated live fetch* of concrete values for a real version has not been run (no token this session) — confirm before any native write. No values were fabricated. **[Superseded 2026-06-28 — see "R-MWR-017 → RESOLVED" below: the live fetch was run (HTTP 200, 4/4 concrete ops); `PAYLOAD_READY`, no residual payload gap.]**
- **R-MWR-018 (P1):** MR-C native writers (002–005) remain blocked on native substrate (no `ios/`/`android/` projects), human-approval gates #1/#2/#3/#9, and device QA (`NOT_EXECUTED`) — independent of the payload gate.

## MR-C payload (2026-06-28 — live verification)
- **R-MWR-017 → RESOLVED:** the MR-C per-operation payload gate is **`PAYLOAD_READY`** — an authenticated live fetch of `runnable-payload` (test_case 17 / version 15, HTTP 200) returned 4/4 concrete operations (value/unit/relative-time/idempotency_key/provenance). No fabrication; dev `root` seed credential used (redacted). Evidence: `docs/contracts/MR_C_LIVE_PAYLOAD_VERIFICATION.md`.
- **R-MWR-019 (P1, NEW):** the mobile runnable-payload **DTO is mis-aligned to the real F8 shape** — backend returns a relative `time:{model,start_offset_minutes,end_offset_minutes}` object + `profile_slugs[]` + top-level `destination_slug`/`time_model_note`/`operation_count`, while `runnablePayloadTypes.ts` expects `start_time`/`end_time` strings + `profile_slug`. As coded, `validateRunnablePayload` would mark every real op `MISSING_TIME`. **Reconcile the DTO/guard/operationPlan before the mobile consumes the ready payload** (resolve relative→absolute via the injected clock, ADR-MWR-008). Separate TS patch — not done in the verification gate.

## R-MWR-019 → RESOLVED (2026-06-28)
The mobile runnable-payload DTO/validator/operationPlan/dry-run were **aligned to the real F8
backend shape**: `profile_slugs[]` (preserved as an array, never collapsed), the relative
`time:{model,start_offset_minutes,end_offset_minutes}` object, and the extra top-level fields;
`order_index` may be null (ordering = array position). Relative→absolute resolution is via an
**injected clock** (`src/runner/timeModel.ts`) — no `Date.now()` in core (deterministic/replay-safe).
Validation was **not weakened** (added `INVALID_TIME_MODEL` + `MISSING_PROVENANCE`; still rejects
missing value/unit/idempotency/metric-ref). The verified live shape validates with **zero issues**.
`tsc --noEmit` clean; jest **24/24** pass. No native code; no fabrication.

## R-MWR-016 update (2026-06-28) — native substrate
Native substrate (`ios/`/`android/`) was **bootstrapped** from the RN 0.74.5 template under
human-approved hard-gate #9 — template/bootstrap-only, no writer/permission code. **Residual
(P1):** the **full native build is unverified** (pod install / xcodebuild / gradle assembleDebug
NOT run; node v25.1.0 is newer than RN 0.74's tested range — use node 20 LTS if the native build
fails). No real write may occur: gates #1/#2/#3 (real Apple Health / Health Connect writes +
permission prompt) remain pending and device QA remains NOT_EXECUTED.

## R-MWR-016 update (2026-06-28) — native substrate BUILD_VERIFIED
The native substrate now **builds from source on both platforms** (iOS `xcodebuild` simulator
`.app`; Android `gradle assembleDebug` `.apk`), under node v25.1.0 — the prior "full native build
unverified / node-25 caveat" residual is **resolved for builds**. A Ruby-3.4 `Gemfile` toolchain
fix was required (CocoaPods ≥ 1.16 + `nkf` for the `kconv` lib Ruby 3.4 dropped). **Remaining (P1):**
this is **build/compile only — NOT a runtime/device QA pass** (the `.app`/`.apk` were not run);
**device QA remains NOT_EXECUTED** and real writes still require gates #1/#2/#3 + real devices.
No writer/permission code exists.

## MWR-MRC-002 (2026-06-28) — iOS HealthKit capability/permission seam
- **R-MWR-020 (P1):** the iOS HealthKit native bridge is a **SEAM only** — `resolveHealthKitBridge`
  returns a fail-closed `gatePendingBridge` (reports unavailable; returns `gate_pending`, never
  success). Real capability/permission requires the native `MwrHealthKit` module + gates #1/#3/#9
  + a real device. No silent prompt: `requestPermissionGuarded` cannot reach the native prompt
  without explain-before-prompt + capability, even if a native module is later installed. The
  five-gate chain + no-fake-success are preserved; no write path exists. The on-screen pre-prompt
  explanation copy is **DRAFT** pending gate #3.

## MR-C-003 gate approvals (2026-06-28)
- **R-MWR-021 (P1, residual after approval):** MR-C-003 gates #1/#3/#9/#10 are human-APPROVED (ADR-MWR-011),
  but the **device-QA fields were submitted as unfilled placeholders** — no real iPhone/iOS/owner is named.
  Per the device-QA ground rule + no-fake-success, the **real on-device write cannot be executed or validated**,
  and the POC cannot be declared successful, until a concrete device + named QA owner are provided. Native
  scaffolding/build may proceed; the real write may not. **Do not fabricate a device or claim a successful write.**

## MWR-MRC-003 (2026-06-28) — iOS HealthKit write POC implemented
- **R-MWR-022 (P1):** a real iOS HealthKit **WRITE path now exists** (native `MwrHealthKit` module),
  gated by the five-gate chain + explicit confirmation + dev-only scope, and iOS build-verified
  (compiles/links HealthKit). **Device QA NOT_EXECUTED** — the actual on-device write, the OS permission
  prompt, and idempotency on re-run are unverified on a real device. **Do not claim a successful real
  write until a named device runs it.** No fake success; denied/unsupported/invalid are skipped.

## MWR-MRC-004 (2026-06-28) — Android Health Connect write POC implemented
- **R-MWR-023 (P1):** a real Android Health Connect **WRITE path now exists** (native `MwrHealthConnect`
  module), gated by the five-gate chain + explicit confirmation + dev-only scope, and Android
  build-verified (`assembleDebug` SUCCESSFUL). **Device QA NOT_EXECUTED** — the actual on-device write,
  the Health Connect permission flow, and idempotency are unverified on a real device; **do not claim a
  successful real write until a named device runs it.** No fake success; denied/unsupported/invalid skipped.
- **R-MWR-024 (P1):** **minSdk raised 23→26** for the Health Connect connect-client (drops Android 7.x).
  Confirm this is acceptable for the product, or gate Health Connect behind a runtime/availability check
  while keeping a lower minSdk via manifest override.

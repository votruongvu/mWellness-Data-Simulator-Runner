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

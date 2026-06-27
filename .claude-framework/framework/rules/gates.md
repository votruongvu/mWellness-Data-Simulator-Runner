# Gates — canonical catalog (mWellness-Mobile-Runner / MWR)

The single source for the framework's named gates. Each gate: **type ·
trigger · owner · checks · enforced by.** Skills/commands/packs cite a gate
by name; they do not re-define it. The mandatory behavioral rules in
[`prompt-overrides.md`](../../adapter/prompt-overrides.md) operationalize
these gates per surface. Owners are the `mwr-*` reviewer roster.

Gate types: **surface gates** (must be answered when a surface is touched)
and **process gates** (human decision points).

The runner pipeline is **backend runnable scenario contract -> mobile
execution plan -> platform writer (Apple Health / Health Connect)**; gates
are grouped to follow it.

## Surface gates

| Gate | Type | Trigger | Owner | Checks (pass = all true) | Enforced by |
|---|---|---|---|---|---|
| `BACKEND_API_GATE` | surface | the backend client: auth/session, loading test cases/versions/ordered scenarios/metric metadata, run reporting | mwr-backend-api-reviewer | base URL + endpoint from config (never hardcoded); auth via secure-storage **reference** (never raw token); backend ownership/authority not bypassed; responses validated + error-classified; redaction on every log path; a missing required API STOPs for human approval, never fabricates | backend-api-rules; security-rules; backend-api-contract-checklist |
| `SCENARIO_CONTRACT_GATE` | surface | interpreting validated scenario payloads + metric metadata into runner models | mwr-execution-plan-reviewer | payloads are **backend-validated**; mobile never authors/validates/mutates/reorders a scenario; interpretation is explicit + typed; an invalid payload **blocks the run with a reason**, never silently corrected | test-data-safety-rules; execution-plan-rules; scenario-contract-checklist |
| `EXECUTION_PLAN_GATE` | surface | building the execution plan / operation classification | mwr-execution-plan-reviewer | each operation classified `writable \| unsupported \| permission_missing \| invalid \| skipped`; every blocked operation carries a `reason_code`; blocked operations are visible **before** the run; no operation is silently dropped | execution-plan-rules; execution-plan-runner-checklist |
| `EXECUTION_DETERMINISM_GATE` | surface | the replay path of a stored plan / time resolution | mwr-execution-plan-reviewer | replaying a stored plan is deterministic; relative time resolves to absolute via an **injected clock**; no ambient `Date.now()`/`Math.random()` in the run path; plan/scenario version recorded; a golden-replay diff = STOP | execution-plan-rules; execution-determinism-checklist |
| `DRY_RUN_NO_WRITE_GATE` | surface | any write path or the dry-run flag (**CROWN JEWEL**) | mwr-test-data-and-health-write-safety-reviewer | dry-run performs **ZERO** real writes/native mutations; output is clearly labelled dry-run; **dry-run is the default**; a real write requires explicit, human-confirmed, config-driven enablement; **no code path bypasses the flag**; a dry-run that writes is a P0 | execution-plan-rules; secret-endpoint-safety-rules; dry-run-no-write-checklist |
| `CAPABILITY_PERMISSION_GATE` | surface | the capability check or permission flow on a write path | mwr-test-data-and-health-write-safety-reviewer | platform capability is checked **before** requesting permission; the permission is **explained before** the native OS prompt; a denied/partial permission **fails closed** (no write) and is surfaced | execution-plan-rules; platform-writer-rules; capability-permission-checklist |
| `APPLE_HEALTH_WRITE_GATE` | surface | Apple Health / HealthKit mapper or writer | mwr-apple-health-write-reviewer | maps to the correct `HKQuantityType`/`HKCategoryType`/workout type + `HKUnit`; share authorization respected; only permitted types written; idempotent (no duplicate samples on re-run); **HealthKit = Apple iOS only**, never confused with Health Connect; success only on actual native write | platform-writer-rules; apple-health-write-checklist |
| `HEALTH_CONNECT_WRITE_GATE` | surface | Android **Health Connect** mapper or writer | mwr-health-connect-write-reviewer | maps to the correct Health Connect **Record** type + unit; write permissions respected; only supported record types written; idempotent via `clientRecordId`(+version); **target is Health Connect — never "Google HealthKit", never Google Fit**; success only on actual native insert | platform-writer-rules; health-connect-write-checklist |
| `NO_FAKE_SUCCESS_GATE` | surface | any code path that reports a write/insert result (**CROWN JEWEL**) | mwr-test-data-and-health-write-safety-reviewer | a write is reported successful **only if** the native platform write/insert actually succeeded; failed/denied/partial results are reported honestly; **negative-verification tests prove** denied/failed writes are not reported as success | platform-writer-rules; no-fake-success-checklist |
| `PLATFORM_WRITER_GATE` | surface | a platform writer adapter / mapper boundary | (platform-specific writer reviewer) | the writer consumes **approved execution-plan operations only**; mapping is explicit + typed; an **unsupported metric is surfaced + skipped-with-`reason_code`, never silently dropped**; per-metric handling is honored | platform-writer-rules; platform-writer-contract-checklist |
| `RUN_REPORTING_GATE` | surface | the run-result summary or optional backend run report | mwr-backend-api-reviewer | summary reports `total/succeeded/failed/skipped` + `reason_codes`; an optional backend report is sent through the redacted client; **no token/raw-payload leakage** | backend-api-rules; platform-writer-rules; run-reporting-checklist |
| `SECRET_AND_ENDPOINT_SAFETY_GATE` | surface | any secret, token, base URL, endpoint, or auth mode | mwr-test-data-and-health-write-safety-reviewer | no raw secret/token committed (**reference name only**, resolved from Keychain/Keystore at runtime); no production endpoint as a default; endpoints from config; **redaction mandatory on every log path** | security-rules; secret-endpoint-safety-rules; secret-endpoint-safety-checklist |
| `TEST_DATA_SAFETY_GATE` | surface | any scenario fixture / test data / log sample | mwr-test-data-and-health-write-safety-reviewer | data is fabricated: **no real PHI/PII**, synthetic identifiers, nothing traceable to a real person, plausible-bounded values; no mock test case/scenario presented as complete product behavior | test-data-safety-rules; security-rules; test-data-safety-checklist |
| `RN_TESTING_GATE` | surface | a risky/data-bound RN UI change (any run-flow screen) | mwr-test-reviewer | RNTL tests cover run-flow states (idle/loading/plan-built/dry-run/confirming/executing/result/error) + invariants (dry-run no write, no fake success, unsupported surfaced, secrets redacted); no loosened assertions | rn-testing-rules; rn-testing-checklist |
| `RN_PERFORMANCE_GATE` | surface | new list/log/progress screen, high-frequency run/progress update, large preview, or new UI/perf dependency | mwr-rn-architecture-reviewer | measure-first evidence present; lists virtualized; high-frequency run/progress updates throttled/batched off the UI thread; stable callbacks; bounded memory; bundle considered | rn-performance-rules; rn-performance-checklist |
| `RN_UI_QUALITY_GATE` | surface | a run-flow UI surface | mwr-rn-architecture-reviewer | all states rendered; target **platform** and run **MODE** (dry-run vs real-write) are obvious throughout; permission prompts explained before the OS prompt; accessibility on controls/status | rn-ui-quality-rules; rn-ui-quality-checklist |
| `DOC_SYNC_GATE` | surface | a load-bearing fact moves (ADR/risk/wiring/settings/contract/capability) | mwr-doc-sync-reviewer | docs/adapter reflect the change or a promotion is queued; no silent governance divergence | documentation-rules |

## Process gates

| Gate | Type | Trigger | Owner | Checks (pass = all true) | Enforced by |
|---|---|---|---|---|---|
| `PROMPT_OVERRIDE_GATE` | process | composing any task brief | mwr-prompt-composer / Human Decision Owner | the brief answers every applicable mandatory rule in `prompt-overrides.md` for the touched surface; no override silently waived | prompt-rules; prompt-review checklist; prompt-overrides.md |
| `CONTEXT_PROMOTION_GATE` | process | a durable fact discovered at closeout | Human Decision Owner | only human-approved facts promote; the target adapter file is named; the source artifact is recorded | artifact-lifecycle; close-task / refresh-context |
| `ARTIFACT_TRUTH_GATE` | process | any claim of "current truth" | author | adapter = current truth; artifacts = evidence until promoted; source hierarchy respected | artifact-lifecycle; operating-principles |
| `SCOPE_SPLIT_GATE` | process | Full-lane / high-risk, ≥3 surfaces | Human Decision Owner | split vs single-patch decision made before implementation | lane-classification |
| `HUMAN_APPROVAL_GATE` | process | any of the hard human-approval triggers | Human Decision Owner | the loop halts and emits a Human Approval Request; the gate is never self-waived by the loop or budget | human-approval-gates.md; MWR_HUMAN_APPROVAL_GATES |

## Composition rule

Gates **compose** — a task touching several surfaces answers every matching
gate. No alias, lane, or task budget ever waives a gate. When gates
conflict, the **stricter** of `DRY_RUN_NO_WRITE_GATE` /
`NO_FAKE_SUCCESS_GATE` / `SECRET_AND_ENDPOINT_SAFETY_GATE` /
`TEST_DATA_SAFETY_GATE` wins.

## Universal high-risk rule

Any task touching the **backend client/auth, scenario interpretation, the
execution plan, dry-run, a platform writer, a real-write path,
capability/permission, or secrets/endpoints** is FULL lane and triggers at
minimum `DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` +
`CAPABILITY_PERMISSION_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE` +
`TEST_DATA_SAFETY_GATE`, regardless of its route's default lane.

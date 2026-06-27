# Context Pack Registry — mWellness-Mobile-Runner (MWR)

Selective-loading registry: which files to load per task, by **budget
level** and **context pack**, plus the **task-routing** table. Pull this on
demand — never default-load it.

**Always-on baseline (every task):** root [`CLAUDE.md`](../../../CLAUDE.md)
+ [`project-source-of-truth.md`](../../adapter/project-source-of-truth.md).

Packs point to adapter slices + rules + checklists. **Concrete repo paths
listed without a defer marker must exist on disk** (the
`validate_context_pack_paths.py` validator flags a missing non-deferred
path as ERROR). RN app paths, not-yet-authored checklists, and external
platform docs are marked `TO_VERIFY` / `DEFERRED` on the same line until
they exist.

---

## Context budget model (L0–L4)

| Level | Use for | Load |
|---|---|---|
| **L0** | `/direct-patch` (Tiny) | Edited file(s) + root `CLAUDE.md` guidance only. No packs. |
| **L1** | Small task (light, single objective, low risk) | Root guidance + **one** adapter slice. |
| **L2** | Normal focused task | **One** context pack + its named adapter files + the matching gate(s). |
| **L3** | Cross-surface task | **Multiple** packs + gates + the matching reviewer lenses. |
| **L4** | Full / high-risk task | Complete task brief + `project-source-of-truth.md` + full adapter + fan-out reviewers + Scope Split Gate. |

Escalate a level whenever a denylist trigger (see
[`lane-classification.md`](../rules/lane-classification.md)) or a
cross-surface dependency is discovered mid-task. Any backend-client/auth,
scenario-interpretation, execution-plan, dry-run, platform-writer,
real-write, capability/permission, or secret/endpoint surface is high-risk
/ full-lane regardless of its default below.

---

## Context packs

Each pack: **entry criteria · minimal files to read · adapter slices ·
gates · tests · reviewers · escalation.**

### AUTH_SESSION
- **Entry criteria:** mobile auth/login/refresh/logout, session storage, the authenticated-state machine.
- **Minimal files:** [`backend-api-rules.md`](../rules/backend-api-rules.md), [`secret-endpoint-safety-rules.md`](../rules/secret-endpoint-safety-rules.md).
- **Adapter:** [`project-source-of-truth.md`](../../adapter/project-source-of-truth.md), [`current-decisions.md`](../../adapter/current-decisions.md), [`settings-map.md`](../../adapter/settings-map.md).
- **Gates:** `BACKEND_API_GATE`, `SECRET_AND_ENDPOINT_SAFETY_GATE`.
- **Tests:** auth flow, token-by-reference, redaction, no-secret-in-repo.
- **Reviewers:** backend-api, test-data-and-health-write-safety, test.
- **Escalation:** token/session **storage strategy** is a hard human-approval gate → STOP.

### BACKEND_API_CLIENT
- **Entry criteria:** backend API client — loading test cases/versions/scenarios/metric metadata; run reporting; endpoint config; error classification.
- **Minimal files:** [`backend-api-rules.md`](../rules/backend-api-rules.md), [`secret-endpoint-safety-rules.md`](../rules/secret-endpoint-safety-rules.md), backend-api-contract-checklist (TO_VERIFY — not yet authored).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`settings-map.md`](../../adapter/settings-map.md), [`current-decisions.md`](../../adapter/current-decisions.md).
- **Gates:** `BACKEND_API_GATE`, `SECRET_AND_ENDPOINT_SAFETY_GATE`, `RUN_REPORTING_GATE` (when reporting).
- **Tests:** request/response contract, error taxonomy, redaction, ownership-not-bypassed.
- **Reviewers:** backend-api, test-data-and-health-write-safety, test.
- **Escalation:** a **missing/insufficient backend API** that would force fabricating local data → document the gap and STOP for human approval (never fabricate).

### SCENARIO_LOADING
- **Entry criteria:** fetching ordered scenarios + scenario content + catalog metric metadata after case+version selection.
- **Minimal files:** [`backend-api-rules.md`](../rules/backend-api-rules.md), scenario-contract-checklist (TO_VERIFY — not yet authored).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`current-decisions.md`](../../adapter/current-decisions.md).
- **Gates:** `BACKEND_API_GATE`, `SCENARIO_CONTRACT_GATE`.
- **Tests:** load + parse contract, ordering preserved (not reordered on device), invalid payload blocks with reason.
- **Reviewers:** backend-api, execution-plan, test.
- **Escalation:** any attempt to author/validate/mutate/reorder scenarios on device → P0.

### SCENARIO_INTERPRETATION
- **Entry criteria:** interpreting validated scenario payloads + metric metadata into runner models.
- **Minimal files:** [`execution-plan-rules.md`](../rules/execution-plan-rules.md), scenario-contract-checklist (TO_VERIFY — not yet authored).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`regression-fixtures.md`](../../adapter/regression-fixtures.md), [`known-risks.md`](../../adapter/known-risks.md).
- **Gates:** `SCENARIO_CONTRACT_GATE`, `EXECUTION_PLAN_GATE`.
- **Tests:** interpretation contract, invalid-payload-blocks, no-mutation-of-contract.
- **Reviewers:** execution-plan, test-data-and-health-write-safety, test.
- **Escalation:** mobile authoring/validating scenario semantics → P0, backend-authority bypass.

### EXECUTION_PLAN
- **Entry criteria:** building the execution plan; classifying each operation; deterministic replay of a stored plan.
- **Minimal files:** [`execution-plan-rules.md`](../rules/execution-plan-rules.md), execution-plan-runner-checklist (TO_VERIFY — not yet authored), execution-determinism-checklist (TO_VERIFY — not yet authored).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`regression-fixtures.md`](../../adapter/regression-fixtures.md), [`known-risks.md`](../../adapter/known-risks.md).
- **Gates:** `EXECUTION_PLAN_GATE`, `EXECUTION_DETERMINISM_GATE`.
- **Tests:** operation classification (`writable\|unsupported\|permission_missing\|invalid\|skipped` + reason_code), replay-determinism (injected clock; no ambient Date.now()/Math.random()).
- **Reviewers:** execution-plan, test-data-and-health-write-safety, test.
- **Escalation:** a blocked op with no reason_code, or a non-deterministic replay path → P0/P1.

### DRY_RUN
- **Entry criteria:** dry-run semantics — preview what *would* be written; the dry-run/real-write toggle.
- **Minimal files:** [`dry-run-no-write-checklist.md`](../checklists/dry-run-no-write-checklist.md), [`execution-plan-rules.md`](../rules/execution-plan-rules.md), [`platform-writer-rules.md`](../rules/platform-writer-rules.md).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`known-risks.md`](../../adapter/known-risks.md), [`settings-map.md`](../../adapter/settings-map.md).
- **Gates:** `DRY_RUN_NO_WRITE_GATE` (crown jewel), `EXECUTION_PLAN_GATE`.
- **Tests:** dry-run-no-write (zero real writes), dry-run-is-default, no-code-path-bypasses-the-flag, auditable dry-run→real switch.
- **Reviewers:** execution-plan, test-data-and-health-write-safety, test.
- **Escalation:** a dry-run that writes → P0. Bypassing dry-run/confirmation is a hard human-approval gate → STOP.

### CAPABILITY_PERMISSION
- **Entry criteria:** platform capability checks + the permission flow (explain-then-prompt; fail-closed).
- **Minimal files:** [`platform-writer-rules.md`](../rules/platform-writer-rules.md), capability-permission-checklist (TO_VERIFY — not yet authored), [`rn-ui-quality-rules.md`](../rules/rn-ui-quality-rules.md).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`settings-map.md`](../../adapter/settings-map.md), [`known-risks.md`](../../adapter/known-risks.md).
- **Gates:** `CAPABILITY_PERMISSION_GATE`, `RN_UI_QUALITY_GATE` (explain-before-prompt copy).
- **Tests:** capability-before-permission, permission-explained-before-OS-prompt, denied/partial-fails-closed.
- **Reviewers:** test-data-and-health-write-safety, rn-architecture, test.
- **Escalation:** **permission-prompt timing or copy** is a hard human-approval gate → STOP.

### APPLE_HEALTH_WRITE
- **Entry criteria:** Apple Health / HealthKit mapper + writer (iOS).
- **Minimal files:** [`apple-health-write-checklist.md`](../checklists/apple-health-write-checklist.md), [`platform-writer-rules.md`](../rules/platform-writer-rules.md), [`dry-run-no-write-checklist.md`](../checklists/dry-run-no-write-checklist.md), apple-health-write context doc (TO_VERIFY — RN app not scaffolded).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`settings-map.md`](../../adapter/settings-map.md), [`test-map.md`](../../adapter/test-map.md).
- **Gates:** `APPLE_HEALTH_WRITE_GATE`, `PLATFORM_WRITER_GATE`, `DRY_RUN_NO_WRITE_GATE`, `CAPABILITY_PERMISSION_GATE`, `NO_FAKE_SUCCESS_GATE`, `SECRET_AND_ENDPOINT_SAFETY_GATE`, `TEST_DATA_SAFETY_GATE`.
- **Tests:** HK type/unit mapping, idempotency (sample identity), capability/permission fail-closed, dry-run-no-write, no-fake-success (denied/failed not reported as success), device write (env-gated).
- **Reviewers:** apple-health-write, test-data-and-health-write-safety, test.
- **Escalation:** always full lane. **Any real Apple Health write behavior is a hard human-approval gate → STOP.** Per-metric writability is `TO_VERIFY`.

### HEALTH_CONNECT_WRITE
- **Entry criteria:** Android **Health Connect** mapper + writer.
- **Minimal files:** [`health-connect-write-checklist.md`](../checklists/health-connect-write-checklist.md), [`platform-writer-rules.md`](../rules/platform-writer-rules.md), [`dry-run-no-write-checklist.md`](../checklists/dry-run-no-write-checklist.md), health-connect-write context doc (TO_VERIFY — RN app not scaffolded).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`settings-map.md`](../../adapter/settings-map.md), [`test-map.md`](../../adapter/test-map.md).
- **Gates:** `HEALTH_CONNECT_WRITE_GATE`, `PLATFORM_WRITER_GATE`, `DRY_RUN_NO_WRITE_GATE`, `CAPABILITY_PERMISSION_GATE`, `NO_FAKE_SUCCESS_GATE`, `SECRET_AND_ENDPOINT_SAFETY_GATE`, `TEST_DATA_SAFETY_GATE`.
- **Tests:** Record type/unit mapping, idempotency (clientRecordId+version), availability/installation check, capability/permission fail-closed, dry-run-no-write, no-fake-success, device write (env-gated).
- **Reviewers:** health-connect-write, test-data-and-health-write-safety, test.
- **Escalation:** always full lane. **Any real Health Connect write behavior is a hard human-approval gate → STOP. Target is Health Connect — never "Google HealthKit", never Google Fit.** Per-metric writability is `TO_VERIFY`.

### RUN_REPORTING
- **Entry criteria:** run result summary + optional backend run report.
- **Minimal files:** [`backend-api-rules.md`](../rules/backend-api-rules.md), run-reporting-checklist (TO_VERIFY — not yet authored), [`secret-endpoint-safety-rules.md`](../rules/secret-endpoint-safety-rules.md).
- **Adapter:** [`wiring-paths.md`](../../adapter/wiring-paths.md), [`settings-map.md`](../../adapter/settings-map.md), [`test-map.md`](../../adapter/test-map.md).
- **Gates:** `RUN_REPORTING_GATE`, `NO_FAKE_SUCCESS_GATE`, `SECRET_AND_ENDPOINT_SAFETY_GATE`.
- **Tests:** summary{total,succeeded,failed,skipped}+reason_codes, no-fake-success, redaction (no token/raw-payload leakage).
- **Reviewers:** backend-api, test-data-and-health-write-safety, test.
- **Escalation:** reporting a write success the platform did not confirm → P0 (no-fake-success).

### DIAGNOSTICS
- **Entry criteria:** mobile diagnostics — dev-gated logs, redaction, run/error inspection.
- **Minimal files:** [`secret-endpoint-safety-rules.md`](../rules/secret-endpoint-safety-rules.md), [`security-rules.md`](../rules/security-rules.md).
- **Adapter:** [`settings-map.md`](../../adapter/settings-map.md), [`known-risks.md`](../../adapter/known-risks.md).
- **Gates:** `SECRET_AND_ENDPOINT_SAFETY_GATE`.
- **Tests:** redaction on every log path, diagnostics dev-gated only, no raw token/payload.
- **Reviewers:** test-data-and-health-write-safety, test.
- **Escalation:** any raw token/secret/payload reachable in a non-dev build → P0.

### Advisory packs (folded in, not standalone routes)
- **RN_UI_QUALITY** — [`rn-ui-quality-rules.md`](../rules/rn-ui-quality-rules.md) + rn-ui-quality-checklist (TO_VERIFY — not yet authored). Advisory; never alters MWR safety invariants (run MODE — dry-run vs real-write — must be obvious throughout).
- **RN_PERFORMANCE** — [`rn-performance-rules.md`](../rules/rn-performance-rules.md) + rn-performance-checklist (TO_VERIFY — not yet authored). Add on high-frequency run/progress updates.
- **RN_TESTING** — [`rn-testing-rules.md`](../rules/rn-testing-rules.md) + rn-testing-checklist (TO_VERIFY — not yet authored). Add on any data-bound/risky run-flow UI.

---

## Task routing

Each route: **lane default · packs · gates · reviewers · tests · split
triggers.** Lane is a *default* — the Lane Gate (human-confirmed) can
override. **Reviewer shorthand** resolves to agent files via
[`mwr-review-fanout-pattern.md`](mwr-review-fanout-pattern.md).

| Route | Lane | Packs | Gates | Reviewers | Tests | Split trigger |
|---|---|---|---|---|---|---|
| `REQ_UPDATE` | full | (DOCS-equiv + relevant) | (decision-change), `DOC_SYNC` | doc-sync, rn-architecture | n/a | new decision affecting ≥3 surfaces |
| `STORY_BREAKDOWN` | light | relevant pack | none | doc-sync | n/a | story spans multiple surfaces |
| `TASK_COMPOSITION` | light | relevant pack(s) | all relevant | prompt-composer | n/a | ≥3 surfaces → Scope Split Gate |
| `AUTH_SESSION` | full | AUTH_SESSION | `BACKEND_API`, `SECRET_AND_ENDPOINT_SAFETY` | backend-api, test-data-and-health-write-safety, test | auth flow, redaction, no-secret | token-storage decision → STOP |
| `BACKEND_API_CLIENT` | full | BACKEND_API_CLIENT | `BACKEND_API`, `SECRET_AND_ENDPOINT_SAFETY` | backend-api, test-data-and-health-write-safety, test | contract, error-taxonomy, redaction | backend API gap → STOP (no fabrication) |
| `SCENARIO_LOADING` | full | SCENARIO_LOADING | `BACKEND_API`, `SCENARIO_CONTRACT` | backend-api, execution-plan, test | load/parse, ordering preserved | mobile reorders/validates scenarios → P0 |
| `SCENARIO_INTERPRETATION` | full | SCENARIO_INTERPRETATION | `SCENARIO_CONTRACT`, `EXECUTION_PLAN` | execution-plan, test-data-and-health-write-safety, test | interpretation, invalid-blocks | authors scenario semantics → P0 |
| `EXECUTION_PLAN` | full | EXECUTION_PLAN | `EXECUTION_PLAN`, `EXECUTION_DETERMINISM` | execution-plan, test-data-and-health-write-safety, test | classification+reason_code, replay-determinism | + a writer in one patch |
| `DRY_RUN` | full | DRY_RUN | `DRY_RUN_NO_WRITE`, `EXECUTION_PLAN` | execution-plan, test-data-and-health-write-safety, test | dry-run-no-write, dry-run-default, no-bypass | bypassing dry-run/confirmation → STOP |
| `CAPABILITY_PERMISSION` | full | CAPABILITY_PERMISSION | `CAPABILITY_PERMISSION`, `RN_UI_QUALITY` | test-data-and-health-write-safety, rn-architecture, test | capability-before-permission, explain-before-prompt, fail-closed | permission timing/copy → STOP |
| `APPLE_HEALTH_WRITE` | full | APPLE_HEALTH_WRITE | `APPLE_HEALTH_WRITE`, `PLATFORM_WRITER`, `DRY_RUN_NO_WRITE`, `CAPABILITY_PERMISSION`, `NO_FAKE_SUCCESS`, `SECRET_AND_ENDPOINT_SAFETY`, `TEST_DATA_SAFETY` | apple-health-write, test-data-and-health-write-safety, test | mapping, idempotency, no-fake-success, device(env-gated) | real Apple Health write → STOP |
| `HEALTH_CONNECT_WRITE` | full | HEALTH_CONNECT_WRITE | `HEALTH_CONNECT_WRITE`, `PLATFORM_WRITER`, `DRY_RUN_NO_WRITE`, `CAPABILITY_PERMISSION`, `NO_FAKE_SUCCESS`, `SECRET_AND_ENDPOINT_SAFETY`, `TEST_DATA_SAFETY` | health-connect-write, test-data-and-health-write-safety, test | mapping, idempotency(clientRecordId), no-fake-success, device(env-gated) | real Health Connect write → STOP; never "Google HealthKit" |
| `RUN_REPORTING` | full | RUN_REPORTING | `RUN_REPORTING`, `NO_FAKE_SUCCESS`, `SECRET_AND_ENDPOINT_SAFETY` | backend-api, test-data-and-health-write-safety, test | summary+reason_codes, no-fake-success, redaction | reporting unconfirmed success → P0 |
| `SECRET_ENDPOINT_SAFETY` | full | DIAGNOSTICS | `SECRET_AND_ENDPOINT_SAFETY`, `DRY_RUN_NO_WRITE` | test-data-and-health-write-safety (mand.), test | no-secret-in-repo, prod-not-default, redaction | touches any real-write path |
| `DIAGNOSTICS` | light→full | DIAGNOSTICS | `SECRET_AND_ENDPOINT_SAFETY` | test-data-and-health-write-safety, test | redaction, dev-gated-only | raw token/payload in non-dev build → P0 |
| `QA_TESTING` | light | (QA / fixtures) | `RN_TESTING`, `EXECUTION_DETERMINISM`, `TEST_DATA_SAFETY` | test, test-data-and-health-write-safety | all + replay-determinism + safety matrix | new platform/metric class |
| `INTERNAL_RELEASE` | full | (release + QA) | `DRY_RUN_NO_WRITE`, `NO_FAKE_SUCCESS`, `SECRET_AND_ENDPOINT_SAFETY`, `TEST_DATA_SAFETY` | test-data-and-health-write-safety, test | acceptance smoke, dry-run-default, no-secret-in-artifact | release-readiness claim → STOP |
| `MOBILE_UI` | light | (CORE + RN_UI_QUALITY) | (`RN_PERFORMANCE` if high-frequency) | rn-architecture, test | unit, component, run-MODE-obvious | data-bound to plan/writer → L3 |
| `DIRECT_PATCH` | tiny | none (edited file + root guidance, L0) | Tiny preflight (denylist + size cap) | none | nearest focused test | any denylist hit / >3 files / >50 lines → escalate |
| `DOCS_ONLY` | tiny | (DOCS-equiv) | none | doc-sync (if load-bearing) | none | a decision actually changes |
| `BUGFIX` | tiny→light | by surface | by surface | by surface | regression for the bug | denylist surface touched |
| `REFACTOR` | light→full | by surface | by surface | rn-architecture, test | no behavior change proven (replay identical) | spans modules |
| `FRAMEWORK_UPDATE` | light | (FRAMEWORK-equiv) | single-source (no re-inlined denylist/gates), product-boundary | doc-sync, rn-architecture | validate-framework.sh | touches lane/gate canon |

**Universal rule:** any route touching the backend client/auth, scenario
interpretation, the execution plan, dry-run, a platform writer, a
real-write path, capability/permission, or secrets/endpoints is
**high-risk / full-lane** regardless of its default above, and triggers at
minimum `DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` +
`CAPABILITY_PERMISSION_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE` +
`TEST_DATA_SAFETY_GATE` (prompt-overrides lane policy).

## TO_VERIFY / DEFERRED

- RN app paths (screens, hooks, native modules, writer adapters) land once
  the app is scaffolded — `TO_VERIFY` until then.
- Not-yet-authored checklists (backend-api-contract, scenario-contract,
  execution-plan-runner, execution-determinism, capability-permission,
  run-reporting, rn-testing, rn-performance, rn-ui-quality,
  mobile-exploratory-qa) are marked `TO_VERIFY` on their pack lines and
  resolve to the cited rules until authored.
- Exact backend routes, per-platform metric writability, and token-storage
  strategy are `TO_VERIFY` pending MR0 contract alignment + human approval.

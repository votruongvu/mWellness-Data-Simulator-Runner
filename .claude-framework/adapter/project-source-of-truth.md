# mWellness-Mobile-Runner — Project Source of Truth

The one-page router for Claude work in this repository. **Read this
first.** When in doubt about scope, authority, or where to look, this file
decides.

> Seeded at framework bootstrap (MR-FRAMEWORK-00, 2026-06-27). The React
> Native app is **not yet scaffolded**; concrete RN paths are `TO_VERIFY`
> until then ([`repository-map.md`](repository-map.md)). This module is
> docs + validators only — no product code, no RN app, no health-write
> code.

## Project identity

mWellness-Mobile-Runner (`MWR` / `mwr`) — a **React Native + TypeScript
MOBILE RUNTIME** that authenticates users, loads validated runnable test
cases/scenarios **directly from the `mWellness-Data-Simulator` (MWDS) Go
backend** after login, interprets them into an execution plan, dry-runs,
requests health permissions, writes via **Apple Health** (iOS) / **Health
Connect** (Android), and reports run results. It is **not** an authoring
system. The upstream **source of truth** = the **MWDS Web App + Go
backend**.

## Core operating principle (load-bearing — never reorder)

> **Backend runnable scenario contract first -> mobile execution plan
> second -> platform writer third.**

The backend authors and validates the scenario contract. The mobile app
*interprets* that contract into an execution plan, *previews* it via
dry-run, and *executes* it through a platform writer. A write is never
authored on device, and a value is never "made up" to fill a backend gap.

## What MWR owns (this repo)

- Mobile auth/session.
- The backend API client (loading test cases/versions/ordered
  scenarios/metric metadata; optional run reporting).
- Scenario interpretation (validated payload + metric metadata -> runner
  models).
- Execution plan generation (operation classification).
- Dry-run.
- Platform capability checks.
- Health permission flow (explained before the OS prompt).
- Apple Health / Health Connect writer adapters.
- Run progress / result reporting.
- Mobile diagnostics.

## What MWR does NOT own / is NOT

- **MWR is not the authoring system.** The MWDS backend owns the catalog
  source of truth, scenario validation authority, test case authoring, the
  scenario seed library/applicability, and versioning/scenario-ordering
  authority. Mobile **does not author, validate, mutate, or reorder
  scenarios** (ADR-MWR-002).
- **MWR is not the score/fusion engine** and does not compute or assert an
  authoritative wellness score.
- **MWR holds no platform control plane.** RBAC/tenant/billing/admin are
  out of scope.
- **MWR holds no secrets.** Tokens/credentials are referenced by name and
  resolved at runtime from Keychain/Keystore, never committed
  (ADR-MWR-006).
- **No Google Fit, no vendor SDK** unless human-approved (ADR-MWR-007).

## Safety invariants (always in force)

- **No accidental health data writes** — a real write needs dry-run +
  capability check + permission check + explicit confirmation (ADR-MWR-004).
- **No fake native write success** — success must reflect the actual
  platform write/insert result (ADR-MWR-005).
- **No unsupported metric silently dropped** — skip with a `reason_code`
  and surface it (ADR-MWR-009).
- **No raw token / payload log leakage** — redaction on every log path;
  diagnostics dev-gated (ADR-MWR-006).
- **No backend authority bypass** — runnable data comes from the
  authenticated API; if a required API is missing, document the gap and
  STOP for human approval — never fabricate local data (ADR-MWR-002).
- **No real PHI/PII** in test data/fixtures/scenarios/logs/commits — all
  synthetic.
- The Android health target is **Health Connect**, never "Google
  HealthKit" / Google Fit (see [`known-legacy.md`](known-legacy.md)).

## Health-store landscape (two targets — Master REQ §8)

| Target | Platform | Mechanism |
|---|---|---|
| **Apple Health / HealthKit** | iOS only | Map to `HKQuantityType`/`HKCategoryType`/workout type + `HKUnit`; request + respect **share authorization**; permitted types only; idempotent; never report success unless the native write succeeds. |
| **Health Connect** | Android only | Map to the correct Health Connect **Record type** + unit; request + respect **write permissions**; supported record types only; idempotent via `clientRecordId`(+version); never report success unless the native insert succeeds. **Health Connect — never "Google HealthKit", never Google Fit.** |

Per-platform metric writability is `TO_VERIFY` — the framework must not
assume every catalog metric is writable (confirmed per phase in
MR0/MR3/MR4/MR5; R-MWR-005).

## Backend-authority boundary (no fabrication)

MWR **loads** the backend-validated runnable contract through authenticated
APIs and **executes** it; it never authors/validates/reorders scenarios and
never injects synthetic data to compensate for a missing/insufficient
backend response. A backend API gap that would force local fabrication is a
**hard human-approval gate** (see [`human-approval-gates.md`](human-approval-gates.md)).

## Critical gates (must be answered when the surface is touched)

See [`../framework/rules/gates.md`](../framework/rules/gates.md) (the
single gate definition) + [`prompt-overrides.md`](prompt-overrides.md). Any
task touching the backend client/auth, scenario interpretation, the
execution plan, dry-run, a platform writer, a real-write path,
capability/permission, or secrets/endpoints is **high-risk / full-lane** —
never a tiny patch. The crown-jewel gates `DRY_RUN_NO_WRITE_GATE` /
`NO_FAKE_SUCCESS_GATE` / `SECRET_AND_ENDPOINT_SAFETY_GATE` /
`TEST_DATA_SAFETY_GATE` win on conflict.

## Context routing

| For a task about... | Read first |
|---|---|
| backend client / auth / loading | [`../framework/rules/backend-api-rules.md`](../framework/rules/backend-api-rules.md) + the BACKEND_API_CLIENT pack |
| scenario interpretation / contract | [`../framework/rules/execution-plan-rules.md`](../framework/rules/execution-plan-rules.md) + the SCENARIO_LOADING / INTERPRET_PLAN packs |
| execution plan / determinism / dry-run | [`../framework/rules/execution-plan-rules.md`](../framework/rules/execution-plan-rules.md) + the DRY_RUN pack |
| an Apple Health / Health Connect writer | [`../framework/rules/platform-writer-rules.md`](../framework/rules/platform-writer-rules.md) + the matching write pack |
| secrets / endpoints / safety | [`../framework/rules/security-rules.md`](../framework/rules/security-rules.md) + [`../framework/rules/secret-endpoint-safety-rules.md`](../framework/rules/secret-endpoint-safety-rules.md) |
| test/scenario data safety | [`../framework/rules/test-data-safety-rules.md`](../framework/rules/test-data-safety-rules.md) |
| risks / open decisions | [`known-risks.md`](known-risks.md) + [`current-decisions.md`](current-decisions.md) |
| tests / acceptance | [`test-map.md`](test-map.md) + [`regression-fixtures.md`](regression-fixtures.md) |
| wiring / data flow | [`wiring-paths.md`](wiring-paths.md) |
| decisions in force | [`current-decisions.md`](current-decisions.md) |
| human approval gates | [`human-approval-gates.md`](human-approval-gates.md) |
| requirements | [`../../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`](../../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html) |

## Source hierarchy

1. **Real repo state** — descriptive current-state facts (code wins over
   docs for *descriptive* facts only — never silently supersedes a
   governance decision).
2. **Mobile Runner Master REQ** (canonical product requirements):
   [`../../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`](../../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html).
3. **`.claude-framework/adapter/*`** — current decisions/risks/wiring
   (current truth).
4. **`.claude-framework/artifacts/*`** — evidence/history, **NOT** current
   truth.

A path or fact that cannot be verified against the real repo is marked
`TO_VERIFY` or `UNKNOWN — needs human confirmation`.

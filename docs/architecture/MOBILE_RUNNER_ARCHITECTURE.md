# mWellness Mobile Runner — Target Architecture

> Target architecture for `mWellness-Mobile-Runner` (MWR), derived from
> [Master REQ §5](../requirements/MOBILE_RUNNER_MASTER_REQ.md#5-target-architecture).
> **Status: the React Native app is NOT yet scaffolded — every `src/` path below
> is `TO_VERIFY` until MR1.** This document describes the intended target shape so
> contracts (MR0) and the dry-run plan (MR3) lock before any writer lands.

## Operating principle (load-bearing)

> **Backend runnable scenario contract first -> mobile execution plan second ->
> platform writer third.**

The backend (MWDS) authors and validates the scenario contract. The mobile app
*interprets* that contract into an execution plan, *previews* it via dry-run, and
*executes* it through a platform writer. A write is never authored on device; a
value is never fabricated to fill a backend gap. MWR does deterministic **replay**
of an execution plan — never data **generation**.

## Authority boundaries

**Mobile OWNS:** mobile auth/session; the backend API client; runnable test
case/scenario loading; scenario interpretation; execution plan generation;
dry-run; platform capability checks; the permission flow; the Apple Health /
Health Connect writer adapters; run progress/result reporting; mobile diagnostics.

**Mobile does NOT own:** the catalog source of truth; scenario validation
authority; test case authoring; the scenario seed library/applicability;
versioning/scenario-ordering authority; RBAC/tenant/billing/admin; Google Fit or
vendor SDKs unless human-approved.

## Layer recommendations (REQ §5)

| Layer | Recommendation | Notes |
|---|---|---|
| App | React Native + TypeScript | Dedicated mobile repository. |
| iOS native | Swift module | HealthKit capability/permission/write adapter. `TO_VERIFY` until MR4. |
| Android native | Kotlin module | Health Connect capability/permission/write adapter. `TO_VERIFY` until MR5. |
| Server state | TanStack Query or equivalent | Fetch/cache backend data. `TO_VERIFY`. |
| Secure storage | Keychain/Keystore-backed | For persistent session material if used. Strategy is a human-approval gate. |
| Logging | Structured local logs | No tokens; raw scenario payloads dev-gated only. |

## Target module tree (`src/` — TO_VERIFY, not yet scaffolded)

```text
src/
  auth/                  # mobile auth/session, secure-storage reference resolution
  backend/               # MWDS API client: login/refresh/logout/me, test cases,
                         #   versions, ordered scenarios, scenario content, metric
                         #   metadata, run reporting; redaction on every log path
  catalog/               # metric metadata consumption (backend-owned definitions)
  testCases/             # runnable test case + version browsing/selection
  runner/
    interpreter/         # parse validated scenario payloads -> internal runner models
    executionPlan/       # build plan; classify operations; resolve relative->absolute time
    runState/            # run lifecycle state machine (SELECT_TEST_CASE..COMPLETE)
  health/
    common/              # shared writer interface + capability/permission abstractions
    appleHealth/         # iOS HealthKit writer adapter (reachable only post-gates)
    healthConnect/       # Android Health Connect writer adapter (reachable only post-gates)
  safety/                # dry-run flag, confirmation, no-fake-success, redaction
  diagnostics/           # dev-gated diagnostics
  shared/                # cross-cutting types/utilities
```

## Architectural invariants

1. **UI must not call native writers directly.** Screens drive the run-state
   machine; only the runner/safety layer invokes the writer adapters.
2. **Native writers implement a common interface** (in `health/common/`) and are
   **reachable only after safety gates pass**: capability check -> permission
   check -> dry-run -> explicit confirmation -> native write -> no-fake-success
   reporting. See [`docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md).
3. **Dry-run is the default.** Real write requires explicit, human-confirmed,
   config-driven enablement; no code path bypasses the dry-run flag.
4. **Backend is the source of truth.** The interpreter consumes validated
   payloads; it never authors, validates, mutates, or reorders scenarios. An
   invalid payload blocks the run with a reason.
5. **Determinism = replay.** The run path resolves relative time to absolute via
   an injected clock; no ambient `Date.now()` / `Math.random()`.
6. **SDK symbols stay out of the TS domain.** OS SDK identifiers (HealthKit /
   Health Connect) resolve only inside native `.swift` / `.mm` / `.kt` files; the
   TS layer carries unqualified concept tokens. See
   [`docs/platform/MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md`](../platform/MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md).

## Data flow (intended wiring)

```text
login -> backend client -> runnable test cases -> select case+version
  -> load ordered scenarios + metric metadata
  -> interpreter (validate-consume) -> executionPlan (classify + time-resolve)
  -> capability check -> permission check
  -> DRY-RUN preview (no write)
  -> explicit confirmation (only if real-write enabled)
  -> platform writer (appleHealth | healthConnect)
  -> native write result -> run result (no-fake-success)
  -> optional backend run report
```

## Cross-references

- Backend client contract: [`docs/contracts/MOBILE_BACKEND_API_CONTRACT.md`](../contracts/MOBILE_BACKEND_API_CONTRACT.md)
- Execution model + state machine: [`docs/contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`](../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md)
- Health-write safety: [`docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)
- Capability matrix: [`docs/platform/MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md`](../platform/MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md)
- Phase roadmap: [`docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md`](../roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md)

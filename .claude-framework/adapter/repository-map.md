# mWellness-Mobile-Runner — Repository Map

Where MWR code **will** live. Seeded at framework bootstrap
(MR-FRAMEWORK-00, 2026-06-27).

> **The React Native app is NOT scaffolded yet.** No RN app, no native
> projects, no product source files exist in this repo. Every `src/`,
> `ios/`, and `android/` path below is the *intended* layout per Master REQ
> §5 and is `TO_VERIFY` / "not scaffolded yet" until the corresponding
> phase lands it. This module is docs + validators only.

## What exists now (framework only)

```text
CLAUDE.md                         root operating contract
.claude/                          live workflow surface (commands, skills, agents, hooks, state, HANDOFF)
.claude-framework/                rules, templates, checklists, context, the Context Layer (adapter/), execution loop, artifacts, scripts
.claude-framework/adapter/        curated CURRENT TRUTH (this file + decisions, risks, gates, wiring, …)
.claude-framework/execution/      MWR execution loop (controller/state/runbook/gates/closeout/stop/phase-queue)
docs/                             canonical REQ + architecture/contracts/safety/roadmap/platform docs
artifacts/bootstrap/              MWR_FRAMEWORK_EXTRACTION_AUDIT.md (planning/audit evidence)
```

## Planned product layout (TO_VERIFY — per Master REQ §5; not scaffolded yet)

```text
src/
  auth/              mobile auth/session                                   TO_VERIFY (MR1)
  backend/           backend API client (load test cases/versions/scenarios/metric metadata; run reporting)  TO_VERIFY (MR1/MR2/MR6)
  catalog/           metric metadata consumption (backend-owned definitions)  TO_VERIFY (MR2)
  testCases/         runnable test case browser + selection                TO_VERIFY (MR2)
  runner/
    interpreter/     validated scenario payload + metric metadata -> runner models  TO_VERIFY (MR3)
    executionPlan/   plan builder; operation classification (writable|unsupported|permission_missing|invalid|skipped)  TO_VERIFY (MR3)
    runState/        run lifecycle state machine + deterministic replay     TO_VERIFY (MR3/MR6)
  health/
    common/          capability check + permission flow (explain-before-prompt; fail-closed)  TO_VERIFY (MR4/MR5)
    appleHealth/     Apple Health / HealthKit writer adapter (iOS)          TO_VERIFY (MR4)
    healthConnect/   Health Connect writer adapter (Android)               TO_VERIFY (MR5)
  safety/            dry-run guard, no-fake-success result mapping, run-mode (dry-run vs real)  TO_VERIFY (MR3+)
  diagnostics/       redacted, dev-gated diagnostics                       TO_VERIFY (MR1+)
  shared/            shared types/utils (no SDK symbols in the TS domain)  TO_VERIFY

ios/                 RN iOS substrate (Swift HealthKit module, entitlements, Info.plist usage strings)  TO_VERIFY (native substrate — hard gate #9; added only with the writer)
android/             RN Android substrate (Kotlin Health Connect module, manifest WRITE_* perms)         TO_VERIFY (native substrate — hard gate #9; added only with the writer)
```

> **Architecture invariant (Master REQ §5):** the UI must not call native
> writers directly. Native writers implement a common interface and are
> reachable only after the safety gates (capability + permission + dry-run
> + confirmation) pass.

## TO_VERIFY

- The entire RN app + native projects (`ios/`, `android/`) — not
  scaffolded; created phase by phase, never as a side effect of framework
  work.
- Exact RN version, native-module prefix (`Mwr<Capability>`), and the
  state/data-fetching library (TanStack Query or equivalent) — set at
  scaffold (MR1), subject to ADR.
- Concrete file names per hop — see [`wiring-paths.md`](wiring-paths.md)
  for the authoritative *shapes*; files land with their phase.

## MR-A update (2026-06-27) — app foundation now exists
The React Native app foundation was scaffolded at **repo root** in MR-A (ADR-MWR-010):
`package.json`, `tsconfig.json`, `App.tsx`, `index.js`, and `src/` —
`src/config` (env seam), `src/navigation` (RootNavigator: auth vs app stack),
`src/shared` (theme + components + redaction), `src/auth` (secureStorage[keychain],
authApi, SessionContext), `src/backend` (apiClient, types), `src/screens`
(Splash, Login, Dashboard, Settings, errors/{SessionExpired,BackendUnavailable}).
Native `ios/`/`android/` projects are generated from the RN 0.74.5 template at
setup (not committed). MR-B+ adds test-case/scenario/runner/health code. Build/run
not yet toolchain-verified — see `docs/platform/MWR_APP_FOUNDATION_SETUP.md`.

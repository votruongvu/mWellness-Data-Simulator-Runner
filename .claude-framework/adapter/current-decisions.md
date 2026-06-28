# mWellness-Mobile-Runner — Current Decisions (ADRs)

Durable decisions in force for the **mWellness Mobile Runner** repo. Seeded
at framework bootstrap (MR-FRAMEWORK-00, 2026-06-27). These are **MWR's
own** decisions — they are **not** inherited from any prior framework, whose
decisions are explicitly not carried (see
[`known-legacy.md`](known-legacy.md)).

## Status meanings

- `Active` — current source of truth; use it.
- `Open` — do **not** bake into implementation until resolved; REQs
  touching it must carry an `OPEN ASSUMPTION`.
- `Conditional` — allowed only when the named gate is satisfied.
- `Proposed` — recorded but **not yet ratified** by the Human Decision
  Owner; do not treat as canonical until accepted (then flip to `Active`).

> Any **new ADR, or change to an active ADR, is a hard human-approval
> gate** (see [`human-approval-gates.md`](human-approval-gates.md)).

## Decision index

| ID | Status | Decision |
|---|---|---|
| ADR-MWR-001 | Active | **MWR is a React Native + TypeScript mobile RUNTIME** (TypeScript-strict; native iOS Swift + Android Kotlin modules for the health writers; UI never calls native writers directly — native writers implement a common interface reachable only after safety gates pass). Exact RN version + native-module prefix (`Mwr<Capability>`) are `TO_VERIFY` — set at scaffold, subject to a later ADR. (Master REQ §1, §5) |
| ADR-MWR-002 | Active | **The MWDS backend is the upstream authority; mobile does NOT author/validate/reorder scenarios.** The backend owns the catalog, test case authoring, scenario validation, the scenario seed library/applicability, and versioning/scenario-ordering. Mobile loads the backend-validated runnable contract and executes it; it never mutates version or scenario order. (Master REQ §2, MR-TC-005) |
| ADR-MWR-003 | Active | **Backend-API-first loading is the primary data flow** (login -> fetch runnable test cases -> select case+version -> load ordered scenarios + metric metadata, all via authenticated APIs). **Export bundles are NOT the primary handoff** — they may be an optional later input but are never the primary mobile runner data source. (Master REQ §1, §3) |
| ADR-MWR-004 | Active | **Dry-run precedes real write; dry-run is the safe default.** No real write occurs without dry-run + capability check + permission check + explicit human confirmation. Dry-run performs ZERO real writes and labels its output as dry-run; no code path bypasses the dry-run flag; real-write enablement is explicit, config-driven, and human-confirmed. (Master REQ §11 MR-SAFE-001/002, §15) |
| ADR-MWR-005 | Active | **No fake native write success.** A write/insert is reported successful ONLY if the native platform call actually succeeded. Writer POCs ship with negative verification proving that denied/failed native writes are not reported as success. (Master REQ §8 MR-IOS-004/MR-AND-004, §11 MR-SAFE-004, §13) |
| ADR-MWR-006 | Active | **Secrets are references, never values; redaction is mandatory.** Tokens/credentials are carried as a reference name and resolved at runtime from **Keychain/Keystore**; never committed, hardcoded, logged, or persisted in plain app storage. No production endpoint is a default; endpoints come from config. Every log path redacts tokens, auth headers, and raw payloads; raw scenario payloads are dev-gated only. (Master REQ §5, §11 MR-SEC-001/002) |
| ADR-MWR-007 | Active | **Health targets are Apple Health (iOS) + Health Connect (Android) ONLY.** **No Google Fit and no direct vendor SDK** without explicit human approval. The Android health-store target is **Health Connect** — never "Google HealthKit" (a wrong term) and never Google Fit. (Master REQ §2, §4, §8; see [`known-legacy.md`](known-legacy.md)) |
| ADR-MWR-008 | Active | **The execution plan classifies every operation and is deterministically replayable.** Each operation is `writable \| unsupported \| permission_missing \| invalid \| skipped`; blocked operations carry a `reason_code` and are visible before the run. Replaying a stored plan is deterministic — relative time resolves to absolute via an injected clock; no ambient `Date.now()`/`Math.random()` in the run path. **This is deterministic REPLAY, not data generation.** (Master REQ §6, §7 MR-PLAN-002/003, §10) |
| ADR-MWR-009 | TO_VERIFY (direction Active) | **Per-platform metric writability is verified per phase, not assumed.** The framework must not assume every catalog metric is writable on a given platform; an unsupported metric is surfaced + skipped-with-reason (`status: unsupported`, `reason_code`), never silently dropped. The concrete per-metric iOS HealthKit / Android Health Connect writability matrix is `TO_VERIFY` and confirmed in MR0/MR3/MR4/MR5 against current official docs. (Master REQ §8; R-MWR-005) |
| ADR-MWR-010 | Active | **MR-A foundation stack (ratified; human-approved at MR-A, gates #9 + #5).** Bare **React Native CLI 0.74.5** + **TypeScript (strict)** + **React Navigation v6** (native-stack) + **`react-native-keychain`** for OS-backed (Keychain/Keystore) token/session storage — **no Expo, no plain AsyncStorage for tokens**. Native iOS Swift / Android Kotlin modules for the health writers come later (MR-D+); native-module prefix `Mwr<Capability>` retained. App lives at repo root (`package.json`, `src/`, `App.tsx`); native `ios/`/`android/` projects are generated from the RN 0.74.5 template at setup (not hand-authored). Concretizes ADR-MWR-001. (Master REQ §1, §5; ADR-MWR-006) |
| ADR-MWR-011 | Active (human-approved 2026-06-28 — gates #1/#3/#9/#10; **scoped**) | **iOS HealthKit write capability (MR-C-003 POC).** Approved to add the HealthKit entitlement (`com.apple.developer.healthkit`), `Info.plist` `NSHealthUpdate`/`NSHealthShareUsageDescription` (copy per readiness packet §3, gate #3), and a native **`MwrHealthKit`** module (prefix `Mwr<Capability>`, ADR-MWR-010) implementing the `HealthKitBridge` seam + a **guarded** `save()`. **Scope: minimal approved metric set, internal/DEV-QA only, NO production-readiness claim, no Android.** A real write requires the full five-gate chain (dry_run + payload_source_verified + capability + permission + explicit_confirmation) and **no-fake-success**; denied/unsupported/invalid ops are skipped, never attempted (ADR-MWR-004/005/008/009). **The real on-device write execution + QA sign-off remain BLOCKED until a concrete real iPhone + iOS version + named QA owner replace the readiness-packet placeholders.** None of these native changes are applied yet (this row records the approval). |

## Open / TO_VERIFY decisions (do not bake in)

These mirror Master REQ §16 open questions and must be resolved (or
explicitly accepted as delivery risk) before the dependent work proceeds.
Each is a hard human-approval gate where noted.

| Topic | Status | Note |
|---|---|---|
| Exact backend endpoints MWR calls | `Open` / `TO_VERIFY` | Reuse existing MWDS routes vs new `/mobile/*`; locked in MR0. A backend API gap that would force local fabrication is a hard gate. |
| Token refresh / session storage strategy | **Resolved (ADR-MWR-010, MR-A)** | OS-backed storage = `react-native-keychain` (Keychain/Keystore); gate #5 human-approved at MR-A. Token **refresh** model kept minimal in MR-A and finalized when the backend refresh endpoint is confirmed. |
| Writable metrics on iOS HealthKit (POC) | `Open` / `TO_VERIFY` | Confirm per metric before MR4 (ADR-MWR-009). MR-C-003 gates approved (ADR-MWR-011, 2026-06-28) but writability is still confirmed on the **named real device** — which is not yet provided. |
| Writable metrics on Android Health Connect (POC) | `Open` / `TO_VERIFY` | Confirm per metric before MR5 (ADR-MWR-009). |
| Run reporting (`POST /mobile/runs`) added before MR6 | `Open` / `TO_VERIFY` | Backend capability question; if absent, do not fabricate. |
| Real-write gating: DEV build flag, env flag, or both | `Open` / `TO_VERIFY` | Settled at MR0/MR1 ([`settings-map.md`](settings-map.md)). |
| Run scope: one scenario, the whole ordered list, or both | `Open` / `TO_VERIFY` | Product question for MR0. |
| RN baseline + native-module prefix (`Mwr<Capability>`) | **Resolved (ADR-MWR-010, MR-A)** | RN CLI 0.74.5 + TS strict + React Navigation v6 ratified at MR-A; native-module prefix `Mwr<Capability>` retained for the MR-D+ writers (native codegen ADR still follows when the writers land). |

## Decision notes

- **Bootstrap (MR-FRAMEWORK-00, 2026-06-27):** this operating module was
  authored fresh for MWR, reusing the **mechanics** of a prior, superseded
  framework (lanes, gates structure, lifecycle, context-pack routing, review
  fanout, closeout, context promotion, validators) but **none of its product
  truth**. No product code was written; the RN app does not yet exist. The
  superseded framework's prior ADRs are **not** MWR truth and are not
  carried — they (and the terminology corrections) are recorded only in
  [`known-legacy.md`](known-legacy.md).
- **Order constraints (Master REQ §17):** MR0 locks backend/mobile/native
  contracts before product implementation; the MR3 dry-run execution plan
  exists before the MR4/MR5 real writer POCs.
- **MR-C-003 gate approvals (Human Decision Owner, 2026-06-28):** gates **#1**
  (real Apple Health/HealthKit write — *minimal write POC only*), **#3**
  (permission-prompt timing + the copy in readiness packet §3), **#9** (HealthKit
  entitlement + `Info.plist` `NSHealth*UsageDescription` + **ADR-MWR-011** + native
  `MwrHealthKit` module), and **#10** (the MR-C-003 permission UX only) are
  **APPROVED** under constraints: internal/DEV-QA only (no production-readiness
  claim), no Android, the five-gate chain enforced, only the approved minimal
  metric set, no fake native success, no unsupported/denied/invalid write attempt.
  **Device QA fields were submitted as unfilled placeholders** (`<real iPhone
  model>` / `<version>` / `<name>`) — **not filled, not fabricated.** Therefore the
  gate-blockers clear but the **real on-device write + QA sign-off remain BLOCKED**
  until a concrete real iPhone + iOS version + named QA owner are provided. Approval
  is recorded in ADR-MWR-011 + [`MR_C_003_IOS_WRITE_POC_READINESS_PACKET.md`](../../docs/contracts/MR_C_003_IOS_WRITE_POC_READINESS_PACKET.md).

## Lane classification — MWR-specific globs

> Single named anchor for project-specific globs (per
> [`../framework/rules/lane-classification.md`](../framework/rules/lane-classification.md)).
> The canonical denylist categories are NOT overridden — globs only map
> onto an existing category. **Globs are `TO_VERIFY` until the RN app is
> scaffolded**; the mapping below is the *intended* shape (per Master REQ
> §5).

| Glob (TO_VERIFY) | Maps to denylist category |
|---|---|
| `src/auth/**`, `src/backend/**` | backend client / auth / session |
| `src/catalog/**`, `src/testCases/**` | scenario loading / metric metadata |
| `src/runner/interpreter/**` | scenario interpretation / contract |
| `src/runner/executionPlan/**`, `src/runner/runState/**` | execution plan / operation classification / determinism |
| `src/health/common/**` | capability / permission flow |
| `src/health/appleHealth/**` | Apple Health writer / real-write path |
| `src/health/healthConnect/**` | Health Connect writer / real-write path |
| `src/safety/**` | dry-run semantics / no-fake-success / run-mode toggles |
| `**/*secret*`, `**/*token*`, `**/config/*` | secrets / tokens / endpoints |
| `ios/**`, `android/**`, `**/*.plist`, `**/AndroidManifest.xml` | native iOS/Android, entitlements, manifests |
| `**/__fixtures__/**`, `**/__golden__/**` | test-data / fixtures |

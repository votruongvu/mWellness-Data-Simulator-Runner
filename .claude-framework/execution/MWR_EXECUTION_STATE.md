# MWR_EXECUTION_STATE

> Single machine-readable source for the MWR execution loop's current state.
> Updated at the end of every loop iteration (controller step 8). Last set:
> **2026-06-27 (framework bootstrap — product loop not yet run).**
>
> Reality note (binding): `mWellness-Mobile-Runner` has **no product code, no
> React Native app, no native substrate (`ios/` + `android/`), and no product
> stories** yet. `MR-FRAMEWORK-00` is the Claude Framework bootstrap phase. The
> first product phase is `MR0` (Mobile Runner Contract Alignment), which is
> hard-gated. Anything unverified about the eventual app (RN version, native
> module prefix, exact backend routes, per-metric writability) is `TO_VERIFY`.

## State

```text
# ---- Phase progress ----
DONE_PHASES: none (no product phase completed yet)
CURRENT_PHASE: MR-FRAMEWORK-00 (Claude Framework Bootstrap)
CURRENT_PHASE_STATUS: IN_PROGRESS — completes when the framework manifest is fully authored + validate-framework.sh PASS + context-pack paths PASS. After this bootstrap it becomes DONE.
NEXT_PHASE: MR0 (Mobile Runner Contract Alignment) — HARD-GATED (touches ADRs + backend API contract; see MWR_HUMAN_APPROVAL_GATES gate 9 + gate 7).

# ---- Product story state ----
PRODUCT_STORIES: NONE — no MR0/MR1+ user stories have been authored. The loop
  does NOT generate per-phase user stories; stories are produced later via
  req-to-stories / story-to-tasks once a phase is approved to start.

# ---- Build / substrate baseline (all TO_VERIFY until the RN app is scaffolded) ----
RN_BASELINE: NOT_SCAFFOLDED (TO_VERIFY — React Native + TypeScript app does not exist yet; RN version/New-Arch/Hermes pin to be decided at MR1)
NATIVE_SUBSTRATE: NOT_PRESENT (no ios/ or android/; generation is a hard gate — substrate work while unvalidated halts the loop, MWR_HUMAN_APPROVAL_GATES gate 9)
NATIVE_MODULE_PREFIX: TO_VERIFY (proposed `Mwr<Capability>`; subject to an ADR)
BACKEND_ENDPOINTS: TO_VERIFY (exact MWDS `/mobile/*` routes resolved at MR0; runnable data comes from the authenticated backend API — never fabricated)
PER_METRIC_WRITABILITY: TO_VERIFY (no metric assumed writable on Apple Health or Health Connect until verified per phase at MR4/MR5)

# ---- Safety posture (bootstrap defaults) ----
DRY_RUN_DEFAULT: TRUE (canonical; dry-run performs ZERO real writes — MR3 dry-run plan precedes MR4/MR5 real writers)
REAL_WRITE_ENABLED: FALSE (no real Apple Health / Health Connect write path exists; enabling one is a hard gate — gates 1, 2, 4)
NO_FAKE_SUCCESS: ENFORCED-BY-POLICY (a write is reported successful only if the native platform write actually succeeds; no writer exists yet to test)
SECRET_HANDLING: BY-REFERENCE-ONLY (secretRefName resolved from Keychain/Keystore at runtime; no raw token/secret committed; no production endpoint default)
ANDROID_HEALTH_TARGET: Health Connect (never "Google HealthKit" / Google Fit)

# ---- Loop bookkeeping ----
LOOP_STARTED: NO (no product loop iteration has run; this entry records the bootstrap install only)
LAST_LOOP_N: 0
LAST_VALIDATION: see CURRENT_PHASE_STATUS — framework validation is run by the bootstrap orchestrator (validate-framework.sh authored by the orchestrator; validate_context_pack_paths.py present). Product validation commands (npm test, npx tsc --noEmit, native verify) do NOT exist yet -> reported NOT_RUN_<reason> (see MWR_LOOP_RUNBOOK).
LAST_VALIDATION_STATUS: PENDING_FRAMEWORK_VALIDATION (framework structural validation by the bootstrap; no product test suite exists)

# ---- Human-approval gate state ----
PENDING_HUMAN_APPROVAL_GATE: MR0_START — starting MR0 requires explicit human
  approval because MR0 locks contracts and will create/modify ADRs
  (gate 9) and may surface backend API contract gaps (gate 7). No
  health-write, permission, real-write, token-storage, vendor-integration, or
  UX-contract gate is active yet because none of those surfaces exist. The loop
  must STOP and emit a Human Approval Request before beginning MR0.
```

## Phase status (mirrors MWR_PHASE_QUEUE)

| Phase | Name | Lane / eligibility | Status |
|---|---|---|---|
| MR-FRAMEWORK-00 | Claude Framework Bootstrap | AUTO-RUN (docs/framework only) | IN_PROGRESS → DONE after this bootstrap |
| MR0 | Mobile Runner Contract Alignment | HARD GATE (ADRs + backend contract) | NOT_STARTED — next; PENDING_HUMAN_APPROVAL_GATE |
| MR1 | Mobile Foundation / Auth / API Client | HARD GATE on token-storage + ADRs | NOT_STARTED |
| MR2 | Test Case Browser + Scenario Loader | AUTO-RUN (read-only loading; no write) | NOT_STARTED |
| MR3 | Scenario Interpreter + Execution Plan | AUTO-RUN (dry-run plan only; ZERO real writes) | NOT_STARTED |
| MR4 | Apple Health Writer POC | HARD GATE (real Apple Health write) | NOT_STARTED |
| MR5 | Health Connect Writer POC | HARD GATE (real Health Connect write) | NOT_STARTED |
| MR6 | Run Orchestration + Result Reporting | HARD GATE on real-write orchestration / run-reporting API | NOT_STARTED |
| MR7 | Safety QA / Release Candidate | HARD GATE (release-readiness needs separate security/privacy review) | NOT_STARTED |

Order constraints (REQ §17, carried into MWR_PHASE_QUEUE): **MR0 locks contracts
before implementation**; **MR3 dry-run plan exists before MR4/MR5 real writers**;
**MR4/MR5 real writes are hard-gated**.

## Reality cross-check (must stay true)

- `bash .claude-framework/scripts/validate-framework.sh` → expected PASS once the
  framework manifest is fully authored (authored by the bootstrap orchestrator).
- `python3 .claude-framework/scripts/validate_context_pack_paths.py` → expected
  PASS (script is present; honors `TO_VERIFY` / `DEFERRED` defer markers).
- `ios/` + `android/` → NOT_PRESENT (substrate generation is a hard gate).
- `package.json` / `node_modules` → NOT_PRESENT (no RN app yet → `npm test`,
  `npx tsc --noEmit`, native verify are reported `NOT_RUN_<reason>`, never PASS).
- `DRY_RUN_DEFAULT` TRUE · `REAL_WRITE_ENABLED` FALSE · no real Apple Health /
  Health Connect write path exists.

## Note (binding)

```text
The product loop does NOT begin until MR0 is human-approved to start. Until
then, only MR-FRAMEWORK-00 framework/docs work is in scope. Every product phase
that touches the backend client/auth, scenario interpretation, the execution
plan, dry-run, a platform writer, a real-write path, capability/permission, or
secrets/endpoints is FULL lane and carries the universal high-risk gate stack.
MR4 (real Apple Health write) and MR5 (real Health Connect write) NEVER
auto-run.
```

## MR-C update (2026-06-27) — F8 payload unblock patch
MR-C story 001 PAYLOAD_GAP → PAYLOAD_PARTIAL → **`PAYLOAD_READY`** (live-verified 2026-06-28):
an authenticated live fetch of `GET …/test-cases/17/versions/15/runnable-payload` (HTTP 200)
returned 4/4 concrete operations (value/unit/relative-time/idempotency_key/provenance all
present); `payload_source_verified` = TRUE. See docs/contracts/MR_C_LIVE_PAYLOAD_VERIFICATION.md.
P1 followup: reconcile the mobile DTO to the real shape (relative `time` object, `profile_slugs[]`).
Native writers (002–005) still gated on gates #1/#2/#3/#9 + native substrate + device QA.
MR-C 002–005 (native writers) still gated on substrate + gates #1/#2/#3/#9 + device QA.
This was a one-off patch (not a phase-loop run); no native write/permission code added.

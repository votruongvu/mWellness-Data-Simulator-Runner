# MWR_LOOP_RUNBOOK

> How to run one MWR execution-loop iteration, and the validation matrix every
> iteration must report. The loop is **not auto-started**; it runs only when the
> Human Decision Owner invokes it (e.g. via `/run-phase-loop`).
>
> Operating principle: `Backend runnable scenario contract first -> mobile
> execution plan second -> platform writer third.`

## How to run one loop iteration

```text
1. READ TRUTH (in this exact order):
   a. .claude-framework/adapter/project-source-of-truth.md
   b. .claude-framework/adapter/current-decisions.md   (active ADRs)
   c. .claude-framework/adapter/known-risks.md
   d. .claude-framework/adapter/human-approval-gates.md
   e. docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md       (the roadmap)
   f. .claude-framework/execution/MWR_EXECUTION_STATE.md
   (Plus the relevant gates.md / lane-classification.md and any phase-scoped
   checklist for the work in hand.)

2. APPLY THE CONTROLLER. Run the 10-step loop algorithm in
   MWR_EXECUTION_CONTROLLER.md (load truth -> check human gate -> fix
   validation failures in scope -> pick next eligible phase/story -> verify
   allowed -> execute in scope -> validate -> update state+adapters -> emit
   closeout -> continue only within budget & no gate).

3. RESPECT THE BUDGET. One phase block OR ≤5 stories per invocation. (No
   product stories exist yet; until they do, the unit is the phase block of
   safe framework/docs/contract work.)

4. STOP at the first hard gate (MWR_HUMAN_APPROVAL_GATES.md) or stop condition
   (MWR_STOP_CONDITIONS.md).

5. VALIDATE + CLOSE OUT. Run the validation matrix below, update
   MWR_EXECUTION_STATE + MWR_PHASE_QUEUE + .claude/HANDOFF.md + the adapters,
   and emit a closeout in the MWR_LOOP_CLOSEOUT_TEMPLATE shape.
```

## Recommended invocation (copy/paste)

```text
Continue the MWR execution loop according to
.claude-framework/execution/MWR_EXECUTION_CONTROLLER.md.
Run one phase block or up to 5 stories, whichever comes first.
Stop at the first hard gate, path-affecting P1/P2 follow-up, or validation
failure. Start from NEXT_PHASE in MWR_EXECUTION_STATE.md.

NOTE (current state): NEXT_PHASE = MR0, which is HARD-GATED (locks contracts +
creates ADRs). The loop must STOP and emit a Human Approval Request before
beginning MR0. No product code, no React Native app, and no product stories
exist yet.
```

## MWR VALIDATION MATRIX (report exact status every loop)

Always run (these exist today):

```bash
bash .claude-framework/scripts/validate-framework.sh
python3 .claude-framework/scripts/validate_context_pack_paths.py
```

- `validate-framework.sh` — structural validator: required root files
  (CLAUDE.md, .claude/HANDOFF.md, .claude/settings.json) present & non-empty;
  required dirs exist; adapter files present & non-empty; lifecycle skill+command
  pairs; each agent declares a non-empty `tools:`; all rules/checklists/
  templates/context present; CLAUDE.md content guards; skills carry no
  `## Agent crew`; single-source lane denylist; terminology leakage guards
  (Android = "Health Connect", never "Google HealthKit" / Google Fit; no DM1
  product-truth leakage); no macOS metadata tracked. (Authored by the bootstrap
  orchestrator.)
- `validate_context_pack_paths.py` — parses the context-pack registry, checks
  path existence, and honors defer markers (`TO_VERIFY`, `DEFERRED`, …). Present
  in `.claude-framework/scripts/`.

Future product commands (TO_VERIFY — these do NOT exist until the React Native
app is scaffolded at MR1; report `NOT_RUN_<reason>` honestly, never PASS):

```bash
# TO_VERIFY — none of these exist yet (no package.json / node_modules / native substrate)
npm test                 # -> NOT_RUN_NO_APP   (no RN app / no package.json yet)
npx tsc --noEmit         # -> NOT_RUN_NO_APP   (no TypeScript app yet)
# native verify (added with the writer phases MR4/MR5; e.g. a verify:native script + builds):
#   <native verify script>                 -> NOT_RUN_NO_SUBSTRATE (no ios/ + android/ yet)
#   cd ios && pod install && xcodebuild …   -> NOT_RUN_NO_SUBSTRATE / NOT_RUN_TOOLCHAIN_MISSING
#   cd android && ./gradlew assembleDebug   -> NOT_RUN_NO_SUBSTRATE / NOT_RUN_TOOLCHAIN_MISSING
```

Once the app exists, the matrix grows to include (at minimum): `npm test`,
`npx tsc --noEmit` (full + any core/build tsconfig), the RNTL run-flow suite,
the safety/no-fake-success/dry-run verifiers, and — once the native substrate
exists and the toolchain is available — the native verify + iOS/Android builds.
Add each command to this matrix as the phase that introduces it lands.

Env-gated / unavailable commands are reported with an EXACT reason — never
hidden behind a generic pass:

```text
NOT_RUN_NO_APP                 # no React Native app / package.json yet
NOT_RUN_NO_SUBSTRATE           # no ios/ + android/ native substrate yet
NOT_RUN_DEPENDENCY_MISSING     # node_modules / a dependency is absent
NOT_RUN_TOOLCHAIN_MISSING      # RN CLI / Xcode / CocoaPods / Android SDK absent
NOT_RUN_ENV_GATED              # requires a device/emulator or interactive grant
```

Native verify exit semantics (once a native verify script exists at MR4/MR5):
- SAFETY violation → BLOCKER; never proceed.
- CLOSURE-not-complete but SAFETY OK (substrate env-gated) → non-native work may
  still proceed; report separately.
- Fully closed → a native writer phase may be considered behind its human gate.

## Loop hygiene

- One phase block / ≤5 stories per invocation; do not run indefinitely.
- Reconcile disk-state vs reality before proceeding: if a validator disagrees
  with MWR_EXECUTION_STATE, fix the state first (a state-vs-reality disagreement
  is itself a stop condition).
- Keep the closeout honest: the Scope-Guard + the full validation statuses
  (including every `NOT_RUN_<reason>`) every time.
- Do not invent product stories or product validation results that do not exist.

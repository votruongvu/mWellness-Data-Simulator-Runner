# MWR_STOP_CONDITIONS

> Conditions that halt the MWR execution loop. These are in addition to the 10
> hard gates in `MWR_HUMAN_APPROVAL_GATES.md`. On any STOP, the loop emits a
> closeout (NEEDS_HUMAN_APPROVAL or BLOCKED as appropriate) and does not
> advance.

## Stop conditions

```text
STOP if validation fails and the fix crosses scope (or crosses a hard gate).
STOP if a path-affecting P1/P2 follow-up appears (resolve cleanly first; see
     the controller's path-affecting follow-up rule).
STOP if the next task requires a hard gate (MWR_HUMAN_APPROVAL_GATES).
STOP if a backend API contract gap is discovered — document the gap and STOP;
     never fabricate local test cases / scenarios to fill it (gate 7 +
     TEST_DATA_SAFETY_GATE).
STOP if the task would require fabricating test data, a mock test case, or a
     mock scenario presented as complete product behavior.
STOP if the task is native / health-write work while the native substrate
     (ios/ + android/) is not present or not validated (substrate generation is
     a hard gate, gate 9).
STOP if a task would touch a real Apple Health or Health Connect write, a real
     OS permission prompt, or flip a dry-run / real-write flag without explicit
     human approval (gates 1-4).
STOP if a story / task needs a missing source-of-truth decision (no active ADR
     covers it, or current-decisions is silent).
STOP if Claude would have to GUESS product behavior, safety policy, a backend
     contract, a permission model, a metric's writability, schema/contract
     compatibility, real-write enablement, or a UX flow.
STOP if native project / app creation would clobber existing files.
STOP if dependency install / bootstrap fails in a way that changes the
     implementation path.
```

## Also STOP (loop hygiene)

```text
STOP when the task budget is reached (one phase block OR ≤5 stories).
STOP rather than start a SECOND phase in the same loop (unless the first phase
     only did documentation / framework / controller setup AND validation
     stayed clean).
STOP if any non-negotiable invariant would be violated: dry-run-is-default +
     dry-run writes nothing · no fake native write success · no real write
     without capability + permission + dry-run + confirmation · no silent OS
     permission prompt · no unsupported metric silently dropped (surface with a
     reason_code) · no raw token/secret/PHI in logs/fixtures · no backend
     authority bypass · mobile never authors/validates/mutates/reorders
     scenarios · no Google Fit / Health-Connect-not-"Google HealthKit" / no
     vendor SDK unless approved.
STOP if the execution state on disk disagrees with reality (e.g. a validator
     now fails where MWR_EXECUTION_STATE claims PASS, or state claims a phase
     done that the repo does not reflect) — reconcile state before proceeding.
```

## What is NOT a stop (continue / carry as backlog)

```text
- Env-gated / toolchain-missing commands (npm test / npx tsc --noEmit with no
  app yet; native verify / iOS/Android builds with no substrate or no
  toolchain) -> report NOT_RUN_<reason> (NOT_RUN_NO_APP / NOT_RUN_NO_SUBSTRATE /
  NOT_RUN_TOOLCHAIN_MISSING / NOT_RUN_DEPENDENCY_MISSING / NOT_RUN_ENV_GATED)
  and CONTINUE with in-scope safe work. These do NOT by themselves block
  framework/docs or non-native AUTO-RUN phases.
- validator / markdownlint unavailable -> report NOT_AVAILABLE, continue.
- Doc polish, minor wording, non-path doc-section completeness that does not
  alter scope/behavior -> backlog.
- Table / accessibility polish before the relevant UI phase -> backlog.
- Dry-run execution-plan FOUNDATION work (MR3): scenario interpretation,
  operation classification (writable | unsupported | permission_missing |
  invalid | skipped + reason_code), the dry-run that performs ZERO real writes,
  deterministic replay, and the capability check that feeds plan classification,
  plus their tests/verifiers/docs, are AUTO-RUN safe and do NOT by themselves
  require human approval. STOP only at REAL OS-writer enablement: native
  substrate generation, a real Apple Health / Health Connect write, an OS
  permission prompt, or flipping the real-write flag (gates 1-4, 9).
```

## On STOP — required output

The loop closeout must state the stop trigger, the EXACT decision/fix needed,
what remains blocked, and the recommended next step. It must NOT silently skip
the blocked task, fabricate data to get past a contract gap, or jump to a later
phase to "make progress".

# MWR — Manual QA Checklist

> The manual QA rhythm for the `mWellness-Mobile-Runner` (MWR) run flow, plus the
> non-negotiable safety floor. Pair with the automated matrix in
> [`MWR_VALIDATION_GUIDE.md`](MWR_VALIDATION_GUIDE.md). **No screens exist yet** —
> this checklist defines the human spot-check for when the run flow lands
> (MR1–MR7). Every item must hold with **fabricated, no-real-PHI** data only.

## A. Global (every screen)

- [ ] **Target platform** (iOS Apple Health / Android Health Connect) is obvious on every run screen.
- [ ] **Run mode** (DRY-RUN vs REAL-WRITE) is visible throughout the run flow — never ambiguous.
- [ ] No "REAL-WRITE" action is enabled without the full gate chain having passed.
- [ ] Controls and status have accessibility labels; back navigation keeps title/route consistent.

## B. The run-flow rhythm (capability -> permission -> dry-run -> confirm -> write -> verify)

- [ ] **Capability check** — platform availability/installation is checked **before** any permission request; unavailable state is shown clearly (HealthKit availability / Health Connect availability+installation).
- [ ] **Permission** — the permission need is **explained before** the native OS prompt appears; no silent OS prompt; denied/partial state is surfaced and fails closed.
- [ ] **Dry-run preview** — the plan previews `writable` operations + `blocked_operations[]` with `reason_code`; **no native write occurs**; output is labelled dry-run.
- [ ] **Confirmation** — a real write requires explicit user confirmation; nothing writes from a list/detail screen; dry-run -> confirm sequence is never skipped.
- [ ] **Confirmed write** — only writable, approved operations reach the platform writer; the target type/unit matches the capability matrix.
- [ ] **Result verification** — the result summary (total/succeeded/failed/skipped + reason_codes) matches what was actually written; `succeeded` reflects the real native result; verify in the OS Health app where feasible.

## C. Determinism & data integrity

- [ ] Re-running the same scenario produces the same plan/result (deterministic replay; no ambient clock/random in the run path).
- [ ] Unsupported metrics are always **surfaced** with a reason, never silently dropped.
- [ ] No screen exposes a real user identifier, token, or PHI/PII.

## D. Edge cases

- [ ] Opening a run screen with no selected case/version shows a clear empty state, not a confusing mismatch.
- [ ] An invalid/missing scenario payload blocks the run with a clear reason.
- [ ] A backend API gap is surfaced as a documented gap that STOPs — never papered over with fabricated data.

## E. Safety floor (must all be TRUE)

- [ ] **No real write without permission + explicit confirmation** (and only when real-write is human-enabled).
- [ ] **No fake success** — a write is reported successful only if the native platform write/insert actually succeeded.
- [ ] **No real PHI/PII** in any scenario, fixture, or screen — fabricated, synthetic data only.
- [ ] **No silent OS permission prompt** — always explained first.
- [ ] **No raw token / raw payload** visible in UI, logs, or diagnostics (diagnostics dev-gated).
- [ ] **Health Connect is labelled correctly** — never "Google HealthKit", never Google Fit. HealthKit = Apple iOS only.
- [ ] **No backend authority bypass** — runnable data came from the authenticated API.

## Cross-references

- Health-write safety / gate chain + human-approval gates: [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)
- Execution model / run state machine: [`../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`](../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md)
- Validation guide (automated): [`MWR_VALIDATION_GUIDE.md`](MWR_VALIDATION_GUIDE.md)

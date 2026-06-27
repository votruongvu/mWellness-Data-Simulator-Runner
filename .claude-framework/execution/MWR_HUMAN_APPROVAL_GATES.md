# MWR_HUMAN_APPROVAL_GATES

> The hard human-approval gates for the MWR execution loop. **When any gate
> applies, Claude STOPs immediately**, does not execute the task, and emits a
> Human Approval Request (closeout `## Human Approval Needed`). A gate is never
> self-waived by the loop, the task budget, or "it's almost done".
>
> This file frames the gates **for the loop**. It mirrors
> `.claude-framework/adapter/human-approval-gates.md` (the adapter current-truth
> definition) and `HUMAN_APPROVAL_GATE` in
> `.claude-framework/framework/rules/gates.md`. On any conflict the adapter +
> gates.md definitions win.

## The 10 hard gates (STOP immediately)

Halt the loop and emit a Human Approval Request on ANY of:

```text
1.  Any real Apple Health / HealthKit write behavior
    (permission / write / delete / query against the real store).
2.  Any real Health Connect write behavior
    (real insert / update / delete / read against the real store).
    Target is Health Connect, never "Google HealthKit" / Google Fit.
3.  Permission-prompt timing or copy
    (when/how the native OS permission prompt is triggered or worded).
4.  Bypassing dry-run / confirmation / capability / permission checks
    on any write path.
5.  Token / session storage strategy
    (secure-storage choice, refresh model, anything beyond secret-by-reference).
6.  New platform / destination / vendor integration
    (e.g., Google Fit, any vendor SDK).
7.  Backend API contract gaps that would otherwise require fabricating local
    test cases / scenarios (document the gap and STOP — never fabricate data).
8.  Production / release-readiness claim
    (no RC is "production-ready" without a separate security/privacy review).
9.  Any new ADR or change to an active ADR; a schema/contract-breaking change;
    or native-substrate work while the substrate is unvalidated.
10. Any UX flow not covered by an approved UX contract.
```

These derive from the Master REQ §15 and are the same 10 gates listed in the
adapter and the controller's step-2 check.

## How a gate is handled (5-step: detect → halt → emit-request → set-state → wait)

```text
1. DETECT. During controller step 2 (check human gate) or step 5 (verify
   allowed), recognize that the next task would trip one of the 10 gates above.
   (Lane triage in lane-classification.md and the tiny-denylist surfaces flag
   these surfaces early.)

2. HALT. Do NOT execute the task. Do not partially implement it, do not
   "scaffold" it, and do not cross the gate to finish adjacent work.

3. EMIT REQUEST. Emit a Human Approval Request stating: the gate hit (by
   number/name); the EXACT decision needed; the options; a recommendation; and
   what stays blocked until the decision is made. Put it in the closeout's
   `## Human Approval Needed` section.

4. SET STATE. Set MWR_EXECUTION_STATE.PENDING_HUMAN_APPROVAL_GATE to the gate +
   task, and set the loop Result = NEEDS_HUMAN_APPROVAL.

5. WAIT. The loop does NOT resume past the gate until the Human Decision Owner
   approves. Record the approval in current-decisions.md (and the relevant
   artifact/ADR) before continuing. Approval of one gated task does not
   pre-approve later gated tasks.
```

## Phase ↔ gate mapping

| Phase | Hard gate(s) that apply before starting |
|---|---|
| MR-FRAMEWORK-00 | none (AUTO-RUN — framework/docs only) |
| MR0 Contract Alignment | 9 (new/changed ADRs) · 7 (backend contract gaps) |
| MR1 Foundation/Auth/API | 5 (token/session storage) · 9 (ADRs + native substrate generation) |
| MR2 Test Case Browser + Loader | none to start (read-only loading); 7 if a backend contract gap appears |
| MR3 Interpreter + Execution Plan | none to start (dry-run only); 4 if any path would bypass dry-run |
| MR4 Apple Health Writer POC | 1 (real Apple Health write) · 3 (permission prompt) · 9 (substrate/ADR) |
| MR5 Health Connect Writer POC | 2 (real Health Connect write) · 3 (permission prompt) · 9 (substrate/ADR) |
| MR6 Run Orchestration + Reporting | 1 & 2 & 4 (confirmed real-write orchestration) · 7 (run-reporting API) |
| MR7 Safety QA / Release Candidate | 8 (production / release-readiness claim) |
| Any phase | 4 (bypassing a safety check) · 5 (token storage) · 6 (new vendor/platform) · 9 (ADR / schema break / unvalidated substrate) · 10 (UX flow not in an approved contract) |

AUTO-RUN phases (MR-FRAMEWORK-00, MR2, MR3) run **only while no gate above
applies**; the moment a task inside them would trip a gate, the loop STOPs.

## Dry-run plan vs real write (the central staging rule)

The **dry-run execution plan (MR3)** is AUTO-RUN safe work: scenario
interpretation, operation classification (`writable | unsupported |
permission_missing | invalid | skipped` + `reason_code`), the dry-run that
performs ZERO real writes, deterministic replay, and the capability check that
feeds plan classification. It performs no real write and triggers no OS
permission prompt.

**Real OS-writer enablement** is staged behind hard gates — each STOPs the loop
and needs explicit Human Decision Owner approval (none is auto-runnable):

| Unlocks | Gate(s) | Key prerequisite |
|---|---|---|
| Native substrate generation (`ios/` + `android/`, codegen the `Mwr<Capability>` specs) | 9 | RN baseline ADR; non-destructive path; native build/codegen validated (`TO_VERIFY` until done) |
| Real Apple Health write (MR4) | 1, 3 | MR3 dry-run plan exists; capability + explained permission; dev-gated; synthetic-only; no fake success |
| Real Health Connect write (MR5) | 2, 3 | MR3 dry-run plan exists; availability + explained permission; dev-gated; synthetic-only; no fake success |
| Real-write flag flip / confirmation bypass | 4 | explicit human confirmation; never auto-run |
| Token / session storage strategy | 5 | approved secure-storage + refresh model |
| New vendor/platform (Google Fit, vendor SDK) | 6 | explicit approval; not in MVP scope |
| Run-reporting API / backend contract change | 7 | the backend exposes the API; no fabricated data |
| Production / release-readiness | 8 | a separate security/privacy review |

Full prerequisites/allowed/prohibited per phase live in `MWR_PHASE_QUEUE.md` and
the phase-scoped checklists (`apple-health-write-checklist`,
`health-connect-write-checklist`, `dry-run-no-write-checklist`,
`no-fake-success-checklist`, `capability-permission-checklist`).

# MWR_EXECUTION_CONTROLLER

> The governed autonomous execution layer for **mWellness-Mobile-Runner**
> (`MWR`). It sits on top of the MWR framework governance (REQ, ADRs, the
> `.claude-framework/adapter/*` current-truth files, gates, lane classification,
> checklists, closeouts, validators) — it does **not** replace it. This file is
> the controller spec; the live state, phase queue, human-approval gates, stop
> conditions, closeout template, and runbook are the companion files in this
> directory.
>
> **Operating principle (verbatim):**
> `Backend runnable scenario contract first -> mobile execution plan second -> platform writer third.`
>
> **Authority boundaries.** Mobile OWNS: mobile auth/session; backend API
> client; runnable test case/scenario loading; scenario interpretation;
> execution plan generation; dry-run; platform capability checks; permission
> flow; Apple Health / Health Connect writer adapters; run progress/result
> reporting; mobile diagnostics. Mobile does NOT own: catalog source of truth;
> scenario validation authority; test case authoring; scenario seed
> library/applicability; versioning/scenario ordering authority;
> RBAC/tenant/billing/admin; Google Fit or vendor SDKs unless approved.
>
> **Source hierarchy (truth model).** 1) Real repo state = descriptive facts.
> 2) The Mobile Runner Master REQ (`docs/requirements/MOBILE_RUNNER_MASTER_REQ.*`)
> = product requirements (canonical). 3) `.claude-framework/adapter/*` = current
> decisions/risks/wiring (current truth). 4) `.claude-framework/artifacts/*` =
> evidence/history, NOT current truth.
>
> **Installed by:** the MWR Claude Framework bootstrap (`MR-FRAMEWORK-00`).
> **Loop started:** NO product loop yet. `MR-FRAMEWORK-00` is the bootstrap
> phase; no product code, no React Native app, and no product stories exist
> yet (see `MWR_EXECUTION_STATE.md`). The first product phase is `MR0` (Mobile
> Runner Contract Alignment), which is **hard-gated** because it touches ADRs
> and backend API contracts.

## Companion files

| File | Role |
|---|---|
| [`MWR_EXECUTION_STATE.md`](MWR_EXECUTION_STATE.md) | Current machine-readable phase state (single source). |
| [`MWR_PHASE_QUEUE.md`](MWR_PHASE_QUEUE.md) | Phase-ordered queue `MR-FRAMEWORK-00 … MR7` + per-phase scope + auto-run vs hard-gate. |
| [`MWR_HUMAN_APPROVAL_GATES.md`](MWR_HUMAN_APPROVAL_GATES.md) | The 10 hard human-approval gates that force an immediate STOP. |
| [`MWR_STOP_CONDITIONS.md`](MWR_STOP_CONDITIONS.md) | Conditions that halt the loop. |
| [`MWR_LOOP_CLOSEOUT_TEMPLATE.md`](MWR_LOOP_CLOSEOUT_TEMPLATE.md) | The closeout every loop iteration must emit. |
| [`MWR_LOOP_RUNBOOK.md`](MWR_LOOP_RUNBOOK.md) | How to run one loop + the MWR validation matrix. |

Authoritative governance referenced by name (never re-inlined here):
`.claude-framework/framework/rules/gates.md`,
`.claude-framework/framework/rules/lane-classification.md`,
`.claude-framework/adapter/human-approval-gates.md`.

## Execution philosophy — phase-block auto-run, stop on hard gates

```text
Auto-run SAFE work. Stop on hard gates, failed validation that cannot be fixed
in scope, or any path/safety/contract/permission/product uncertainty.
```

This is a **phase-block auto-run** model — not approve-after-every-story and
not run-forever. The loop keeps moving through approved, safe work (framework
authoring, docs, audits, scenario-interpretation/plan logic that performs no
real write, dry-run logic, tests, and refactors that cross no gate) and STOPs
the instant a task would trip a hard human-approval gate, a stop condition, or
a point where Claude would have to guess product behavior, safety, a backend
contract, a permission, or a UX flow.

The crown-jewel safety invariants always win on conflict (the stricter of
`DRY_RUN_NO_WRITE_GATE` / `NO_FAKE_SUCCESS_GATE` /
`SECRET_AND_ENDPOINT_SAFETY_GATE` / `TEST_DATA_SAFETY_GATE`).

## Loop algorithm (binding — 10 steps)

```text
1.  LOAD TRUTH. Read, in the runbook's read-truth order:
    project-source-of-truth -> current-decisions -> known-risks ->
    human-approval-gates -> roadmap (MOBILE_RUNNER_PHASE_ROADMAP) ->
    MWR_EXECUTION_STATE. (Plus the relevant gates.md / lane-classification.md
    and any phase-scoped checklist.)

2.  CHECK HUMAN GATE. If a Human Approval Gate is PENDING or now applies to the
    next task (MWR_HUMAN_APPROVAL_GATES.md) -> STOP. Emit a Human Approval
    Request (closeout `## Human Approval Needed`), set
    MWR_EXECUTION_STATE.PENDING_HUMAN_APPROVAL_GATE, result = NEEDS_HUMAN_APPROVAL.
    Do NOT execute the task.

3.  FIX VALIDATION FAILURES IN SCOPE. If the last validation failed -> fix ONLY
    the validation failure, and only if the fix stays in scope and crosses no
    hard gate. Otherwise STOP (MWR_STOP_CONDITIONS). Do not start new work on
    top of a red validation state.

4.  PICK NEXT ELIGIBLE PHASE/STORY. Take the next eligible phase block (or the
    next eligible stories within the CURRENT phase) from MWR_PHASE_QUEUE, in
    phase order. (No product stories exist yet; until they do, the eligible
    unit is the phase block of safe framework/docs/contract work.)

5.  VERIFY ALLOWED. Confirm the task is allowed by: the active ADRs
    (current-decisions.md); the canonical gate set (gates.md) +
    lane-classification.md; the per-phase scope rules in MWR_PHASE_QUEUE; the
    known risks (known-risks.md); and the stop conditions. If the task needs a
    hard gate, a missing decision, a backend contract that does not exist, or
    fabricated test data -> STOP.

6.  EXECUTE IN SCOPE. Perform the task within its declared scope ONLY. Never
    cross a gate to "finish" something. For any write-adjacent surface
    (backend client/auth, scenario interpretation, execution plan, dry-run,
    a platform writer, a real-write path, capability/permission, secrets/
    endpoints) apply the universal high-risk rule: FULL lane +
    DRY_RUN_NO_WRITE_GATE + NO_FAKE_SUCCESS_GATE + CAPABILITY_PERMISSION_GATE +
    SECRET_AND_ENDPOINT_SAFETY_GATE + TEST_DATA_SAFETY_GATE.

7.  VALIDATE. Run the MWR validation matrix (MWR_LOOP_RUNBOOK). Report each
    command's EXACT status; never hide a NOT_RUN_<reason> behind a generic PASS.

8.  UPDATE STATE + ADAPTERS. Update MWR_EXECUTION_STATE, MWR_PHASE_QUEUE
    status, .claude/HANDOFF.md, and the adapter current-truth files
    (current-decisions / known-risks / pending-promotions / milestone-log /
    repository-map / wiring-paths) as load-bearing facts move. Honor
    CONTEXT_PROMOTION_GATE: only human-approved facts promote into the adapter.

9.  EMIT CLOSEOUT. Emit a loop closeout in the exact MWR_LOOP_CLOSEOUT_TEMPLATE
    shape (Result / Tasks / Files / Scope-Guard / Validation / Followups /
    Human-Approval / Next). The Scope-Guard and Validation sections are
    mandatory.

10. CONTINUE ONLY WITHIN BUDGET & NO GATE. Continue to the next task ONLY if
    within the task budget AND no stop condition / hard gate is encountered.
    Otherwise end the loop with the closeout.
```

## Task budget (per loop invocation)

```text
Run ONE phase block OR up to 5 stories, whichever comes first.
Stop earlier on any hard gate, path-affecting P1/P2 follow-up, validation
failure, or scope conflict.
Do not run indefinitely. Do not start a SECOND phase in the same loop unless
the first phase only performed documentation / framework / controller setup
AND validation stayed clean.
```

(During `MR-FRAMEWORK-00` there are no product stories, so the unit of work is
the phase block of safe framework/docs authoring.)

## Path-affecting follow-up rule (binding)

```text
If a P1/P2 follow-up affects the implementation path, foundation, native/build
baseline, schema, backend API contract, safety boundary, permission model, or
phase sequencing, resolve it cleanly before moving to new work. Do NOT carry
path-affecting P1/P2 follow-ups forward as loose debt unless the Human Decision
Owner explicitly risk-accepts it (record the acceptance in current-decisions).
```

**Path-affecting (resolve before new work):** RN / native build baseline
uncertainty (`TO_VERIFY` until the RN app is scaffolded) · native module prefix
ambiguity (`Mwr<Capability>`, `TO_VERIFY`) · backend API endpoint / contract
ambiguity · scenario-contract or execution-plan model ambiguity · dry-run /
real-write flag uncertainty · capability/permission model ambiguity ·
per-metric writability ambiguity · token/secret storage ambiguity · idempotency
strategy ambiguity · phase sequencing ambiguity · UX-contract approval-status
ambiguity.

**Non-path cleanup (may remain backlog):** validator/markdownlint unavailable ·
minor wording polish · doc-section completeness that does not alter
scope/behavior · table-accessibility polish before the relevant UI phase.

## Non-negotiable invariants (every loop preserves)

Dry-run is the default; dry-run performs ZERO real writes · a write is reported
successful ONLY if the native platform write/insert actually succeeded (no fake
success) · no real write without capability check + permission check + dry-run +
explicit human-confirmed enablement · no silent HealthKit / Health Connect
permission prompt (explain before the OS prompt) · an unsupported metric is
surfaced + skipped with a `reason_code`, never silently dropped · no raw
token/secret/PHI/PII in logs or fixtures (redaction mandatory; secret-by-
reference) · no production endpoint default · runnable data comes from the
authenticated backend API (no backend-authority bypass; mobile never authors,
validates, mutates, or reorders scenarios) · no mock test case/scenario marked
as complete product behavior · no Google Fit; no direct vendor SDK unless
human-approved · Android health target is always **Health Connect**, never
"Google HealthKit" / Google Fit.

> MWR consumes a backend-validated scenario contract and EXECUTES it (deterministic
> REPLAY of a stored plan). MWR does NOT generate, seed, or author data.

## Authority

This controller is subordinate to: the canonical Master REQ, the Active ADRs
(current-decisions.md), `prompt-overrides.md`, the canonical gate set
(gates.md), lane-classification.md, and the human-approval gates. On any
conflict the higher governance wins and the loop STOPs.

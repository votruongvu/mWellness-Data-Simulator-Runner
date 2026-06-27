# Skill — compose-req

## Name
`compose-req`

## Purpose
Turn a slice of the Mobile Runner Master REQ or the backend contract into a
grounded MWR requirement. Requirements derive from the Master REQ + the
MWDS backend contract — never invented on device.

## Mode
**COMPOSE/ARTIFACT-AUTHORING.** Writes a `REQ-*.md` under
`artifacts/requirements/`. No source edits.

## Inputs
A Master-REQ slice, a backend-contract gap, or a product proposal slice.

## Context to load
- [`project-source-of-truth.md`](../../../.claude-framework/adapter/project-source-of-truth.md), [`current-decisions.md`](../../../.claude-framework/adapter/current-decisions.md), the Master REQ ([`docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`](../../../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html)), `framework/templates/requirement.md`.

## Gates to run
- **Intent Gate** (human) — the problem + goals + non-goals are the right ones.
- **`PROMPT_OVERRIDE_GATE`** for any MWR safety invariant the REQ touches.

## Step-by-step workflow
1. State the problem, goals, non-goals (incl. "mobile does NOT author/validate/reorder scenarios" and "never computes an authoritative wellness score").
2. Restate the operating principle: backend runnable scenario contract first → mobile execution plan second → platform writer third.
3. Separate confirmed context (with source) from `OPEN ASSUMPTION` lines tied to Open ADRs (RN baseline, token storage, writable metrics, run-mode gating).
4. Fill the MWR impact block (run-flow stage, platform writers, metric metadata, dry-run, capability/permission, secrets, no-fake-success + test-data-safety checks).
5. List success criteria (verifiable), risks (`R-MWR-*`), out-of-scope, downstream stories.

## Output format / artifact
`.claude-framework/artifacts/requirements/REQ-<slug>.md` per template.

## Closeout / artifact requirements
Draft REQ ready for the Intent Gate, then `/req-to-stories`.

## Escalation triggers
- Scope spans multiple surfaces/writers → recommend splitting into multiple REQs.
- A required backend API is missing → document the gap and STOP for human approval; never bake a fabricate-local-data assumption ([`human-approval-gates.md`](../../../.claude-framework/adapter/human-approval-gates.md)).
- A new durable decision is needed → spin a `DECISION-*` brief, do not bake an assumption.

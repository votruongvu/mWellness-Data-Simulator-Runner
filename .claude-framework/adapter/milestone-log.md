# mWellness-Mobile-Runner — Milestone Log

Historical milestone narrative for the MWR Claude framework. Most recent
first. This is a **fresh** log for MWR — no prior milestone history is
carried (see [`known-legacy.md`](known-legacy.md)).

## Framework setup

| Date | Milestone | Status |
|---|---|---|
| 2026-06-27 | **MR-FRAMEWORK-00 — Claude Framework bootstrapped (docs/framework only).** Authored the MWR operating module fresh for the mobile runner — reusing a prior framework's *mechanics* (lanes, gates structure, lifecycle, context-pack routing, review fanout, closeout, context promotion, validators) and **none** of its product truth. Seeded the adapter Context Layer: `project-source-of-truth`, `current-decisions` (ADR-MWR-001…009), `known-risks` (R-MWR-001…016 from Master REQ §16 + guardrails), `human-approval-gates` (10 hard gates), `repository-map` / `settings-map` / `test-map` / `wiring-paths` / `regression-fixtures` (all RN-app `TO_VERIFY` / to-be-added), `prompt-overrides`, `pending-promotions` (empty), `known-legacy` (records the superseded framework + the "Google HealthKit" -> Health Connect terminology correction), and this log. Operating principle = **backend runnable scenario contract first -> mobile execution plan second -> platform writer third**; source of truth = MWDS backend + Master REQ. **No product code, no RN scaffold, no health-write code, no MR0/MR1 stories.** | DONE |

## Next

- **MR0 — Mobile Runner Contract Alignment**: lock the backend/mobile/native
  contracts and the safety gate set before any product implementation
  (Master REQ §17). Resolve the §16 open questions (endpoints, token
  storage, writable metrics, run-reporting, real-write gating, run scope) or
  accept them as delivery risk. No product code until contracts are locked.

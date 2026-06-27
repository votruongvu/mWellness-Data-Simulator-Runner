# MWR Framework Context-Completeness & MR0-Readiness Audit

**Document ID:** MWR-BOOTSTRAP-AUDIT-002
**Pass:** PROMPT_02 — Context completeness + MR0 readiness (validation/docs only)
**Target repo:** `mWellness-Mobile-Runner` (`MWR` / `mwr`)
**Date:** 2026-06-27
**Branch:** `mr-framework-00-bootstrap` (framework from MR-FRAMEWORK-00, commit `cbe7e22`)
**Final classification:** **READY_WITH_FOLLOWUPS** — the framework has enough context to generate MR0 user stories, is free of DM1 product-truth contamination, and the named follow-ups are largely MR0's own deliverables.

> **Scope.** Validation/docs only. No product code was written, no React Native app was scaffolded, **no MR0 user stories were created**, no HealthKit/Health Connect code was implemented, and the old DM1 REQ is not treated as canonical. The only file this pass adds is this audit (plus a memory note).

---

## 0. Method

Read the required first-reads — `CLAUDE.md`, `docs/requirements/MOBILE_RUNNER_MASTER_REQ.html/.md`, `adapter/project-source-of-truth.md`, `adapter/current-decisions.md`, `adapter/known-risks.md`, `adapter/human-approval-gates.md`, `docs/roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md` — then ran the framework validator, an internal-link check, and a DM1-contamination scan, and dispatched two read-only verifications: (A) native-gates + commands/process depth, (B) the seven MR0-readiness contract inputs. Evidence is cited as `file:line`.

**A note on "readiness."** The question is whether the framework carries enough context to *generate MR0 stories* — not whether MR0's deliverables are already done. MR0 ("Mobile Runner Contract Alignment") **exists to lock** the exact backend routes, per-metric writability, token strategy, real-write gating, and device matrix. Those items being `Open`/`TO_VERIFY` is the framework working as designed, not a defect — they are the *subject* of MR0, captured honestly as open questions.

---

## 1. Pass/fail checklist (the 7 audit areas)

### Area 1 — Product identity — **PASS**
| Sub-item | Verdict | Evidence |
|---|---|---|
| Repo/project is `mWellness-Mobile-Runner` | PASS | `CLAUDE.md:3`; `project-source-of-truth.md:15` |
| Acronym MWR clearly defined | PASS | `CLAUDE.md:3` "(**MWR** — the mWellness Mobile Runner)"; `project-source-of-truth.md:15` |
| Upstream is `mWellness-Data-Simulator` | PASS | `CLAUDE.md:5-6,36-42`; `project-source-of-truth.md:17-22` |
| Mobile runner — not Web App, not DM1 generator/seeder | PASS | `CLAUDE.md:9-10` "not an authoring system … never generates or seeds data"; `:208-209` "deterministic **replay** … never data **generation**" |

### Area 2 — Source of truth — **PASS**
| Sub-item | Verdict | Evidence |
|---|---|---|
| New Master REQ is canonical | PASS | `CLAUDE.md:34-42`, `:67`; `project-source-of-truth.md:135-136`; REQ present as `.html`+`.md` in `docs/requirements/` |
| Old DM1 REQ marked legacy/superseded or absent | PASS | DM1 REQ/SRS absent from repo; superseded statement in `adapter/known-legacy.md` and `current-decisions.md:54-61` |
| Artifacts are evidence/history, not current truth | PASS | `CLAUDE.md:82-87` (Artifact truth rule); `project-source-of-truth.md:139-140`; `.claude-framework/artifacts/requirements/README.md` |
| Source hierarchy documented | PASS | `CLAUDE.md:59-80`; `project-source-of-truth.md:130-143` (4-level hierarchy) |

### Area 3 — Boundary — **PASS**
| Sub-item | Verdict | Evidence |
|---|---|---|
| Mobile consumes backend-authoritative runnable test cases/scenarios | PASS | `CLAUDE.md:46-50`; `project-source-of-truth.md:34-47`; `ADR-MWR-002/003` |
| Mobile does NOT own catalog/validation/seed library/versioning/ordering/RBAC/tenant/billing | PASS | `CLAUDE.md:52-57`; `project-source-of-truth.md:49-63`; `ADR-MWR-002` |
| Export bundle is not primary handoff | PASS | `ADR-MWR-003` (`current-decisions.md:27`) "Export bundles are NOT the primary handoff" |
| Google Fit out of scope | PASS | `CLAUDE.md:120,202-207`; `ADR-MWR-007`; human-approval gate #6 |

### Area 4 — Safety — **PASS**
| Sub-item | Verdict | Evidence |
|---|---|---|
| Dry-run required before real write | PASS | `CLAUDE.md:106-107`; `ADR-MWR-004`; `DRY_RUN_NO_WRITE_GATE` + `dry-run-no-write-checklist.md` |
| Capability check required | PASS | `CAPABILITY_PERMISSION_GATE` (gates.md) + `capability-permission-checklist.md` |
| Permission check required | PASS | `CLAUDE.md:110-111` (explain before OS prompt); `R-MWR-006`; capability-permission-checklist |
| Explicit user confirmation required | PASS | `ADR-MWR-004`; human-approval gate #4; `MOBILE_HEALTH_WRITE_SAFETY.md` gate chain |
| No fake native write success | PASS | `CLAUDE.md:108-109`; `ADR-MWR-005`; `NO_FAKE_SUCCESS_GATE` + `no-fake-success-checklist.md`; `R-MWR-002` (P0) |
| Unsupported metric cannot be silently ignored | PASS | `CLAUDE.md:112-113`; `ADR-MWR-009`; `PLATFORM_WRITER_GATE`; `R-MWR-007` |
| Token/raw-payload logging guardrails | PASS | `CLAUDE.md:114-115`; `ADR-MWR-006`; `SECRET_AND_ENDPOINT_SAFETY_GATE`; `R-MWR-003` (P0) |

### Area 5 — Native gates — **PASS**
| Sub-item | Verdict | Evidence |
|---|---|---|
| Apple Health write gate | PASS | `APPLE_HEALTH_WRITE_GATE` (gates.md) + `apple-health-write-checklist.md` (8 items); reviewer `mwr-apple-health-write-reviewer` |
| Health Connect write gate | PASS | `HEALTH_CONNECT_WRITE_GATE` + `health-connect-write-checklist.md`; terminology guard enforced |
| Permission prompt gate | PASS | `CAPABILITY_PERMISSION_GATE` + `capability-permission-checklist.md` (explain before OS prompt; fail-closed); human-approval gate #3 |
| Token storage gate | PASS | `SECRET_AND_ENDPOINT_SAFETY_GATE` + human-approval gate #5; secret-by-reference |
| Backend contract gap gate | PASS | `BACKEND_API_GATE` + `backend-api-contract-checklist.md` ("missing API → STOP, never fabricate"); human-approval gate #7 |
| Production readiness gate | PASS | human-approval gate #8; `MWR_PHASE_QUEUE.md` MR7; "no RC without separate security/privacy review" |

### Area 6 — Commands / process — **PASS**
| Sub-item | Verdict | Evidence |
|---|---|---|
| `run-phase-loop` (or equivalent) exists | PASS | `.claude/commands/run-phase-loop.md`; drives phase execution off the execution layer |
| `close-task` (or close-task-style review handoff) exists | PASS | `.claude/commands/close-task.md` + `.claude/skills/close-task/SKILL.md` (Acceptance + `CONTEXT_PROMOTION_GATE`) |
| `refresh-context` exists | PASS | `.claude/commands/refresh-context.md` + skill (the only adapter writer) |
| Phase loop stops after closeout for human approval | PASS | `run-phase-loop.md` ("STOP for human approval before starting the next phase"); `MWR_EXECUTION_CONTROLLER.md` step 2/10 |
| Story commits are separate | PASS | `run-phase-loop.md` "Commit each story separately (one commit per story)" |
| Context refresh required on contract/risk/API/native/safety-gate/sequencing change | PASS | `run-phase-loop.md` explicit trigger list → `/refresh-context` |
| Hard human-approval gates halt the loop regardless of budget | PASS | `MWR_EXECUTION_CONTROLLER.md`; `human-approval-gates.md:6-8` "never self-waived by … the task budget" |

### Area 7 — MR0 readiness (the seven required inputs)
| Input | Status | Evidence / note |
|---|---|---|
| 1. Mobile/backend API contract | **PRESENT (routes Open by design)** | `docs/contracts/MOBILE_BACKEND_API_CONTRACT.md` carries capabilities, JSON contracts, error model, and the "missing API → STOP" rule; **exact routes `TO_VERIFY` — locked at MR0** (REQ §16 Q1/Q5). This is MR0's job, not a gap. |
| 2. Scenario execution model | **PRESENT** | `docs/contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`: full state machine, `ExecutionPlan`+`RunResult` JSON, operation classification + reason_codes, dry-run, deterministic replay (final reason_code set `TO_VERIFY` at MR3). |
| 3. HealthKit mapping contract | **PRESENT (per-metric writability `TO_VERIFY`)** | `docs/platform/MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md`: metric→HK type/unit, permissions, idempotency; every writability cell honestly `TO_VERIFY` (confirmed MR3/MR4). |
| 4. Health Connect mapping contract | **PRESENT (per-metric writability `TO_VERIFY`)** | Same matrix: metric→Record type/unit, permissions, `clientRecordId` idempotency, correct terminology; writability `TO_VERIFY` (confirmed MR5). |
| 5. Safety & permission rules | **PRESENT** | `docs/safety/MOBILE_HEALTH_WRITE_SAFETY.md` (6-step gate chain + 10 hard gates + redaction) and `docs/platform/MWR_HEALTH_WRITE_SAFETY_BOUNDARIES.md`. |
| 6. Run lifecycle & result reporting | **PRESENT** | Execution model state machine + `RunResult` summary/reason_codes; "succeeded counts only real native successes"; optional backend report flagged as a possible MR6 gap. |
| 7. QA / device matrix | **WEAK** | `docs/platform/MWR_MANUAL_QA_CHECKLIST.md` is a sound *procedural* checklist but there is **no concrete real-device / OS-version matrix** (min iOS / Android API, named devices). REQ §16 Q8 is open. This is the one genuine framework-completeness gap. |

**Area 7 verdict:** inputs 2/5/6 are locked; 1/3/4 are PRESENT with their open variables correctly held as MR0 work; **7 is WEAK** and should be stubbed.

---

## 2. Missing / weak context areas

1. **QA / real-device matrix (input 7) — WEAK (the only true framework gap).** Only a generic checklist exists; no min-OS / named-device matrix for MR4/MR5 manual writer validation (REQ §16 Q8 open).
2. **Open contract variables (by design, not defects):** exact MWDS routes (Q1), run-reporting endpoint existence (Q5), per-metric writability iOS/Android (Q3/Q4), token/session storage strategy (Q2, gate #5), real-write gating mechanism (Q6), run scope one-vs-ordered (Q7), final reason_code set (MR3). All are recorded as `Open`/`TO_VERIFY` in `current-decisions.md` and `known-risks.md` and are the explicit subject of MR0.
3. **`USER_STORY_INDEX.md` not present** — `run-phase-loop.md` references it and correctly STOPs if absent; it is created in MR0+. Minor.
4. **Decision log is template-seeded** — `current-decisions.md` holds the right ADRs and Opens but no MR0 *resolutions* yet (expected pre-MR0).

---

## 3. Required fixes before / during MR0

**P1 (do as part of, or just before, MR0):**
- **F1 — Add a QA/device-matrix stub.** Create `docs/platform/MWR_DEVICE_QA_MATRIX.md` (or an `Open` row block) capturing min iOS / min Android API (Health Connect availability), named real devices for MR4/MR5, and QA ownership. Resolve REQ §16 Q8. *(This is the single framework-completeness fix; everything else is MR0 content.)*
- **F2 — At MR0, lock the contract Opens into ADRs** (flip `current-decisions.md` Opens → Active via close-task → refresh-context): exact backend routes, run-reporting endpoint (or documented gap + gate), per-metric writability verdicts (iOS + Android, with doc links/dates), token/session storage strategy, real-write gating, run scope, final reason_code set.

**P2:**
- **F3 — Seed `USER_STORY_INDEX.md`** when MR0 stories are authored (the loop already guards its absence).
- **F4 — Optional CI/pre-commit check** that adapter edits route only through `/refresh-context` (enforce `CONTEXT_PROMOTION_GATE` syntactically, not just procedurally) — defer to MR1.
- **F5 — Optional phase-order guard** that halts MR4/MR5 if MR3 (dry-run plan) is incomplete (procedurally enforced today by the phase queue/loop).

None of F1–F5 block *generating* MR0 stories.

---

## 4. Legacy DM1 contamination check — **CLEAN**

- **Framework validator** `validate-framework.sh` → PASS (0 errors, 0 warnings); its `[15] DM1 leakage guard` (forbidden `mwdm1`/`Mwdm1`/`ADR-MW-DM1`/`mWellness-DM1` as current truth) and `[14]` terminology guard both pass.
- **Broad markdown scan** for DM1 product-truth tokens (`seed engine`, `canonical synthetic`, `source library`, `active source`, `internal sandbox`, `vendor_api`, `file_export`, `deterministic generation`, `manual_pulse`, `Google HealthKit`) across `CLAUDE.md`, `.claude/`, `.claude-framework/{adapter,framework,execution}`, `docs/`: every hit is a **negation/guard/prohibition** line (e.g., "never 'Google HealthKit'", "No on-device generation … replay only", reviewer instructions to *flag* the token). No token appears as current truth.
- DM1 is named **only** in `adapter/known-legacy.md` (historical correction) — as required. The DM1 REQ/SRS is absent from the repo.
- The operating principle, authority boundaries, and "deterministic **replay**, not generation" framing are consistent across `CLAUDE.md`, `project-source-of-truth.md`, `current-decisions.md`, and the roadmap.

---

## 5. Recommended MR0 story-set outline (DO NOT create story files)

MR0 = "Mobile Runner Contract Alignment." Each story produces **contracts/ADRs/docs only — no product code**; each traces to MR0 + a REQ section; each that touches a real-write/permission/secret surface is full-lane and may hit a hard human-approval gate.

| # | Proposed MR0 story | Output | Traces to |
|---|---|---|---|
| MR0-S1 | Lock the mobile↔backend API contract — exact MWDS routes for auth/session, test cases, version detail, ordered scenarios, scenario content, metric metadata; pagination/ordering; error model | ADRs + updated `MOBILE_BACKEND_API_CONTRACT.md` | REQ §9; §16 Q1 |
| MR0-S2 | Confirm run-reporting capability (`POST /mobile/runs`) or record the gap + gate | ADR / documented gap | REQ §16 Q5; gate #7 |
| MR0-S3 | Ratify the scenario execution model — state machine, `ExecutionPlan`/`RunResult`, operation classification + **final reason_code set** | ratified `MOBILE_SCENARIO_EXECUTION_MODEL.md` | REQ §6/§10 |
| MR0-S4 | Lock the HealthKit mapping contract + **per-metric writability verdicts** + idempotency | decision table + matrix update | REQ §8; §16 Q3 |
| MR0-S5 | Lock the Health Connect mapping contract + **per-metric writability verdicts** + `clientRecordId` idempotency | decision table + matrix update | REQ §8; §16 Q4 |
| MR0-S6 | Ratify the health-write safety + permission contract (capability→permission→dry-run→confirmation→native-write→no-fake-success; redaction) as ADRs | ADRs | REQ §11; gates |
| MR0-S7 | Decide token/session storage strategy (Keychain/Keystore; refresh model) | ADR (hard gate #5) | REQ §16 Q2 |
| MR0-S8 | Decide real-write enablement gating (DEV/env/both) + run scope (one vs ordered) | ADRs | REQ §16 Q6/Q7 |
| MR0-S9 | Establish the **QA/device matrix** (min iOS/Android, named devices for MR4/MR5) | new `MWR_DEVICE_QA_MATRIX.md` | REQ §13/§16 Q8 (fixes F1) |
| MR0-S10 | Promote locked decisions (Opens→Active) and update wiring/settings/test maps; seed `USER_STORY_INDEX.md` | adapter updates via refresh-context | governance |

---

## 6. Validation results

| Check | Result |
|---|---|
| Framework validator (`validate-framework.sh`) | ✅ PASS — 0 errors, 0 warnings (18 checks incl. leakage + terminology guards) |
| Context-pack path validator | ✅ 3 paths OK, 0 deferred, 0 errors |
| Internal markdown links | ✅ 0 broken of 472 (file-relative or repo-root-relative) |
| DM1 contamination scan | ✅ CLEAN — only negation/guard lines; DM1 named only in known-legacy.md |
| No product/native code changed | ✅ PASS — no `.ts/.tsx/.swift/.kt/.java/.mm/package.json/Podfile/build.gradle` exist |
| No MR0 user stories created | ✅ PASS — `artifacts/stories/` holds only `.gitkeep`; outline above is advisory, no files |
| No native write code implemented | ✅ PASS — none exists |
| Old DM1 REQ not canonical | ✅ PASS — absent from repo; superseded in known-legacy |

---

## 7. Closeout

**Final readiness classification: `READY_WITH_FOLLOWUPS`.**

The MWR Claude Framework is governance-complete, safety-critical, DM1-clean, and carries enough context to generate MR0 user stories. Areas 1–6 pass fully; area 7's open variables (exact routes, per-metric writability, token strategy, real-write gating, run scope, reason_codes) are correctly held as `Open`/`TO_VERIFY` and are precisely what MR0 resolves. The one genuine framework-completeness gap is the **QA/real-device matrix** (F1) — a small stub closes it.

**Followups**
- **P0** — none.
- **P1** — F1 (add `MWR_DEVICE_QA_MATRIX.md` stub for REQ §16 Q8); F2 (at MR0, lock the contract Opens into ADRs via close-task → refresh-context).
- **P2** — F3 (seed `USER_STORY_INDEX.md` with MR0 stories); F4 (CI guard for adapter-via-refresh-context); F5 (automated MR3-before-MR4/MR5 phase guard).

**Recommended next step:** proceed to generate the MR0 story set (outline §5) under an approved REQ slice via `req-to-stories` / `story-to-tasks`. MR0 itself and all real-write work (MR4/MR5) remain hard human-approval gates.

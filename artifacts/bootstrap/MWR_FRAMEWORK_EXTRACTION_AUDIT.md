# MWR Framework Extraction Audit

**Document ID:** MWR-BOOTSTRAP-AUDIT-001
**Pass:** PROMPT_00 — Framework Extraction Audit (planning/audit only)
**Target repo:** `mWellness-Mobile-Runner` (`MWR` / `mwr`)
**Date:** 2026-06-27
**Status:** Draft for human review → feeds PROMPT_01 (framework bootstrap)

> **Scope of this pass.** This is an **audit/planning document only**. No product code was written, no React Native app was scaffolded, no MR0/MR1 user stories were created, no old DM1 requirement was promoted to canonical truth, and no health-write code was implemented. The only files this pass creates are this audit document and two Claude memory notes. The actual framework files are created later by PROMPT_01.

---

## 0. Inputs and method

| Input | Location | Role | Status |
|---|---|---|---|
| Old Claude Framework archive | `~/Downloads/Archive.zip` (the prompt's `Archive(2).zip`; only `Archive.zip` is present — same artifact) | Source of **reusable framework mechanics only** | Extracted & audited (266 files) |
| New Master REQ | `~/Downloads/mWellness_Mobile_Runner_Master_REQ_v1.0.html` (MWR-MASTER-REQ-v1.0) | **Canonical requirement source** for the new repo | Read in full (333 lines) |
| Bootstrap prompt pack | `~/Downloads/mwr_claude_framework_bootstrap_prompts/` (PROMPT_00/01/02) | Sequenced bootstrap plan | Read 00 (this) + 01 (downstream structure) |

**Method.** The archive was extracted to a scratchpad and inventoried (`__MACOSX` cruft excluded). Five parallel read-only audits classified every file by cluster: (1) commands & skills & settings, (2) hooks & validator scripts, (3) rules & checklists, (4) adapter & execution & context, (5) templates & agents & docs & artifacts. The new Master REQ was read directly and is the sole source for "Mobile Runner canonical assumptions" below.

**Classification legend (per PROMPT_00 buckets):**

- **A — Reuse directly / light rename.** Generic framework mechanic. Copy the file; only `DM1→MWR` token renames needed.
- **B — Reuse after rewriting to Mobile Runner semantics.** The role/mechanic is valuable and the file name/slot is retained, but the **body** is rewritten because it assumes DM1 product semantics (generator, seed engine, canonical model, internal sandbox destination).
- **C — Drop/archive as legacy.** Tied to DM1 product (generator/seeder/source-library/dataset-export/product history). Not carried into the new repo; remains available in `Archive.zip` for reference.

---

## 1. Files and directories found in the old archive

**Total: 266 tracked files** (excluding `__MACOSX/` and `.DS_Store`). Top-level structure:

```
Archive.zip/
├── CLAUDE.md                         # DM1 operating contract (root)
├── .claude/                          # runtime: commands, skills, agents, hooks, settings, state
│   ├── HANDOFF.md
│   ├── settings.json                 # hook wiring (5 hooks)
│   ├── commands/      (21 *.md)
│   ├── skills/        (13 SKILL.md)
│   ├── agents/        (12 mwdm1-* + README)
│   ├── hooks/         (6 *.sh)
│   ├── state/         (.gitignore)
│   └── task-runs/     (.gitkeep)
├── .claude-framework/                # the framework "module"
│   ├── README.md
│   ├── adapter/       (12 *.md — curated current truth)
│   ├── execution/     (7 DM1_*.md — autonomous loop layer)
│   ├── framework/
│   │   ├── rules/        (18 *.md)
│   │   ├── checklists/   (18 *.md)
│   │   ├── templates/    (12 *.md)
│   │   └── context/      (7 *.md — mental model, registries, guides)
│   ├── artifacts/     (~113 files — DM1 product history)
│   │   ├── requirements/  (3: README, DM1 master REQ .md, SRS .pdf)
│   │   ├── stories/       (~67 DM1 STORY-*.md)
│   │   ├── reviews/       (~26 DM1 closeouts/audits)
│   │   ├── ux/            (7 DM1 UX artifacts)
│   │   ├── adr/           (4 ADR-MW-DM1-*)
│   │   ├── plans/         (2 US044 plans)
│   │   ├── tasks/         (2 + .gitkeep)
│   │   ├── decision-briefs/ (1 + .gitkeep)
│   │   └── handoffs/      (.gitkeep)
│   └── scripts/       (validate-framework.sh, validate_context_pack_paths.py)
└── docs/              (11 DM1_*.md — mobile-native + QA docs)
```

**Cluster tally and disposition (file counts → A/B/C):**

| Cluster | Files | A | B | C |
|---|---:|---:|---:|---:|
| Commands | 21 | 8 | 8 | 5 |
| Skills | 13 | 9 | 2 | 2 |
| Hooks | 6 | 3 | 3 | 0 |
| Validator scripts | 2 | 1 | 1 | 0 |
| Rules | 18 | 13 | 4 | 1 |
| Checklists | 18 | 11 | 5 | 2 |
| Templates | 12 | 11 | 1 | 0 |
| Context | 7 | 5 | 2 | 0 |
| Adapter (content) | 12 | 1 | 10 | 1 |
| Execution (loop layer) | 7 | 5 | 2 | 0 |
| Agents | 12 | 8 | 2 | 2 |
| docs/ (mobile-native) | 11 | 2 | 8 | 1 |
| artifacts/ (DM1 history) | ~113 | 0 | 0 | ~113 |
| CLAUDE.md (root) | 1 | 0 | 1 | 0 |

> The **adapter directory structure** and the **artifacts bucket structure** are themselves reusable mechanics (kept as empty scaffolds). Only their DM1 *contents* are dropped.

---

## 2. Reuse / Drop / Rewrite classification (detail)

### 2.1 Commands (`.claude/commands/`)

| File | Class | Disposition for MWR |
|---|:--:|---|
| `close-task.md` | A | Generic context-promotion gate. Keep. |
| `compose-task.md` | A | Generic task-brief composer w/ lane/risk/scope gates. Keep. |
| `execute-task.md` | A* | Generic executor; re-point agent refs `mwdm1-*`→`mwr-*`. |
| `review-task.md` | A | Multi-lens fanout review → single verdict. Keep. |
| `refresh-context.md` | A | Reconcile curated context vs repo state. Keep. |
| `req-to-stories.md` | A | REQ → stories (one surface each). Keep. |
| `story-to-tasks.md` | A | Story → single-objective tasks. Keep. |
| `direct-patch.md` | A | Tiny-lane shortcut. Keep. |
| `update-source-of-truth.md` | A | Alias of refresh-context. Keep. |
| `routes.md` | B | Routing decision guide — rewrite route table for MWR surfaces (auth, backend-load, interpret/plan, dry-run, health-write, report). |
| `run-gates.md` | B | Advisory gate lister — re-point to the MWR gate set (§7). |
| `mwdm1-context.md` | B | Re-author as `mwr-context` loading MWR context packs. |
| `mwdm1-full-task.md` | B | Re-author as `mwr-full-task` preset. |
| `mwdm1-destination-task.md` | B | Re-author as `mwr-health-write-task` (Apple Health / Health Connect). |
| `mwdm1-safety-critical.md` | B | Re-author as `mwr-safety-critical` (dry-run/permission/no-fake-success). |
| `mwdm1-review-closeout.md` | B | Re-author as `mwr-review-closeout`. |
| `review-closeout.md` | B | Alias → re-point to `mwr-review-closeout`. |
| `compose-req.md` | C→B | Lifecycle slot retained but body is DM1-generator grounded; author fresh MWR version (requirements derive from the Master REQ + backend contract). |
| `dataset-export-report.md` | C | DM1 synthetic-dataset export. Not in MWR primary scope. Drop. |
| `mwdm1-canonical-task.md` | C | Canonical synthetic metric model is dropped. Drop. |
| `mwdm1-seed-engine-task.md` | C | No on-device seed engine in MWR. (An `mwr-execution-plan-task` may be authored fresh, but this file is not carried.) Drop. |

`A*` = reuse, but update the `mwdm1-*` agent crew references.

### 2.2 Skills (`.claude/skills/`)

| File | Class | Disposition |
|---|:--:|---|
| `close-task` | A | Keep. |
| `compose-task` | A | Keep (lane triage + gates). |
| `review-task` | A | Keep (fanout). |
| `refresh-context` | A | Keep. |
| `req-to-stories` | A | Keep. |
| `story-to-tasks` | A | Keep. |
| `direct-patch` | A | Keep. |
| `rn-performance` | A | Measure-first RN perf review. Keep (mobile-native). |
| `mobile-exploratory-qa` | A | Device/exploratory QA walk. Keep (mobile-native). |
| `execute-task` | B | Re-point DM1 invariants/agent crew to MWR. |
| `rn-testing` | B | RNTL discipline — retarget DM1 screen states → MWR run-flow states. |
| `compose-req` | C→B | As above; author fresh MWR version. |
| `dataset-export-report` | C | Drop. |

### 2.3 Hooks (`.claude/hooks/`) + validator scripts

| File | Class | Disposition |
|---|:--:|---|
| `notification-only.sh` | A | Generic macOS notification. Keep as-is. |
| `framework-validator.sh` | A | PostToolUse wrapper that runs the validator on `.claude/` & `.claude-framework/` edits. Keep wrapper; it calls the rewritten validator. |
| `stop-guard-and-notify.sh` | A | Stop-hook chain (guard → notify). Keep; update notification title `DM1 Claude Loop`→`MWR Mobile Loop`. |
| `route-hint.sh` | B | UserPromptSubmit route detector writing `.claude/state/route`. Mechanism reusable; rewrite route markers/hints for MWR lanes. |
| `direct-patch-output-guard.sh` | B | Stop-hook enforcing 5-field compact output. Reusable; keep section/field names aligned to MWR report-format. |
| `protected-edit-guard.sh` | B | PreToolUse guard blocking Tiny-lane edits to high-risk paths + protecting `.claude-framework/adapter/*`. **Rewrite `HIGH_RISK_PATTERNS`** for MWR (native iOS/Android, entitlements/Info.plist/AndroidManifest, health writers, secrets, dry-run/confirmation, scenario-contract, execution-plan). |
| `scripts/validate_context_pack_paths.py` | A | Domain-agnostic: parses context-pack-registry, checks path existence, honors defer markers (`TO_VERIFY`, `DEFERRED`, …). Keep as-is. |
| `scripts/validate-framework.sh` | B | Comprehensive structural validator. Logic reusable; **every hard-coded file/agent/command/rule/checklist/template name must be reset to the MWR manifest** (see §2.4 note on leakage guards). |

**Validator checks worth re-implementing for MWR** (from `validate-framework.sh`): root files present & non-empty (`CLAUDE.md`, `.claude/HANDOFF.md`, `.claude/settings.json`); all required dirs exist; all adapter files present & non-empty; lifecycle skill+command pairs present; each agent declares a non-empty `tools:`; all rules/checklists/templates/context files present; artifact buckets non-empty or `.gitkeep`; CLAUDE.md content guards (Context Layer / Artifact-truth / Context Promotion / human gate / source-of-truth principle); skills carry no `## Agent crew`; single-source lane denylist; **terminology leakage guards** (Android = "Health Connect", never "Google HealthKit"/Google Fit); no macOS metadata tracked; context-pack path validation. The two DM1-specific leakage guards (M1 `ADR-MW-RN-*` bleed; "DM1 must not compute score") should be re-expressed as MWR guards (no upstream-backend-truth bleed; no-fake-success / mobile-does-not-author-scenarios).

### 2.4 Rules (`.claude-framework/framework/rules/`)

**A — keep (generic governance or mobile-native safety):** `operating-principles`, `gates`, `security-rules`, `secret-endpoint-safety-rules`, `testing-rules`, `rn-testing-rules`, `rn-performance-rules`, `rn-ui-quality-rules`, `refactor-rules`, `documentation-rules`, `prompt-rules`, `artifact-lifecycle`, `report-format` (update P0 examples to health-write language), `internal-release-rules`.

**B — rewrite to MWR semantics:** `synthetic-data-rules` → *test/scenario-data safety + no-fake-success* (drop "we generate; canonical is source"; keep no-real-PHI, plausibility, redaction, "never present test data as real / never fake success"); `destination-adapter-rules` → *platform writer-adapter rules* (keep DA boundary, explicit typed mapping, unsupported-surfaced, per-metric toggles, idempotency; re-point "vendor/internal/file" to Apple Health + Health Connect + a backend run-reporting client); `lane-classification` → rewrite the denylist categories for MWR high-risk surfaces; `seed-engine-rules` → *execution-plan runner rules* (keep lifecycle/dry-run/idempotency/error-taxonomy/redaction; drop ambient generation, accelerated/backfill seeding modes).

**C — drop:** none of the rules are pure-legacy except where the concept disappears; the only rule whose subject ceases to exist (canonical generation) is covered by rewriting `synthetic-data-rules`/`seed-engine-rules`. (Listed as 1 C in the tally for `seed-engine-rules`' generation core; its safety core survives in the rewrite.)

### 2.5 Checklists (`.claude-framework/framework/checklists/`)

**A — crown-jewel safety/quality, keep:** `apple-health-write-checklist`, `health-connect-write-checklist`, `dry-run-no-write-checklist`, `secret-endpoint-safety-checklist`, `synthetic-data-safety-checklist` (= no-real-PHI scenario safety), `rn-testing-checklist`, `rn-performance-checklist`, `rn-ui-quality-checklist`, `mobile-exploratory-qa-checklist`, `post-patch-verification`, `prompt-review`, `internal-release-checklist`.

**B — rewrite:** `destination-adapter-contract-checklist` → *mobile writer-adapter contract*; `api-destination-contract-checklist` → *MWDS backend API client + run-reporting contract* (loading + reporting, not seeding); `wiring-audit` → *mobile execution wiring audit* (scenario → plan → writer → health store); `scenario-determinism-checklist` → *scenario replay determinism* (deterministic replay of a stored plan, not generation); `realtime-seed-engine-checklist` → *execution-plan runner checklist*.

**C — drop:** `canonical-metric-model-checklist` (MWR does not author a canonical model — the backend catalog owns metric definitions). `scenario-determinism-checklist` and `realtime-seed-engine-checklist` are counted here as the generator versions being dropped; their replay/runner successors are authored fresh (so net: 2 C for the generator originals).

### 2.6 Templates (`.claude-framework/framework/templates/`)

All 12 are **A** (generic forms; light tag rename `DM1 impact`→`MWR impact`): `requirement`, `story`, `task`, `task-brief`, `task-brief-compact`, `task-review-compact`, `review`, `decision-brief`, `handoff`, `session-closeout-compact`, `test-case-set`. The single **B** is `mobile-qa-report` (rewrite the safety-confirmation rows to MWR: no-real-PHI scenario, dry-run wrote nothing, permission honored, no-fake-success, Health Connect labeled correctly).

### 2.7 Context (`.claude-framework/framework/context/`)

**A — keep (structural mechanics):** `README`, `mental-model` (four-layer Command→Skill→Agent→Tool), `dm1-skill-command-anatomy` (rename → `mwr-skill-command-anatomy`), `dm1-review-fanout-pattern` (rename; swap reviewer roster), `dm1-framework-guide` (rename; retarget pipeline to backend-load→plan→write).
**B — rewrite content:** `context-pack-registry` (author MWR packs: AUTH/SESSION, BACKEND_API_CLIENT, SCENARIO_LOADING, INTERPRET_PLAN, DRY_RUN, APPLE_HEALTH_WRITE, HEALTH_CONNECT_WRITE, RUN_REPORTING, DIAGNOSTICS), `skill-registry` (MWR skills + risk levels).

### 2.8 Adapter (`.claude-framework/adapter/`) — *the curated "current truth"*

The **file set is reused as the adapter contract**; the **DM1 content is overwritten**. All are **B** except `known-legacy` (A — terminology-correction anchor) and `milestone-log` (C — pure DM1 product history; start a fresh MWR log). Rewrite targets:
`project-source-of-truth` (→ MWR identity + backend-first principle + ownership boundaries), `current-decisions` (→ MWR ADRs; DM1's 15 ADRs are **not** carried), `known-risks` (→ MWR risk register seeded from Master REQ §16), `repository-map`, `wiring-paths` (→ scenario→plan→writer→store paths), `settings-map`, `test-map`, `regression-fixtures` (→ scenario/plan fixtures), `pending-promotions`, `prompt-overrides`.
The Master REQ §15 also asks for `source-of-truth.md` and `human-approval-gates.md` in `adapter/`; reconcile naming (`project-source-of-truth.md` is the existing convention — keep it and add a `human-approval-gates.md`).

### 2.9 Execution loop layer (`.claude-framework/execution/`)

The **autonomous loop mechanics are high-value and reused** (renamed `DM1_*`→`MWR_*`); the **block/state contents are MWR-specific**:
- **A (mechanics):** `DM1_EXECUTION_CONTROLLER` (10-step loop algorithm, budget rule), `DM1_LOOP_RUNBOOK` (read-truth→apply→validate→closeout; retarget the validation matrix commands), `DM1_HUMAN_APPROVAL_GATES` (detect→halt→request→wait; rewrite the gate list per §7), `DM1_LOOP_CLOSEOUT_TEMPLATE` (Result/Tasks/Files/Scope-Guard/Validation/Followups/Human-Approval/Next; rewrite Scope-Guard rows), `DM1_STOP_CONDITIONS` (categories reused; retarget triggers).
- **B (content):** `DM1_TASK_QUEUE` (→ MWR phase queue MR0–MR7), `DM1_EXECUTION_STATE` (→ MWR phase-state machine).

This layer is the basis for the **`run-phase-loop` command** the Master REQ (§15) and PROMPT_01 request.

### 2.10 Agents (`.claude/agents/`)

| File | Class | Disposition |
|---|:--:|---|
| `mwdm1-rn-architecture-reviewer` | A | → `mwr-rn-architecture-reviewer`. |
| `mwdm1-test-reviewer` | A | → `mwr-test-reviewer`. |
| `mwdm1-doc-sync-reviewer` | A | → `mwr-doc-sync-reviewer`. |
| `mwdm1-apple-health-write-reviewer` | A | → `mwr-apple-health-write-reviewer` (crown-jewel). |
| `mwdm1-health-connect-write-reviewer` | A | → `mwr-health-connect-write-reviewer` (crown-jewel). |
| `mwdm1-codebase-explorer` | A | → `mwr-codebase-explorer`. |
| `mwdm1-implementation-agent` | A | → `mwr-implementation-agent`. |
| `mwdm1-prompt-composer` | A | → `mwr-prompt-composer`. |
| `mwdm1-synthetic-data-safety-reviewer` | B | → `mwr-test-data-and-health-write-safety-reviewer` (no-real-PHI + dry-run + no-fake-success + secret redaction). |
| `mwdm1-api-destination-reviewer` | B | → `mwr-backend-api-reviewer` (loading + run-reporting client, not vendor seeding). |
| `mwdm1-canonical-data-reviewer` | C | Canonical synthetic model dropped. Drop. |
| `mwdm1-seed-engine-reviewer` | C | On-device seed engine dropped. (An execution-plan-runner reviewer can be authored fresh.) Drop. |

### 2.11 docs/ (mobile-native knowledge)

**A — keep (light rename):** `DM1_NATIVE_BUILD_AND_CODEGEN_GUIDE` (RN + New Arch + Hermes + TurboModule codegen + concept-token boundary), `DM1_VALIDATION_GUIDE` (test/verify command matrix).
**B — rewrite to MWR (real-write-enabled runner, not dry-run-only generator):** `DM1_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX`, `DM1_SAFETY_BOUNDARIES`, `DM1_OS_HEALTH_STORE_READINESS`, `DM1_NATIVE_SUBSTRATE_ACTIVATION`, `DM1_HEALTHKIT_REAL_WRITE_MANUAL_VERIFICATION`, `DM1_HEALTH_CONNECT_REAL_WRITE_MANUAL_VERIFICATION`, `DM1_HEALTHKIT_APP_VISIBILITY_TROUBLESHOOTING`, `DM1_MANUAL_QA_CHECKLIST`.
**C — drop:** `DM1_DEMO_RUNBOOK` (tied to DM1 product demo/UX).

The genuinely valuable mobile-native IP to carry into the rewritten docs is consolidated in **Appendix B**.

### 2.12 artifacts/ (DM1 product history)

**Entire tree → C (legacy).** ~113 files: ~67 `STORY-*`, ~26 reviews/closeouts/audits, 7 UX, 4 ADRs, 3 requirements (incl. `REQ-mwellness-dm1-data-simulator-master.md` and the SRS PDF), 2 plans, 2 tasks, 1 decision-brief. **Only the empty bucket structure is reused.** The DM1 master REQ and SRS here are explicitly **not** promoted to canonical (see §9). These remain in `Archive.zip` for historical reference.

---

## 3. Old DM1 assumptions that MUST be removed

These are DM1 product truths embedded in the archive. They must **not** leak into the MWR framework. (Source files noted.)

1. **The app generates data.** DM1 is a synthetic data **generator/seeder**; "canonical synthetic metric model → convert → seed" is its core. → MWR **loads** validated runnable scenarios from the backend and **executes** them. (`project-source-of-truth`, `mental-model`, `dm1-framework-guide`, ADR-MW-DM1-002)
2. **Canonical synthetic metric model is the source of truth.** → The **MWDS backend catalog** owns metric definitions; mobile consumes metric metadata. (`synthetic-data-rules`, `canonical-metric-model-checklist`)
3. **On-device real-time seed engine** with `backfill / realtime / accelerated / manual_pulse` modes + simulated clock. → MWR runs an **execution plan** (one run / ordered scenarios); timing comes from the scenario, no acceleration engine. (`seed-engine-rules`, ADR-MW-DM1-014)
4. **Seeded PRNG determinism (`cyrb128`+`sfc32`), generator SemVer (`MW_GENERATOR_VERSION`, `mw_canonical_version`, `mw_converter_version`).** → No generation = no generator versioning; **backend scenario version** is authoritative. Determinism survives only as **deterministic replay** of a stored plan. (ADR-MW-DM1-004/005)
5. **Four destination kinds** (`os_health_store`, `vendor_api`, `internal_api`/internal sandbox emitter, `file_export`). → MWR destinations are **Apple Health + Health Connect** only; plus a **backend run-reporting API client** (not a "destination"). No vendor SDK, no internal sandbox emitter, no file-export as primary. (ADR-MW-DM1-007, `wiring-paths` W-DM1-006/007, `destination-adapter-rules` DA-6/DA-8)
6. **Export-bundle handoff.** → MWR's **primary** flow is direct backend API loading after login; export bundles are explicitly *not* the primary data source. (Master REQ §1)
7. **Source Library / Active Source model (M6)** and **SRS-backed synthetic source picker (M5).** → Out of scope; mobile does not own scenario seed library/applicability. (DM1 stories `m5-*`, `m6-*`)
8. **Attribution-scoped clear** via `mw_seeded` markers ("delete only what we wrote"). → Not an MWR concept at bootstrap. (ADR-MW-DM1-015)
9. **DM1 milestone/gate history M1–M6 / Gate A–F**, ADR-MW-DM1-001…015, US-044/US-044F, and the DM1 roadmap. → Not carried; MWR starts a fresh decision log and roadmap (MR0–MR7). (`milestone-log`, `current-decisions`, `artifacts/*`)
10. **iOS-first ordering** `file_export → internal sandbox API → iOS HealthKit; Android post-MVP`. → MWR treats Apple Health (MR4) and Health Connect (MR5) as peer POCs after the dry-run plan (MR3). (ADR-MW-DM1-011)
11. **Native module prefix `Mwdm1<Capability>`** and **`ADR-MW-DM1-*` IDs**. → Rename to MWR conventions (§6).
12. **"DM1 is not the score engine" framed around generation.** → Survives, generalized: mobile **does not author/validate scenarios or compute scores**; it executes and reports. Pairs with the new **no-fake-success** rule.

> **Explicitly preserved (not a DM1-only assumption):** dry-run-no-write, no-real-PHI, secret-by-reference / no prod default, redaction, idempotency, fail-closed permissions, unsupported-metric-surfaced, "Health Connect ≠ Google HealthKit/Fit". These are safety invariants that the new Master REQ re-affirms (§11/§15) and are carried forward.

---

## 4. Mobile Runner assumptions that MUST become canonical (from new Master REQ v1.0)

Sourced directly from `mWellness_Mobile_Runner_Master_REQ_v1.0.html`.

**Identity & operating principle**
- MWR is a **React Native + TypeScript** mobile **runtime**, not an authoring system. Upstream source of truth = **`mWellness-Data-Simulator` Web App + Go backend**. (§1, §2)
- Canonical operating principle: **Backend runnable scenario contract first → mobile execution plan second → platform writer third.**
- Primary flow: **login → fetch runnable test cases → select case+version → load ordered scenarios + metric metadata → check capability + permissions → build plan → dry-run → confirm → execute → report.** (§3)

**Authority boundaries** (§2)
- **Mobile owns:** mobile auth/session; backend API client; runnable test case/scenario loading; scenario interpretation; execution plan generation; dry-run; platform capability checks; permission flow; Apple Health / Health Connect writer adapters; run progress/result reporting; mobile diagnostics.
- **Mobile does NOT own:** catalog source of truth; test case authoring; scenario validation authority; scenario seed library/applicability; versioning/ordering authority; RBAC/tenant/billing/admin; Google Fit or vendor SDKs unless approved.

**Domain model & state machine** (§6) — `UserSession, RunnableTestCase, RunnableTestCaseVersion, RunnableScenario, MetricDefinition, PlatformCapability, PermissionState, ExecutionPlan, RunSession, RunResult`; run lifecycle `SELECT_TEST_CASE → LOAD_VERSION → LOAD_SCENARIOS → LOAD_METRIC_METADATA → CHECK_CAPABILITY → CHECK_PERMISSIONS → BUILD_PLAN → DRY_RUN → CONFIRM_REAL_WRITE → EXECUTE → COLLECT_RESULTS → REPORT_RESULT → COMPLETE`.

**Data contracts** (§10) — Runnable Test Case Summary, Runnable Scenario, **Execution Plan** (`operations[]` with `status: writable|unsupported|permission_missing|invalid|skipped`, `blocked_operations[]` with `reason_code`), **Run Result** (`summary{total,succeeded,failed,skipped}`, `errors[].reason_code`). These become the MWR scenario-execution model doc.

**Backend API surface** (§9) — auth login/refresh/logout/me; `GET /mobile/test-cases`; version detail; ordered scenarios; scenario content; catalog metric metadata; `POST /mobile/runs` (run reporting, MR6). **If a required API is missing, document the gap and STOP for human approval — never fabricate local data.**

**Platform requirements** (§8) — HealthKit: availability check → explain-then-permission → map metrics to quantity/category/workout types → never report success unless native write succeeds → surface denied/partial. Health Connect: availability/installation check → explain-then-permission → map to record types → never report success unless native insert succeeds → handle OS/version differences. **Metric write support is verified per phase; the framework must not assume every catalog metric is writable.**

**Safety (canonical guardrails)** (§11, §15) — see [[mwr-safety-guardrails]] and §7 below. Dry-run before real-write; explicit confirmation; capability + permission checks; **no fake native write success**; unsupported metrics blocked/skipped with reason; no token/raw-payload log leakage; no backend-authority bypass; no Google Fit / vendor SDK unless approved.

**Roadmap (becomes canonical phase plan)** (§14) — `MR-FRAMEWORK-00, MR0, MR1, MR2, MR3, MR4, MR5, MR6, MR7` (Framework Bootstrap → Contract Alignment → Foundation/Auth/API → Test-Case Browser+Loader → Interpreter+Plan → Apple Health POC → Health Connect POC → Run Orchestration+Reporting → Safety QA/RC).

**Master acceptance criteria** (§17) — dedicated repo + framework with mobile-native guardrails; Master REQ converted into canonical repo docs; source-of-truth states MWDS backend is upstream authority; known-risks include native-write safety/permission/mapping/token-storage/no-fake-success; **MR0 locks contracts before implementation**; **MR3 dry-run plan exists before MR4/MR5 real writers**; no writer phase is "done" if it fakes success; no real-write flow is done without dry-run+capability+permission+confirmation; no RC is production-ready without a separate security/privacy review.

---

## 5. Proposed target framework file layout

Reconciles the existing archive structure with PROMPT_01's required files and Master REQ §15. (Authored by PROMPT_01; shown here for approval.)

```
mWellness-Mobile-Runner/
├── CLAUDE.md                                  # rewrite (B) — MWR operating contract
├── .claude/
│   ├── HANDOFF.md
│   ├── settings.json                          # 5 hooks rewired
│   ├── commands/                              # A-set + rewritten B-set + run-phase-loop.md (new)
│   ├── skills/                                # A-set + rewritten B-set
│   ├── agents/                                # 8 renamed mwr-* + 2 rewritten + README
│   ├── hooks/                                 # notification-only, framework-validator, stop-guard-and-notify (A);
│   │                                          #   route-hint, direct-patch-output-guard, protected-edit-guard (B)
│   └── state/
├── .claude-framework/
│   ├── README.md
│   ├── adapter/
│   │   ├── project-source-of-truth.md         # MWDS backend = upstream authority
│   │   ├── current-decisions.md               # fresh MWR ADRs
│   │   ├── known-risks.md                     # seeded from REQ §16
│   │   ├── human-approval-gates.md            # NEW (REQ §15)
│   │   ├── repository-map.md  settings-map.md  test-map.md
│   │   ├── wiring-paths.md  regression-fixtures.md
│   │   ├── pending-promotions.md  prompt-overrides.md
│   │   ├── known-legacy.md                     # terminology anchor (A)
│   │   └── milestone-log.md                    # fresh MWR log
│   ├── execution/                             # MWR_EXECUTION_CONTROLLER / _STATE / _RUNBOOK /
│   │                                          #   _HUMAN_APPROVAL_GATES / _LOOP_CLOSEOUT_TEMPLATE /
│   │                                          #   _STOP_CONDITIONS / _PHASE_QUEUE (MR0–MR7)
│   ├── framework/
│   │   ├── rules/         # A-set + rewritten writer-adapter / test-data / lane / execution-plan rules
│   │   ├── checklists/    # crown-jewel A-set + rewritten writer-adapter/backend-api/wiring/replay
│   │   ├── templates/     # 12 A templates (+ rewritten mobile-qa-report)
│   │   └── context/       # mental-model, anatomy, fanout, framework-guide (A renamed) +
│   │                      #   context-pack-registry, skill-registry (B rewritten)
│   ├── artifacts/         # EMPTY buckets: requirements, stories, tasks, reviews,
│   │   │                  #   decision-briefs, handoffs, plans, ux (+ .gitkeep)
│   │   └── requirements/MOBILE_RUNNER_MASTER_REQ.md   # canonical mirror of new REQ (if mirrored)
│   └── scripts/           # validate-framework.sh (B) + validate_context_pack_paths.py (A)
├── docs/
│   ├── requirements/MOBILE_RUNNER_MASTER_REQ.html     # canonical copy of new REQ
│   ├── requirements/MOBILE_RUNNER_MASTER_REQ.md       # converted (if practical)
│   ├── architecture/MOBILE_RUNNER_ARCHITECTURE.md
│   ├── contracts/MOBILE_BACKEND_API_CONTRACT.md
│   ├── contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md
│   ├── safety/MOBILE_HEALTH_WRITE_SAFETY.md
│   ├── roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md         # MR-FRAMEWORK-00 … MR7
│   └── platform/   # rewritten capability-matrix, native-build-codegen, real-write verification,
│                   #   health-store-readiness, app-visibility-troubleshooting, manual-QA, validation-guide
└── artifacts/bootstrap/MWR_FRAMEWORK_EXTRACTION_AUDIT.md   # THIS FILE
```

---

## 6. Proposed rename map (`DM1`/`mwdm1` → `MWR`/`mwr`/`mWellness-Mobile-Runner`)

| Old token | New token | Notes |
|---|---|---|
| `mWellness-DM1-Data-Simulator` | `mWellness-Mobile-Runner` | Product/repo name |
| `DM1` (product short code) | `MWR` | Titles, doc headers, rule references |
| `mwdm1` (slug prefix) | `mwr` | Agents, command presets, packs |
| `mwdm1-<x>-reviewer` | `mwr-<x>-reviewer` | All reviewer agents (rename the 8 kept) |
| `mwdm1-canonical-data-reviewer` | *(dropped)* | No canonical model |
| `mwdm1-seed-engine-reviewer` | *(dropped)* → `mwr-execution-plan-reviewer` (fresh) | No seed engine |
| `mwdm1-synthetic-data-safety-reviewer` | `mwr-test-data-and-health-write-safety-reviewer` | Rewrite scope |
| `mwdm1-api-destination-reviewer` | `mwr-backend-api-reviewer` | Loading + run-reporting |
| `mwdm1-context` / `-full-task` / `-destination-task` / `-safety-critical` / `-review-closeout` | `mwr-context` / `mwr-full-task` / `mwr-health-write-task` / `mwr-safety-critical` / `mwr-review-closeout` | Re-point gates/agents |
| `Mwdm1<Capability>` (native module prefix) | `Mwr<Capability>` | TurboModule specs (subject to ADR) |
| `ADR-MW-DM1-NNN` | `ADR-MWR-NNN` | Fresh decision log (old ADRs not carried) |
| `R-MW-DM1-NNN` | `R-MWR-NNN` | Fresh risk register |
| `W-DM1-NNN` | `W-MWR-NNN` | Wiring path IDs |
| `REQ-mwellness-dm1-data-simulator-master` | `MOBILE_RUNNER_MASTER_REQ` | Canonical = new REQ, not old |
| `DM1_EXECUTION_*`, `DM1_LOOP_*`, `DM1_TASK_QUEUE`, etc. | `MWR_EXECUTION_*`, `MWR_LOOP_*`, `MWR_PHASE_QUEUE` | Execution layer |
| `dm1-framework-guide` / `dm1-skill-command-anatomy` / `dm1-review-fanout-pattern` | `mwr-framework-guide` / `mwr-skill-command-anatomy` / `mwr-review-fanout-pattern` | Context docs |
| `DM1 Claude Loop` (notification title) | `MWR Mobile Loop` | `stop-guard-and-notify.sh` |
| **Concept renames** | | |
| canonical (synthetic metric model) | scenario / metric metadata (backend-owned) | Not authored on mobile |
| generation / generator / seeding | execution / execution plan / run | Mobile runs, doesn't generate |
| seed engine / runtime player | execution-plan runner | |
| destination (vendor/internal/file) | platform writer (Apple Health / Health Connect) + backend run-reporting client | |
| source library / active source | *(out of scope)* | |
| dry-run, idempotency, redaction, fail-closed, "Health Connect ≠ Google HealthKit" | **unchanged** | Carried-forward safety vocabulary |

---

## 7. Required human approval gates (for the MWR framework)

Halt the loop and emit a Human Approval Request (do not proceed) on any of:

1. **Any real Apple Health / HealthKit write behavior** (permission/write/delete/query against the real store).
2. **Any real Health Connect write behavior** (real insert/update/delete/read against the real store).
3. **Permission-prompt timing or copy** (when/how the native OS permission prompt is triggered or worded).
4. **Bypassing dry-run, confirmation, or capability/permission checks** on any write path.
5. **Token / session storage strategy** (secure-storage choice, refresh model, anything beyond secret-by-reference).
6. **New platform / destination / vendor integration** (e.g., Google Fit, any vendor SDK).
7. **Backend API contract gaps** that would otherwise require fabricating local test cases/scenarios.
8. **Production / release-readiness claim** (no RC is "production-ready" without a separate security/privacy review).
9. **Any new ADR or change to an active ADR**, schema/contract-breaking change, or native-substrate work while the substrate is unvalidated.
10. **Any UX flow not covered by an approved UX contract.**

(Derived from Master REQ §15 + PROMPT_01 §5, with the DM1 execution-gate detection/halt/request/wait **mechanic** reused from `DM1_HUMAN_APPROVAL_GATES.md`.)

---

## 8. Bootstrap risks and open questions

**Bootstrap risks**

| ID | Risk | Sev | Mitigation |
|---|---|:--:|---|
| B-001 | DM1 product truth (generation, canonical model, seed engine, 4 destinations, M1–M6 history) leaks into MWR adapters/CLAUDE.md. | P0 | Overwrite all adapter content; add validator leakage guards (`canonical`, `seed engine`, `generator`, `vendor_api`, `internal sandbox`). |
| B-002 | Old DM1 REQ / SRS treated as canonical. | P0 | Only `MOBILE_RUNNER_MASTER_REQ` is canonical; old REQ stays in `Archive.zip`, never copied into `docs/requirements/` or adapters. |
| B-003 | "No dry-run in MWR" misread (one sub-audit asserted this). | P0 | **Corrected:** dry-run is canonical (REQ MR-PLAN-004 / MR-SAFE-001; MR3 precedes MR4/MR5). Carry `dry-run-no-write-checklist` forward. |
| B-004 | Validator/hook ships with DM1 file manifest, so it passes on the wrong structure or false-fails. | P1 | Reset the validator manifest + `HIGH_RISK_PATTERNS` to the MWR layout in §5 before enabling hooks. |
| B-005 | Capability-matrix metrics copied from DM1 (6 MVP) assumed writable. | P1 | Mark all per-platform metric writability `TO_VERIFY`; confirm in MR0/MR3/MR4/MR5. |
| B-006 | Crown-jewel safety checklists lost in translation during rewrite. | P1 | Preserve verbatim where generic (Appendix A); only re-scope wording. |
| B-007 | Repo directory is named `mWellness-Data-Simulator-Runner`; product is `mWellness-Mobile-Runner`. | P2 | Cosmetic; confirm intended repo/remote name (Open Q8). Use product name `mWellness-Mobile-Runner` in all docs regardless. |

**Open questions (need human answers; several mirror Master REQ §16)**

1. Exact backend endpoints MWR will call (reuse existing MWDS routes vs new `/mobile/*`)?
2. Approved token refresh/storage strategy (Keychain/Keystore; refresh model)?
3. Which metrics are truly writable on iOS HealthKit for the POC?
4. Which metrics are truly writable on Android Health Connect for the POC?
5. Add run-reporting (`POST /mobile/runs`) to backend before MR6?
6. Real-write gating: DEV build flag, environment flag, or both?
7. Run scope: one scenario, the whole ordered list, or both?
8. Repo/remote naming: keep on-disk `mWellness-Data-Simulator-Runner` or rename to `mWellness-Mobile-Runner`?
9. Native module prefix: confirm `Mwr<Capability>` (vs other) before any codegen ADR.
10. RN baseline for MWR (reuse DM1's RN 0.81 New-Arch/Hermes pin, or re-pin)?
11. Should the new REQ be mirrored as a `.md` artifact in `.claude-framework/artifacts/requirements/`, or only kept under `docs/requirements/`?

---

## 9. Statement — no product code changed, no old REQ became canonical

- **No product code was modified.** The target repo (`/Users/vuvo/mWellness-Data-Simulator-Runner`) is a fresh git repository with **no commits**; before this pass it contained only `.git/`. This pass created exactly: `artifacts/bootstrap/MWR_FRAMEWORK_EXTRACTION_AUDIT.md` (this file) and two Claude memory notes outside the repo. **No** React Native app, native module, HealthKit/Health Connect code, or any source file was created or changed.
- **No old DM1 requirement became canonical.** `REQ-mwellness-dm1-data-simulator-master.md` and the DM1 SRS PDF are classified **C (legacy)**; they remain inside `Archive.zip` and were **not** copied into the repo. The **only** canonical requirement source for this repo is `mWellness_Mobile_Runner_Master_REQ_v1.0.html` (MWR-MASTER-REQ-v1.0).
- **No old DM1 product roadmap/backlog was preserved.** DM1 stories, reviews, UX, ADRs, plans, and milestone history are legacy reference only.

---

## Validation results

| Check | Result |
|---|---|
| Old DM1 REQ is **not** treated as source of truth | ✅ PASS — classified C; not copied; §9 affirms canonical = new REQ only |
| New Master REQ HTML was read and is canonical | ✅ PASS — read in full (333 lines); §4 derives canonical assumptions directly from it |
| No product code modified | ✅ PASS — repo had only `.git/`; only the audit doc (+ external memory notes) created |
| No RN app scaffolded | ✅ PASS — none created |
| No MR0/MR1 user stories created | ✅ PASS — none created (deferred to later passes) |
| No HealthKit/Health Connect write code implemented | ✅ PASS — none created |
| Archive fully inventoried & classified | ✅ PASS — 266 files across 14 clusters bucketed A/B/C |

---

## Closeout

**Classification summary (this pass): Framework extraction audit — docs/planning only. Result: COMPLETE.**

**Files created/updated**
- `artifacts/bootstrap/MWR_FRAMEWORK_EXTRACTION_AUDIT.md` (this document) — created.
- `~/.claude/projects/.../memory/mwr-project-identity.md`, `mwr-safety-guardrails.md`, `MEMORY.md` — Claude memory notes (outside the repo; not product code).

**What was reused (A) / rewritten (B) / dropped (C)** — see §1 tally and §2 detail. Headlines:
- **Reuse (A):** the full task lifecycle (compose/execute/review/close, refresh-context, req→stories→tasks), the autonomous **loop mechanics** (controller/runbook/closeout-template/stop-conditions/human-approval-gate detection), all 12 templates, the four-layer mental model + fanout pattern, 3 hooks + the context-pack path validator, and the **crown-jewel safety checklists** (apple-health-write, health-connect-write, dry-run-no-write, secret-endpoint-safety, synthetic/test-data safety, rn-testing/perf/ui, mobile-exploratory-qa) and 8 mobile-native reviewer agents.
- **Rewrite (B):** CLAUDE.md, all adapter content, the structural validator manifest + `protected-edit-guard` patterns, route-hint/output-guard, the destination→**platform-writer** + **backend-API** rules/checklists, lane denylist, seed-engine→**execution-plan runner**, context-pack/skill registries, the phase queue/state, and the mobile-native docs (capability matrix, safety boundaries, real-write verification, QA).
- **Drop (C):** the entire `artifacts/` DM1 history (~113 files incl. old REQ/SRS), canonical-metric-model & generator-determinism/seed-engine originals, dataset-export, demo runbook, and the canonical-data/seed-engine reviewers.

**Summary.** The old archive is a mature, mobile-aware Claude operating module whose **mechanics and health-write safety IP are highly reusable**, but whose **product truth (a synthetic-data generator/seeder) is the opposite of the new product (a backend-driven mobile runner)**. The new operating principle — *backend runnable scenario contract first → mobile execution plan second → platform writer third* — and the §2 authority boundaries replace DM1's "canonical → convert → seed." This audit gives PROMPT_01 a concrete A/B/C disposition for every file, a rename map, a target layout, the human-approval gates, and the canonical assumptions to encode.

**Validation results.** All seven checks PASS (table above).

**Followups**
- **P0** — When PROMPT_01 authors the framework: overwrite **all** adapter content and CLAUDE.md so no DM1 product truth (canonical/seed-engine/generation/4-destinations/M1–M6) leaks (risk B-001); ensure the **old REQ/SRS are never copied** into the repo (B-002); keep **dry-run-no-write canonical** (B-003).
- **P1** — Reset the validator file-manifest and `protected-edit-guard` `HIGH_RISK_PATTERNS` to the §5 layout before enabling hooks (B-004); mark every per-platform metric writability `TO_VERIFY` (B-005); preserve crown-jewel checklist wording where generic (B-006); seed `known-risks.md` from Master REQ §16 + the no-fake-success rule.
- **P2** — Resolve repo/product naming (B-007 / Open Q8); decide native-module prefix and RN baseline before any codegen ADR (Open Q9/Q10); decide whether to mirror the REQ as a `.md` artifact (Open Q11). Carry the remaining Master REQ §16 open questions (endpoints, token storage, writable metrics, run-reporting, real-write gating, run scope) into MR0 contract alignment.

---

## Appendix A — Crown-jewel safety content to carry forward (verbatim-where-generic)

These are the highest-value reusable safety rules extracted from the archive. They align with Master REQ §11/§15 and should survive the rewrite with only scope wording changed.

**Dry-run / no-write** (`dry-run-no-write-checklist`, `seed-engine-rules` SE-4): dry-run performs **zero** real writes/network mutations and computes/labels only what *would* be written; dry-run is the **default** for any new/unknown write path; a real write requires **explicit, human-confirmed, config-driven** enablement; the dry-run→real switch is **auditable**; **no code path bypasses** the dry-run flag; a dry-run that writes is **P0**.

**Apple Health / HealthKit write** (`apple-health-write-checklist`): map to correct `HKQuantityType`/`HKCategoryType` + `HKUnit`; request & respect share authorization; a **denied type fails closed**; idempotent (no duplicate samples on re-run); HealthKit is **iOS-only**, never confused with Health Connect; device write tests env-gated, synthetic data only; entitlements + `Info.plist` usage strings added **only with** the writer; **never report success unless the native write actually succeeds**.

**Health Connect write** (`health-connect-write-checklist`): target is **Android Health Connect**, never "Google HealthKit"/Google Fit (**terminology = P0**); map to correct Record types + units; request & respect write permissions; **denied fails closed**; idempotent via `clientRecordId`(+version); manifest write permissions added **only with** the writer; **never report success unless the native insert actually succeeds**.

**Secret / endpoint safety** (`secret-endpoint-safety-*`, `security-rules`): no raw secret committed or in plain app storage — config carries `secretRefName` only, resolved at runtime (Keychain/Keystore); **no production endpoint by default**; endpoint + header allowlists; **redaction mandatory on every log path** (no tokens, auth headers, or raw payloads); synthetic identities only.

**Test/scenario-data safety** (`synthetic-data-safety-checklist`, `synthetic-data-rules` re-scoped): all scenario test data is fabricated — **no real PHI/PII**, no real tokens, clearly-synthetic identifiers, plausible-bounded values, nothing traceable to a real person; a `no-real-phi` scan travels with fixtures; **mobile never authors/validates scenarios or computes a score, and never fakes write success.**

**Unsupported-metric honesty** (`destination-adapter-rules` DA-2): an unsupported metric is **skipped with a recorded reason and surfaced in the UI**, never silently dropped (silent drop = P0). Maps to REQ `status: unsupported` + `reason_code`.

**Determinism (as replay)** (`scenario-determinism-checklist` re-scoped): replaying a stored execution plan is deterministic — no ambient `Date.now()`/`Math.random()` in the run path; relative time resolves from injected `simulated_now`; the seed/plan version is recorded; a golden-replay diff = stop.

**Loop closeout shape** (`DM1_LOOP_CLOSEOUT_TEMPLATE`): `Result {APPROVED | APPROVED_WITH_FOLLOWUPS | NEEDS_HUMAN_APPROVAL | BLOCKED}` · Tasks · Files · **Scope-Guard** (yes/no on each forbidden action) · **Validation** (every command + exact status; never hide `NOT_RUN_<reason>` behind PASS) · Followups (P1/P2, path-affecting flagged) · Human-Approval-Needed · Next. Per-story commit + per-story validation; **stop for human classification** at any hard gate.

## Appendix B — Mobile-native knowledge worth preserving (into rewritten `docs/platform/`)

- **Capability mapping:** canonical metric → iOS `HKQuantityType`/`HKCategoryType`(+`HKUnit`) and Android Health Connect Record types(+units); per-metric permission names; idempotency mechanism per platform (iOS sample identity; Android `clientRecordId`+version). **All writability marked `TO_VERIFY` for MWR.**
- **TurboModule / codegen boundary:** RN New-Architecture + Hermes baseline; TurboModule spec contracts as the JS↔native seam; **concept-token rule** — TS names unqualified tokens (`steps`, `count/min`), qualified SDK identifiers resolve only in native `.swift/.mm`/`.kt`; `tsconfig` build boundary keeps SDK symbols out of the TS domain.
- **iOS entitlements/provisioning:** `com.apple.developer.HealthKit`; `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription`; HealthKit capability + framework link; authorization request; device provisioning notes; **app-visibility-under-Health troubleshooting**.
- **Android manifest/permissions:** `android.permission.health.WRITE_*` declarations; runtime permission flow; Health Connect availability/installation check; record-type/unit specifics.
- **Safety boundaries (re-framed for a real-write runner):** dry-run default; fail-closed on permission denial; no-fake-success; no real PHI in scenarios; secret-by-reference; Health Connect terminology; no direct injection into the production mWellness app.
- **Validation & manual QA:** automated categories (no-real-PHI, determinism/replay, dry-run-no-write, idempotency, no-silent-drop, no-secret, no-fake-success) + real-device manual QA rhythm (capability → permission → dry-run preview → confirmed write → result verification).

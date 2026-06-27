# mWellness-Mobile-Runner (MWR) Claude Framework — Mental Model

Single-page operator reference for the four-layer model. Read once; never
re-derive.

## The four layers

```text
Command  = workflow entrypoint (slash command, e.g. /execute-task). Owns orchestration.
Skill    = playbook / methodology / template / checklist set. NOT an executor, NOT an agent router.
Agent    = specialist worker with tight tools + role context. Leaf worker; never spawns agents.
Tool     = the actual action capability (Read, Edit, Bash, Grep, …).
```

### Responsibilities

- **Command** — the front door. An operator types `/compose-task`; the
  command points at a canonical skill and owns orchestration (which `mwr-*`
  agents run, when). The `## Agent crew` heading lives here only.
- **Skill** — what Claude reads to know *how* to handle a workflow:
  required reads, gates to run, output contract, closeout shape. It does
  not call agents on its own.
- **Agent** — a specialist invoked by the command layer, with a tight
  role, restricted tools, and its own context window. Agents are leaves.
- **Tool** — performs the real read/edit/run.

### Orchestration

```text
User → Command (/execute-task TASK-BRIEF-foo)
     → Main Claude reads the matching Skill
     → optionally spawns mwr-* Subagents (each uses its own Tools)
     → Tools perform the actual reads / edits / runs
```

## What a skill is NOT

- Not an executor — it is a playbook.
- Not an agent router — routing lives in the command layer (`## Agent crew`
  never appears in a skill).
- Not current truth — current truth is `adapter/`.

## How this maps to MWR work

The MWR runtime is a pipeline; each stage has a governance attach point.

```text
backend load        → interpret + plan       → dry-run → capability/permission → platform write → report
(BACKEND_API_GATE,    (SCENARIO_CONTRACT_GATE,  (DRY_RUN_  (CAPABILITY_           (APPLE_HEALTH_    (RUN_
 SCENARIO_LOADING)     EXECUTION_PLAN_GATE,      NO_WRITE_  PERMISSION_GATE)        WRITE_GATE |     REPORTING_
                       EXECUTION_DETERMINISM)    GATE)                              HEALTH_CONNECT_  GATE,
                                                                                    WRITE_GATE,      NO_FAKE_
                                                                                    PLATFORM_WRITER) SUCCESS_GATE)
```

- **Backend-contract-first:** the MWDS backend authors and validates the
  scenario contract; mobile **loads** it (never authors/validates/mutates/
  reorders it), **interprets** it into an execution plan, **previews** via
  dry-run, then **executes** through a platform writer. MWR does
  deterministic **replay** of a plan — never data **generation**.
- **Source-of-truth driven:** every task is grounded in `adapter/`
  (decisions, risks, wiring, gates), never in assumptions. A backend API
  gap is documented and STOPs for human approval — never fabricated.
- **Curated truth vs evidence:** `adapter/` is current truth; `artifacts/`
  are working records, promoted only via the Context Promotion Gate (owned
  by `close-task`).
- **Minimal-by-default:** load only the context pack(s) the task needs
  (see [`context-pack-registry.md`](context-pack-registry.md)).
- **Human-led gates:** Claude proposes; the Human Decision Owner decides.
  Any hard human-approval gate (real Apple Health / Health Connect write,
  permission-prompt timing/copy, bypassing dry-run/confirmation, token
  storage, new vendor/Google Fit, backend API gap, release-readiness,
  new/changed ADR, UX flow) **halts the loop**.
- **Safety-first:** any task touching the backend client/auth, scenario
  interpretation, the execution plan, dry-run, a platform writer, a
  real-write path, capability/permission, or secrets/endpoints is
  high-risk / full-lane — never a tiny patch. **No fake native write
  success; dry-run never writes.**

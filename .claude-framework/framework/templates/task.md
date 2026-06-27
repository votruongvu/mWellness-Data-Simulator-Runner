---
id: TASK-<slug>
type: task
status: draft
parent_story: STORY-<slug>
route: <AUTH_SESSION | BACKEND_API_CLIENT | SCENARIO_LOADING | SCENARIO_INTERPRETATION | EXECUTION_PLAN | DRY_RUN | CAPABILITY_PERMISSION | APPLE_HEALTH_WRITE | HEALTH_CONNECT_WRITE | RUN_REPORTING | SECRET_ENDPOINT_SAFETY | DIAGNOSTICS | QA_TESTING | INTERNAL_RELEASE | MOBILE_UI | DOCS_ONLY | BUGFIX | REFACTOR | …>
risk_level: low
tags: [mwellness-mobile-runner, mwr]
---

# TASK-<slug> — <title>

## Objective (single, clear)
<one objective>

## Parent story
STORY-<slug>

## Route + lane
- Route: <from context-pack-registry.md>
- Recommended lane: tiny | light | full (confirmed at the Lane Gate)
> Any task touching the backend client/auth, scenario interpretation, the
> execution plan, dry-run, a platform writer, a real-write path,
> capability/permission, or secrets/endpoints is FULL lane — never tiny
> (see `lane-classification.md`).

## Surface
- Pipeline stage: backend load / interpretation / execution plan / dry-run / capability+permission / platform writer / run reporting
- Files/areas: <real paths or TO_VERIFY>
- Wiring path(s): <W-MWR-00x>

## Expected tests
- <test categories from test-map.md>

## Gates this task triggers
- <gate names from gates.md>

## Dependencies / blockers
- <Open ADRs that block, if any — ADR-MWR-00x; backend API gaps that would force fabrication → STOP for human approval>

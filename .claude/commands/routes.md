---
description: Route-selection guide — pick the lane + command + context packs for an MWR task.
---

**Command-only** (no skill): an advisory decision guide. It reads the
routing table and recommends a lane/command/packs; it does not execute.

User input: $ARGUMENTS

## Agent crew
None — advisory only. Recommends the agent crew the chosen command will run.

## How to choose
1. Identify the MWR surface, then look up the route in
   [`context-pack-registry.md`](.claude-framework/framework/context/context-pack-registry.md)
   "Task routing".

| MWR surface | Typical route / pack | Default gates (cite [`gates.md`](.claude-framework/framework/rules/gates.md)) | Lane |
|---|---|---|---|
| Mobile auth / session / backend client / scenario loading | BACKEND_API_CLIENT | `BACKEND_API_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE` | full |
| Scenario interpretation → runner models | INTERPRET_PLAN | `SCENARIO_CONTRACT_GATE` + `EXECUTION_PLAN_GATE` | full |
| Execution plan / operation classification / determinism | INTERPRET_PLAN | `EXECUTION_PLAN_GATE` + `EXECUTION_DETERMINISM_GATE` | full |
| Dry-run semantics | DRY_RUN | `DRY_RUN_NO_WRITE_GATE` (crown jewel) | full |
| Capability / permission flow | CAPABILITY_PERMISSION | `CAPABILITY_PERMISSION_GATE` (+ HARD human-approval on prompt timing/copy) | full |
| Apple Health writer | APPLE_HEALTH_WRITE | `APPLE_HEALTH_WRITE_GATE` + `DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` + `CAPABILITY_PERMISSION_GATE` | full |
| Health Connect writer | HEALTH_CONNECT_WRITE | `HEALTH_CONNECT_WRITE_GATE` + `DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` + `CAPABILITY_PERMISSION_GATE` | full |
| Run progress / result reporting | RUN_REPORTING | `RUN_REPORTING_GATE` + `NO_FAKE_SUCCESS_GATE` | light/full |
| RN screen / UI quality / tests / perf | RN_TESTING / RN_PERFORMANCE | `RN_TESTING_GATE` / `RN_PERFORMANCE_GATE` / `RN_UI_QUALITY_GATE` | light |

2. Take the route's **lane default**, required **packs**, **gates**,
   **reviewers**, **tests**, and **split trigger**.
3. Map to a command:
   - Tiny + safe → `/direct-patch`.
   - Light/Full → `/compose-task` → `/execute-task` → `/review-task` → `/close-task`.
   - Lane presets → `/mwr-full-task`, `/mwr-health-write-task`, `/mwr-safety-critical`.
4. **Universal override:** any backend-client/auth, scenario-interpretation/
   contract, execution-plan, dry-run, capability/permission, platform-writer,
   real-write, or secret/endpoint surface is full-lane regardless of the
   route default — see the denylist in
   [`lane-classification.md`](.claude-framework/framework/rules/lane-classification.md)
   and [`prompt-overrides.md`](.claude-framework/adapter/prompt-overrides.md).

## Output
A one-block recommendation: route · lane · command · packs · gates ·
reviewers. Claude proposes; the human confirms at the Lane Gate.

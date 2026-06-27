---
description: Load the minimal MWR context for a surface (pack + adapter slices + gates) — advisory.
---

**Lane preset / context loader** (command-only). Resolves the matching
context pack + its adapter slices + gates for a surface, at the right L0–L4
budget. Advisory; does not execute.

User input: $ARGUMENTS

## Agent crew
None — advisory only. Recommends the next command and its crew.

## How it works
1. Map the surface to a pack in
   [`context-pack-registry.md`](.claude-framework/framework/context/context-pack-registry.md)
   (CORE_MWR / AUTH_SESSION / BACKEND_API_CLIENT / SCENARIO_LOADING /
   INTERPRET_PLAN / DRY_RUN / CAPABILITY_PERMISSION / APPLE_HEALTH_WRITE /
   HEALTH_CONNECT_WRITE / RUN_REPORTING / DIAGNOSTICS / …).
2. Load only the pack's named files + adapter slices + matching gates from
   [`gates.md`](.claude-framework/framework/rules/gates.md).
3. Recommend the next command (lifecycle step or a lane preset).

## Output
A loaded-context summary + recommended lane/command. No gate is waived.

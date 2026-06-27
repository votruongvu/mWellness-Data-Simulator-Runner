---
description: Preset for Apple Health / Health Connect writer work — full lane, writer + safety gates.
---

**Lane preset** (command-only shim) for a platform writer adapter — the
Apple Health (iOS) or Health Connect (Android) writer that consumes
approved execution-plan operations.

User input: $ARGUMENTS

## Agent crew
Full lifecycle; review fans out to the matching writer reviewer
([`mwr-apple-health-write-reviewer`](.claude/agents/mwr-apple-health-write-reviewer.md)
for iOS / [`mwr-health-connect-write-reviewer`](.claude/agents/mwr-health-connect-write-reviewer.md)
for Android) +
[`mwr-test-data-and-health-write-safety-reviewer`](.claude/agents/mwr-test-data-and-health-write-safety-reviewer.md)
(mandatory) + `mwr-test-reviewer`.

## Packs + gates
Loads APPLE_HEALTH_WRITE or HEALTH_CONNECT_WRITE; applies
`APPLE_HEALTH_WRITE_GATE` / `HEALTH_CONNECT_WRITE_GATE` +
`PLATFORM_WRITER_GATE` + `DRY_RUN_NO_WRITE_GATE` +
`CAPABILITY_PERMISSION_GATE` + `NO_FAKE_SUCCESS_GATE` +
`SECRET_AND_ENDPOINT_SAFETY_GATE` ([`gates.md`](.claude-framework/framework/rules/gates.md)).

## Invariants
Execution-plan operation → typed mapping → platform writer (one-way); an
unsupported metric is surfaced + skipped with a `reason_code`, never
silently dropped; idempotent (no duplicate samples/records on re-run);
dry-run writes nothing; success is reported only if the native write/insert
actually succeeded; **Health Connect, never "Google HealthKit" or Google
Fit**; HealthKit is iOS-only. Full lane — never `/direct-patch`.

## Hard human-approval gate
Any **real** Apple Health or Health Connect write behavior, and any
permission-prompt timing/copy, STOPs and emits a Human Approval Request
([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)).
The gate is never self-waived.

---
description: List the MWR gates that apply to a described change (advisory) — naming-parity shim.
---

**Command-only** (no skill): advisory. Given a described change, names the
gates that apply and where each is enforced. Does not execute or waive
anything.

User input: $ARGUMENTS

## Agent crew
None — advisory only.

## How it works
1. Identify the touched MWR surface(s).
2. List the matching gates from
   [`gates.md`](.claude-framework/framework/rules/gates.md) (the single
   source) + the mandatory behavioral rules from
   [`prompt-overrides.md`](.claude-framework/adapter/prompt-overrides.md).
3. Note the universal high-risk rule: any backend-client/auth, scenario-
   interpretation, execution-plan, dry-run, platform-writer, real-write,
   capability/permission, or secret/endpoint surface triggers at minimum
   `DRY_RUN_NO_WRITE_GATE` + `NO_FAKE_SUCCESS_GATE` +
   `CAPABILITY_PERMISSION_GATE` + `SECRET_AND_ENDPOINT_SAFETY_GATE` +
   `TEST_DATA_SAFETY_GATE`.
4. Flag any HARD human-approval gate that applies
   ([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)) —
   e.g. a real Apple Health / Health Connect write, permission-prompt timing/
   copy, dry-run/confirmation bypass, token storage, a backend API gap.

## Output
A gate checklist for the change. Gates **compose**; the stricter of
`DRY_RUN_NO_WRITE_GATE` / `NO_FAKE_SUCCESS_GATE` /
`SECRET_AND_ENDPOINT_SAFETY_GATE` / `TEST_DATA_SAFETY_GATE` wins on
conflict; none is waived.

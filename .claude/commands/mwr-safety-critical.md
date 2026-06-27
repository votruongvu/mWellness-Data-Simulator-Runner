---
description: Preset for safety-sensitive MWR work — secrets/endpoints/dry-run/permission/fixtures (full lane).
---

**Lane preset** (command-only shim) for the highest-risk MWR surfaces:
secrets/tokens/endpoints, dry-run semantics, the capability/permission
flow, run-mode (dry-run vs real) toggles, and test-data/fixtures
(real-PHI risk). The test-data-and-health-write-safety reviewer is
**mandatory**.

User input: $ARGUMENTS

## Agent crew
Full lifecycle; review **always** includes
[`mwr-test-data-and-health-write-safety-reviewer`](.claude/agents/mwr-test-data-and-health-write-safety-reviewer.md)
(adversarial bias) + `mwr-test-reviewer`, plus the backend-api reviewer when
a secret/endpoint/auth surface is touched.

## Packs + gates
Applies `SECRET_AND_ENDPOINT_SAFETY_GATE`, `DRY_RUN_NO_WRITE_GATE`,
`CAPABILITY_PERMISSION_GATE`, `NO_FAKE_SUCCESS_GATE`, `TEST_DATA_SAFETY_GATE`
([`gates.md`](.claude-framework/framework/rules/gates.md)).

## Invariants
No raw secret/token committed or logged (reference name only, resolved from
Keychain/Keystore at runtime); no production endpoint default; redaction on
every log path; no real PHI/PII in scenarios/fixtures; dry-run writes
nothing; denied/partial permission fails closed; success never faked. Any
violation is P0. Full lane — never `/direct-patch`.

## Hard human-approval gate
Token/session storage strategy, permission-prompt timing/copy, and any
bypass of dry-run/confirmation/capability/permission checks STOP for human
approval ([`human-approval-gates.md`](.claude-framework/adapter/human-approval-gates.md)).

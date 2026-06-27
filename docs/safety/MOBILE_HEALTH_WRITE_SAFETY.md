# mWellness Mobile Runner — Health-Write Safety

> The canonical health-write safety document for `mWellness-Mobile-Runner` (MWR).
> Derived from [Master REQ §11](../requirements/MOBILE_RUNNER_MASTER_REQ.md#11-security-privacy-and-safety)
> and §15. These guardrails are **always in force** and the stricter rule wins on
> conflict. No real-write verification procedures are authored here — those land
> at MR4/MR5 under a gated brief.

## Operating principle

> **Backend runnable scenario contract first -> mobile execution plan second ->
> platform writer third.** A write is never authored on device; a value is never
> fabricated to fill a backend gap; success is never reported unless the native
> platform write actually succeeded.

## Mandatory safety guardrails (always in force)

- **No accidental health data writes.**
- **No real write without dry-run + capability check + permission check + explicit
  confirmation.**
- **No fake native write success** — success must reflect the actual platform
  write/insert result.
- **No silent HealthKit / Health Connect permission prompt** — explain before the
  OS prompt.
- **No unsupported metric silently ignored** — skip with a `reason_code` and
  surface it.
- **No raw token / log leakage** — redaction on every log path; diagnostics
  dev-gated only.
- **No backend authority bypass** — runnable data comes from the authenticated
  API; a missing backend API is documented and STOPs for human approval, never
  fabricated.
- **No mock test cases/scenarios marked as complete product behavior.**
- **No Google Fit. No direct vendor SDK unless human-approved.**

## The per-write gate chain (load-bearing order)

Every real health write passes the full chain, in order. The platform writer is
**reachable only after every gate passes**. The UI must never call a writer
directly.

```text
capability check  ->  permission check  ->  dry-run  ->  explicit confirmation
   ->  native write  ->  no-fake-success reporting
```

| Step | Gate | Rule |
|---|---|---|
| 1. Capability | `CAPABILITY_PERMISSION_GATE` | Check platform availability + write support **before** requesting permission. Unavailable -> fail closed, surfaced. |
| 2. Permission | `CAPABILITY_PERMISSION_GATE` | Permission is **explained before** the native OS prompt. Denied/partial -> fail closed, surfaced. |
| 3. Dry-run | `DRY_RUN_NO_WRITE_GATE` (crown jewel) | Dry-run performs ZERO real writes; output labelled dry-run; dry-run is the default; no code path bypasses the flag. |
| 4. Confirmation | `DRY_RUN_NO_WRITE_GATE` / MR-RUN-001 | Real write requires explicit, human-confirmed, config-driven enablement. No accidental writes. |
| 5. Native write | `APPLE_HEALTH_WRITE_GATE` / `HEALTH_CONNECT_WRITE_GATE` | Map to the correct platform type/unit; write only permitted/supported types; idempotent. |
| 6. Reporting | `NO_FAKE_SUCCESS_GATE` (crown jewel) | A write is reported successful ONLY if the native write/insert actually succeeded. Negative tests prove denied/failed writes are not reported as success. |

## The 10 hard human-approval gates

When any of these applies, Claude **STOPs**, does not execute the task, and emits
a Human Approval Request for the Human Decision Owner. A gate is never self-waived.
The canonical list lives in
[`.claude-framework/adapter/human-approval-gates.md`](../../.claude-framework/adapter/human-approval-gates.md).

1. Any real Apple Health / HealthKit write behavior.
2. Any real Health Connect write behavior.
3. Permission-prompt timing or copy.
4. Bypassing dry-run / confirmation / capability / permission checks.
5. Token / session storage strategy.
6. New platform / destination / vendor integration (e.g. Google Fit, vendor SDK).
7. Backend API contract gap that would require fabricating local test data.
8. Production / release-readiness claim.
9. Any new/changed ADR, schema/contract-breaking change, or native-substrate work
   while unvalidated.
10. Any UX flow not covered by an approved UX contract.

## Redaction

- **No tokens, auth headers, or raw payloads** in any log path.
- Raw scenario payloads are **dev-gated only**.
- Secrets are **by reference**: config carries a `secretRefName`, resolved at
  runtime from Keychain/Keystore; no raw secret committed or in plain storage.
- No production endpoint default; endpoints come from config.
- Scenario/test data is fabricated: **no real PHI/PII**, synthetic identifiers,
  nothing traceable to a real person.

## Terminology guard (load-bearing)

- The Android health store target is **Health Connect** (Android Health Connect /
  Jetpack Health Connect). It is **never** called "Google HealthKit" and **never**
  Google Fit. (Terminology violations are P0.)
- **HealthKit** refers only to Apple's iOS framework.
- MWR does deterministic **replay** of an execution plan — never data
  **generation**.

## Composition

Gates compose; the **stricter** of `DRY_RUN_NO_WRITE_GATE` / `NO_FAKE_SUCCESS_GATE`
/ `SECRET_AND_ENDPOINT_SAFETY_GATE` / `TEST_DATA_SAFETY_GATE` wins on conflict. Any
task touching the backend client/auth, scenario interpretation, the execution
plan, dry-run, a platform writer, a real-write path, capability/permission, or
secrets/endpoints is FULL lane and triggers at minimum `DRY_RUN_NO_WRITE_GATE` +
`NO_FAKE_SUCCESS_GATE` + `CAPABILITY_PERMISSION_GATE` +
`SECRET_AND_ENDPOINT_SAFETY_GATE` + `TEST_DATA_SAFETY_GATE`.

## Cross-linked checklists

| Surface | Checklist |
|---|---|
| Apple Health write | `.claude-framework/framework/checklists/apple-health-write-checklist.md` |
| Health Connect write | `.claude-framework/framework/checklists/health-connect-write-checklist.md` |
| Dry-run / no-write | `.claude-framework/framework/checklists/dry-run-no-write-checklist.md` |
| No-fake-success | `.claude-framework/framework/checklists/no-fake-success-checklist.md` |
| Capability / permission | `.claude-framework/framework/checklists/capability-permission-checklist.md` |
| Secret / endpoint safety | `.claude-framework/framework/checklists/secret-endpoint-safety-checklist.md` |
| Test-data safety | `.claude-framework/framework/checklists/test-data-safety-checklist.md` |

> Some checklist files are authored by the framework-bootstrap pass; if a path is
> not yet present it is a `TO_VERIFY` placeholder, not a missing safety control.

## Cross-references

- Execution model + classification: [`../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md`](../contracts/MOBILE_SCENARIO_EXECUTION_MODEL.md)
- Safety boundaries (real-write-capable runner): [`../platform/MWR_HEALTH_WRITE_SAFETY_BOUNDARIES.md`](../platform/MWR_HEALTH_WRITE_SAFETY_BOUNDARIES.md)
- Capability matrix: [`../platform/MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md`](../platform/MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md)
- Manual QA checklist: [`../platform/MWR_MANUAL_QA_CHECKLIST.md`](../platform/MWR_MANUAL_QA_CHECKLIST.md)

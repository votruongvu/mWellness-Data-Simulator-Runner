---
id: TESTSET-<slug>
type: test-case-set
tags: [mwellness-mobile-runner, mwr]
---

# Test Case Set — <title>

Named, verifiable test cases for an MWR surface. Categories from
[`test-map.md`](../../adapter/test-map.md). The **mandatory safety
categories below travel with every write/run surface** — they may not be
dropped or weakened.

## Surface
- Pipeline stage: backend load / interpretation / execution plan / dry-run / capability+permission / platform writer / run reporting
- Platform target: <Apple Health (iOS) | Health Connect (Android) | both | n/a>

## Mandatory safety categories (must be present for any write/run surface)
| # | Category | Case | Expected | Pins (gate/risk/fixture) |
|---|---|---|---|---|
| 1 | dry-run-no-write | run plan with dryRun=true (the default) | ZERO real writes; "would_write" results only; output labelled dry-run | DRY_RUN_NO_WRITE_GATE / R-MWR-xxx / dry-run-no-write |
| 2 | no-fake-success | native write denied / fails | NOT reported as success; failure surfaced with reason | NO_FAKE_SUCCESS_GATE / R-MWR-xxx / negative-write-verification |
| 3 | no-real-PHI | scan fixtures/scenarios/logs | no real PHI/PII, no real token, synthetic identifiers only | TEST_DATA_SAFETY_GATE / R-MWR-xxx / no-real-phi-scan |
| 4 | unsupported-surfaced | map a metric the platform can't accept | `status: unsupported` + `reason_code`; surfaced, not silently dropped | PLATFORM_WRITER_GATE / R-MWR-xxx / unsupported-metric-surfaced |
| 5 | capability/permission fail-closed | capability missing OR permission denied/partial | run blocks/skips with reason; no write attempted; no fake success | CAPABILITY_PERMISSION_GATE / R-MWR-xxx / permission-fail-closed |
| 6 | replay-determinism | replay the same stored plan twice (injected clock) | byte-identical execution result; no ambient Date.now()/Math.random() | EXECUTION_DETERMINISM_GATE / R-MWR-xxx / golden-replay-diff |
| 7 | secret-redaction | scan source/config/logs | secret-by-reference only, no raw value; tokens/headers/payloads redacted | SECRET_AND_ENDPOINT_SAFETY_GATE / R-MWR-xxx / no-secret-in-repo |

## Additional surface cases
| # | Category | Case | Expected | Pins (gate/risk/fixture) |
|---|---|---|---|---|
| 8 | backend-contract | load runnable scenario/metric metadata; invalid payload | parsed into runner models; invalid payload blocks the run with a reason; backend authority not bypassed | BACKEND_API_GATE / SCENARIO_CONTRACT_GATE |
| 9 | idempotency | re-run same plan to platform | no duplicate samples/records (iOS sample identity / Health Connect clientRecordId+version) | APPLE_HEALTH_WRITE_GATE / HEALTH_CONNECT_WRITE_GATE |
| … | <category> | <case> | <expected> | <pin> |

## Run command
```bash
<test command — TO_VERIFY until the RN runner exists>
```

# mWellness-Mobile-Runner — Regression Fixtures

Planned load-bearing regression fixtures pinned to the rule/ADR/risk they
protect. Seeded at framework bootstrap (MR-FRAMEWORK-00, 2026-06-27).

> **The app + test suite do not exist yet** — this file declares the
> discipline and the planned load-bearing set so they travel with the
> surface when implemented. All fixtures are `TO_VERIFY` / to-be-added in
> MR1+.

## Fixture discipline

- **Synthetic data only — never real PII/PHI.** Fabricated subjects,
  fabricated metrics, fabricated tokens, clearly-synthetic identifiers,
  nothing traceable to a real person.
- **Replay fixtures are golden.** A stored scenario/execution-plan replay is
  pinned; replaying it is deterministic (relative time resolved via an
  injected clock; no ambient `Date.now()`/`Math.random()`). Regenerating a
  golden is an explicit, reviewed act — **a golden-replay diff under a
  refactor means behavior changed: stop.** (This is deterministic REPLAY,
  not data generation.)
- **Device/native fixtures are env-gated** (run only where the integration
  env is configured; never against a real user's store with real
  credentials).
- Each fixture is pinned to the rule/ADR/risk it protects; do not delete or
  weaken a fixture to make a change pass.

## Planned load-bearing fixtures (TO_VERIFY / to be added)

| Fixture | Pins | Protects |
|---|---|---|
| no-real-phi-scan | R-MWR-013, `TEST_DATA_SAFETY_GATE` | Test data/fixtures/scenarios/logs contain no real PHI/PII, no real token/account/device id. |
| golden-plan-replay-deterministic | R-MWR-011, ADR-MWR-008 | Replaying a stored execution plan is byte-identical; relative time resolves via an injected clock; no ambient time/random in the run path. |
| dry-run-no-write | R-MWR-001, ADR-MWR-004 | Dry-run performs zero real writes/native mutations; output labelled dry-run; dry-run is the default. |
| no-fake-success | R-MWR-002, ADR-MWR-005 | A denied/failed native write/insert is NOT reported as success. |
| unsupported-metric-surfaced | R-MWR-007, ADR-MWR-009 | An unsupported metric is `status: unsupported` + `reason_code`, never silently dropped. |
| capability-permission-fail-closed | R-MWR-006, `CAPABILITY_PERMISSION_GATE` | Capability checked before permission; denied/partial fails closed and is surfaced. |
| secret-redaction | R-MWR-003, ADR-MWR-006 | Logs/reports redact tokens + identifier-bearing payloads; secret resolved from reference. |
| no-prod-endpoint-default | R-MWR-003, ADR-MWR-006 | No production endpoint is a default; base URL from config. |
| apple-health-mapping (env-gated) | R-MWR-005, ADR-MWR-009 | Canonical metric -> `HKQuantityType`/`HKCategoryType` + `HKUnit` correct; permitted types only; idempotent. |
| health-connect-mapping (env-gated) | R-MWR-005, ADR-MWR-009 | Canonical metric -> Health Connect Record type + unit correct; `clientRecordId` idempotency. |
| not-google-healthkit | R-MWR-010, ADR-MWR-007 | The Android target is Health Connect; no "Google HealthKit" / Google Fit in current truth. |
| backend-gap-no-fabrication | R-MWR-008, ADR-MWR-002 | A missing/insufficient backend response blocks with a reason; no local fabrication. |

## TO_VERIFY

- Concrete fixture file locations + runner wiring once the app + tests exist
  (MR1+).
- Synthetic backend-response fixtures (test cases / versions / ordered
  scenarios / metric metadata) — fabricated, no real PHI.

# mWellness-Mobile-Runner — Prompt Overrides (mandatory behavioral rules)

Project-specific rules that **override or extend** the generic framework
rules. Every Claude task in this repo is bound by these. They operationalize
the gates in [`../framework/rules/gates.md`](../framework/rules/gates.md);
the `PROMPT_OVERRIDE_GATE` requires every task brief to answer each
applicable rule below. Seeded at framework bootstrap (MR-FRAMEWORK-00,
2026-06-27).

## Mandatory behavioral rules (each task brief answers the applicable ones)

| # | Rule | Maps to gate |
|---|---|---|
| 1 | **backend-authority-not-bypassed** — runnable data comes only from the authenticated MWDS backend API; mobile never authors/validates/reorders scenarios; a missing backend API is documented and STOPs for human approval, never fabricated. (ADR-MWR-002) | `BACKEND_API_GATE` |
| 2 | **scenario-contract-not-mutated** — interpret validated scenario payloads + metric metadata into runner models only; never author, validate, mutate, or reorder a scenario; an invalid payload blocks the run with a reason. (ADR-MWR-002) | `SCENARIO_CONTRACT_GATE` |
| 3 | **execution-plan-classifies-blocked-ops** — every operation is classified `writable \| unsupported \| permission_missing \| invalid \| skipped`; blocked operations carry a `reason_code` and are visible before the run. (ADR-MWR-008) | `EXECUTION_PLAN_GATE` |
| 4 | **dry-run-no-write** — dry-run performs ZERO real writes; output labelled dry-run; dry-run is the default; no code path bypasses the flag; real write needs explicit human-confirmed enablement. (ADR-MWR-004) | `DRY_RUN_NO_WRITE_GATE` (crown jewel) |
| 5 | **no-fake-success** — a write is reported successful only if the native platform write/insert actually succeeded; negative tests prove denied/failed writes are not reported as success. (ADR-MWR-005) | `NO_FAKE_SUCCESS_GATE` (crown jewel) |
| 6 | **capability+permission-before-write** — check platform capability before requesting permission; explain BEFORE the native OS prompt; denied/partial permission fails closed and is surfaced. (R-MWR-006) | `CAPABILITY_PERMISSION_GATE` |
| 7 | **secrets-by-reference** — tokens/credentials by reference name only, resolved at runtime from Keychain/Keystore; never committed/hardcoded/logged/persisted in plain storage; no production endpoint default; redaction on every log path. (ADR-MWR-006) | `SECRET_AND_ENDPOINT_SAFETY_GATE` |
| 8 | **no-real-PHI test data** — all test/scenario data is fabricated: no real PHI/PII, synthetic identifiers, nothing traceable to a real person; no mock test case/scenario presented as complete product behavior. | `TEST_DATA_SAFETY_GATE` |
| 9 | **unsupported-surfaced** — an unsupported metric is surfaced + skipped-with-`reason_code`, never silently dropped. (ADR-MWR-009) | `PLATFORM_WRITER_GATE` |
| 10 | **Health-Connect-not-Google-HealthKit** — the Android health-store target is **Android Health Connect**; never "Google HealthKit", never Google Fit; "HealthKit" is Apple/iOS only. (ADR-MWR-007, R-MWR-010) | `HEALTH_CONNECT_WRITE_GATE` |

## Precedence — MWR safety governance outranks imported RN skills

Imported/adapted React Native skills (rn-testing, rn-performance,
mobile-exploratory-qa) **strengthen implementation quality only** — they
never override MWR backend-authority, scenario-contract, dry-run-no-write,
no-fake-success, capability/permission, or secret/endpoint rules.

```text
Order of authority:
1. Real repo state.
2. Mobile Runner Master REQ / source-of-truth docs.
3. MWR adapter / prompt-overrides (this file).
4. Crown-jewel safety gates: DRY_RUN_NO_WRITE · NO_FAKE_SUCCESS · SECRET_AND_ENDPOINT_SAFETY · TEST_DATA_SAFETY.
5. React Native imported/adapted skills.
6. General coding preference.
```

An imported RN skill MUST NOT relax any of rules 1–10. In particular it may
never: bypass backend authority; author/validate/mutate/reorder a scenario;
let dry-run write; report a fake native success; reach a real write without
capability + permission + dry-run + confirmation; commit/log a raw token;
default to a production endpoint; silently drop an unsupported metric; put
real PHI/PII into a fixture; or call Health Connect "Google HealthKit". On
any conflict, the higher-ranked rule wins and the RN skill yields.

## Lane policy

Any task touching **the backend client/auth, scenario interpretation, the
execution plan, dry-run, a platform writer, a real-write path,
capability/permission, or secrets/endpoints** is **high-risk / full-lane**
work — never a tiny patch. The canonical denylist + size cap live in
[`../framework/rules/lane-classification.md`](../framework/rules/lane-classification.md).

## TO_VERIFY

- Final per-platform capability mappings (Apple Health, Health Connect)
  confirmed against official docs at implementation time (R-MWR-005).
- Exact backend endpoints + token-storage strategy (Master REQ §16 open
  questions; see [`current-decisions.md`](current-decisions.md)).

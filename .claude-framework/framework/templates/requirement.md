---
id: REQ-<slug>
type: requirement
status: draft            # draft | proposed | accepted | superseded
stage: definition
owner: <Human Decision Owner>
risk_level: low          # low | medium | high
related_context:
  - .claude-framework/adapter/project-source-of-truth.md
  - .claude-framework/adapter/current-decisions.md
related_artifacts: []
gate_required: true
promote_to_context: false
supersedes: []
tags: [mwellness-mobile-runner, mwr, react-native]
---

# REQ-<slug> — <title>

> Operating principle: **Backend runnable scenario contract first → mobile
> execution plan second → platform writer third.** Mobile never authors,
> validates, mutates, or reorders scenarios; it loads a backend-validated
> contract and executes it.

## 1. Problem
<the problem this requirement solves>

## 2. Goals
- <goal>

## 3. Non-goals
- <explicit non-goal — e.g. NOT authoring/validating scenarios; NOT computing a wellness score; NOT generating data (MWR replays an execution plan)>

## 4. Confirmed context (with sources)
- <fact> — source: <adapter file / Master REQ section / official Apple Health or Health Connect doc + date / code>

## 5. Open assumptions
- OPEN ASSUMPTION: <tied to an Open ADR / P1 risk — e.g. RN baseline, backend route shape, token-storage strategy, per-metric writability, native module prefix>

## 6. Success criteria
- <verifiable criterion>

## MWR impact
> Gate checks — confirm each (cite `gates.md`). The stricter of
> `DRY_RUN_NO_WRITE_GATE` / `NO_FAKE_SUCCESS_GATE` /
> `SECRET_AND_ENDPOINT_SAFETY_GATE` / `TEST_DATA_SAFETY_GATE` wins on conflict.

| Check | Status |
|---|---|
| Backend authority not bypassed (runnable data from authenticated API; gap → STOP for human approval) | <confirmed / n/a> |
| Scenario contract not authored/validated/mutated/reordered on device | <confirmed / n/a> |
| Execution-plan classification (`writable\|unsupported\|permission_missing\|invalid\|skipped` + `reason_code`) | <confirmed / n/a> |
| Dry-run performs ZERO real writes; dry-run is default | <confirmed / n/a> |
| Capability checked before permission; permission explained before the OS prompt; denied/partial fails closed | <confirmed / n/a> |
| No fake native write success (success reflects the real platform write/insert) | <confirmed / n/a> |
| Test-data safety: no real PHI/PII; synthetic identifiers only | <confirmed / n/a> |
| Secret/endpoint safety: secret-by-reference; no prod endpoint default; redaction on every log path | <confirmed / n/a> |
| Health Connect terminology correct (never "Google HealthKit" / Google Fit) | <confirmed / n/a> |

## 7. Risks
- <R-MWR-xxx reference or new risk>

## 8. Out of scope
- <…>

## 9. Downstream
<how this breaks into stories>

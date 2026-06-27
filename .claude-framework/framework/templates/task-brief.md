---
id: TASK-BRIEF-<slug>
type: task-brief
status: draft
parent_task: TASK-<slug>
route: <route>
lane: <tiny | light | full>
risk_level: <low | medium | high>
tags: [mwellness-mobile-runner, mwr]
---

# TASK-BRIEF-<slug> — <title>

> Full-lane brief. For `light` lane, use selective inclusion (drop what
> genuinely doesn't apply — never drop gates, tests, or acceptance). For
> Tiny, use `/direct-patch` instead. Field/ordering contracts:
> [`report-format.md`](../rules/report-format.md), [`prompt-rules.md`](../rules/prompt-rules.md).

## Human Summary
> Canonical field contract for this block (cited by `report-format.md` R-1).
- **Result:** <one line>
- **What changed:** <one line, or "n/a — pre-execution brief">
- **What still matters:** Blocking: <…> / Non-blocking: <…> / Can defer: <…>
- **Recommended next action:** <one line, names a command>

## 1. Objective
## 2. Confirmed context (sources) vs Open assumptions
## 3. Route + Lane Triage
```text
Lane decision / Recommended lane / Risk level / Escalation triggers found /
De-escalation possible / Context promotion likely / Recommended next command
```
## 4. Files / surface to touch (real paths or TO_VERIFY)
## 5. Wiring path(s) affected (cite W-MWR-00x)
## 6. Mandatory gates (cite gates.md / prompt-overrides.md)
## 7. Named, verifiable tests (cite test-map.md categories)
## 8. Acceptance criteria (each verifiable)
## 9. Non-goals
## 10. Risks + Risk-First Pass (high-risk: failure modes + the test proving each)
## 11. Rollback / blast radius
## 12. Reviewer lenses needed (cite the fanout registry)

## MWR impact
> Gate checks — confirm each (cite `gates.md`). The stricter of
> `DRY_RUN_NO_WRITE_GATE` / `NO_FAKE_SUCCESS_GATE` /
> `SECRET_AND_ENDPOINT_SAFETY_GATE` / `TEST_DATA_SAFETY_GATE` wins on conflict.

| Check | Status |
|---|---|
| Backend authority not bypassed (runnable data from authenticated API; gap → STOP for human approval) | <confirmed / n/a> |
| Scenario contract not authored/validated/mutated/reordered on device | <confirmed / n/a> |
| Execution-plan classification (`writable\|unsupported\|permission_missing\|invalid\|skipped` + `reason_code`) | <confirmed / n/a> |
| Dry-run performs ZERO real writes; dry-run is default; no code path bypasses the flag | <confirmed / n/a> |
| Capability checked before permission; permission explained before the OS prompt; denied/partial fails closed | <confirmed / n/a> |
| No fake native write success (success reflects the real platform write/insert) | <confirmed / n/a> |
| Test-data safety: no real PHI/PII; synthetic identifiers; replay determinism (no ambient Date.now()/Math.random()) | <confirmed / n/a> |
| Secret/endpoint safety: secret-by-reference; no prod endpoint default; redaction on every log path | <confirmed / n/a> |
| Platform mapping correct + idempotent; Health Connect terminology correct (never "Google HealthKit" / Google Fit) | <confirmed / n/a> |
| Test device / env requirements + adapter docs to update on close | <…> |

## Portable handoff summary
> 9-field schema canonical at [`.claude/HANDOFF.md` §3](../../../.claude/HANDOFF.md).

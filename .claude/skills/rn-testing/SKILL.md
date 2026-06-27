# Skill — rn-testing

## Name
`rn-testing`

## Purpose
RN component-test quality (RNTL) for MWR screens, with MWR run-flow and
safety-invariant coverage. **Subordinate to MWR governance**
(prompt-overrides Precedence).

## Mode
**REVIEW / IMPLEMENTATION support.** Writes/reviews tests only.

## Inputs
A component + the RNTL version.

## Context to load
- [`rn-testing-rules.md`](../../../.claude-framework/framework/rules/rn-testing-rules.md) + [`rn-testing-checklist.md`](../../../.claude-framework/framework/checklists/rn-testing-checklist.md), [`test-map.md`](../../../.claude-framework/adapter/test-map.md).

## Gates to run
- `RN_TESTING_GATE`.

## Step-by-step workflow
1. Cover the run-flow states: idle / loading / plan-built / dry-run / confirming / executing / result / error.
2. Assert MWR invariants in tests: dry-run performs no real write; success is reported only on actual native write/insert (no fake success); an unsupported metric is surfaced with its `reason_code`; denied/partial permission fails closed; no token/PHI/raw payload in output; target platform and run MODE (dry-run vs real) are obvious.
3. Use `screen` queries, query priority, `userEvent`, `findBy*`; no loosened assertions.

## Output format / artifact
Tests or a test review.

## Closeout / artifact requirements
Tests green; command + result recorded.

## Escalation triggers
- An MWR safety invariant has no test (dry-run-no-write, no-fake-success, unsupported-surfaced, secrets redacted) → P0/P1 to the test reviewer; never relax to pass.

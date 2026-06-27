# Skill — mobile-exploratory-qa

## Name
`mobile-exploratory-qa`

## Purpose
Dogfood / exploratory QA across MWR run-flow states on a real device or
agent-device — fabricated scenario data only, dry-run by default, never a
real health-store write without the human-approval gate.

## Mode
**REVIEW / QA.** Produces a `mobile-qa-report`.

## Inputs
Flows + platform (iOS / Android); an internal/dev build.

## Context to load
- [`mobile-exploratory-qa-checklist.md`](../../../.claude-framework/framework/checklists/mobile-exploratory-qa-checklist.md), [`mobile-qa-report.md`](../../../.claude-framework/framework/templates/mobile-qa-report.md), [`test-map.md`](../../../.claude-framework/adapter/test-map.md).

## Gates to run
- Folds into `RN_TESTING_GATE` + `RN_UI_QUALITY_GATE` + `INTERNAL_RELEASE` checks.

## Step-by-step workflow
1. Walk the run-flow state matrix: idle → loading (login → fetch test cases → load version/scenarios/metric metadata) → check capability → check permissions (explained before the OS prompt) → plan-built → dry-run → confirming → executing → result → error; include unsupported-metric and partial-success paths.
2. Confirm the safety confirmations in-app: no real PHI/PII in scenarios; dry-run wrote nothing; capability + permission honored (denied/partial fails closed); success reflects the actual native result (no fake success); Health Connect labelled correctly (never "Google HealthKit"/Google Fit); target platform + run MODE obvious throughout.
3. File findings in a `mobile-qa-report` with repro evidence + severity.

## Output format / artifact
`.claude-framework/artifacts/reviews/` QA report (or attached to the review).

## Closeout / artifact requirements
Verdict + findings; the safety confirmations recorded.

## Escalation triggers
- `agent-device` unavailable → manual real-device fallback.
- Any safety defect (a real write in dry-run, faked success, a secret/PHI visible, a silent metric drop) → P0.
- A real Apple Health / Health Connect write would be exercised → STOP for the human-approval gate ([`human-approval-gates.md`](../../../.claude-framework/adapter/human-approval-gates.md)).

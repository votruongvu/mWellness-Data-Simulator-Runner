---
id: STORY-<slug>
type: story
status: draft
parent_req: REQ-<slug>
tags: [mwellness-mobile-runner, mwr]
---

# STORY-<slug> — <title>

## As a / I want / so that
- As a <MWR engineer / QA>, I want <capability>, so that <outcome>.

## Traces to
- REQ: REQ-<slug>  (a story traces to exactly one REQ)

## Scope (one surface)
- Pipeline stage: backend load / scenario interpretation / execution plan / dry-run / capability+permission / platform writer / run reporting
- Platform target: <Apple Health (iOS) | Health Connect (Android) | both | n/a>

## Acceptance (verifiable)
- <criterion>

## MWR invariants to preserve
- backend-authority-respected · scenario-contract-not-mutated · execution-plan-classified · dry-run-no-write · capability+permission-fail-closed · no-fake-success · no-real-PHI · unsupported-surfaced-with-reason · secret-by-reference/redaction · Health-Connect-not-"Google HealthKit"

## Breaks into tasks
- TASK-<slug> — <one objective>

---
story_id: MWR-DESIGN-006
phase: MR-DESIGN-00
order: 6
title: "Create implementation handoff"
depends_on: ["MWR-DESIGN-002", "MWR-DESIGN-003", "MWR-DESIGN-004", "MWR-DESIGN-005"]
status: ready
---

# MWR-DESIGN-006 — Create Implementation Handoff

## Story File

`STORY-create-implementation-handoff.md`

## Phase

`MR-DESIGN-00 — Design Handoff Normalization`

## Goal

Map design screens, components, states, API dependencies, and native dependencies to future MR implementation phases.

## Context

This phase normalizes the accepted/refined Claude Designer output into implementation-ready design artifacts for `mWellness-Mobile-Runner`.

MR-DESIGN-00 happens after framework bootstrap and before product implementation. It exists because the design package should be translated into screen maps, flow maps, state matrices, safety UX rules, and implementation handoff before MR1/MR2/MR3 stories are created.

Source priority:

```text
Master REQ = canonical product requirement source
Refined Claude Design = UI/UX implementation input
Framework source-of-truth/current-decisions = active operating truth
```

Design direction:
- Keep core runner flow focused.
- Do not overbuild environment setup.
- Keep safety gates mandatory but less noisy outside real-write confirmation.
- Mobile is runner-only and backend-authoritative.

## Dependencies

- MWR-DESIGN-002
- MWR-DESIGN-003
- MWR-DESIGN-004
- MWR-DESIGN-005

## Scope

- Create `artifacts/design/mobile-runner/MOBILE_RUNNER_IMPLEMENTATION_HANDOFF.md`.
- Map screens/components to MR1, MR2, MR3, MR4, MR5, and MR6.
- Map screens to required backend APIs and DTOs.
- Map screens to native platform requirements where relevant.
- Identify which screens can be built before native writers exist.
- Identify which screens must wait for MR3 execution plan.
- Identify which screens must wait for MR4/MR5 native capability/permission/write POCs.
- Identify open design questions and implementation risks.
- Do not generate MR1/MR2/MR3 implementation stories in this story.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native write code.
- Do not create MR0, MR1, or later implementation user stories.
- Do not add test case authoring, catalog editing, scenario ordering, scenario seed library, scenario upload, or export-bundle primary flow.
- Do not weaken mandatory health-write safety gates.

## Acceptance Criteria

- Implementation handoff doc exists.
- Each final screen maps to future MR phase(s).
- API dependencies are listed.
- Native dependencies are listed.
- Safety gate dependencies are listed.
- MR1/MR2/MR3/MR4/MR5/MR6 story generation can use the handoff.

## Validation Expectations

- Markdown validation where available.
- Internal link validation where available.
- Manual review against Master REQ and accepted/refined design package.
- Confirm no product code or RN scaffold changed.

## Human Approval Triggers

Stop and ask for human approval if:

- Design conflicts with Master REQ.
- Design introduces mobile authoring/editing scope.
- Design makes export bundle the primary mobile flow.
- Design weakens dry-run/capability/permission/confirmation safety gates.
- Design requires product implementation code.
- Design requires native health write implementation.
- Design requires backend API implementation.

## Commit Requirement

Commit subject must be:

`MR-DESIGN-00 STORY-create-implementation-handoff`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, design impact, validation results, and P0/P1/P2 followups.

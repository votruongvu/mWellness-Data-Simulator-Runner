---
story_id: MWR-DESIGN-004
phase: MR-DESIGN-00
order: 4
title: "Create component kit and state matrix"
depends_on: ["MWR-DESIGN-002", "MWR-DESIGN-003"]
status: done
---

# MWR-DESIGN-004 — Create Component Kit And State Matrix

## Story File

`STORY-create-component-kit-and-state-matrix.md`

## Phase

`MR-DESIGN-00 — Design Handoff Normalization`

## Goal

Define reusable mobile UI components and critical screen states for implementation.

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

## Scope

- Create `artifacts/design/mobile-runner/MOBILE_RUNNER_COMPONENT_KIT.md`.
- Create `artifacts/design/mobile-runner/MOBILE_RUNNER_STATE_MATRIX.md`.
- Define components: App Header, Backend Status Indicator, Platform Badge, Mode Badge, Status Badge, Safety Banner, Test Case Card, Version Summary Card, Scenario Row, Metric Chip, Capability Card, Permission Row, Execution Plan Summary Card, Operation Count Tile, Unsupported Metric Panel, Error Detail Panel, Run Progress Row, Run Result Summary Card, Diagnostics Row, Confirmation Modal, Empty/Loading/Error states.
- Define screen states: loading, empty, success, error, forbidden, session expired, backend unavailable, unsupported platform, planning, blocked, partial, dry-run completed, running, completed, failed, cancelled.
- Keep component kit practical for implementation, not theoretical.
- Do not create visual code or React Native components.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native write code.
- Do not create MR0, MR1, or later implementation user stories.
- Do not add test case authoring, catalog editing, scenario ordering, scenario seed library, scenario upload, or export-bundle primary flow.
- Do not weaken mandatory health-write safety gates.

## Acceptance Criteria

- Component kit doc exists.
- State matrix doc exists.
- Components map to final screen map.
- Critical states are covered for core flow.
- Safety/status components support dry-run, real-write, blocked, partial, failed, skipped, and success semantics.
- No UI implementation code is added.

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

`MR-DESIGN-00 STORY-create-component-kit-and-state-matrix`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, design impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-DESIGN-00 phase loop
- **Executed:** 2026-06-27 · branch `mr-design-00-stories`. **Status:** DONE.
- **Deliverables:** `artifacts/design/mobile-runner/MOBILE_RUNNER_COMPONENT_KIT.md` (32 components + safety-critical rules) and `MOBILE_RUNNER_STATE_MATRIX.md` (per-screen states, operation classification, reason_codes, iOS/Android parity, safety-state invariants).
- **Normalizations:** device-profile in TestCaseCard/VersionSummaryCard; PlatformBadge iOS·Apple Health / Android·Health Connect; RealWriteConfirmCard gate-disabled until dry-run+capability+permission+checkbox; partial_success distinct; no disable-safety/bypass/force-success/reorder/seed components.
- **Validation:** markdown OK; links resolve. No product/RN/backend/native code.
- **Followups:** none.

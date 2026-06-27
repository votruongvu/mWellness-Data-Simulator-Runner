---
story_id: MWR-DESIGN-005
phase: MR-DESIGN-00
order: 5
title: "Create safety gate UX matrix"
depends_on: ["MWR-DESIGN-003", "MWR-DESIGN-004"]
status: ready
---

# MWR-DESIGN-005 — Create Safety Gate Ux Matrix

## Story File

`STORY-create-safety-gate-ux-matrix.md`

## Phase

`MR-DESIGN-00 — Design Handoff Normalization`

## Goal

Create implementation-ready UX rules for dry-run, capability, permission, confirmation, partial run, unsupported metrics, and no-fake-success messaging.

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

- MWR-DESIGN-003
- MWR-DESIGN-004

## Scope

- Create `artifacts/design/mobile-runner/MOBILE_RUNNER_SAFETY_UX_MATRIX.md`.
- Define four mandatory real-write gates: dry-run completed, platform capability checked, permissions checked, explicit confirmation.
- Define concise safety presentation for normal flow and strong warning presentation for real-write confirmation.
- Define partial run behavior: denied/unsupported metrics are skipped and no denied metric write is attempted.
- Define result semantics: Success, Partial Success, Failed, Cancelled, Skipped-only.
- Define no-fake-success UX: native write failure must show failed/partial, never success.
- Define unsupported metric copy using F2X-aligned examples such as recovery_score, readiness_score, stress_level, sleep_stage_deep.
- Define sanitized diagnostics copy: no tokens, credentials, raw payloads, or personal health data.
- Do not weaken safety gates for simplicity.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native write code.
- Do not create MR0, MR1, or later implementation user stories.
- Do not add test case authoring, catalog editing, scenario ordering, scenario seed library, scenario upload, or export-bundle primary flow.
- Do not weaken mandatory health-write safety gates.

## Acceptance Criteria

- Safety UX matrix exists.
- All four mandatory real-write gates are defined.
- Partial run copy is explicit.
- Unsupported metric copy is aligned with expanded wellness catalog.
- Success/partial/failure/skipped result semantics are distinct.
- Safety is concise but not hidden.

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

`MR-DESIGN-00 STORY-create-safety-gate-ux-matrix`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, design impact, validation results, and P0/P1/P2 followups.

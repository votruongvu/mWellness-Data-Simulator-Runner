---
story_id: MWR-DESIGN-001
phase: MR-DESIGN-00
order: 1
title: "Import and archive accepted design package"
depends_on: []
status: done
---

# MWR-DESIGN-001 — Import And Archive Accepted Design Package

## Story File

`STORY-import-and-archive-accepted-design-package.md`

## Phase

`MR-DESIGN-00 — Design Handoff Normalization`

## Goal

Archive the accepted/refined Claude Designer package and review notes as traceable design evidence without making design higher authority than Master REQ.

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

- None

## Scope

- Import the accepted/refined Claude Designer design package into `artifacts/design/mobile-runner/` or the repo-approved design artifact path.
- Archive the original design PDF/export and any refined version if available.
- Archive design review notes and refinement prompt, including simplification of environment handling and terminology fixes.
- Record design artifact version, source, date, status, and reviewer notes.
- Document that Master REQ remains canonical product requirement source.
- Document that design package is UI/UX implementation input, not product authority over Master REQ.
- Do not implement UI code or product code.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native write code.
- Do not create MR0, MR1, or later implementation user stories.
- Do not add test case authoring, catalog editing, scenario ordering, scenario seed library, scenario upload, or export-bundle primary flow.
- Do not weaken mandatory health-write safety gates.

## Acceptance Criteria

- Design package is archived under a traceable artifact path.
- Design review/refinement notes are preserved.
- Design status is explicit: accepted baseline or accepted with followups.
- Master REQ priority over design artifact is documented.
- No React Native code or product implementation is added.

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

`MR-DESIGN-00 STORY-import-and-archive-accepted-design-package`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, design impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-DESIGN-00 phase loop

- **Executed:** 2026-06-27 · branch `mr-design-00-stories` · via `.claude/commands/run-phase-loop.md`.
- **Status:** DONE.
- **Deliverable:** `artifacts/design/mobile-runner/` — archived `Mobile_Runner_UI.pdf` (Claude Designer output, 23 screens) + `MWR_UI_FLOW_SCREEN_SPEC.md` (design brief/review notes) + `DESIGN_PACKAGE_INDEX.md` (source, version, status, normalization deltas, Master-REQ supremacy).
- **Claude Design MCP import:** attempted via `DesignSync` — `get_project 21d27f8f…` → 404; `list_projects` → only an empty `Design System` project. The `v2.dc.html` canvas is not readable by this MCP; archived the on-disk PDF + spec instead (documented in DESIGN_PACKAGE_INDEX).
- **Design subordinate to Master REQ:** documented (design = UI/UX input, not product authority).
- **Validation:** markdown OK; internal links resolve; no product/RN/native/backend code added.
- **Non-goals preserved:** no product code · no RN scaffold · no backend API · no native write · no MR0/MR1+ stories · no authoring/catalog/seed/upload/export-bundle · no Google Fit/vendor SDK · no RBAC/tenant/billing.
- **Followups:** P2 — retrieve the exact `v2.dc.html` if/when the Claude Design canvas becomes MCP-accessible and reconcile any visual deltas.

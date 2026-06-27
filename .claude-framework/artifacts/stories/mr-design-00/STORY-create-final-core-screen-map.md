---
story_id: MWR-DESIGN-002
phase: MR-DESIGN-00
order: 2
title: "Create final core screen map"
depends_on: ["MWR-DESIGN-001"]
status: done
---

# MWR-DESIGN-002 — Create Final Core Screen Map

## Story File

`STORY-create-final-core-screen-map.md`

## Phase

`MR-DESIGN-00 — Design Handoff Normalization`

## Goal

Normalize the final screen inventory into primary, secondary, and error-state screens with simplified environment handling.

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

- MWR-DESIGN-001

## Scope

- Create `artifacts/design/mobile-runner/MOBILE_RUNNER_SCREEN_MAP.md` or repo-equivalent path.
- Define primary core screens: Splash/Bootstrap, Login, Runner Dashboard, Platform Capability Summary, Test Case List, Test Case Detail, Version/Ordered Scenarios, Execution Plan Preview, Dry-run Result, Permission & Capability Check, Real-write Confirmation, Run Progress, Run Result.
- Define secondary screens: Scenario Payload Preview, Diagnostics/Logs, Settings, Error Detail.
- Define error states: Session Expired, Backend Unavailable, Unsupported Platform.
- Remove or de-emphasize heavy local/dev/staging/prod environment management from the primary UX.
- Specify environment handling as lightweight status/settings/error recovery only.
- Correct terminology: source/device profile means Apple Watch/Huawei Watch; do not use `profile: athlete`.
- Standardize naming: Destination Apple Health / Platform API HealthKit / Device platform iOS; Destination Health Connect / Platform API Health Connect / Device platform Android.

## Explicit Non-Goals

- Do not implement product code.
- Do not scaffold the React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native write code.
- Do not create MR0, MR1, or later implementation user stories.
- Do not add test case authoring, catalog editing, scenario ordering, scenario seed library, scenario upload, or export-bundle primary flow.
- Do not weaken mandatory health-write safety gates.

## Acceptance Criteria

- Screen map exists and is implementation-ready.
- Primary vs secondary vs error-state screens are clearly separated.
- Environment setup is not a major primary product flow.
- Terminology is corrected for device/source profile.
- Apple Health/HealthKit and Health Connect naming is standardized.
- No authoring/editor screens are introduced.

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

`MR-DESIGN-00 STORY-create-final-core-screen-map`

Commit body must include story path, summary, validation results, non-goals preserved, and followups.

## Closeout Requirements

Return story closeout with status, commit hash, files changed, design impact, validation results, and P0/P1/P2 followups.

---

## Execution Record — MR-DESIGN-00 phase loop
- **Executed:** 2026-06-27 · branch `mr-design-00-stories`. **Status:** DONE.
- **Deliverable:** `artifacts/design/mobile-runner/MOBILE_RUNNER_SCREEN_MAP.md` — 14 primary + 5 secondary + 4 error screens (23 reconciled).
- **Normalizations applied:** environment demoted to a lightweight badge/connection (not local/dev/staging/prod primary UX); `profile` = device/source profile (Apple Watch), never `athlete`; terminology Apple Health/HealthKit/iOS + Health Connect/Health Connect/Android; iOS + Android happy paths both first-class; Unsupported Platform split iOS/Android; safety gates retained.
- **Validation:** markdown OK; internal links resolve. No product/RN/backend/native code.
- **Non-goals preserved:** no authoring/catalog/seed/upload/reorder/export-bundle/Google Fit/RBAC; design subordinate to Master REQ.
- **Followups:** none.

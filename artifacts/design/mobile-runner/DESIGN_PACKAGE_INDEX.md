# Mobile Runner — Design Package Index (MR-DESIGN-00)

Archived design evidence for `mWellness-Mobile-Runner`. **This package is UI/UX
implementation input — it is NOT product authority.** The canonical product
requirement source remains the **Mobile Runner Master REQ**
([`docs/requirements/MOBILE_RUNNER_MASTER_REQ.html`](../../../docs/requirements/MOBILE_RUNNER_MASTER_REQ.html)).
Where design and Master REQ disagree, Master REQ wins and the divergence is a
human-approval item (per the story-001 approval triggers).

## Archived artifacts

| File | Type | Role |
|---|---|---|
| `Mobile_Runner_UI.pdf` | Claude Designer visual output (7 pages, 23 screens) | The accepted design package (visual mockups + flow map). |
| `MWR_UI_FLOW_SCREEN_SPEC.md` | UI Flow & Screen Spec (`MWR-UI-FLOW-SCREEN-SPEC-v1.0`) | The design brief / review notes given to Claude Designer (23 screens, 6 flows, 26 components, copy, constraints). |

## Source / provenance

| Field | Value |
|---|---|
| Design source requested | Claude Design canvas `Mobile Runner UI v2.dc.html` (project `21d27f8f-84a8-4c24-a1b3-0156cfafa33c`). |
| Claude Design MCP (`DesignSync`) import status | **Not retrievable via MCP.** `get_project` → HTTP 404; `list_projects` surfaced only an empty `Design System` project (`fb7a4126…`, 0 files). The MCP reads design-**system** projects, not this design **canvas** doc. |
| Actual archived baseline | `Mobile Runner UI.pdf` (Claude Designer output) + `MWR_UI_FLOW_SCREEN_SPEC.md`, both provided on disk. |
| Version / status | Baseline `MWR-UI-FLOW-SCREEN-SPEC-v1.0`, **accepted with normalization followups** (see below). The refined "v2" direction is captured as the normalization deltas applied across MR-DESIGN-00 artifacts. |
| Imported | 2026-06-27, MR-DESIGN-00, branch `mr-design-00-stories`. |

## Reviewer notes / normalization deltas (the "v2" refinement)

The baseline was directionally correct but slightly overbuilt. The following
deltas are applied across the MR-DESIGN-00 normalization artifacts (screen map,
flows, component kit, state matrix, safety UX, handoff):

1. **Environment handling is lightweight, not primary UX.** The baseline's full
   `Environment Setup` screen with `local / dev / staging` selectors is demoted
   to a small **environment badge + minimal connection check** (no
   local/dev/staging/prod environment-management flow as a primary screen).
2. **`profile` means source/device profile only** (e.g. **Apple Watch**, **Huawei
   Watch**) — the baseline's `profile: athlete` is corrected to a device/source
   profile everywhere.
3. **Terminology is normalized** (baseline showed `destination: HealthKit`):
   - Destination = **Apple Health** · Platform API = **HealthKit** · Device platform = **iOS**.
   - Destination = **Health Connect** · Platform API = **Health Connect** · Device platform = **Android**.
   - "Google HealthKit" / Google Fit never appear.
4. **Android Health Connect happy path is represented.** The baseline shows
   Android only in an error state (Health Connect not installed); the normalized
   flows/screen map add the Android Health Connect happy path as a peer to iOS.
5. **Safety gates stay mandatory** but are quieter outside the real-write
   confirmation; dry-run precedes real write; real write requires dry-run +
   capability + permission + explicit confirmation; partial success is distinct
   from success; no fake native write success.

## Master REQ supremacy (recorded)

- Master REQ = canonical product requirement source.
- Refined Claude Design = UI/UX implementation input.
- Framework `adapter/*` = active operating truth.
- Old design iterations = evidence/history only.

Design must not introduce: mobile authoring/editing, scenario seed library,
scenario upload, catalog editing, scenario reordering, export-bundle primary
flow, Google Fit/vendor SDK, RBAC/tenant/billing/admin, background autonomous
writes, or fake write success. None of the above are present in the archived
package after normalization.

# mWellness Mobile Runner — UI Flow & Screen Specification for Claude Designer

Document ID: `MWR-UI-FLOW-SCREEN-SPEC-v1.0`  
Target product: `mWellness-Mobile-Runner`  
Target use: Claude Designer visual mockup/prototype generation before implementation  
Source baseline: `mWellness Mobile Runner Master REQ v1.0`  
Status: Draft for design generation

---

## 0. Purpose

Create a complete mobile UI design package for `mWellness-Mobile-Runner`.

This document is intended for Claude Designer. The goal is to generate a full set of mobile screens and end-to-end flows before implementation starts, so the mobile repo/framework can later map screens to MR phases and user stories.

The design should focus on:

- mobile runner workflow
- internal DEV/QA usability
- native health write safety
- dry-run first behavior
- backend-loaded test cases/scenarios
- clear blocked/unsupported/permission states
- no accidental real health data writes

This is a mobile app design task, not an implementation task.

---

## 1. Product Summary

`mWellness-Mobile-Runner` is a dedicated mobile runtime app used by DEV/QA users to execute wellness scenarios that were authored, validated, versioned, and ordered in the upstream `mWellness-Data-Simulator` Web App/Backend.

The mobile app:

1. Logs in the user.
2. Loads runnable test cases from backend APIs.
3. Lets the user select a test case and version.
4. Loads ordered concrete scenarios for that version.
5. Loads metric metadata and platform support.
6. Builds an execution plan.
7. Runs a dry-run preview.
8. Requests health permissions with explanation.
9. Requires explicit confirmation before real write.
10. Writes/simulates supported data through Apple Health / HealthKit or Health Connect.
11. Shows progress and final run result.
12. Optionally reports results to backend.

The mobile app does **not** author test cases, edit catalog, edit scenario seeds, validate scenario source of truth, or own versioning/order authority.

---

## 2. Design Principles

### 2.1 Safety-first

Every real write flow must make the following obvious:

- target platform
- destination: Apple Health or Health Connect
- mode: dry-run or real-write
- permissions status
- unsupported metrics
- exact number of planned write operations
- confirmation before writing

### 2.2 Backend-authoritative

The UI must communicate that test cases, versions, ordered scenarios, and metric definitions come from backend.

Do not design UI that implies mobile can edit:

- test case configuration
- metric selection
- scenario order
- scenario JSON
- scenario seed applicability
- catalog definitions

### 2.3 DEV/QA utility

The app is internal and should be efficient for testers:

- compact but readable screens
- clear status badges
- copyable diagnostic IDs where relevant
- request ID/run ID visibility
- actionable error states
- quick rerun/retry where safe

### 2.4 No fake success

Design must distinguish:

- succeeded
- failed
- skipped
- blocked
- unsupported
- permission missing
- cancelled

Never show a generic “success” if some operations failed or were skipped.

---

## 3. Visual Direction

### 3.1 Style

Recommended style:

- clean internal QA tool
- high clarity over marketing polish
- modern mobile cards and status panels
- strong safety banners for real-write mode
- subdued but clear health/platform indicators
- accessible contrast
- compact information hierarchy

### 3.2 Suggested Visual Tokens

Claude Designer may propose its own UI kit, but the design should include:

- primary action
- secondary action
- danger/destructive action
- warning action
- disabled action
- status badges
- metric chips
- scenario cards
- run progress rows
- permission state cards
- platform capability cards
- diagnostic/error panels

### 3.3 Status Colors

Use consistent semantic states:

- Ready / supported / granted
- Warning / partial / requires attention
- Blocked / denied / unsupported
- Running / in progress
- Completed
- Failed
- Skipped
- Dry-run
- Real-write

Avoid relying on color only; use text labels and icons.

---

## 4. Navigation Model

Recommended top-level app structure:

```text
Unauthenticated Stack
  Splash / Bootstrap
  Environment Setup
  Login

Authenticated Stack
  Home / Runner Dashboard
  Test Cases
  Test Case Detail
  Version Detail
  Execution Plan
  Permission & Capability Check
  Run Confirmation
  Run Progress
  Run Result
  Diagnostics
  Settings
```

Alternative bottom tabs are allowed:

```text
Tabs
  Runner
  Test Cases
  Diagnostics
  Settings
```

For early design, prefer a simple authenticated stack with a visible top-level dashboard.

---

## 5. End-to-End Flow Map

### 5.1 Primary Happy Path — Dry-run then Real Write

```text
Splash
→ Environment Check
→ Login
→ Runner Dashboard
→ Test Case List
→ Test Case Detail
→ Version Detail / Ordered Scenarios
→ Build Execution Plan
→ Dry-run Preview
→ Permission & Capability Check
→ Real-write Confirmation
→ Run Progress
→ Run Result
→ Optional Report Result
```

### 5.2 Permission Denied Flow

```text
Version Detail
→ Build Execution Plan
→ Permission & Capability Check
→ Missing Permission
→ Explain Required Permission
→ Open OS Permission Prompt / Settings
→ Permission Denied
→ Run Blocked or Partial Run Available
```

### 5.3 Unsupported Metric Flow

```text
Version Detail
→ Build Execution Plan
→ Execution Plan Preview
→ Unsupported Metrics Panel
→ Run Blocked or Partial Run Available
→ User chooses Dry-run Only / Skip Unsupported / Cancel
```

### 5.4 Backend Error Flow

```text
Any Backend Screen
→ API Error
→ Show error envelope/message
→ Show request ID if available
→ Retry
→ If auth expired, redirect to Login
```

### 5.5 Real Write Safety Flow

```text
Execution Plan
→ Dry-run Completed
→ Real-write mode selected
→ Safety warning
→ Platform target shown
→ Operation count shown
→ User confirms with explicit action
→ Run starts
```

The design should make it impossible to accidentally jump from test case list directly to real write.

---

## 6. Complete Screen Inventory

### Screen 01 — Splash / Bootstrap

Purpose: initial app startup, environment loading, session restore.

Required elements:

- app name: `mWellness Mobile Runner`
- small subtitle: `Internal DEV/QA Runner`
- loading indicator
- environment label if known
- version/build label
- error state for failed bootstrap

States:

- loading
- session restored
- no session
- environment config error
- backend unavailable

Actions:

- Retry bootstrap
- Go to environment setup
- Go to login

Designer output:

- one normal loading state
- one config error state

---

### Screen 02 — Environment Setup / Backend Connection

Purpose: configure or verify backend environment before login.

Required elements:

- backend base URL or selected environment
- environment badge: local/dev/staging
- connection status
- health check result
- warning that this is an internal runner
- save/test connection action

Fields:

- Backend URL
- Optional environment selector
- Optional build channel label

Actions:

- Test Connection
- Save and Continue
- Reset to Default

States:

- not configured
- checking
- connected
- failed
- invalid URL

Safety notes:

- Do not expose secret tokens.
- Do not allow fake backend data as completed behavior.

---

### Screen 03 — Login

Purpose: authenticate user against MWDS backend.

Required elements:

- email
- password
- backend environment label
- login button
- loading state
- error message area
- link to environment setup

Actions:

- Login
- Change environment

States:

- empty
- invalid input
- loading
- auth failed
- backend unavailable
- session expired message

Acceptance for design:

- login screen should feel like internal QA tool, not consumer onboarding.
- show clear environment context.

---

### Screen 04 — Runner Dashboard / Home

Purpose: landing page after login.

Required elements:

- user identity summary
- backend environment/status
- platform status card: iOS Apple Health or Android Health Connect
- quick action: Browse Test Cases
- recent runs summary if available
- safety mode banner: Dry-run default
- diagnostics shortcut

Cards:

- `Runnable Test Cases`
- `Platform Capability`
- `Last Run`
- `Safety Mode`

Actions:

- Browse Test Cases
- Check Platform
- View Diagnostics
- Logout

States:

- normal
- backend degraded
- platform unsupported
- no recent runs

---

### Screen 05 — Platform Capability Overview

Purpose: show device/platform readiness.

Required elements:

- detected platform: iOS / Android
- destination: Apple Health / Health Connect
- availability status
- app installation status for Health Connect if Android
- OS support status
- permission summary
- supported metric categories summary
- unsupported/unknown warnings

Actions:

- Re-check Capability
- Review Permissions
- Continue to Test Cases

States:

- supported
- partially supported
- unsupported
- Health Connect not installed
- permission unknown
- permission denied

---

### Screen 06 — Test Case List

Purpose: list runnable test cases from backend.

Required elements:

- search bar
- filters:
  - destination
  - profile
  - metric category
  - runnable status
  - has scenarios
- test case card/table rows
- latest version badge
- scenario count
- destination/profile chips
- metric count
- validation/runnable status
- last updated

Card content:

- test case name
- slug
- latest/current version
- destination
- profiles
- metric chips or count
- scenario count
- status

Actions:

- Open Test Case
- Refresh
- Clear filters

States:

- loading
- empty
- no search result
- backend error
- session expired
- success

Do not include:

- create/edit test case action
- scenario authoring action
- catalog edit action

---

### Screen 07 — Test Case Detail

Purpose: show selected test case and available versions.

Required elements:

- test case name and slug
- status
- latest/current version summary
- destination/profile/metric summary
- scenario count
- version history preview
- action to open latest/current version
- action to choose older version if available

Actions:

- Open Current Version
- View Versions
- Refresh
- Back to List

States:

- loading
- not found
- forbidden
- no runnable version
- success

Important copy:

- “Configuration is managed in MWDS Web App.”
- “Mobile Runner executes validated scenarios only.”

---

### Screen 08 — Version Detail / Ordered Scenarios

Purpose: show immutable version config and ordered scenario list.

Required elements:

- version number
- current/latest marker
- destination
- profiles
- metric list grouped by category
- catalog revision/hash if available
- ordered scenario list
- scenario validation status
- scenario count
- button to build execution plan

Scenario row content:

- order index
- scenario name
- scenario slug
- metrics used
- validation status
- source/provenance if available
- expected operation count if available

Actions:

- Build Execution Plan
- View Scenario Payload Preview
- Refresh

States:

- loading
- no scenarios
- invalid version
- scenario validation warning
- success

Do not include:

- reorder scenario
- edit version
- edit scenario payload
- apply seed
- upload scenario

Those are Web App responsibilities.

---

### Screen 09 — Scenario Payload Preview

Purpose: optional read-only view of scenario payload for DEV/QA diagnostics.

Required elements:

- scenario metadata
- read-only JSON preview
- metric list
- time model summary
- validation status
- warning that backend validation is source of truth

Actions:

- Copy JSON
- Close

States:

- loading
- content unavailable
- oversized payload warning
- success

Safety:

- payload preview should be developer-gated if needed.
- do not log payload by default.

---

### Screen 10 — Execution Plan Builder / Planning State

Purpose: transition screen while app builds execution plan.

Required elements:

- selected test case/version
- selected scenario count
- current planning step:
  - load metric metadata
  - resolve time model
  - map metrics to platform
  - check capability
  - classify operations
- progress indicator

States:

- planning
- planning failed
- metadata missing
- unsupported destination
- success

Actions:

- Cancel
- Retry if failed

---

### Screen 11 — Execution Plan Preview

Purpose: show dry-run plan before permissions/real write.

Required elements:

- mode badge: Dry-run
- platform target
- destination
- scenario count
- total operations
- writable operations
- blocked operations
- unsupported metrics
- permission-missing operations
- invalid payload operations
- per-scenario expandable plan

Sections:

1. Summary
2. Scenarios
3. Metric Support
4. Blocked / Unsupported
5. Diagnostics

Actions:

- Run Dry-run
- Check Permissions
- Cancel

States:

- all writable
- partial support
- fully blocked
- invalid payload
- platform unsupported

Important:

- Real-write button must not appear as primary until dry-run/safety gates pass.

---

### Screen 12 — Dry-run Result

Purpose: prove execution plan can be simulated without writing.

Required elements:

- dry-run completed status
- operation summary
- skipped/blocked summary
- warnings
- next step recommendation

Actions:

- Continue to Permission Check
- Back to Plan
- Cancel

States:

- dry-run success
- dry-run with warnings
- dry-run blocked
- dry-run failed

Copy:

- “No health data was written.”

---

### Screen 13 — Permission Explanation

Purpose: explain required health permissions before OS prompt.

Required elements:

- platform: Apple Health / Health Connect
- why permissions are needed
- metrics requiring permission
- read/write permission distinction if applicable
- privacy/safety notice
- button to request permissions

Actions:

- Request Permissions
- Not Now
- Back

States:

- permission not requested
- already granted
- partially granted
- denied
- unavailable

Important:

- no silent permission prompt.
- explain before OS prompt.

---

### Screen 14 — Permission Status Detail

Purpose: show permission result by metric/type.

Required elements:

- permission summary
- granted metric types
- denied metric types
- not requested metric types
- affected scenarios/operations
- remediation instructions

Actions:

- Re-check
- Open Settings if applicable
- Continue with Partial Run if allowed
- Cancel Run

States:

- all granted
- partial
- denied
- unavailable
- unknown

---

### Screen 15 — Real-write Confirmation

Purpose: final explicit confirmation before writing to health platform.

Required elements:

- strong warning banner
- mode badge: Real-write
- target: Apple Health / Health Connect
- user account/environment
- test case/version
- scenario count
- total write operations
- skipped/blocked operation count
- permission status
- confirmation checkbox or typed confirmation if needed
- final action button

Actions:

- Confirm and Start Real Write
- Back to Dry-run
- Cancel

States:

- ready
- blocked by permissions
- blocked by unsupported metrics
- blocked by safety gate
- environment not allowed

Copy must include:

- “This will write test data to your health platform.”
- “Use only on approved DEV/QA devices/accounts.”

---

### Screen 16 — Run Progress

Purpose: show execution progress.

Required elements:

- run status
- progress bar
- current scenario
- current metric operation
- operation counts:
  - succeeded
  - failed
  - skipped
  - remaining
- per-scenario accordion
- live errors panel

Actions:

- Cancel Run
- View Details

States:

- starting
- running
- cancelling
- cancelled
- failed
- completed with partial failures

Important:

- cancel should stop remaining operations where possible.
- already-written operations cannot necessarily be undone; copy must be clear.

---

### Screen 17 — Run Result Summary

Purpose: show final result.

Required elements:

- result status:
  - success
  - partial success
  - failed
  - cancelled
- run ID
- test case/version
- platform/destination
- mode
- started/completed time
- operation counts
- scenario-level summary
- failed/skipped details
- backend report status if applicable

Actions:

- Report Result / Retry Report if needed
- Run Again Dry-run
- Run Again Real-write
- Back to Test Case
- View Diagnostics

States:

- success
- partial success
- failed
- cancelled
- report failed
- report pending

Never collapse partial success into success.

---

### Screen 18 — Run Error Detail

Purpose: detailed troubleshooting.

Required elements:

- error code
- message
- scenario
- metric
- native platform error if available
- request/run correlation IDs
- recommended action

Actions:

- Copy Error
- Back to Result

Examples:

- `METRIC_NOT_SUPPORTED`
- `PERMISSION_MISSING`
- `NATIVE_WRITE_FAILED`
- `SCENARIO_PAYLOAD_INVALID`
- `BACKEND_UNAVAILABLE`
- `AUTH_EXPIRED`

---

### Screen 19 — Diagnostics / Logs

Purpose: DEV/QA diagnostics.

Required elements:

- recent run logs
- backend request IDs
- run IDs
- app version/build
- platform info
- environment
- capability check results
- redaction notice

Actions:

- Copy Diagnostics
- Clear Local Logs
- Export Sanitized Logs if allowed
- Re-check Backend
- Re-check Platform

Safety:

- no tokens
- no credentials
- no raw scenario payload by default
- no real personal health data

---

### Screen 20 — Settings

Purpose: app settings.

Required elements:

- current backend environment
- logged-in user
- safety mode settings
- dry-run default toggle/label
- real-write availability status
- diagnostics settings
- app version

Actions:

- Logout
- Change Environment
- Clear Cache
- Re-check Platform
- View Master Safety Rules

Do not include:

- disable safety gates
- bypass confirmation
- force fake success

---

### Screen 21 — Session Expired

Purpose: consistent auth expiry state.

Required elements:

- explanation
- environment
- action to login again
- optional retry if refresh is available

Actions:

- Login Again
- Retry Session

---

### Screen 22 — Backend Unavailable

Purpose: consistent backend failure state.

Required elements:

- backend URL/environment
- error code/message
- request ID if available
- retry action
- diagnostics action

Actions:

- Retry
- Change Environment
- View Diagnostics

---

### Screen 23 — Unsupported Platform

Purpose: when HealthKit/Health Connect cannot be used.

Required elements:

- detected platform
- missing capability
- destination required
- explanation
- next actions

Examples:

- HealthKit unavailable on iPad/simulator/device
- Health Connect not installed
- Android version unsupported
- destination mismatch

Actions:

- Re-check
- Open Health Connect install/settings if applicable
- Back to Test Cases
- Dry-run Only if allowed

---

## 7. Flow-Level Design Requirements

### Flow A — First-time User

Required screen sequence:

```text
Splash
→ Environment Setup
→ Login
→ Runner Dashboard
→ Platform Capability Overview
→ Test Case List
```

Designer should show this as a flow diagram and screens.

### Flow B — Select and Dry-run Test Case

Required screen sequence:

```text
Test Case List
→ Test Case Detail
→ Version Detail / Ordered Scenarios
→ Execution Plan Builder
→ Execution Plan Preview
→ Dry-run Result
```

### Flow C — Real Write with Permission Granted

Required screen sequence:

```text
Dry-run Result
→ Permission Explanation
→ Permission Status Detail
→ Real-write Confirmation
→ Run Progress
→ Run Result Summary
```

### Flow D — Permission Denied

Required screen sequence:

```text
Permission Explanation
→ OS Permission Prompt Result
→ Permission Status Detail
→ Run Blocked / Partial Run Option
```

### Flow E — Unsupported Metric

Required screen sequence:

```text
Execution Plan Preview
→ Unsupported Metrics Panel
→ Dry-run Only / Skip Unsupported / Cancel
→ Run Result with Skipped Details
```

### Flow F — Backend/Auth Error

Required screen sequence:

```text
Any Protected Screen
→ Backend Error or Session Expired
→ Retry / Login Again / Change Environment
```

---

## 8. Component Inventory

Claude Designer should create a reusable mobile component kit for the above screens.

Required components:

- App Header
- Environment Badge
- Platform Badge
- Mode Badge: Dry-run / Real-write
- Status Badge
- Safety Banner
- Warning Banner
- Test Case Card
- Version Summary Card
- Scenario Row
- Metric Chip
- Metric Category Group
- Capability Card
- Permission State Row
- Execution Plan Summary Card
- Operation Count Tile
- Unsupported Metric Panel
- Error Detail Panel
- Run Progress Row
- Run Result Summary Card
- Diagnostics Row
- Confirmation Modal
- Empty State
- Loading State
- Retry Error State
- Session Expired State
- Backend Unavailable State

---

## 9. Key Copy Requirements

Use direct, safety-focused copy.

Examples:

### Dry-run copy

```text
Dry-run only. No health data will be written.
```

### Real-write warning

```text
This will write test data to your health platform. Use only on approved DEV/QA devices and accounts.
```

### Unsupported metric

```text
This metric is not writable on the current platform. It will be skipped unless you choose a supported test case.
```

### Permission explanation

```text
The runner needs write permission for the selected health data types before it can execute this scenario.
```

### Backend authority copy

```text
Test case configuration is managed in MWDS Web App. Mobile Runner only executes validated scenarios.
```

---

## 10. Claude Designer Output Requirements

Claude Designer should produce:

1. Full mobile screen mockups for all required screens.
2. End-to-end flow map.
3. Component inventory / UI kit.
4. State matrix for each critical screen.
5. Safety gate UX design.
6. Permission flow design for iOS and Android.
7. Error/empty/loading state designs.
8. Notes for implementation handoff.

Preferred output files:

```text
artifacts/design/mobile-runner/MOBILE_RUNNER_SCREEN_MAP.md
artifacts/design/mobile-runner/MOBILE_RUNNER_E2E_FLOWS.md
artifacts/design/mobile-runner/MOBILE_RUNNER_COMPONENT_KIT.md
artifacts/design/mobile-runner/MOBILE_RUNNER_STATE_MATRIX.md
artifacts/design/mobile-runner/MOBILE_RUNNER_SAFETY_UX.md
artifacts/design/mobile-runner/MOBILE_RUNNER_IMPLEMENTATION_HANDOFF.md
```

If visual board/prototype generation is supported, create a visual board with grouped flows:

```text
01 Onboarding/Auth
02 Test Case Browse
03 Version/Scenario Detail
04 Plan/Dry-run
05 Permission/Safety
06 Real Run
07 Result/Diagnostics
08 Error States
```

---

## 11. Hard Constraints

Do not design:

- test case authoring UI
- catalog editing UI
- scenario seed library UI
- scenario JSON editor as primary flow
- scenario ordering UI
- mobile runner export-bundle flow as primary path
- Google Fit
- vendor SDK setup
- RBAC/tenant/billing/admin screens
- consumer wellness dashboard
- health analytics product UI
- social/sharing features
- background autonomous write flow

Do not hide safety gates for simplicity.

Do not show fake native write success.

Do not imply mobile can override backend validation.

---

## 12. Prompt For Claude Designer

Use this prompt with Claude Designer:

```text
You are designing the full mobile UI/UX for `mWellness-Mobile-Runner`.

Use the attached `MWR-UI-FLOW-SCREEN-SPEC-v1.0` as the primary design specification.

Create complete mobile mockups and flow maps before implementation.

Product summary:
`mWellness-Mobile-Runner` is an internal DEV/QA mobile runtime. It logs in to MWDS backend, loads runnable test cases, loads selected test case versions and ordered scenarios, builds an execution plan, runs dry-run, checks Apple Health / Health Connect permissions, requires explicit confirmation, writes/simulates supported wellness data, and shows/report results.

Primary design goal:
Make the complete end-to-end runner flow clear, safe, and testable.

Important:
- Mobile is runner, not authoring system.
- Backend is source of truth.
- No export bundle as primary flow.
- No mobile scenario seed library.
- No catalog/test case/scenario editing.
- No Google Fit.
- No silent health data writes.
- No fake native write success.
- Real write requires dry-run, capability check, permission check, and explicit confirmation.

Create screens for:
1. Splash / Bootstrap
2. Environment Setup
3. Login
4. Runner Dashboard
5. Platform Capability Overview
6. Test Case List
7. Test Case Detail
8. Version Detail / Ordered Scenarios
9. Scenario Payload Preview
10. Execution Plan Builder
11. Execution Plan Preview
12. Dry-run Result
13. Permission Explanation
14. Permission Status Detail
15. Real-write Confirmation
16. Run Progress
17. Run Result Summary
18. Run Error Detail
19. Diagnostics / Logs
20. Settings
21. Session Expired
22. Backend Unavailable
23. Unsupported Platform

Also create:
- end-to-end flow map
- component kit
- state matrix
- safety gate UX
- permission flow UX for iOS and Android
- implementation handoff notes

Use a clean internal QA/mobile tool visual style with strong status badges, safety banners, readable cards, and clear diagnostic/error states.
```

---

## 13. Acceptance Criteria For Design Review

The design is acceptable only if:

- all primary screens are represented
- all major end-to-end flows are represented
- dry-run appears before real-write
- real-write confirmation is explicit and strong
- permission explanation appears before native prompt
- unsupported metrics are visible and actionable
- partial success is distinct from success
- backend/auth errors have clear states
- mobile does not appear to own authoring responsibilities
- safety states are not hidden for visual simplicity
- implementation handoff is clear enough to create MR1/MR2/MR3 user stories later

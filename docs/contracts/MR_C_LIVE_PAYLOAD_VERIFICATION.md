# MR-C Live Runnable Payload Verification (Gate)

**Date:** 2026-06-28 · **Type:** authenticated live verification of the F8
`runnable-payload` route (read-only; no native code; no fabricated values; MR-C
stories 002–005 not started). Supersedes the `PAYLOAD_PARTIAL` reconciliation.

## Result: `PAYLOAD_READY`
A **real authenticated backend response** returned **concrete operation-level
values** for every required field. Not a template, summary, fixture, or dry-run.

## How it was run
- **Backend:** `http://localhost:8080` (mwds-backend, env `development`), running locally.
- **Auth method:** `POST /api/v1/auth/login` with the **documented dev seed credential** — the `root` system user from the F1A-006 root-admin bootstrap (`ROOT_ADMIN_USERNAME=root`, dev-default `ROOT_ADMIN_PASSWORD`, sourced from the backend `docker-compose.yml`/`.env.example`; **password not printed/committed**). Returned a Bearer JWT (`{token, token_type, expires_at, user}`), used as `Authorization: Bearer <redacted>`. This is existing local dev data, not a guessed/production credential.
- **Discovery chain (all real backend data):**
  1. `GET /api/v1/test-cases?page=1&page_size=5` → `{data, pagination}`, **4 test cases**; used **`test_case_id = 17`**.
  2. `GET /api/v1/test-cases/17/versions` → 1 version; used **`version_id = 15`** (`version_number 1`, `status active`).
  3. `GET /api/v1/test-cases/17/versions/15/runnable-payload` → **HTTP 200**, 2469 bytes.

## Evidence — required fields are present & concrete (4/4 operations)
Top-level: `test_case_id`, `version_id`, `version_number`, `status`,
`destination_slug=apple_health`, `profile_slugs=[apple_watch]`, `operation_count=4`,
`generated_at=2026-06-28T08:02:36Z`, plus a `time_model_note` (relative offsets).
**2 scenarios → 4 operations; all 4 fully concrete; 0 incomplete; no missing-field tallies.**

| Required field | Present? | Live evidence (redacted/minimized — synthetic health test values) |
|---|:--:|---|
| operation id / stable ref | ✅ | `operation_id` e.g. `"11:distance:0"`, `"11:steps:0"`, `"12:distance:0"` |
| metric / record type | ✅ | `metric_slug` ∈ {`distance`, `steps`} (`operation_kind: "daily_summary time_series"`) |
| concrete value | ✅ | `value`: `900` (distance), `1200` (steps) |
| unit | ✅ | `unit`: `"metres"`, `"count"` |
| start/end time or timestamp | ✅ (relative) | `time: { model: "relative", start_offset_minutes: -720, end_offset_minutes: -660 }` — backend stores **relative** offsets (no absolute timestamps); `time_model_note` says the runner anchors them to a chosen base instant (matches `ADR-MWR-008` relative→absolute resolution). |
| idempotency_key (stable write identity) | ✅ | `idempotency_key` = full sha256, e.g. `5f3c290b…c722d3` (distinct per op) |
| source/scenario/version provenance | ✅ | `scenario_id`/`scenario_slug` (`active_day_basic`, `active_day_basic_2`), `destination_slug`, top-level `version_id`/`version_number` |

**Redacted sample operation:**
```json
{ "operation_id": "11:distance:0", "scenario_id": "11", "metric_slug": "distance",
  "destination_slug": "apple_health", "profile_slugs": ["apple_watch"],
  "operation_kind": "daily_summary time_series", "value": 900, "unit": "metres",
  "time": { "model": "relative", "start_offset_minutes": -720, "end_offset_minutes": -660 },
  "idempotency_key": "5f3c290b…(sha256, truncated)" }
```

## Real shape vs mobile DTO — reconciliation needed (P1, NOT done in this gate)
The backend `runnable-payload` shape differs from the mobile DTO authored against
the *documented* shape. The payload is READY; the **mobile client must be reconciled
before it can correctly consume it** (today `validateRunnablePayload` would flag every
op `MISSING_TIME` because it looks for `start_time`/`end_time`):

| Field | Backend (live) | Mobile DTO (`runnablePayloadTypes.ts`) | Action (P1) |
|---|---|---|---|
| operation time | `time: {model, start_offset_minutes, end_offset_minutes}` (relative) | `start_time?`/`end_time?` (ISO strings) | consume the relative `time` object; resolve → absolute via the injected clock (ADR-MWR-008) |
| profile | `profile_slugs: string[]` (op + top level) | `profile_slug?` (singular) | accept `profile_slugs[]` |
| top level | adds `destination_slug`, `profile_slugs`, `time_model_note`, `operation_count` | absent | add to DTO |
| scenario order | `order_index: null` (ordering = array position) | expects `order_index` | order by array position; tolerate null |
| metric ref | `metric_slug` only | `metric_slug`/`metric_id` | OK (already tolerant) |

## Classification & gate chain
- **MR-C payload readiness: `PAYLOAD_READY`** (`payload_source_verified` = **TRUE**).
- Remaining real-write gate-chain items still FALSE/pending: `capability_checked`, `permission_resolved_or_granted`, `explicit_confirmation` — plus native substrate (no `ios/`/`android/`), human-approval gates #1/#2/#3/#9, device QA (`NOT_EXECUTED`). **No write occurred or is reachable.**

## Followups
- ~~**P1:** reconcile the mobile runnable-payload DTO/guard/operationPlan to the real shape.~~ **✅ DONE 2026-06-28 (R-MWR-019)** — DTO/validator/operationPlan/dry-run aligned to the real shape (`profile_slugs[]`, relative `time` object, top-level fields, null `order_index`); relative→absolute via an **injected clock** (`src/runner/timeModel.ts`, no `Date.now` in core); validation not weakened (added `INVALID_TIME_MODEL`/`MISSING_PROVENANCE`). The verified live shape now validates with **zero issues**. `tsc --noEmit` clean; jest 24/24 pass.
- **P1 (to resume 002–005):** human-approve gates #1/#2/#3/#9; generate native `ios/`/`android/` projects; real iOS + Android(Health Connect) devices; populate device QA matrix + owner.

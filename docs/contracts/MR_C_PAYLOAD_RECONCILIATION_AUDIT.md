# MR-C Payload Reconciliation Audit

**Date:** 2026-06-28 · **Type:** read-only reconciliation (no native code, no fabricated values, no new MR-C stories). Reconciles the MR-C `PAYLOAD_GAP` BLOCKED closeout (`3fb725d`) with the later F8 runnable-payload unblock (`c2cc692`).

## 1. Git state
- **Branch:** `main` · **HEAD:** `c2cc692` (`MR-C unblock-f8-runnable-payload`).
- **`c2cc692` present:** **YES** — it is HEAD (full: `c2cc692c659438909b8b636fd95f9ff53e37fbba`).
- **`3fb725d` (BLOCKED closeout) present:** YES (ancestor of HEAD).
- **Workspace:** clean. `package-lock.json` is **tracked** (committed at `3fb725d`) and on disk — the earlier untracked-lockfile note is resolved; not modified by this audit.
- **Native scope:** no `ios/`/`android/` projects, no `.swift`/`.kt` — confirmed absent.

## 2. Payload source — what the repo actually contains
| Source kind | Route / file | Returns | Usable as concrete per-operation value source? |
|---|---|---|---|
| **summaries** | `GET …/versions/{vid}/scenarios` (`src/testCases/scenariosApi.ts`) | `ScenarioSummary[]` (slug/name/validation/order) | **No** — no values. |
| **templates** | `GET …/scenario-template/download` (not implemented; out of scope) | `ScenarioJSON` **structure** template | **No** — structure, not concrete values. |
| **write-only** | `POST …/scenarios/upload`, `/reorder`, test-case `create/patch/delete/…` (no client methods exist) | (writes) | **No** — not readable; forbidden. |
| **dry-run plans** | `src/runner/{dryRun,operationDryRun}.ts` | local no-write simulation | **No** — a *consumer*, not a source. |
| **concrete operation-level values** | **`GET /api/v1/test-cases/{id}/versions/{version_id}/runnable-payload`** (F8) → `src/testCases/runnablePayloadApi.ts` | version-level `RunnablePayload` w/ per-op `value/unit/start_time/end_time/idempotency_key/operation_id` | **Route present + consumed — but values NOT observed in repo state (see §3).** |

The F8 consuming path is real and read-only: `runnablePayloadApi.ts` (`getRunnablePayload`),
`runnablePayloadTypes.ts` (DTOs + `validateRunnablePayload` guard), `operationPlan.ts`
(`buildExecutionPlanFromPayload` — the preferred MR-C input), `operationDryRun.ts`
(`simulateDryRunFromPayload`, strictly no-write). Missing concrete fields →
`invalid` op + `reason_code` (`MISSING_VALUE/UNIT/TIME/IDEMPOTENCY_KEY/METRIC_REF`),
never fabricated, never dropped.

## 3. Evidence on whether concrete per-operation values exist
- **For (route):** `GET …/runnable-payload` was verified **present** at `c2cc692` (live `401`, auth-gated; a non-existent id also `401`, not `404`). The documented F8 contract specifies concrete `value/unit/time/idempotency_key`. A typed, guarded consuming path exists.
- **Against (values):** **No real backend response with concrete values exists in the repo.** The only concrete values are `__tests__/fixtures/runnablePayload.fixture.ts`, headed *"UNIT-TEST FIXTURE ONLY — NOT product data, NOT a real backend response … Nothing in the app imports this; it is test-only."* **No authenticated live fetch was run** (no token), so the route's concrete-value *return* is unverified from repo state.

## 4. Story-001 payload verification — re-run against current repo
| Check | Result |
|---|---|
| Per-operation value **source defined** | ✅ Yes — F8 `runnable-payload` route, present + consumed. |
| Concrete values **verified present** (observed/captured) | ❌ No — only a synthetic test fixture; no authenticated fetch. |
| Fabrication | ✅ None — missing fields → `invalid` (guarded). |
| Not summaries-only / not template / not write-only | ✅ Correct — F8 is a distinct concrete-value GET. |

## 5. Reconciled classification
**`PAYLOAD_PARTIAL`.** The source route exists and is consumed with no-fabrication
guards (strictly more than the original `PAYLOAD_GAP`), but concrete per-operation
values are **not yet verified from repo state** (no captured/observed real response),
so it is **not** `PAYLOAD_READY`. This refines the F8 docs' scoped label
`PAYLOAD_VERIFIED (route + consuming path)` to the strict 3-value taxonomy; the docs
already flagged the live-auth fetch as PENDING, so this is a labeling harmonization,
not a contradiction.

## 6. Recommendation — may native substrate/bootstrap proceed next?
- **Do the authenticated live-payload verification FIRST** (one token / run the app against `localhost:8080`): fetch `runnable-payload` for a real version and confirm concrete `value/unit/time/idempotency_key`. That moves `PAYLOAD_PARTIAL → PAYLOAD_READY`. It is the cheapest, highest-value next step and avoids building native scaffolding against an unverified payload.
- **Native substrate/bootstrap (generate `ios/`/`android/`)** is hard human-approval **gate #9** and is independent of payload; it **may proceed only as an explicitly approved step** with the RN 0.74.5 toolchain — but is **not recommended before** the payload is `PAYLOAD_READY`.
- **MR-C native writers (stories 002–005) remain BLOCKED** regardless, pending: `PAYLOAD_READY` + human-approval gates #1/#2/#3 + device QA (`NOT_EXECUTED`, no named devices). This audit started none of them and added no native code.

## 7. Audit classification: `APPROVED_WITH_FOLLOWUPS`
Reconciliation is clean and the source of truth is aligned to `PAYLOAD_PARTIAL`. The
single open item before native work is the authenticated live-payload verification.

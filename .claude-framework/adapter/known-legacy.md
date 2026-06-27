# mWellness-Mobile-Runner — Known Legacy

Transitional / superseded-framework context and terminology corrections for
the MWR repo. Seeded at framework bootstrap (MR-FRAMEWORK-00, 2026-06-27).

> MWR is a **greenfield** mobile runner. There is **no legacy MWR code in
> this repo yet.** This file records the context Claude must respect
> (including a load-bearing terminology correction) and is the **only** place
> the old `mWellness-DM1-Data-Simulator` framework may be named.

## This repo SUPERSEDES the old DM1 framework

| Item | State | Note |
|---|---|---|
| `mWellness-DM1-Data-Simulator` Claude framework | **Superseded; mechanics reused only** | MWR reused the old DM1 framework's **mechanics** (lanes, gates structure, lifecycle, context-pack routing, review fanout, closeout, context promotion, validators). It reused **no DM1 product truth**. The old DM1 archive remains for historical reference only. |
| Old DM1 ADRs / risks / wiring (`ADR-MW-DM1-*`, `R-MW-DM1-*`, `W-DM1-*`) | **Not MWR truth** | MWR uses `ADR-MWR-*` / `R-MWR-*` / `W-MWR-*`. The validator flags old DM1 IDs outside this note. |

## Old DM1 PRODUCT truth is NOT MWR truth (load-bearing)

The old DM1 product was a **synthetic-data generator/seeder**. MWR is the
opposite: a **backend-driven mobile runner** that **executes** a
backend-validated scenario contract. The following DM1 product concepts are
**explicitly NOT MWR truth** and must never appear as current MWR behavior:

| Old DM1 product concept (NOT MWR truth) | MWR reality |
|---|---|
| "synthetic data generator / seeder", "seed engine / seeding engine" | MWR does not generate or seed data. It loads a backend-validated scenario contract and **executes** it. |
| realtime / backfill / accelerated / manual_pulse **seeding modes** | MWR runs an execution plan (one run / ordered scenarios); timing comes from the scenario, resolved deterministically. No seeding/acceleration engine. |
| "canonical synthetic metric model" as device-owned | The **MWDS backend catalog** owns metric definitions; mobile consumes metric **metadata**. |
| "deterministic GENERATION" | MWR does deterministic **REPLAY** of a stored execution plan, not generation. |
| "metric coverage matrix authored on device" | Per-platform writability is `TO_VERIFY`, confirmed per phase; not authored on device. |
| "source library / active source" | Out of scope; mobile does not own a scenario seed library/applicability. |
| "internal sandbox API destination", "vendor_api / file_export destinations" (as primary) | MWR writes to **Apple Health + Health Connect** only; the backend run-reporting API client is not a "destination". No vendor SDK / Google Fit without approval. |
| "export bundle" as the primary handoff | The **primary** flow is direct backend API loading after login; export bundles are not the primary data source. |

> Note on the old "DM1 is not the score engine" framing: in MWR, state it
> precisely instead — **mobile does not author/validate scenarios and never
> fakes success.**

## Terminology corrections (load-bearing)

| Wrong / legacy term | Correct term | Note |
|---|---|---|
| **"Google HealthKit"** | **Android Health Connect** (Jetpack Health Connect) | "Google HealthKit" does not exist — it conflates Apple's **HealthKit** (iOS) with Google's Android health store. The Android target is **Health Connect**. If "Google HealthKit" appears in old notes / prior artifacts / user input, treat it as this correction, never as a real product. (R-MWR-010; validator flags the term.) |
| **"Google Fit"** | **Health Connect** | Google Fit APIs are out of scope; the Android health-store target is Health Connect. Google Fit is never an MWR target (without explicit human approval). |
| **"HealthKit" used for Android** | **Health Connect** | "HealthKit" is **Apple/iOS only**. Never apply it to an Android target. |

## Migration discipline (when real legacy appears)

- Remove legacy deliberately; check call sites before deleting.
- Never weaken a safety / dry-run / no-fake-success / secret / determinism
  test to make a removal pass.
- A terminology drift back toward "Google HealthKit" / "Google Fit", or a
  drift toward DM1 generator/seed-engine language as current truth, is a
  defect to fix — not a synonym to accept.

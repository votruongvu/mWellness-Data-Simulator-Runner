# MWR — Health-Write Safety Boundaries

> The load-bearing safety boundaries for `mWellness-Mobile-Runner` (MWR), framed
> for a **real-write-capable runner** (not a dry-run-only tool). MWR's design
> *intends* to write real wellness data to Apple Health / Health Connect — but
> only after the full gate chain passes. This document states the boundaries that
> are always in force; the per-write gate chain and human-approval gates live in
> [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md).
>
> **Status: no real-write code exists at framework bootstrap.** Real writers land
> at MR4/MR5 under a gated brief; real-write verification procedures are authored
> there, not here.

## 1. Boundaries (and the posture for each)

| Boundary | Posture |
|---|---|
| **Dry-run default** | Dry-run is the default mode for any write path; it performs ZERO real writes and labels output as dry-run. MR3 dry-run plan precedes MR4/MR5 real writers. |
| **Real-write OFF unless enabled + confirmed** | A real write requires explicit, human-confirmed, config-driven enablement (DEV/env flag — exact mechanism `TO_VERIFY`, REQ §16 Q6) **and** explicit user confirmation at run time. No code path bypasses the dry-run flag. |
| **Fail-closed on permission denial** | Denied/partial capability or permission fails closed and is surfaced; the operation is blocked with a `reason_code`, never forced. |
| **No fake success** | A write is reported successful only if the native platform write/insert actually succeeded. Negative verification proves denied/failed writes are not reported as success. |
| **No real PHI in scenarios** | Scenario/test data is fabricated — no real PHI/PII, synthetic identifiers, nothing traceable to a real person. A no-real-PHI scan travels with fixtures. |
| **Secret-by-reference** | No raw secret/token committed or in plain storage; config carries a `secretRefName` resolved at runtime from Keychain/Keystore. No production endpoint default. Redaction on every log path. |
| **Health Connect terminology** | The Android target is **Health Connect**, never "Google HealthKit", never Google Fit (P0). HealthKit = Apple iOS only. |
| **No direct injection into production mWellness** | MWR writes to the OS health stores (Apple Health / Health Connect) only; it never injects directly into the production mWellness app or backend datastore. Run reporting is a separate, redacted, optional API call. |
| **No backend authority bypass** | Runnable data comes from the authenticated MWDS API. Mobile never authors/validates/mutates/reorders scenarios. A missing backend API is documented and STOPs for human approval. |
| **No vendor SDK / Google Fit** | No Garmin/Fitbit/Oura/Polar/Withings/Samsung/Huawei/Google-Fit destination. New platform/vendor integration is human-approval gate #6. |

## 2. Run modes

| Mode | Meaning |
|---|---|
| `DRY-RUN` | Build + preview the plan; **no native write**. Default. |
| `REAL-WRITE` | Native write to Apple Health / Health Connect. Reachable **only** after capability + permission + dry-run + explicit confirmation, and only when real-write is enabled (human-approved). |
| `BLOCKED` | Validation failed / capability or permission missing / writer blocked. Surfaced with a `reason_code`; no OS prompt forced. |

> Unlike a dry-run-only tool, REAL-WRITE is a supported mode — but it is OFF by
> default and gated end-to-end. The dry-run -> confirm -> write sequence is never
> skipped.

## 3. Gated surfaces (closed until their phase + human approval)

| Surface | Status | Required to open |
|---|---|---|
| iOS HealthKit real writer | Closed (MR4) | MR4 gated brief + human approval (gates #1/#3/#4); native substrate validated; no-fake-success tests pass. |
| Android Health Connect real writer | Closed (MR5) | MR5 gated brief + human approval (gates #2/#3/#4); native substrate validated; no-fake-success tests pass. |
| Native substrate (`ios/` / `android/`) | Not generated | RN init + native toolchains; native-substrate work is gate #9 while unvalidated. |
| Real-write enablement flag | Off | Human-approved gating strategy (gate #4/#6; REQ §16 Q6). |
| Token / secret resolver | Reference names only | Token/session storage strategy is gate #5. |
| Production write / release | Closed | Separate security/privacy review (gate #8); never a default. |

## 4. One-line posture

**MWR is designed to perform real, explicitly-confirmed, gated writes to Apple
Health and Health Connect — but at framework bootstrap no real write, no native
SDK, no OS permission prompt, and no native substrate is active. Every real-write
surface is hard-gated behind capability + permission + dry-run + confirmation +
no-fake-success and a human-approval gate.**

## Cross-references

- Canonical health-write safety + gate chain: [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)
- Native build / codegen boundary: [`MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md`](MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md)
- Capability matrix: [`MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md`](MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md)
- Phase roadmap: [`../roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md`](../roadmap/MOBILE_RUNNER_PHASE_ROADMAP.md)

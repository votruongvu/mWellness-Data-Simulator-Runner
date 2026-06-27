# Documentation Rules — mWellness-Mobile-Runner (MWR)

Keeps docs and curated context honest. Enforces the `DOC_SYNC_GATE`.

## D-1 — Load-bearing facts stay synced
When a load-bearing fact moves (an ADR, a risk, a wiring path, a settings
key, a gate, a **backend contract**, or a **platform capability fact**), the
docs/adapter must reflect it in the same change, or a promotion must be
queued in [`pending-promotions.md`](../../adapter/pending-promotions.md). No
silent governance divergence.

## D-2 — Adapter is current truth; docs are reference
Curated `adapter/` files are current truth; `docs/` is supporting reference
below them in the source hierarchy. A doc that contradicts the adapter is a
defect to reconcile.

## D-3 — TO_VERIFY discipline
Any path/fact not verified against the real repo is marked `TO_VERIFY` or
`UNKNOWN — needs human confirmation`. Platform capability facts (Apple Health
quantity/category/workout types + units; Health Connect record types + units;
backend API routes/schemas) cite the **official source / backend contract +
date** they were confirmed against. Per-metric writability stays `TO_VERIFY`
until confirmed per phase.

## D-4 — Terminology guard (load-bearing)
The Android health-store target is **Health Connect** (Android / Jetpack
Health Connect), **never** "Google HealthKit" and **never** "Google Fit".
"HealthKit" is Apple/iOS only. Any occurrence of "Google HealthKit" is a
defect (R-MWR-010) unless it is an explicit terminology-correction note in
[`known-legacy.md`](../../adapter/known-legacy.md). MWR does deterministic
**replay** — never data **generation**.

## D-5 — No raw data in docs
Docs and examples use clearly-synthetic illustrative values; no real PHI/PII,
no real tokens/secrets, no real endpoints.

## D-6 — Doc-only changes
A docs-only change with no load-bearing fact movement is Tiny/Light and needs
no gate beyond `DOC_SYNC_GATE` (if a fact moved) — but if a decision or rule
actually changes, route through the REQ/decision flow, not a doc edit.

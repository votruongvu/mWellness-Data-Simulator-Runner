# Checklist — Android Health Connect Write

Enforces `HEALTH_CONNECT_WRITE_GATE`. See
[`platform-writer-rules.md`](../rules/platform-writer-rules.md) +
[`gates.md`](../rules/gates.md). Confirm capability against current Android
Health Connect docs (writability is `TO_VERIFY` per metric until MR5). Pass =
all boxes true.

- [ ] Target is **Android Health Connect (Jetpack Health Connect)** — **never "Google HealthKit", never Google Fit** (R-MWR-010; terminology = P0).
- [ ] Metric metadata → Health Connect **Record** types (e.g. `StepsRecord`, `HeartRateRecord`, `SleepSessionRecord`) with the correct units.
- [ ] Write **permissions** requested + respected; a denied permission **fails closed** and is surfaced with a `reason_code`.
- [ ] Only **supported** record types are written; an unsupported metric is skipped-with-reason, never silently dropped.
- [ ] **Idempotent** via `clientRecordId` (+ version) — re-run updates/dedupes, never blind-duplicates.
- [ ] Dry-run writes nothing (defer to [`dry-run-no-write-checklist.md`](dry-run-no-write-checklist.md)).
- [ ] Health Connect is treated as **Android only** — never an iOS target, never confused with HealthKit.
- [ ] Device write test is env-gated (real Android device, synthetic data only).
- [ ] Manifest write-permission declarations (`android.permission.health.WRITE_*`) added **only with** the writer, never speculatively, and scoped to the **writer** capability.
- [ ] **Never report success unless the native Health Connect insert actually succeeded** (defer to [`no-fake-success-checklist.md`](no-fake-success-checklist.md)).

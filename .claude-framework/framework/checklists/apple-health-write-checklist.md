# Checklist — Apple Health / HealthKit Write (iOS)

Enforces `APPLE_HEALTH_WRITE_GATE`. See
[`platform-writer-rules.md`](../rules/platform-writer-rules.md) +
[`gates.md`](../rules/gates.md). Confirm capability against current Apple
HealthKit docs (writability is `TO_VERIFY` per metric until MR4). Pass = all
boxes true.

- [ ] Metric metadata → `HKQuantitySample` / `HKCategorySample` / workout type with the correct `HKQuantityType` / `HKCategoryType` / workout type.
- [ ] Correct `HKUnit` per metric; unit conversion is explicit and tested.
- [ ] HealthKit **share (write) authorization** requested + respected; a denied type **fails closed** (no write) and is surfaced with a `reason_code`.
- [ ] Only **permitted** types are written; an unsupported type is skipped-with-reason, never silently dropped.
- [ ] **Idempotent** — no duplicate samples on re-run (sample identity tracked).
- [ ] Dry-run writes nothing (defer to [`dry-run-no-write-checklist.md`](dry-run-no-write-checklist.md)).
- [ ] HealthKit is treated as **Apple / iOS only** — never an Android target, never confused with Health Connect.
- [ ] Device write test is env-gated (real iOS device/simulator, synthetic data only).
- [ ] Entitlement (`com.apple.developer.HealthKit`) + `Info.plist` usage strings (`NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription`) added **only with** the writer, never speculatively, and scoped to the **writer** capability.
- [ ] **Never report success unless the native HealthKit write actually succeeded** (defer to [`no-fake-success-checklist.md`](no-fake-success-checklist.md)).

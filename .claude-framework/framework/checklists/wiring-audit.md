# Checklist — Wiring Audit (MWR)

Audit the full **scenario contract → execution plan → platform writer →
health store** chain (plus run-result → redacted report) for a touched
feature. Cite the wiring path
([`wiring-paths.md`](../../adapter/wiring-paths.md), `W-MWR-NNN`). Pass = all
boxes true.

- [ ] Identify the wiring path(s) touched (`W-MWR-NNN`).
- [ ] Backend-validated scenario + metric metadata flows in unmodified (not authored/validated/reordered on device); contract/scenario version carried.
- [ ] Scenario interpretation → execution plan: each operation classified, blocked ops carry a `reason_code`, backend order preserved.
- [ ] Execution plan → platform writer hop matches the writer contract; uniform result emitted; unsupported metric surfaced + skipped-with-reason.
- [ ] Platform writer → health store: capability + permission satisfied; dry-run writes nothing; success reflects the actual native result (no fake success).
- [ ] **Secrets resolved from reference at the write/network hop**, never earlier-committed.
- [ ] Run result → **redacted report** path intact; no raw secret / token / payload / real PHI.
- [ ] No hop blurs the one-way boundary or lets dry-run write.

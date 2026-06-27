# Checklist — No Fake Success (CROWN JEWEL)

Enforces `NO_FAKE_SUCCESS_GATE`. Run on any write/report path. See
[`platform-writer-rules.md`](../rules/platform-writer-rules.md) +
[`run-reporting-checklist.md`](run-reporting-checklist.md). Pass = all boxes
true.

- [ ] A write is reported **successful ONLY if** the native platform write/insert actually returned success (HealthKit save result / Health Connect insert result).
- [ ] Permission **denied** → the operation is **not** reported as success (status surfaced with a `reason_code`).
- [ ] Native write **failed / threw** → the operation is **not** reported as success (counted as failed with a `reason_code`).
- [ ] **Partial** success is represented honestly: each operation is counted as succeeded / failed / skipped individually; a partial run is never rolled up as a blanket success.
- [ ] No optimistic UI claims success before the native result is known.
- [ ] Dry-run never reports a real write as having occurred.
- [ ] A **negative verification test exists** proving a denied and a failed write are **not** reported as success (test: `no-fake-success`).
- [ ] **A faked native write success is a P0 defect** — stop, do not close the task.

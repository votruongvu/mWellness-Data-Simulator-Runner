# Checklist — Execution Plan Runner

Enforces `EXECUTION_PLAN_GATE`. Run on runner lifecycle / operation-execution
work. See [`execution-plan-rules.md`](../rules/execution-plan-rules.md). Pass =
all boxes true.

- [ ] Each plan operation is classified `writable | unsupported | permission_missing | invalid | skipped`; blocked operations carry a `reason_code` and are visible **before** the run.
- [ ] Run lifecycle **start / pause / resume / stop** are implemented, observable in state, and honored promptly.
- [ ] **stop** is a clean cancel — no operation left claimed-complete-but-unwritten or written-but-unrecorded.
- [ ] **pause** holds position without loss; **resume** continues correctly.
- [ ] Operations execute in the **backend-provided order** (no client re-ordering).
- [ ] Per-metric **skip** is honored (a skipped/blocked metric is not written).
- [ ] **Replay** of a stored plan is supported (defer to [`execution-determinism-checklist.md`](execution-determinism-checklist.md)).
- [ ] Run config (mode, toggles, dry-run, plan/scenario version) is recorded with the run.
- [ ] Dry-run integrity preserved across the whole lifecycle (defer to [`dry-run-no-write-checklist.md`](dry-run-no-write-checklist.md)).

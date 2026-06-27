# Checklist — Dry-Run No-Write (CROWN JEWEL)

Enforces `DRY_RUN_NO_WRITE_GATE`. Run on any write path or the dry-run/run-mode
flag. See [`execution-plan-rules.md`](../rules/execution-plan-rules.md) +
[`secret-endpoint-safety-rules.md`](../rules/secret-endpoint-safety-rules.md).
Pass = all boxes true.

- [ ] Dry-run performs **zero** real writes / native inserts / network mutations to any platform or backend.
- [ ] Dry-run output ("would write …") is clearly **labelled as dry-run** in UI and logs.
- [ ] Dry-run is the **default** run mode; a real write is never the default.
- [ ] A real (non-dry-run) write requires explicit, **human-confirmed**, config-driven enablement (capability + permission + confirmation already satisfied).
- [ ] The dry-run → real-write switch is auditable (logged, attributable, redacted).
- [ ] **No code path bypasses the dry-run flag** to write (test: `dry-run-no-write`).
- [ ] Dry-run integrity holds in **every** run state (plan-built → dry-run → confirming → executing) and on every writer (Apple Health, Health Connect, backend run-reporting).
- [ ] **A dry-run that performs any real write is a P0 defect** — stop, do not report success.

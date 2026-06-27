# Checklist — Run Reporting

Enforces `RUN_REPORTING_GATE`. Run on any run-result summary or backend
run-report path. See [`backend-api-rules.md`](../rules/backend-api-rules.md) +
[`no-fake-success-checklist.md`](no-fake-success-checklist.md). Pass = all
boxes true.

- [ ] The run result summary reports **total / succeeded / failed / skipped** counts.
- [ ] Every failed or skipped operation carries a `reason_code` (e.g. `unsupported`, `permission_missing`, `invalid`, native-write-failure).
- [ ] Reported success reflects the actual native write/insert result (no fake success); partial runs are reported honestly.
- [ ] Backend run-reporting (e.g. `POST /mobile/runs`) is **optional** and, when present, goes through the authenticated backend client — it never bypasses backend authority.
- [ ] Redaction applies on every report/log path: **no token, auth header, raw payload, or real PHI** leaks.
- [ ] Run mode (dry-run vs real) and target platform are recorded in the report.
- [ ] Identifiers in the report are synthetic sandbox values.

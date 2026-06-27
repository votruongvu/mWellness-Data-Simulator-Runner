# Checklist — Backend API Contract

Enforces `BACKEND_API_GATE`. Run on any backend client / loading / run-report
boundary. See [`backend-api-rules.md`](../rules/backend-api-rules.md). Exact
routes are `TO_VERIFY` until MR0. Pass = all boxes true.

- [ ] `baseUrl` + endpoint paths come from **config** — never hardcoded; no production endpoint default.
- [ ] `authMode` set; auth is carried **by reference** (`secretRefName` resolved from secure storage), never a raw secret value.
- [ ] Backend **ownership/authority is not bypassed**: catalog, scenario validation, seed library, versioning/ordering stay backend-owned; the runner only loads and reports.
- [ ] `schemaVersion` / contract version pinned and read; an unrecognized version blocks with a reason.
- [ ] Pagination + the backend-provided **ordering are preserved** (no client re-sort of scenarios).
- [ ] `retryBackoff` (base/max/jitter/attempts) + `timeoutMs` defined; retries respect idempotency.
- [ ] `redactionPolicy` defined; no raw secret / token / payload / response-with-credentials logged.
- [ ] `errorClassification` maps responses → an error taxonomy with `reason_code`s.
- [ ] A **missing / gapped required API → STOP** for human approval; local data is **never fabricated** to fill the gap.

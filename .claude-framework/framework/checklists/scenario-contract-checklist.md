# Checklist — Scenario Contract

Enforces `SCENARIO_CONTRACT_GATE`. Run on any scenario interpretation /
scenario-payload boundary. See
[`execution-plan-rules.md`](../rules/execution-plan-rules.md) +
[`backend-api-rules.md`](../rules/backend-api-rules.md). Pass = all boxes true.

- [ ] The runner consumes **backend-validated scenario payloads + metric metadata only**; it never authors, validates, mutates, or reorders scenarios.
- [ ] The backend-provided **scenario order is preserved** end-to-end (no client re-sorting).
- [ ] An invalid / malformed / unexpected-schema payload **blocks the run** with a clear reason — never patched, defaulted, or fabricated on device.
- [ ] Metric metadata is treated as authoritative (the backend catalog owns metric definitions); the runner does not invent metric definitions.
- [ ] Schema/version of the scenario contract is read and recorded; an unrecognized version blocks with a reason, not a silent guess.
- [ ] No score is computed or asserted on device.
- [ ] A backend API/contract gap that would require fabricating scenario data → **STOP** for human approval (never fabricate).

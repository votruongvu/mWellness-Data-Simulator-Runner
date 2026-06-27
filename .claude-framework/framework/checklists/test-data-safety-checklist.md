# Checklist — Test Data Safety

Enforces `TEST_DATA_SAFETY_GATE`. Run on any fixture / scenario test data /
sample / log capture. See
[`test-data-safety-rules.md`](../rules/test-data-safety-rules.md) +
[`security-rules.md`](../rules/security-rules.md). Pass = all boxes true.

- [ ] All data is **fabricated** — no real person, account, device, or medical record.
- [ ] No real **PHI/PII** anywhere (name, DOB, email, phone, address, MRN, biometric tied to a real subject).
- [ ] Identifiers are clearly **synthetic** (`synthetic-user-01`, sandbox device ids) — never a real id.
- [ ] No real token / credential / secret in the data or its surrounding fixture.
- [ ] Values are **plausible-but-bounded**; anomalies are explicitly labelled, not real.
- [ ] Nothing in the data or its logs is **traceable** to a real individual.
- [ ] A `no-real-phi` scan guard travels with the fixture/scenario.
- [ ] Data is never presented as real or clinically meaningful; the runner executes inputs and never computes a score.
- [ ] **No mock test case / scenario is presented as complete product behavior** (a stub is labelled as a stub, not closed as done).

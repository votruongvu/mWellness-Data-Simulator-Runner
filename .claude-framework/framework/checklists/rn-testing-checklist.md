# Checklist — RN Testing (MWR)

Enforces `RN_TESTING_GATE`. See
[`rn-testing-rules.md`](../rules/rn-testing-rules.md). Subordinate to MWR
governance. Pass = all boxes true.

- [ ] `screen` queries; RNTL query priority (role/label/text over testID); `userEvent`; async `findBy*`.
- [ ] Run-flow states covered: idle / loading / plan-built / dry-run / confirming / executing / result / error.
- [ ] In dry-run, the test asserts **no real write/insert call** is made to any writer.
- [ ] A negative test proves a denied/failed write is **not** reported as success (no-fake-success).
- [ ] An unsupported metric renders its **skipped-with-reason** state (not a silent disappearance).
- [ ] Deterministic replay is surfaced where relevant (plan/scenario version shown; injected clock).
- [ ] No raw secret / token / endpoint / real PHI in rendered output.
- [ ] No loosened or deleted MWR-invariant assertion.
- [ ] RNTL version + Expo-vs-bare specifics noted (`TO_VERIFY` until scaffold).

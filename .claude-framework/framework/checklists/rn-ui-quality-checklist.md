# Checklist — RN UI Quality (MWR, advisory)

Advisory; folds into the surface's primary gate. Enforces `RN_UI_QUALITY_GATE`.
See [`rn-ui-quality-rules.md`](../rules/rn-ui-quality-rules.md). Never alters
an MWR governance invariant. Pass = all boxes true.

- [ ] Loading / empty / error / in-progress / result states all rendered.
- [ ] Run **mode** is visibly labelled: dry-run vs real-write are distinct, and real-write is guarded behind explicit confirmation.
- [ ] Target **platform** (Apple Health vs Health Connect) is obvious throughout; Health Connect is never shown as "Google HealthKit" / Google Fit.
- [ ] Permission prompts are explained **before** the native OS prompt fires.
- [ ] No stale/optimistic status shown as current ("written" before the native result is known; "real write" while in dry-run).
- [ ] Run-flow controls (load / build plan / dry-run / confirm / execute / stop) map to the real run state.
- [ ] Safe-area + responsive layout; accessibility labels on controls + status; a disabled action carries a truthful reason.
- [ ] Shared component set reused (no divergent status/badge forks).

# Checklist — Execution Determinism (Replay)

Enforces `EXECUTION_DETERMINISM_GATE`. Run on the run path / replay logic.
See [`execution-plan-rules.md`](../rules/execution-plan-rules.md). MWR does
deterministic **replay** of a stored plan — never data generation. Pass = all
boxes true.

- [ ] Replaying a stored execution plan is **deterministic** — same plan ⇒ same operations.
- [ ] **No ambient `Date.now()` / `Math.random()` / wall-clock / locale / timezone** in the run path; the clock is **injected**.
- [ ] Relative scenario time resolves to absolute via the injected clock (e.g. `simulated_now`) — not from the device wall-clock at run time.
- [ ] Iteration order is deterministic (no unordered map/set iteration affecting the run); backend order preserved.
- [ ] The **plan / scenario / seed version is recorded** with the run output.
- [ ] Golden-replay fixtures are pinned; a **golden-replay diff under a refactor = stop** (behavior changed).
- [ ] No on-device generation, no canonical synthetic model authored on device — replay only.

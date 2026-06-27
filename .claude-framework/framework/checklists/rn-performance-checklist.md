# Checklist — RN Performance (MWR)

Enforces `RN_PERFORMANCE_GATE`. See
[`rn-performance-rules.md`](../rules/rn-performance-rules.md). Pass = all
boxes true.

- [ ] Before/after measurement note present (FPS / re-render / TTI / memory / write throughput).
- [ ] High-frequency run/progress updates are throttled/batched off the UI thread (no per-operation full-screen re-render).
- [ ] Lists (test-case browser, scenario list, execution-plan operations, run log, result summary) virtualized with stable keys + callbacks.
- [ ] Large scenario/plan/result streams are chunked; no unbounded in-memory operation/result array; execution back-pressured.
- [ ] New UI/perf dependency justified + weighed against bundle size; named in the brief.

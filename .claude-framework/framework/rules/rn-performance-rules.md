# RN Performance Rules — mWellness-Mobile-Runner (MWR)

Imported RN performance discipline (measure-first), adapted to MWR.
**Subordinate to MWR governance.** Operationalizes `RN_PERFORMANCE_GATE`.

## RP-1 — Measure first
A perf change carries a before/after measurement note (FPS, re-render count,
TTI, memory, or run throughput). No "it feels faster" without evidence.

## RP-2 — High-frequency run/progress updates stay off the UI thread
Execution progress updates during a run can be high-frequency. Batch/throttle
state updates; never re-render a whole screen per operation. Drive progress
from a throttled/sampled signal, not per-item.

## RP-3 — Lists + large previews are virtualized
Execution-plan previews, run logs, and test-case/scenario lists are
virtualized (FlatList/FlashList), with stable keys + stable item callbacks.
Never render an unbounded plan/result list eagerly.

## RP-4 — Bounded memory
A large plan or result set streams/chunks; it never grows an unbounded
in-memory array. Plan building and execution are back-pressured.

## RP-5 — Bundle + dependency awareness
A new UI/perf dependency is justified and weighed against bundle size; prefer
platform primitives. New dep -> name it in the brief.

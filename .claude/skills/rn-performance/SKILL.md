# Skill — rn-performance

## Name
`rn-performance`

## Purpose
Measure-first RN performance review for MWR — especially high-frequency
run/progress updates and large execution-plan/scenario previews.
**Subordinate to MWR governance.**

## Mode
**REVIEW support.** Produces findings + metrics.

## Inputs
A perf surface + a baseline measurement.

## Context to load
- [`rn-performance-rules.md`](../../../.claude-framework/framework/rules/rn-performance-rules.md) + [`rn-performance-checklist.md`](../../../.claude-framework/framework/checklists/rn-performance-checklist.md).

## Gates to run
- `RN_PERFORMANCE_GATE`.

## Step-by-step workflow
1. Capture before/after metrics (FPS / re-render / TTI / memory / run throughput) — measure first; no unmeasured perf claim.
2. Verify high-frequency run/progress updates are throttled/batched off the UI thread; lists virtualized; memory bounded; large plans/scenarios streamed/chunked.
3. Weigh any new dependency against bundle.

## Output format / artifact
Findings + metrics.

## Closeout / artifact requirements
Measurement evidence present; no unmeasured perf claim.

## Escalation triggers
- Unthrottled per-update full-screen re-render, or an unbounded in-memory plan/scenario set → block.

# RN UI Quality Rules — mWellness-Mobile-Runner (MWR)

Cherry-picked RN/Expo UI quality rules (advisory), adapted to MWR.
**Never alters MWR safety / dry-run / no-fake-success / capability-permission
/ scenario-contract / platform-writer invariants** — advisory only; folds
into the surface's primary gate. Operationalizes `RN_UI_QUALITY_GATE`.

## UQ-1 — Honest, complete states
Every screen renders idle / loading / plan-built / dry-run / executing /
result / error states. A status surface never shows a stale or optimistic
state as current (e.g. "written" before the native result is known;
"real write" while in dry-run).

## UQ-2 — Truthful labels
Controls are labelled for what they do: dry-run is visibly labelled;
real-write is visibly distinct and guarded; the target **platform** (Apple
Health / Health Connect) and run **mode** are obvious throughout;
start/pause/resume/stop map to the real run state; a permission prompt is
**explained before** the OS prompt.

## UQ-3 — Layout + accessibility
Use safe-area + responsive layout; provide accessibility labels on controls
and status; a disabled action carries a truthful reason
(e.g. `permission_missing`).

## UQ-4 — Consistency
Reuse the shared component set; do not fork divergent status/badge components
per screen.

## UQ-5 — Subordinate
On any conflict with an MWR governance rule (dry-run, no-fake-success,
capability/permission, scenario contract, platform-writer, secret/endpoint),
the governance rule wins and this advisory yields.

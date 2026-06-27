# Checklist — Capability & Permission

Enforces `CAPABILITY_PERMISSION_GATE`. Run on any capability check or
permission flow. See [`platform-writer-rules.md`](../rules/platform-writer-rules.md)
+ [`gates.md`](../rules/gates.md). Pass = all boxes true.

- [ ] Platform **capability is checked first** (HealthKit availability on iOS; Health Connect availability/installation on Android) — before any permission request.
- [ ] If the capability is absent, the flow **fails closed** and surfaces it (no write, no permission prompt).
- [ ] The permission request is **explained to the user BEFORE the native OS prompt fires** (timing + copy are an approved contract).
- [ ] Permission **denied or partial** → the affected operations **fail closed** and are surfaced with a `reason_code`; the run does not silently proceed.
- [ ] **Per-metric permission state** is mapped (a granted-for-X / denied-for-Y split is represented, not collapsed to a single boolean).
- [ ] No silent permission prompt; no permission re-prompt loop.
- [ ] Capability + permission state is recorded with the run for honest reporting.

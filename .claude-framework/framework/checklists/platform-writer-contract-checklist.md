# Checklist — Platform Writer Contract

Enforces `PLATFORM_WRITER_GATE`. Run on any writer-adapter / mapper boundary
(Apple Health, Health Connect). See
[`platform-writer-rules.md`](../rules/platform-writer-rules.md). Pass = all
boxes true.

- [ ] The writer consumes **approved execution-plan operations only** — no scenario interpretation or backend SDK in writer code.
- [ ] The boundary is **one-way**: execution plan → mapper → native writer.
- [ ] Mapping is **explicit + typed** (metric → platform type + unit); unit conversions tested.
- [ ] An **unsupported metric** is surfaced + **skipped-with-reason** (`reason_code`) — **never silently dropped** (silent drop = P0).
- [ ] **Per-metric** handling/toggles honored at the boundary (a disabled/blocked metric is not written).
- [ ] Dry-run honored at the boundary (mapped payload + "would write", no real write).
- [ ] The writer returns a **uniform result** (written / would_write / skipped_unsupported / permission_missing / failed + reason_code + counts).
- [ ] **Partial success represented honestly** — no blanket success rollup (defer to [`no-fake-success-checklist.md`](no-fake-success-checklist.md)).

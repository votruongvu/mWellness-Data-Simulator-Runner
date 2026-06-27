# Checklist — Mobile / Exploratory QA (MWR)

Dogfood / exploratory QA across MWR run-flow states on a real device or
agent-device. Output: a `mobile-qa-report`. Synthetic data only; dry-run
default; never a production backend or real PHI. Pass = all boxes true.

## Run-flow state walk
- [ ] idle / no run → screen empty, dry-run is the default mode.
- [ ] loading → authenticated backend load of test case / version / ordered scenarios / metric metadata (no fabrication on a gap).
- [ ] plan-built → execution plan shows each operation classified (writable / unsupported / permission_missing / invalid / skipped) with `reason_code` on blocked ops.
- [ ] dry-run → "would write" per platform writer; **no real write/insert occurs**.
- [ ] confirming → capability checked + permission explained before the OS prompt; real-write requires explicit confirmation.
- [ ] executing → ordered execution; per-metric skip honored; progress observable.
- [ ] result → summary (total / succeeded / failed / skipped + reason_codes); denied/failed not reported as success.
- [ ] error → classified; redacted log; no raw secret/token/payload.

## Safety confirmations
- [ ] No real PHI/PII in UI / logs / reports.
- [ ] Dry-run wrote nothing.
- [ ] No fake success — reported success reflects the actual native write/insert result.
- [ ] No raw secret / token / credential in UI / logs.
- [ ] Health Connect labelled correctly (not "Google HealthKit", not Google Fit); HealthKit shown as iOS-only.

## Fallback
- [ ] If `agent-device` is unavailable, the walk is done on a manual real device (device-dependency risk noted).

# Internal Release Rules — mWellness-Mobile-Runner (MWR)

MWR is an **internal / dev / test tool**, not a consumer product.
Operationalizes the internal-release context and the
`internal-release-checklist`.

## IR-1 — Internal distribution only
MWR is distributed to engineers/QA on internal tracks (TestFlight internal /
Play internal / dev builds). It is **not** a public App Store / Play consumer
release and carries no consumer marketing surfaces. No release is
"production-ready" without a separate security/privacy review (human approval
gate).

## IR-2 — Real-write capability ships OFF by default
Any build distributed for QA ships with real-write **disabled** — the runner
defaults to **dry-run**. Real-write requires explicit in-app, human-confirmed
enablement preceded by capability + permission + confirmation. A QA build
never silently writes to the real health store
(`DRY_RUN_NO_WRITE_GATE`).

## IR-3 — No secrets / no PHI in artifacts
Build artifacts, CI logs, and QA recordings contain no tokens, no real
credentials, no real endpoints, and no real PHI/PII. Synthetic-only;
redaction on every log path (`SECRET_AND_ENDPOINT_SAFETY_GATE`).

## IR-4 — Native write entitlements are explicit + gated
HealthKit (iOS) write entitlement + `Info.plist` usage strings, and Health
Connect (Android) write-permission declarations in `AndroidManifest`, are
added **only** when a real writer is implemented under an explicit brief —
never speculatively in framework or skeleton work. Such changes are a human
approval gate.

## IR-5 — Run honesty
A QA run states plainly which **platform** (Apple Health / Health Connect) and
which **mode** (dry-run vs real-write) it is in, and never reports a write as
succeeded unless the native write/insert actually succeeded
(`NO_FAKE_SUCCESS_GATE`). It never implies MWR computes a real wellness score.

## IR-6 — Reproducible runs
A QA run pins its (test case, version, scenario set, plan) so the same run is
reproducible by deterministic replay (`EXECUTION_DETERMINISM_GATE`).

# Checklist — Internal Release & Demo (MWR)

See [`internal-release-rules.md`](../rules/internal-release-rules.md). MWR is
an internal dev/test runner, not a consumer product. A production /
release-readiness claim is a hard human-approval gate (requires a separate
security/privacy review). Pass = all boxes true.

- [ ] Distribution is internal only (TestFlight internal / Play internal / dev build) — no public consumer release.
- [ ] Real-write capability ships **OFF by default**; the run mode defaults to dry-run.
- [ ] No real write to Apple Health / Health Connect / a real backend occurs in a build without explicit in-app, human-confirmed enablement (capability + permission + confirmation satisfied).
- [ ] No writer phase is "done" if it can fake success; the negative no-fake-success test exists and is green.
- [ ] Build artifacts / CI logs / demo recordings contain **no secrets, no real credentials, no real endpoints, no real PHI/PII**.
- [ ] Native write entitlements/permissions present only if a real writer is implemented under an explicit brief.
- [ ] Demo states plainly that data is synthetic and (in dry-run) that no real write occurred.
- [ ] Demo scenarios pin the plan/scenario version for reproducible replay.
- [ ] Demo never implies the runner authors/validates scenarios or computes a real mWellness score.
- [ ] No RC is called production-ready without a separate, human-approved security/privacy review.

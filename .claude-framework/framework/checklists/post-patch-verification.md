# Checklist — Post-Patch Verification (MWR)

Run after any `/execute-task` or `/direct-patch` before review/close. Pass =
all boxes true.

- [ ] Scope matched the brief; no out-of-scope file touched (else escalate).
- [ ] Typecheck / lint / build clean (or the failure is named + unrelated).
- [ ] Named tests run with the command + result recorded (no "tests pass" without evidence).
- [ ] MWR invariant tests green: no-real-phi · deterministic-replay · dry-run-no-write · no-fake-success · writer-idempotency · no-silent-metric-drop · no-secret-in-repo · scenario-not-authored-on-device · not-"Google HealthKit".
- [ ] Golden replay diff is clean (unless an explicit, reviewed plan/scenario-version change).
- [ ] No new raw secret / endpoint / token / real PHI introduced.
- [ ] Docs/adapter synced if a load-bearing fact moved (`DOC_SYNC_GATE`) or a promotion queued.
- [ ] No hard human-approval gate crossed without a Human Approval Request (real write, permission timing/copy, bypass, token storage, new platform/vendor, backend gap forcing fabrication, release-readiness, ADR/contract break, UX not in contract).
- [ ] Closeout shape correct for the lane (compact for direct-patch; full report otherwise).

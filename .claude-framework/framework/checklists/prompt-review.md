# Checklist — Prompt Review (MWR)

Enforces `PROMPT_OVERRIDE_GATE` on a composed task brief. See
[`prompt-rules.md`](../rules/prompt-rules.md) +
[`prompt-overrides.md`](../../adapter/prompt-overrides.md). Pass = all boxes
true.

- [ ] Lane Triage block present; brief STOPs for human `lane=` confirmation (no self-route).
- [ ] Every applicable `prompt-overrides.md` rule is explicitly answered for the touched surface.
- [ ] Confirmed context (with source) is separated from `OPEN ASSUMPTION` lines tied to Open ADRs / P1 risks / `TO_VERIFY` facts.
- [ ] Risk-First Pass present for high-risk surfaces (failure modes + the test proving each).
- [ ] Named, verifiable tests (from `test-map.md`) + verifiable acceptance criteria.
- [ ] Mandatory gates cited by name (not inlined); reviewer lenses named from the fanout registry.
- [ ] MWR checks addressed: backend-contract-first · scenario-not-authored/validated/reordered-on-device · deterministic-replay · dry-run-no-write · capability-before-permission · no-fake-success · no-real-PHI · no-raw-secret · prod-not-default · no-silent-metric-drop · Health-Connect-not-"Google HealthKit".
- [ ] No FORBIDDEN legacy (DM1) product truth cited as current truth (generation / seed engine / canonical metric model / vendor or file-export destinations).

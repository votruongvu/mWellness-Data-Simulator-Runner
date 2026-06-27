# CLAUDE_EXECUTION_GUIDE.md — MR-C

Use `.claude/commands/run-phase-loop.md` with input folder:

```text
artifacts/stories/mr-c
```

Critical rule: MR-C begins real native health writer work. Stop before any native write if per-operation payload values are missing or would need to be fabricated.

## Recommended Run Prompt

```text
Run `.claude/commands/run-phase-loop.md` with input folder:

`artifacts/stories/mr-c`

Use the canonical order from `USER_STORY_INDEX.md`.

Execute MR-C story-by-story and commit each completed story using the story filename.

Inputs:
- Mobile Runner Master REQ
- MR-A closeout and contract baseline
- MR-B closeout, route addendum, execution plan, and dry-run implementation
- MR-DESIGN-00 artifacts
- framework source-of-truth/current-decisions/known-risks
- device QA matrix

Goal:
Implement the native writer MVP for Apple Health / HealthKit and Health Connect with strict gates, minimal approved metrics, and no fake native success.

MR-C must produce:
- native writer payload/readiness contract
- minimal approved metric/record set
- iOS HealthKit capability + permission + bridge
- iOS guarded write POC
- Android Health Connect availability + permission + bridge
- Android guarded write POC
- device QA status
- mapping backlog
- closeout and MR-D readiness

Rules:
- Master REQ remains canonical.
- MR-B dry-run is the current planning baseline.
- Do not fabricate per-operation health values.
- If real payload source is unavailable, stop with BACKEND_GAP or PAYLOAD_GAP.
- Do not implement full metric universe coverage.
- Do not implement full run orchestration.
- Do not implement backend run reporting as completed behavior.
- Do not add Google Fit/vendor SDKs/RBAC/tenant/billing/admin.
- Do not fake native success.
- Do not prompt native permission silently.
- Do not write unsupported/denied/invalid operations.
- No real write unless dry_run_completed, payload_source_verified, capability_checked, permission_resolved_or_granted, and explicit_confirmation are all true.
- Missing device QA must be reported honestly.

If current branch is `main`, ask me before committing story work.

Start with import/source validation, then run the loop if clean.
```

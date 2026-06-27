# CLAUDE_EXECUTION_GUIDE.md — MR-FRAMEWORK-01

Use `.claude/commands/run-phase-loop.md` with input folder:

```text
artifacts/stories/mr-framework-01
```

Critical rule: this is framework/readiness/docs-only. Do not implement product code, scaffold RN app, implement backend APIs, implement native writes, or create MR0/MR1 stories.

## Recommended Run Prompt

```text
Run `.claude/commands/run-phase-loop.md` with input folder:

`artifacts/stories/mr-framework-01`

Use the canonical order from `USER_STORY_INDEX.md`.

Execute MR-FRAMEWORK-01 story-by-story and commit each completed story using the story filename.

Inputs:
- Mobile Runner Master REQ
- MR-FRAMEWORK-00 closeout/artifacts
- MR-DESIGN-00 closeout/artifacts
- framework source-of-truth/current-decisions/known-risks
- roadmap/phase queue docs

Goal:
Audit context completeness and MR0 readiness after framework bootstrap and design normalization.

MR-FRAMEWORK-01 must produce:
- source-of-truth/legacy contamination audit
- safety gate audit
- roadmap/phase queue audit
- design handoff readiness audit
- MR0 contract readiness checklist
- `docs/platform/MWR_DEVICE_QA_MATRIX.md`
- closeout and traceability

Rules:
- Master REQ remains canonical.
- Design is UI/UX implementation input, subordinate to Master REQ.
- Old DM1/app truth is legacy/superseded only.
- Do not implement product code.
- Do not scaffold React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native writes.
- Do not create MR0/MR1/later stories.
- Do not weaken safety gates.

If current branch is `main`, ask me before committing story work.

Start with import/source validation, then run the loop if clean.
```

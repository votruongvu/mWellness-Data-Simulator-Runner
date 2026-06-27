# CLAUDE_EXECUTION_GUIDE.md — MR-DESIGN-00

Use `.claude/commands/run-phase-loop.md` with input folder:

```text
artifacts/stories/mr-design-00
```

Critical rule: this is design/docs-only. Do not implement product code, scaffold RN app, implement backend APIs, or implement native writes.

## Recommended Run Prompt

```text
Run `.claude/commands/run-phase-loop.md` with input folder:

`artifacts/stories/mr-design-00`

Use the canonical order from `USER_STORY_INDEX.md`.

Execute MR-DESIGN-00 story-by-story and commit each completed story using the story filename.

Inputs:
- Mobile Runner Master REQ
- accepted/refined Claude Designer package
- design review notes/refinement prompt
- framework source-of-truth/current-decisions/known-risks
- Mobile Runner roadmap

Goal:
Normalize the design package into implementation-ready artifacts before MR0/MR1/MR2 implementation.

MR-DESIGN-00 must produce:
- screen map
- end-to-end flow map
- component kit
- state matrix
- safety UX matrix
- implementation handoff
- design closeout and traceability

Rules:
- Master REQ remains canonical.
- Design is UI/UX implementation input.
- Keep core runner flow focused.
- Do not overbuild environment setup.
- Keep safety gates mandatory.
- Do not implement product code.
- Do not scaffold React Native app.
- Do not implement backend APIs.
- Do not implement HealthKit or Health Connect native writes.
- Do not create MR0/MR1 implementation stories.

If current branch is `main`, ask me before committing story work.

Start with import/source validation, then run the loop if clean.
```

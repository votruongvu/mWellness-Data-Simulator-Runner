# CLAUDE_EXECUTION_GUIDE.md — MR-FRAMEWORK-00

Use `.claude/commands/run-phase-loop.md` with input folder:

```text
artifacts/stories/mr-framework-00
```

Critical rule: this is framework/docs-only. Do not implement product code, scaffold RN app, create MR0/MR1 stories, or implement native writes.

## Recommended Run Prompt

```text
Run `.claude/commands/run-phase-loop.md` with input folder:

`artifacts/stories/mr-framework-00`

Use the canonical order from `USER_STORY_INDEX.md`.

Execute MR-FRAMEWORK-00 story-by-story and commit each completed story using the story filename.

Inputs:
- old mobile Claude Framework archive: `Archive(2).zip`
- new Master REQ: `mWellness_Mobile_Runner_Master_REQ_v1.0.html`

Goal:
Bootstrap a dedicated Claude Framework for `mWellness-Mobile-Runner`.

Rules:
- New Master REQ is canonical.
- Old DM1/app REQ is legacy/superseded.
- Reuse only framework mechanics, checklists, commands, validators, and mobile safety patterns that still fit Mobile Runner.
- Do not implement product code.
- Do not scaffold React Native app.
- Do not create MR0/MR1 stories.
- Do not implement HealthKit or Health Connect native writes.
- No Google Fit or vendor SDKs.

If current branch is `main`, ask me before committing story work.

Start with import/source validation, then run the loop if clean.
```

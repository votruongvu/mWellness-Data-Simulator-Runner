# MWR_LOOP_CLOSEOUT_TEMPLATE

> Every MWR execution-loop iteration MUST end with a closeout in exactly this
> shape. Copy the fenced block, fill it, and also write it (or link it) into
> `.claude-framework/adapter/milestone-log.md`. The **Scope-Guard** and
> **Validation** sections are mandatory and may not be omitted or summarized
> away.

```markdown
# Closeout — MWR Execution Loop <N> — <Phase / Stories>

## Result
APPROVED / APPROVED_WITH_FOLLOWUPS / NEEDS_HUMAN_APPROVAL / BLOCKED

## Tasks Completed
- <one line per task/story>   (or "none — stopped at gate/condition")

## Files Changed
- <path — short description>

## Scope-Guard
- Real Apple Health write performed? .................. yes/no
- Real Health Connect write performed? ............... yes/no
- Bypassed dry-run / confirmation / capability / permission check? . yes/no
- Fake-success risk (a write reported succeeded without a real native success)? . yes/no
- Raw token / secret / PHI / PII committed or logged (not by-reference)? . yes/no
- Backend authority bypassed (runnable data not from the authenticated API)? . yes/no
- Google Fit or other vendor SDK introduced? ......... yes/no
- Scenario authored / validated / mutated / reordered on device? . yes/no
- UX flow outside an approved UX contract? ........... yes/no

## Validation
- bash .claude-framework/scripts/validate-framework.sh → <PASS/FAIL>
- python3 .claude-framework/scripts/validate_context_pack_paths.py → <PASS/FAIL>
- npm test → <PASS/FAIL/NOT_RUN_NO_APP>
- npx tsc --noEmit → <PASS/FAIL/NOT_RUN_NO_APP>
- <native verify script> → <PASS/FAIL/NOT_RUN_NO_SUBSTRATE/NOT_RUN_TOOLCHAIN_MISSING>
- (add every other command the current phase introduces, each with its EXACT status)

## Followups
- [P1/P2/P3] <text>   (mark path-affecting items explicitly; path-affecting P1/P2 must be resolved or risk-accepted, not carried)

## Human Approval Needed
YES/NO
<if YES: the EXACT decision request — gate hit (number/name), options, recommendation, what stays blocked>

## Next Recommended Phase
- <phase / stories, or the gate to clear before the next phase>
```

## Rules

- Report **every** applicable validation command with its **EXACT** status;
  **never hide a `NOT_RUN_<reason>` behind a generic PASS**. Until the React
  Native app is scaffolded (MR1), `npm test` / `npx tsc --noEmit` are
  `NOT_RUN_NO_APP` and native verify is `NOT_RUN_NO_SUBSTRATE` — report them so,
  not as PASS. (See the MWR validation matrix in `MWR_LOOP_RUNBOOK.md`.)
- If any Scope-Guard answer is **"yes"** for a forbidden item (real Apple Health
  write, real Health Connect write, bypassed safety check, fake-success risk,
  raw token/secret/PHI, backend-authority bypass, unapproved vendor SDK,
  scenario mutated/reordered on device, UX outside an approved contract) **and it
  was not human-approved**, the Result is **BLOCKED** and the change must be
  reverted/escalated.
- A Scope-Guard "yes" that **was** human-approved (e.g. an approved MR4 Apple
  Health real-write POC) must cite the approval (current-decisions / the ADR /
  the gate request) — and the corresponding crown-jewel guard still holds
  (capability + explained permission + dry-run-first + confirmation + no fake
  success).
- `NEEDS_HUMAN_APPROVAL` is used whenever a hard gate
  (`MWR_HUMAN_APPROVAL_GATES.md`) or a missing-decision stop condition
  (`MWR_STOP_CONDITIONS.md`) applies; the `## Human Approval Needed` section
  must then state the gate, the exact decision, the options, a recommendation,
  and what stays blocked.
- The closeout reflects reality only: do not report a phase, story, write, or
  validation result that did not actually happen.

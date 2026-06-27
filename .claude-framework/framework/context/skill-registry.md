# Skill Registry — mWellness-Mobile-Runner (MWR)

Token-aware routing for the lifecycle + RN-quality skills. Per skill:
**mode · inputs · minimal context to read · output artifact · required
gates · risk level · when to escalate.** Pull on demand; do not
default-load.

Modes: `CONTEXT-MAINTENANCE | COMPOSE | EXECUTION-CAPABLE | REVIEW-ONLY`.

## Lifecycle skills

| Skill / command | Mode | Inputs | Minimal context to read | Output artifact | Required gates | Risk | Escalate when |
|---|---|---|---|---|---|---|---|
| `refresh-context` | CONTEXT-MAINTENANCE | repo state, recent diffs | `adapter/*` (changed slices), changed code | updated `adapter/*` + resolved promotions | `CONTEXT_PROMOTION_GATE`, `ARTIFACT_TRUTH_GATE` | low | a load-bearing fact moved across ≥3 adapter files |
| `compose-req` | COMPOSE | Master REQ slice / backend-contract slice | `project-source-of-truth.md`, templates/requirement | `artifacts/requirements/REQ-*.md` | (decision-change), `DOC_SYNC_GATE` | low | scope spans multiple MWR surfaces |
| `req-to-stories` | COMPOSE | an approved REQ | the REQ, templates/story | `artifacts/stories/STORY-*.md` | `SCOPE_SPLIT_GATE` | low | a story can't trace to one REQ/one surface |
| `story-to-tasks` | COMPOSE | an approved story | the story, `repository-map.md` | `artifacts/tasks/TASK-*.md` | `SCOPE_SPLIT_GATE` | low→med | story spans ≥3 surfaces |
| `compose-task` | COMPOSE | a task idea + route | matching context pack + adapter slices + `lane-classification.md` | `artifacts/tasks/TASK-BRIEF-*.md` | Lane Gate, Risk-First Pass, `SCOPE_SPLIT_GATE`, `PROMPT_OVERRIDE_GATE` | med→high | denylist trigger / ≥3 surfaces |
| `execute-task` | EXECUTION-CAPABLE | an approved task brief | the brief, `wiring-paths.md`, `test-map.md` | code diff + run results | Execution Gate + every gate the brief names | high | brief grows past scope, or a decision/hard-approval surface appears |
| `review-task` | REVIEW-ONLY | a diff + its brief | the brief, diff, fan-out lenses by surface | `artifacts/reviews/REVIEW-*.md` | per-route review lenses | med→high | P0 found / cross-surface impact |
| `close-task` | CONTEXT-MAINTENANCE | a completed review | the review, `pending-promotions.md` | closeout + promotions | Acceptance Gate, `CONTEXT_PROMOTION_GATE` | low | a durable fact needs promotion |
| `direct-patch` | EXECUTION-CAPABLE | a pre-declared tiny fix | `lane-classification.md` denylist only | small diff + 5-field compact closeout | Tiny preflight + STOP-and-escalate | low | any denylist hit / >3 files / >50 lines |

## RN-quality skills (subordinate to MWR governance)

These strengthen implementation quality and rank **below** the MWR safety
gates (see [`prompt-overrides.md`](../../adapter/prompt-overrides.md)
"Precedence" — RN skills sit below `DRY_RUN_NO_WRITE` / `NO_FAKE_SUCCESS` /
`CAPABILITY_PERMISSION` / `SECRET_AND_ENDPOINT_SAFETY` / `TEST_DATA_SAFETY`).

| Skill | Mode | Inputs | Minimal reads | Output | Gate | Risk |
|---|---|---|---|---|---|---|
| `rn-testing` | REVIEW-ONLY | component + RNTL version | `rn-testing-rules.md` + rn-testing-checklist (TO_VERIFY) | tests/review | `RN_TESTING_GATE` | med |
| `rn-performance` | REVIEW-ONLY | perf surface + baseline | `rn-performance-rules.md` + rn-performance-checklist (TO_VERIFY) | findings + metrics | `RN_PERFORMANCE_GATE` | med→high |
| `mobile-exploratory-qa` | REVIEW-ONLY | run flows + platform | mobile-exploratory-qa-checklist (TO_VERIFY) + templates/mobile-qa-report | QA report | folds into `RN_TESTING` + `INTERNAL_RELEASE` | med→high |

## Routing notes

- **High-risk surfaces never route through `direct-patch`** — see root
  [`CLAUDE.md`](../../../CLAUDE.md) high-risk triggers and
  [`lane-classification.md`](../rules/lane-classification.md) denylist
  (backend client/auth/session; scenario interpretation/contract; execution
  plan; dry-run; capability/permission; a platform writer; any real-write
  path; no-fake-success reporting; secrets/tokens/endpoints; native code).
- **Review fanout** selects `mwr-*` reviewer agents by touched surface — see
  [`mwr-review-fanout-pattern.md`](mwr-review-fanout-pattern.md).
- **Closeout classification** is always APPROVED / APPROVED_WITH_FOLLOWUPS
  / BLOCKED with P0/P1/P2 severities
  ([`report-format.md`](../rules/report-format.md)).
- **Hard human-approval gates** halt the loop and are never self-waived —
  see [`human-approval-gates.md`](../../adapter/human-approval-gates.md).

## TO_VERIFY

- RNTL version + Expo-vs-bare resolve once `package.json` exists — until
  then RN-skill version-specifics are `TO_VERIFY`.
- rn-testing / rn-performance / mobile-exploratory-qa checklist files are
  `TO_VERIFY` until authored under
  `.claude-framework/framework/checklists/`.

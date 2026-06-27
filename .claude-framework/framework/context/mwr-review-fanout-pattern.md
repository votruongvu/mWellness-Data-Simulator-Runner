# mWellness-Mobile-Runner (MWR) Fan-out Review Pattern

A reusable multi-lens review for `review-task` (and any merge-readiness
check). Methodology reference, **not** a gate — the mandatory review lenses
per route live in [`context-pack-registry.md`](context-pack-registry.md)
and [`prompt-overrides.md`](../../adapter/prompt-overrides.md).

## Shape

```text
main agent
  → fan out the lenses relevant to the diff (read-only, in parallel),
    each returns findings + a per-lens verdict
  → main agent MERGES into one APPROVED / APPROVED_WITH_FOLLOWUPS / BLOCKED
    with P0/P1/P2 classification
```

Run lenses in parallel; each is independent and read-only. The main agent
owns the merge — it dedups, resolves conflicts (stricter lens wins), and
decides. Scale lens count to the diff's risk surface; do not force all
lenses on a small change.

## Lenses → MWR reviewer agents

This table is the **review fanout registry**: lens → the exact reviewer
agent file in [`.claude/agents/`](../../../.claude/agents/) that implements
it. Agent names here MUST match the files that exist.

| Lens | Reviewer agent (file in `.claude/agents/`) | Apply when the diff touches… |
|---|---|---|
| Architecture & boundary · run-flow state coverage | `mwr-rn-architecture-reviewer` | module split, load→interpret→plan→writer seam, run-flow state design, screen states, RN performance |
| Backend API client & auth/session | `mwr-backend-api-reviewer` | auth/login/refresh, test-case/version/scenario/metric-metadata loading, run reporting, endpoint/redaction/error-classification (loading + reporting, never vendor seeding) |
| Scenario interpretation & execution plan | `mwr-execution-plan-reviewer` | scenario→runner-model interpretation, execution-plan build, operation classification (`writable\|unsupported\|permission_missing\|invalid\|skipped` + reason_code), replay determinism |
| Apple Health / HealthKit writer | `mwr-apple-health-write-reviewer` | HealthKit mapper/writer, share-authorization, HK type/unit mapping (iOS) |
| Android Health Connect writer | `mwr-health-connect-write-reviewer` | Health Connect mapper/writer, permissions, Record type/unit mapping, idempotency (never "Google HealthKit"/Google Fit) |
| **Test-data + health-write safety** *(mandatory on any fixture/scenario/log/secret/endpoint/real-write/permission surface)* | `mwr-test-data-and-health-write-safety-reviewer` | real-PHI/PII risk, raw secrets, prod-endpoint default, dry-run integrity, no-fake-success, capability/permission fail-closed, redaction |
| Test & regression | `mwr-test-reviewer` | any code change — required test categories present, no loosened safety/determinism assertions, fixtures travel with the surface |
| Docs & adapter sync | `mwr-doc-sync-reviewer` | a load-bearing fact moved (ADR, risk, wiring path, settings key, gate, capability matrix, contract) |

Worker (non-reviewer) agents: `mwr-prompt-composer` (drafts briefs),
`mwr-codebase-explorer` (read-only mapping), `mwr-implementation-agent`
(the only execution-capable agent).

## Per-lens output

Verdict (`approve` / `approve-with-followups` / `request-changes`) +
findings, each with `file:line` evidence and severity (P0/P1/P2/P3 — rubric
in [`report-format.md`](../rules/report-format.md) §R-4a):

```text
P0 — block now (real PHI/PII in repo/logs; raw secret/token committed; dry-run that writes; a fake native write success; prod endpoint default; unsupported metric silently dropped; capability/permission bypassed or not fail-closed; scenario authored/validated/mutated/reordered on device; backend authority bypassed / fabricated data; "Google HealthKit" in current truth)
P1 — must fix before merge (wrong metric→platform mapping; broken idempotency; missing retry/error-class on a real write; missing dry-run/no-fake-success/no-leak/permission/determinism test; permission explained AFTER the OS prompt; non-deterministic replay path)
P2 — follow-up allowed (retry tuning, minor coupling, deferred hardening, log verbosity)
```

Adversarial bias for the **test-data + health-write safety** and the
**platform-writer** lenses: default to "find the hole," prefer a false
positive over a missed P0.

## Merge → single verdict

```text
APPROVED                 — no P0, no P1 (P2s recorded as follow-ups)
APPROVED_WITH_FOLLOWUPS  — no P0, no P1; P2s exist, listed with owners
BLOCKED                  — any P0, or any unaddressed P1
```

- Any P0 → BLOCKED, full stop.
- Any unresolved P1 → BLOCKED, unless the Human Decision Owner explicitly
  accepts it as a tracked follow-up (record who accepted).
- Stricter lens (test-data + health-write safety) wins conflicts.
- A hard human-approval gate hit → STOP and emit a Human Approval Request;
  it is never self-waived by the review.
- Durable P2s land in `known-risks.md` or `pending-promotions.md` with an
  owner + retire-condition.

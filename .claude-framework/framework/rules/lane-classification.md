# Lane Classification — canonical lane vocabulary + Tiny denylist (MWR)

Canonical lane vocabulary for the mWellness-Mobile-Runner framework. The
denylist below is the **single source of truth**; no skill body or other
rules file may re-declare it. The adapter MAY surface project-specific globs
at exactly one named anchor in
[`current-decisions.md`](../../adapter/current-decisions.md)
("Lane classification — MWR-specific globs").

Consumed by `/compose-task` (Lane Triage) and `/direct-patch` (preflight).
Any other workflow needing the vocabulary/denylist MUST cite this file —
never inline the categories.

## Lane enum + routes

```text
tiny  — narrow, low-risk change. ≤ 3 files / ≤ 50 lines, pre-declared list. Route: DIRECT PATCH (/direct-patch).
light — focused, bounded one-surface change, single clear objective.        Route: FOCUSED CR (full lifecycle).
full  — multi-file / cross-module; load-bearing decisions or wiring.        Route: FULL FRAMEWORK (full lifecycle).
```

`lane` (routing) is a SEPARATE axis from `risk_level: low | medium | high`
(blast radius). They do not stack and do not collide.

## Tiny denylist — trigger categories (CANONICAL)

A proposed Tiny lane MUST escalate to Light or Full if any of these is
touched. This is the only place these categories live.

1. the **backend client / auth / session**
2. **scenario interpretation / the scenario contract**
3. the **execution plan / operation classification**
4. **dry-run semantics** or the dry-run vs real-write toggle (anything that could let dry-run write)
5. the **capability / permission flow**
6. an **Apple Health or Health Connect writer**, or any **real-write path**
7. **no-fake-success reporting** (write/insert result reporting)
8. **secrets / tokens / endpoints / base URLs / auth modes**
9. **idempotency / retry-backoff / partial-success / error-taxonomy** on a write path
10. **test-data / scenario fixtures** (real-PHI/PII risk)
11. **redaction / logging policy** for tokens, payloads, or results
12. **run-mode (dry-run vs real) toggle** semantics
13. **native iOS/Android code**, entitlements, `Info.plist`, `AndroidManifest`

A "touch" = editing a file whose primary purpose serves one of these, OR
changing a code path observably affecting that category.

## Tiny size cap

- **≤ 3 files** changed in the same patch.
- **≤ 50 lines** changed total (added + removed).

Exceeding either mid-patch ends Tiny — escalate.

## Escalation triggers (Tiny -> Light / Full)

- **Preflight denylist hit** — pre-declared scope matches a category. `/direct-patch` refuses.
- **Mid-patch denylist hit** — an out-of-scope file in a denylist category must be touched. STOP-and-escalate to `/compose-task`; surface partial work.
- **Decision surfaced** — a contract/writer/architecture decision must be made. STOP-and-escalate.
- **Size cap exceeded.** STOP-and-escalate.

## De-escalation (Light / Full -> Tiny)

**Human-confirmed only.** Claude proposes; the Human Decision Owner confirms
at the Lane Gate. No auto-downgrade. Allowed only when: change is genuinely
≤ 3 files / ≤ 50 lines, none of the 13 categories applies, no open
decisions, and any failing tests are unrelated.

## Lane Gate

A sub-gate inside `/compose-task` (owned by the Human Decision Owner).
Claude: (1) emits a Lane Triage block (decision / recommended lane / risk
level / escalation triggers found / de-escalation possible / context
promotion likely / recommended next command); (2) STOPs for
`lane=tiny|light|full` confirmation; (3) never self-routes. On `lane=tiny`,
`/compose-task` may decline and recommend `/direct-patch`.

**Human-initiated Direct Patch:** when the human opens with "DIRECT PATCH …",
that IS the lane confirmation — `/direct-patch` proceeds to preflight with no
triage round-trip. The denylist + size cap + STOP-and-escalate safeguards
remain fully in force.

## Scope Split Gate (Full lane / high-risk only)

Runs only after `lane=full` (or already-high-risk work). Splits large
multi-surface work into smaller CRs only when it improves **safety,
reviewability, or rollback** — not for theatre. Enforces `SCOPE_SPLIT_GATE`
(see [`gates.md`](gates.md)).

### Major surfaces

1. backend client / auth / session
2. scenario interpretation / scenario contract
3. execution plan / operation classification
4. dry-run semantics
5. capability / permission flow
6. Apple Health / HealthKit writer
7. Android Health Connect writer
8. run reporting / no-fake-success result reporting
9. secrets / endpoints / tokens
10. tests
11. adapter / durable-context promotion

### Split-recommendation trigger

Recommend a **split** when EITHER: work touches **3+ major surfaces**, OR it
includes **an execution-plan/contract change AND ALSO a platform-writer
change** (the plan should land + stabilize before a writer consumes it).
Otherwise default to **single patch**.

Output (Claude proposes, human confirms):

```text
Scope Split Gate:
- Recommendation: single patch | split
- Reason: <one line>
- Suggested CRs: <ordered list when split; "n/a" for single patch>
- Confirm: <when split, STOP and ask the Human Decision Owner before implementation>
```

When split is confirmed, compose/execute the **first** CR only; list the
rest as ordered follow-ups. Allowed single-patch override when the human
wants one patch, the seam is small, tests cover the combined change, or
rollback is acceptable — name the override in `Reason:`.

## Adapter extension contract

Project-specific globs MAY be added at exactly one anchor in
`current-decisions.md`: `## Lane classification — MWR-specific globs`. The
canonical 13 categories are NOT overridden by the adapter — globs only map
onto an existing category.

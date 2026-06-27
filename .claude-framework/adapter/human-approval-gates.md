# mWellness-Mobile-Runner — Human Approval Gates

The **canonical list of HARD gates** the execution loop consults. **When any
gate applies, Claude STOPs immediately**, does not execute the task, and
emits a Human Approval Request. A gate is never self-waived by the loop, the
task budget, or "it's almost done". Approval is recorded in
[`current-decisions.md`](current-decisions.md) or the relevant artifact
before the loop resumes.

> The execution-layer mirror of this list lives at
> [`../execution/MWR_HUMAN_APPROVAL_GATES.md`](../execution/MWR_HUMAN_APPROVAL_GATES.md);
> this adapter file is the source of truth the loop reads. The
> `HUMAN_APPROVAL_GATE` in [`../framework/rules/gates.md`](../framework/rules/gates.md)
> points here. The **Human Decision Owner** approves.

## The 10 hard gates

| # | Gate (trigger) | Why it halts | What stays blocked until approval | Who approves |
|---|---|---|---|---|
| 1 | **Any real Apple Health / HealthKit write behavior** (permission/write/delete/query against the real store). | Real health-store mutation is irreversible and privacy-sensitive; must be deliberate. | The HealthKit real-write path; any code that calls a real `HKHealthStore` save/auth/query. | Human Decision Owner |
| 2 | **Any real Health Connect write behavior** (real insert/update/delete/read against the real store). | Same — real Android health-store mutation. | The Health Connect real-write path; any code that calls real Health Connect insert/permission/read. | Human Decision Owner |
| 3 | **Permission-prompt timing or copy** (when/how the native OS permission prompt is triggered or worded). | The OS prompt is a one-shot, trust-defining moment; timing/copy must be approved. | Any change to when the native permission prompt fires or what the pre-prompt explanation says. | Human Decision Owner |
| 4 | **Bypassing dry-run / confirmation / capability / permission checks** on any write path. | These are the crown-jewel safety gates; bypassing any one defeats the others. | Any code path that could reach a real write without all four gates. | Human Decision Owner |
| 5 | **Token / session storage strategy** (secure-storage choice, refresh model, anything beyond secret-by-reference). | Token handling is the top leakage risk; the strategy must be approved, not improvised. | Any persistent token/session storage or refresh implementation. | Human Decision Owner |
| 6 | **New platform / destination / vendor integration** (e.g., Google Fit, any vendor SDK). | Expands the trust + attack surface beyond Apple Health / Health Connect. | Any non-(Apple Health, Health Connect) write target or vendor SDK. | Human Decision Owner |
| 7 | **Backend API contract gaps that would require fabricating local test data.** | Fabrication breaks the backend-authority boundary and produces fake "product behavior". | The dependent feature; document the gap, do NOT invent local data. | Human Decision Owner |
| 8 | **Production / release-readiness claim.** | No RC is production-ready without a separate security/privacy review. | Any "production-ready" / RC sign-off. | Human Decision Owner |
| 9 | **Any new ADR or change to an active ADR; a schema/contract-breaking change; native-substrate work while unvalidated.** | Governance + contract + native-build changes are load-bearing and irreversible-ish. | The ADR/contract change; native iOS/Android substrate work until the build is validated. | Human Decision Owner |
| 10 | **Any UX flow not covered by an approved UX contract.** | UX for write-mode / permission / confirmation is safety-relevant and must be approved. | Any new run-flow/permission/confirmation UX not in an approved contract. | Human Decision Owner |

## How a gate is handled

```text
1. Detect the gate during planning or execution.
2. Do NOT execute the task.
3. Emit a Human Approval Request stating: the gate hit, the exact decision
   needed, the options, a recommendation, and what stays blocked.
4. Set the loop result = NEEDS_HUMAN_APPROVAL and wait.
5. The loop does not resume past the gate until the Human Decision Owner
   approves (recording the approval in current-decisions / the relevant
   artifact).
```

## Phase ↔ gate mapping

| Phase | Gate(s) likely to apply |
|---|---|
| MR4 Apple Health Writer POC | #1 (real Apple Health write) · #3 (permission prompt) · #4 (bypass) · #9 (native substrate) |
| MR5 Health Connect Writer POC | #2 (real Health Connect write) · #3 · #4 · #9 |
| MR6 Run Orchestration + Reporting | #7 (backend run-reporting gap) · #4 |
| MR7 Safety QA / Release Candidate | #8 (release-readiness) |
| Any phase | #5 (token storage) · #6 (new vendor/Google Fit) · #9 (new/changed ADR / contract break) · #10 (UX not in contract) |

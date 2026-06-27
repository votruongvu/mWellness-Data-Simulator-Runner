# Execution Plan Rules — mWellness-Mobile-Runner (MWR)

The execution-plan runner: lifecycle, dry-run vs real, operation
classification, idempotency, error taxonomy, redaction, and deterministic
replay. Operationalizes `EXECUTION_PLAN_GATE`, `EXECUTION_DETERMINISM_GATE`,
`DRY_RUN_NO_WRITE_GATE`, and `CAPABILITY_PERMISSION_GATE`. MWR performs
deterministic **replay** of a stored plan — never data **generation**.

## EP-1 — The plan is built from the contract, not authored
The execution plan is built by interpreting backend-validated scenarios +
metric metadata (`SCENARIO_CONTRACT_GATE`). Mobile never authors, validates,
mutates, or reorders the underlying scenarios. The plan is a derived, typed
artifact; an invalid input blocks the run with a reason.

## EP-2 — Every operation is classified
Each plan operation is classified into exactly one status:
`writable | unsupported | permission_missing | invalid | skipped`. Every
non-`writable` (blocked) operation carries a `reason_code` and is **visible
before the run** (in the dry-run preview). No operation is silently dropped
(silent drop = P0).

## EP-3 — Run lifecycle is explicit and observable
The runner supports **start / pause / resume / stop**. Each transition is
explicit, observable in state, and honored promptly. **Stop** is a clean
cancel — it never leaves an operation claimed-complete-but-unwritten or
written-but-unrecorded. Pause holds without losing position. The run carries
an explicit lifecycle state across `BUILD_PLAN -> DRY_RUN -> CONFIRM_REAL_WRITE
-> EXECUTE -> COLLECT_RESULTS -> REPORT_RESULT -> COMPLETE`.

## EP-4 — Dry-run never writes (CROWN JEWEL)
**Dry-run performs zero real writes** or native mutations — it computes and
labels what *would* be written, per-operation, clearly marked dry-run.
**Dry-run is the default.** A real (non-dry-run) write requires explicit,
human-confirmed, config-driven enablement preceded by capability + permission
checks + explicit confirmation. **No code path bypasses the dry-run flag.** A
dry-run that writes is a **P0**.

## EP-5 — Capability + permission precede a real write
Before EXECUTE in real mode, the runner checks platform **capability**, then
the **permission** state (the permission explained before the OS prompt). A
denied/partial permission classifies affected operations `permission_missing`
and **fails closed** — no write — and is surfaced
(`CAPABILITY_PERMISSION_GATE`).

## EP-6 — Idempotency, retry, partial success, error taxonomy
Every real-write path is:
- **Idempotent** — re-running the same plan does not double-write. Use platform
  idempotency keys (HealthKit sample identity; Health Connect
  `clientRecordId`/version).
- **Retried with backoff** — transient failures retry with bounded exponential
  backoff + jitter; retries respect idempotency.
- **Partial-success aware** — per-operation success/failure is surfaced, not
  hidden, and is resumable.
- **Error-classified** — failures map to a defined **error taxonomy** (e.g.
  `PERMISSION_DENIED`, `UNSUPPORTED_METRIC`, `VALIDATION`, `TRANSIENT`,
  `AUTH`, `CONFIG`, `UNKNOWN`); the taxonomy drives retry vs surface-and-stop.

## EP-7 — No fake success
The runner reports an operation as written only when the platform writer
confirms the native write/insert succeeded. A denied/failed/partial result is
reported honestly (`NO_FAKE_SUCCESS_GATE`).

## EP-8 — Deterministic replay
Replaying a stored plan is deterministic: the same plan + scenario version
yields the same operations and the same outcome on the same inputs. **No
ambient `Date.now()`/`Math.random()` in the run path.** Relative scenario time
resolves to absolute time via an **injected clock** (e.g. an injected
`run_now` / clock dependency), never wall-clock read directly. The plan +
scenario version are recorded with the run; a golden-replay diff = STOP.

## EP-9 — Redacted run logs
Run logs record what happened (counts, statuses, `reason_code`s, error
classes) through the redaction boundary — never raw tokens, raw auth headers,
or full identifier-bearing payloads (see
[`security-rules.md`](security-rules.md) SEC-3).

## EP-10 — Safety rails hold across lifecycle
None of the safety invariants are relaxed for any lifecycle transition:
dry-run / capability / permission / no-fake-success / idempotency hold
regardless of pause/resume/stop or run scope.

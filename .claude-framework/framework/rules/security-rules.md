# Security Rules — mWellness-Mobile-Runner (MWR)

Baseline security for a mobile runtime that holds backend session material
and writes health data to the OS health store. Operationalizes
`SECRET_AND_ENDPOINT_SAFETY_GATE`, `BACKEND_API_GATE`, and
`TEST_DATA_SAFETY_GATE` together with
[`secret-endpoint-safety-rules.md`](secret-endpoint-safety-rules.md).

## SEC-1 — No raw secrets/tokens in the repo or app storage
No secret, API key, OAuth/session token, or refresh token is ever committed,
hardcoded, or persisted in plain app storage. Configuration carries a
**secret reference name** only; the value is resolved at runtime from secure
storage (Keychain / Keystore) / env, never from source. Token/session storage
strategy is a human approval gate (see
[`human-approval-gates.md`](../../adapter/human-approval-gates.md)).

## SEC-2 — Endpoints come from config, never hardcoded
Base URLs and endpoint paths come from backend configuration. No production
endpoint is a default. A new/unknown environment defaults to **dry-run**.

## SEC-3 — Redacted logging
Logs, error reports, run logs, and dry-run previews route through a redaction
boundary: never log a raw token, raw auth header, full identifier-bearing
payload, or a raw backend response that may echo credentials. Redact by key
name + known token value shapes. Diagnostics are dev-gated only.

## SEC-4 — Test data is synthetic
No real PHI/PII enters the repo, fixtures, scenarios, logs, or analytics.
Identifiers (user/device/tenant) are synthetic sandbox values, never real
subjects. Mobile never authors/validates a scenario.

## SEC-5 — Least-privilege health permissions
A writer requests only the health permissions / record types it needs for the
metrics in the approved plan. Permissions are explicit; a denied permission
**fails closed** (no write) and does not fall back to a broader scope.

## SEC-6 — Real writes are explicit + gated
Switching from dry-run to real write is a human-confirmed, config-driven act
preceded by capability + permission + explicit confirmation, never a code
default (`DRY_RUN_NO_WRITE_GATE` + `CAPABILITY_PERMISSION_GATE`). A run can be
stopped; idempotency keys make a re-run safe. Success is never faked
(`NO_FAKE_SUCCESS_GATE`).

## SEC-7 — Backend authority not bypassed
Runnable data comes only from the authenticated backend API. Backend
ownership/authority checks are not bypassed on device. A missing required API
STOPs for human approval — never fabricates local data.

# Secret & Endpoint Safety Rules — mWellness-Mobile-Runner (MWR)

Operationalizes `SECRET_AND_ENDPOINT_SAFETY_GATE` and reinforces
`DRY_RUN_NO_WRITE_GATE` and `BACKEND_API_GATE`. Works with
[`security-rules.md`](security-rules.md).

## SES-1 — Secrets are references, not values
Backend/client configuration carries a **`secretRefName`** pointing at a
secure-storage entry (Keychain / Keystore) or env. The secret/token **value**
is resolved at runtime and never written to source, fixtures, logs,
snapshots, or plain app storage. A committed raw secret/token is a **P0**.

## SES-2 — No production endpoint by default
The client's `environmentLabel` defaults to a non-production value and any
real-write enablement defaults to `false` / dry-run. **Production is never the
default** and is never reachable without explicit, human-confirmed,
config-driven enablement. Pointing a default config at a production base URL
is a P0.

## SES-3 — Endpoint allowlisting
Base URLs/endpoints come from config. A real (non-dry-run) target is checked
against an **endpoint allowlist**; an unknown or production host is refused
unless explicitly allowlisted by the Human Decision Owner.

## SES-4 — Headers allowlist
Only headers on the client's `headersAllowlist` are sent. Auth headers are
built from the resolved token at send time and are redacted in all logs.

## SES-5 — Redaction is mandatory on every log path
Run logs, error reports, dry-run previews, run reports, and response captures
route through the redaction boundary (redact by sensitive key name + known
token value shapes). Never log a raw token, raw `Authorization` header, full
identifier-bearing payload, or a raw response that may echo credentials.

## SES-6 — Dry-run is the safe default
A new environment, an unknown endpoint, or any ambiguity defaults to dry-run.
The dry-run -> real-write switch is auditable and human-confirmed, preceded by
capability + permission + explicit confirmation.

## SES-7 — Synthetic identities only
`tenantId` / `userId` / `deviceId` and any account-like identifier used in a
scenario/test are **synthetic sandbox values**, never real subjects or real
production tenants.

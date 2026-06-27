# Checklist — Secret & Endpoint Safety

Enforces `SECRET_AND_ENDPOINT_SAFETY_GATE`. See
[`secret-endpoint-safety-rules.md`](../rules/secret-endpoint-safety-rules.md)
+ [`security-rules.md`](../rules/security-rules.md). Pass = all boxes true.

- [ ] No raw secret / API key / token / real credential committed, hardcoded, or stored in plain app storage.
- [ ] Config carries a `secretRefName` only; the value resolves at runtime from secure storage (iOS Keychain / Android Keystore) or env.
- [ ] No production endpoint is a default; the backend base URL / endpoints come from config.
- [ ] Real-write / real-backend target is checked against an **endpoint allowlist**; an unknown/prod host is refused unless human-approved.
- [ ] Only **allowlisted headers** are sent; the auth header is built at send time and **redacted** in logs.
- [ ] Logs / previews / error reports / response captures route through the **redaction boundary** (no tokens, auth headers, or raw payloads).
- [ ] `tenantId` / `userId` / `deviceId` and any scenario identities are **synthetic** sandbox identifiers, never tied to a real person.
- [ ] Diagnostics that could expose secrets are dev-gated only.
- [ ] Test: `no-secret-in-repo` + `prod-not-default` + `redaction-log-safety`.

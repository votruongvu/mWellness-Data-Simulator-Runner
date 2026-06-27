# mWellness-Mobile-Runner — Settings / Config Map

Maps the feature flags / build profiles / env vars that **will** gate MWR
behavior. Seeded at framework bootstrap (MR-FRAMEWORK-00, 2026-06-27).

> **The app is not scaffolded yet**, so concrete keys/locations/mechanisms
> are `TO_VERIFY` placeholders; the *categories* and the handling rules are
> authoritative now.

> **Hard rules:** no secrets in the repo or plain app storage — tokens live
> behind a reference name, resolved at runtime from **Keychain/Keystore**
> (ADR-MWR-006). **Dry-run is the default; real-write ships OFF; no
> production endpoint is a default** (ADR-MWR-004).

## Config categories

| Category | Expected key(s) | Notes / handling | Status |
|---|---|---|---|
| Build profile | `dev` / `internal` / `production` build profile | Real-write capability is permitted only under non-production profiles; a production build with a write flag set fails validation. | `TO_VERIFY` (rule authoritative) |
| Dry-run / real-write | `dryRun` (default **true**), `realWriteEnabled` (default **false**) | New/unknown write path ⇒ dry-run; real write is explicit, human-confirmed, config-driven; no code path bypasses `dryRun` (ADR-MWR-004). | Authoritative rule |
| Backend endpoint | `backendBaseUrl` (from config), endpoint paths | Base URL from config; **no production endpoint default**; auth via secure-storage reference. | `TO_VERIFY` (rule authoritative) |
| Secret / token store | secret/token **reference name**; Keychain/Keystore backing | Resolves the reference at runtime; never committed, hardcoded, logged, or in plain storage (ADR-MWR-006). The storage/refresh strategy is a hard human-approval gate (#5). | `TO_VERIFY` |
| Apple Health (iOS) | HealthKit **share** entitlement + `Info.plist` usage strings (`NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`) | Added **only** when the writer is implemented (MR4); must match the bundle id. | `TO_VERIFY` — deferred/gated |
| Health Connect (Android) | manifest `android.permission.health.WRITE_*` + Health Connect SDK config | Added **only** when the writer is implemented (MR5); **Health Connect, not Google Fit**. | `TO_VERIFY` — deferred/gated |
| Logging / redaction | redaction policy config | No raw token/auth header/raw payload in logs; raw scenario payloads dev-gated only. | Authoritative rule |
| Diagnostics | DEV diagnostics flag | Diagnostics screen/surface is dev-gated; redacted. | `TO_VERIFY` |

## TO_VERIFY

- Real env values + the chosen mechanism (react-native-config / build
  schemes / Expo config) wired at scaffold (MR1).
- Final flag names/defaults confirmed with the Human Decision Owner;
  real-write gating = DEV build flag, env flag, or both (Master REQ §16 open
  question).
- Native entitlement/permission specifics confirmed against current Apple
  HealthKit + Android Health Connect docs at writer time (R-MWR-005).

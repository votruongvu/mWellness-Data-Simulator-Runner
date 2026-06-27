# MWR — Validation Command Guide

> The validation matrix for `mWellness-Mobile-Runner` (MWR) and what each command
> proves. **The RN app is not yet scaffolded**, so the only commands that run
> today are the framework + context-pack validators. Product-code commands
> (`npm test`, `tsc`, native verify) are listed as **`NOT_RUN`** until the app
> exists — never reported as PASS before then.

## Available now (framework bootstrap)

| Command | Proves | Expected |
|---|---|---|
| `bash .claude-framework/scripts/validate-framework.sh` | Framework structural validity: required files present + non-empty; adapter set complete; lifecycle skill/command pairs; agents declare `tools:`; rules/checklists/templates/context present; CLAUDE.md content guards (Context Layer / Artifact truth / Context Promotion / human gate / source-of-truth + operating principle); skills carry no `## Agent crew`; terminology leakage guards (Android = "Health Connect", never "Google HealthKit" / Google Fit); no DM1 product-truth leakage. | PASS |
| `python3 .claude-framework/scripts/validate_context_pack_paths.py` | Context-pack registry concrete paths exist (honoring `TO_VERIFY` / `DEFERRED` defer markers). | 0 errors |

## Not runnable until the app is scaffolded (`NOT_RUN`)

These commands belong to the product code and **do not exist yet**. Report them as
`NOT_RUN_<reason>` until MR1+ scaffolds the app — never hide `NOT_RUN` behind PASS.

| Command (future) | Will prove | Status now |
|---|---|---|
| `npm ci` | install dependencies | `NOT_RUN_NO_APP` |
| `npm test` | unit + component (RNTL) + integration suites pass, incl. run-flow states + safety invariants (dry-run no write, no fake success, unsupported surfaced, secrets redacted) | `NOT_RUN_NO_APP` |
| `npx tsc --noEmit` | full RN/app TypeScript is clean | `NOT_RUN_NO_APP` |
| `npx tsc --noEmit -p tsconfig.build.json` | domain build boundary (no-network / SDK-free domain compile-enforced) | `NOT_RUN_NO_APP` |
| native verify (e.g. `verify:native`) | TurboModule specs + codegen config well-formed; no SDK symbol leaks into TS; real-write/permission symbols absent until MR4/MR5 gates open | `NOT_RUN_NO_NATIVE_SUBSTRATE` |
| no-fake-success negative tests | denied/failed native writes are NOT reported as success | `NOT_RUN_NO_WRITER` (MR4/MR5) |
| no-real-PHI fixture scan | scenario/test fixtures contain no real PHI/PII | `NOT_RUN_NO_FIXTURES` |

> The native verify closure (codegen against real `ios/` + `android/` projects) is
> expected to **safety-pass + closure-block** until the native substrate is
> generated under a gated brief — exactly as in the prior framework. That
> closure-block is by design, not a failure.

## Interpreting status honestly

- A command that cannot run is `NOT_RUN_<reason>`, never PASS.
- The framework validator + context-pack validator are the only authoritative
  green checks at framework bootstrap.
- As phases land, move rows from "Not runnable" to "Available" and record their
  expected results.

## Cross-references

- Manual QA rhythm: [`MWR_MANUAL_QA_CHECKLIST.md`](MWR_MANUAL_QA_CHECKLIST.md)
- Native build / verify boundary: [`MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md`](MWR_NATIVE_BUILD_AND_CODEGEN_GUIDE.md)
- Health-write safety: [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)

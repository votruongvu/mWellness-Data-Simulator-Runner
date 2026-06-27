# MWR-FRAMEWORK-01 — Source-of-Truth & Legacy Contamination Audit

**Story:** MWR-FW1-001 · **Phase:** MR-FRAMEWORK-01 · **Date:** 2026-06-27 · **Result: PASS (CLEAN).**

Audits the source hierarchy, Master REQ canonical status, MR-DESIGN-00 subordinate
status, and old DM1 legacy-only status after MR-FRAMEWORK-00 + MR-DESIGN-00.

## Source hierarchy (verified)
| Rank | Source | Status | Evidence |
|---|---|---|---|
| 1 | Real repo state (descriptive facts) | active | `CLAUDE.md` source hierarchy block |
| 2 | **Mobile Runner Master REQ** | **canonical product requirements** | `docs/requirements/MOBILE_RUNNER_MASTER_REQ.html/.md`; `CLAUDE.md`; `adapter/project-source-of-truth.md` |
| 3 | `.claude-framework/adapter/*` | current operating truth | adapter set present, validator PASS |
| 4 | MR-DESIGN-00 artifacts | **UI/UX implementation input (subordinate)** | `artifacts/design/mobile-runner/DESIGN_PACKAGE_INDEX.md` + closeout |
| 5 | `.claude-framework/artifacts/*` | evidence/history (not current truth) | Artifact truth rule in `CLAUDE.md` |
| — | Old DM1 / app truth | **legacy/superseded only** | `adapter/known-legacy.md` |

## Checklist
| Check | Verdict | Evidence |
|---|:--:|---|
| New Mobile Runner Master REQ is canonical | PASS | `CLAUDE.md` "Source of truth"; `MOBILE_RUNNER_MASTER_REQ.md` header |
| MR-DESIGN-00 design = UI/UX input only, subordinate to Master REQ | PASS | `DESIGN_PACKAGE_INDEX.md` + `MOBILE_RUNNER_DESIGN_HANDOFF_CLOSEOUT.md` ("Master REQ is canonical… design = implementation input") |
| Old DM1 REQ/product truth not canonical | PASS | DM1 REQ/SRS absent from repo; not referenced as canonical |
| DM1 named only as legacy correction | PASS | `mwdm1`/`ADR-MW-DM1`/`mWellness-DM1` appear only in `adapter/known-legacy.md` (+ one allowed provenance line in `agents/README.md`) |
| Validator DM1-leakage guard passes | PASS | `validate-framework.sh` [15] passes |

## Legacy contamination scan (P0/P1/P2)
Scanned framework surfaces (`CLAUDE.md`, `.claude`, `.claude-framework/{adapter,framework,execution}`, `docs`) for DM1 product tokens: `mwdm1`, `ADR-MW-DM1`, `seed engine`, `canonical synthetic`, `source library`, `vendor_api`, `file_export`, old M1–M6 roadmap, `Google HealthKit`, `Google Fit`.

**Result: no contamination.** Every hit is a **negation / guard / gate-trigger** line (e.g., human-approval gate #6 forbidding Google Fit; reviewer P0 lists; "call Health Connect 'Google HealthKit'" as a forbidden example; `known-legacy.md` corrections). No DM1 product truth and no "Google HealthKit" appears as current truth. The old 4-destination scope, generator/seed-engine model, and M1–M6 roadmap are absent.

- **P0:** none. **P1:** none. **P2:** none (one benign provenance mention of the superseded `mwdm1-` roster in `agents/README.md`, allowed by the validator).

## Conclusion
Source hierarchy is clean: Master REQ canonical, design subordinate, DM1 legacy-only. No legacy contamination blocks MR0. **PASS.**

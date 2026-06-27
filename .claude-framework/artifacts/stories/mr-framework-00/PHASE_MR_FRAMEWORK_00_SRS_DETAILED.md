# PHASE_MR_FRAMEWORK_00_SRS_DETAILED.md — Claude Framework Bootstrap

Project: `mWellness-Mobile-Runner`  
Phase: `MR-FRAMEWORK-00 — Claude Framework Bootstrap`

## Objective

Create a dedicated Claude Framework for the new Mobile Runner repository by extracting reusable mechanics from the old mobile framework and replacing old app requirements with the new Mobile Runner Master REQ.

## Product Identity

- Product: `mWellness-Mobile-Runner`
- Acronym: `MWR`
- Type: React Native mobile runner/runtime
- Upstream: `mWellness-Data-Simulator` Web App + Go Backend
- Primary flow: login, load runnable backend test cases/scenarios, build execution plan, dry-run, check permissions/capabilities, write/simulate via Apple Health / Health Connect, report results.

## Framework Intent

The framework must guide Claude to build mobile runner work safely, story-by-story, with strong native health write guardrails.

## Core Guardrails

- No accidental health data writes.
- No real write without dry-run, capability check, permission check, and explicit confirmation.
- No fake native write success.
- No silent HealthKit / Health Connect permission prompt.
- No unsupported metric silently ignored.
- No raw token/log leakage.
- No backend authority bypass.
- No mock test cases/scenarios marked as complete product behavior.
- No Google Fit.
- No direct vendor SDK integration unless human-approved.

## Source Hierarchy

1. Real repository state for descriptive facts.
2. New Mobile Runner Master REQ for product requirements.
3. Mobile Runner framework adapter docs for current operating truth.
4. Old framework archive as reusable mechanics/history only.
5. Old DM1 REQ/product docs are legacy/superseded unless explicitly transformed and approved.

## Out of Scope

- React Native app scaffolding.
- Product feature implementation.
- Native writer implementation.
- MR0/MR1 story generation.
- Old DM1 product roadmap continuation.

## Done Definition

MR-FRAMEWORK-00 is done when the framework skeleton, canonical Master REQ docs, source-of-truth/adapters, mobile safety guardrails, phase loop/closeout process, core docs, adapted checklists, validation, traceability, and closeout are complete.

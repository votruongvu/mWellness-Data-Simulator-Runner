# Testing Rules — mWellness-Mobile-Runner (MWR)

Required testing discipline. Mandatory safety tests travel with the surface
they protect. Category detail lives in
[`test-map.md`](../../adapter/test-map.md).

## T-1 — Safety tests are non-negotiable
Every change to a high-risk surface carries the test that proves its
invariant:
- **Dry-run-no-write:** dry-run performs zero real native writes / network
  mutations; the run is labelled dry-run.
- **No-fake-success:** a write is reported succeeded only when the native
  platform write/insert actually succeeded; a **negative-verification** test
  proves a denied/failed/partial write is NOT reported as success.
- **No-real-PHI:** fixtures/scenarios/logs contain no real PHI/PII, no real
  token/account/device id (scan-style guard).
- **No-silent-drop / unsupported-surfaced:** an unsupported metric is
  surfaced with a `reason_code`, not dropped.
- **Capability-permission:** capability is checked before the permission
  request; a denied/partial permission fails closed; the prompt is explained
  before the OS prompt.
- **Replay-determinism:** replaying a stored plan is deterministic; relative
  time resolves via an injected clock; no ambient `Date.now()`/`Math.random()`
  in the run path.
- **No-secret-in-repo:** no raw secret/token/real endpoint committed.
- **No-score-authority:** MWR emits no authoritative wellness score; mobile
  never authors/validates/mutates/reorders a scenario.

## T-2 — Test categories
Unit (interpreter, plan classification, mappers, status derivation),
scenario-contract interpretation, plan-replay determinism, platform-writer
contract (mocked native), idempotency/retry/error-taxonomy, dry-run,
no-fake-success negative-verification, capability/permission, redaction/log-
safety, run-reporting summary, RN component/hook/state, and (when a real
writer exists) device/integration tests — env-gated. See `test-map.md`.

## T-3 — No loosened assertions
Do not weaken or delete a safety / no-fake-success / idempotency /
replay-determinism assertion to make a change pass. A failing safety test is
a defect, not a test to relax.

## T-4 — Golden replays are pinned
Deterministic golden replays are pinned to a plan + scenario version;
regenerating them is an explicit, reviewed act. A golden-replay diff = STOP.

## T-5 — Real-write tests are env-gated
Native HealthKit / Health Connect write tests and live-backend tests run only
where the integration env is configured; they never run against a production
endpoint and never with real credentials or real PHI in CI.

# RN Testing Rules — mWellness-Mobile-Runner (MWR)

Imported React Native component-test quality (RNTL), adapted to MWR.
**Subordinate to MWR governance** (see
[`prompt-overrides.md`](../../adapter/prompt-overrides.md) "Precedence").
Operationalizes `RN_TESTING_GATE`.

## RT-1 — Query + interaction discipline
Use `screen` queries, follow RNTL query priority (role/label/text over
testID), use `userEvent` for interaction, and `findBy*` for async. No
snapshot-only tests for behavior.

## RT-2 — Run-flow state coverage
A data-bound MWR screen covers the run-flow states: **idle / loading /
plan-built / dry-run / confirming / executing / result / error**. Progress
and status surfaces assert the truthful state — including the active
**platform** and **mode** (dry-run vs real-write).

## RT-3 — MWR invariant assertions (mandatory)
Component/hook tests for a run-flow or writer surface assert:
- in dry-run, **no real native write call** is made;
- a denied/failed write is shown as **failed/skipped**, never as success
  (no fake success);
- an unsupported metric renders its **skipped-with-`reason_code`** state, not
  a silent disappearance;
- the permission prompt is **explained before** the OS prompt;
- no raw token/endpoint/identifier appears in rendered output.

## RT-4 — No loosened assertions
Never weaken or delete an MWR invariant assertion to make a test pass.

## RT-5 — Version specifics
RNTL version + Expo-vs-bare resolve once the RN app exists (`package.json`) —
until then mark version-specifics `TO_VERIFY`.

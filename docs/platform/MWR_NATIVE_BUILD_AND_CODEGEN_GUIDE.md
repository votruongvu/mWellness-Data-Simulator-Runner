# MWR — Native Build & Codegen Guide (TurboModules, New Arch, Hermes)

> How the MWR native seam is intended to be wired for React Native **New
> Architecture** codegen, and how a future gated writer (MR4/MR5) lands without
> breaking the SDK-free TS domain boundary.
>
> **Status: the RN app and native projects are NOT yet scaffolded.** Versions,
> module names, codegen config, and paths below are `TO_VERIFY` until MR1/MR0
> settle them under an explicit, gated brief. No native HealthKit / Health Connect
> code exists at framework bootstrap.

## New Architecture / Hermes baseline (`TO_VERIFY`)

- **RN version: `TO_VERIFY`** (exact pin set at MR1). New Architecture is the RN
  default on recent versions; Hermes is the default JS engine.
- New-Arch + Hermes build flags live in the native projects once scaffolded
  (`ios/Podfile`; `android/gradle.properties`: `newArchEnabled=true`,
  `hermesEnabled=true`). These are created during native-substrate activation,
  which is **env-gated** and human-approved (gate #9).

## TurboModule codegen seam (intended)

MWR declares TurboModule codegen in `package.json` -> `codegenConfig` once the app
is scaffolded. Native module prefix is **`Mwr<Capability>`** (`TO_VERIFY` — subject
to an ADR before any codegen). Illustrative shape:

```json
{
  "name": "MwrNativeSpecs",
  "type": "modules",
  "jsSrcsDir": "src/health",
  "android": { "javaPackageName": "TO_VERIFY" }
}
```

| Spec (intended) | Module name (`Mwr<Capability>`, TO_VERIFY) | Native impl seam |
|---|---|---|
| `NativeMwrHealthKitWriter.ts` | `MwrHealthKitWriter` | `ios/MwrHealthKitWriter.h/.mm` |
| `NativeMwrHealthConnectWriter.ts` | `MwrHealthConnectWriter` | `android/MwrHealthConnectWriter.kt` |

Each spec: `export interface Spec extends TurboModule { … }` + `export default
TurboModuleRegistry.get<Spec>('<ModuleName>')`. Until the writers are gated open
(MR4/MR5), any native methods are inert (e.g. an availability probe + a
`writeBatch` that returns a `not_implemented` result with **no** OS call).

## How codegen runs (after substrate activation)

- **iOS:** `pod install` / `xcodebuild` run codegen, generating the
  `MwrHealthKitWriterSpec` base from the TS spec; the `.mm` implements it.
- **Android:** the Gradle build runs codegen into the configured Java package; the
  `.kt` implements the generated interface.
- With no `ios/` + `android/` projects, codegen has no target; the framework
  validates the **specs + config statically** instead.

## Concept-token boundary (load-bearing)

The TS/domain layer names **no** OS SDK symbol — it carries unqualified concept
tokens (`stepCount`, `Steps`, `count/min`, …). A concept resolves to its
qualified SDK identifier **only inside the native `.mm` / `.kt` / `.swift`**, and
only under the MR4/MR5 gate. See
[`MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md`](MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md).

## Build boundary — keep the SDK out of the domain (intended)

Two TypeScript projects enforce the boundary; respect both when native code is
added (exact filenames `TO_VERIFY` at scaffold):

- A **domain build** project (e.g. `tsconfig.build.json`, domain -> `dist/`)
  **excludes** `src/health/**/native` and uses a non-DOM `lib` so network globals
  are not type-resolvable in the domain build.
- A **core** project excludes the TurboModule spec files (they import
  `react-native`).
- The full `tsconfig.json` (with RN + node types) type-checks the specs.

> A new native-side TS file that imports `react-native` MUST live under a
> `**/native/` path (auto-excluded from the domain build) and be added to the core
> project's exclude list — mirror the spec files.

## iOS entitlements / provisioning (added only with the writer)

- `com.apple.developer.HealthKit` entitlement.
- `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription` usage strings.
- HealthKit capability + framework link; authorization request.
- Device provisioning notes; app-visibility-under-Health troubleshooting.

These are added **only with** the gated iOS writer (MR4), never as a framework
side effect.

## Android manifest / permissions (added only with the writer)

- `android.permission.health.WRITE_*` declarations per supported record type.
- Runtime permission flow; Health Connect availability/installation check.
- Record-type / unit specifics per the capability matrix.

These are added **only with** the gated Android writer (MR5).

## What a future gated writer (MR4/MR5) does

1. The native `.mm` / `.kt` import the OS SDK (HealthKit / Health Connect) — the
   **only** place a symbol resolves.
2. Implement `writeBatch` behind the disabled-by-default real-write flag,
   dry-run-first, behind the per-write gate chain.
3. Real-write enablement and permission-prompt symbols are relaxed **only** under
   the explicit MR4/MR5 human approval (gates #1/#2/#3/#4) — never silently.
4. Register the real writer only after the writer's negative + positive write
   tests pass (no-fake-success).

Until then: no SDK import, no write, no OS permission prompt.

## Cross-references

- Capability matrix: [`MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md`](MWR_HEALTHKIT_HEALTH_CONNECT_CAPABILITY_MATRIX.md)
- Safety boundaries: [`MWR_HEALTH_WRITE_SAFETY_BOUNDARIES.md`](MWR_HEALTH_WRITE_SAFETY_BOUNDARIES.md)
- Health-write safety / gate chain: [`../safety/MOBILE_HEALTH_WRITE_SAFETY.md`](../safety/MOBILE_HEALTH_WRITE_SAFETY.md)
- Validation guide: [`MWR_VALIDATION_GUIDE.md`](MWR_VALIDATION_GUIDE.md)

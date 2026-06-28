# MWR Native Substrate Bootstrap (MR-C)

**Date:** 2026-06-28 · **Hard-gate #9 (native substrate): human-APPROVED** for this
task. Generates the RN native projects needed for the *later* iOS HealthKit /
Android Health Connect write POCs — **with no native writer/permission code**.

## What was generated
`ios/` and `android/` from the **React Native 0.74.5** template (matches
`ADR-MWR-010`), via:
```
npx @react-native-community/cli@13.6.9 init mWellnessMobileRunner \
    --version 0.74.5 --skip-install --skip-git-init   # generated in a temp dir, ios/+android/ copied in
```
- App/module name **`mWellnessMobileRunner`** — matches `app.json` `name` and
  `index.js` `AppRegistry.registerComponent`. Verified: `AppDelegate.mm`
  `self.moduleName = @"mWellnessMobileRunner"` and `MainActivity.kt`
  `getMainComponentName() = "mWellnessMobileRunner"`.
- 41 files under `ios/` + `android/` (template baseline; no app logic changed).

## Native source files added (TEMPLATE / BOOTSTRAP-ONLY — not writer code)
- iOS (Obj-C/Obj-C++, RN 0.74 default): `ios/mWellnessMobileRunner/AppDelegate.h`, `AppDelegate.mm`, `main.m`, `ios/mWellnessMobileRunnerTests/mWellnessMobileRunnerTests.m`.
- Android (Kotlin, RN 0.74 default): `android/app/src/main/java/com/mwellnessmobilerunner/MainActivity.kt`, `MainApplication.kt`.
- **These contain ZERO HealthKit / Health Connect / writer / permission code.** Verified by grep: no `HealthKit`/`HealthConnect`/`HKQuantity`/`insertRecords`/`NSHealth`; no `NSHealth*` usage keys in `Info.plist`; no health permissions in `AndroidManifest.xml`.

## Minimal config changes (only what the native build needs)
- `package.json` devDeps: added the RN-0.74 template's native/babel build deps the repo lacked — `@babel/core`, `@babel/preset-env`, `@babel/runtime`, `babel-jest`, `@types/react-test-renderer` (existing deps untouched). `npm install` → **added 1 package** (the rest were already transitive); **`package-lock.json` updated**.
- `.gitignore`: added the canonical RN native-artifact ignores (`ios/Pods/`, `ios/*.xcworkspace`, `DerivedData/`, `xcuserdata/`, `android/build/`, `android/.gradle/`, `android/local.properties`, `.cxx/`, etc.) and **`!debug.keystore`** (the prior blanket `*.keystore` would have wrongly excluded the template's committable Android debug keystore).
- `Gemfile` copied (for `bundle exec pod install`). Bundle identifiers are template placeholders (`org.reactjs.native.example.mWellnessMobileRunner` / Android `com.mwellnessmobilerunner`) — to be finalized later; **not** write-related.
- Repo's own `App.tsx`, `index.js`, `metro.config.js`, `babel.config.js` (with `react-native-dotenv`), `tsconfig.json` were **kept** (the template's were not copied).

## Validation (this environment)
| Check | Result |
|---|---|
| `npx react-native config` | **OK** — detects `project.ios.sourceDir`=`ios/`, `project.android.sourceDir`=`android/`, and **autolinks** the existing native deps (`react-native-keychain`, `react-native-safe-area-context`, `react-native-screens`). |
| `npx tsc --noEmit` | clean (exit 0) |
| `npx jest` | **24/24 pass** (5 suites) |
| `eslint` | **still crashing** — pre-existing `prettier`/`eslint-plugin-prettier` mismatch (unrelated to substrate; P1). |
| git hygiene | no generated dir staged (node_modules/Pods/build/.gradle/local.properties); `debug.keystore` committable; `gradlew` executable. |

## Native build status — NOT executed (honest blockers)
A **full native build was not run**. Blockers (toolchain IS present — Xcode 26.0.1, CocoaPods 1.16.2, Android SDK at `~/Library/Android/sdk`):
- **iOS:** `bundle exec pod install` (network-heavy; generates `ios/Pods` + `Podfile.lock` + `.xcworkspace`) then `xcodebuild` (needs a signing identity / simulator) — deferred to keep this patch focused and avoid committing large generated artifacts.
- **Android:** `./gradlew assembleDebug` (network-heavy gradle dependency resolution + build-tools) — deferred.
- **Node version caveat:** the machine runs **node v25.1.0**, newer than RN 0.74.5's tested range (>=18, LTS 18/20). JS-side `tsc`/`jest`/`react-native config` all passed under node 25, but a **full native bundle/build under node 25 is unverified** — if it fails, use node 20 LTS (nvm) for the native build.
- **No simulator/emulator/device QA was run or claimed.**

## State after this task
- **Native substrate: PRESENT** (`ios/` + `android/`). · Hard-gate #9: **APPROVED** (this task).
- **Payload gate: `PAYLOAD_READY`** (live-verified, commit `aded38a`). · **DTO consuming path: READY** (`R-MWR-019` done, commit `e600a39`).
- **Native write POCs (MR-C stories 002–005): still BLOCKED** — pending human-approval gates **#1** (real Apple Health write), **#2** (real Health Connect write), **#3** (permission-prompt timing/copy), and a populated **device QA matrix** (still `NOT_EXECUTED`). **No** native writer/permission code exists.

## Next recommended task
1. **Native build verification** (developer machine, ideally node 20 LTS): `bundle exec pod install` + a debug `xcodebuild`/`gradlew assembleDebug` to confirm the substrate compiles/runs (no device write).
2. Then **MR-C story 002** (iOS HealthKit capability + permission bridge) — a **hard-gated** step (#1/#3) that still implements **no** write until approved, plus the device QA matrix is populated for MR-C-003/004 real-write POCs.

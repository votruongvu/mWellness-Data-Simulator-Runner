# MWR App Foundation Setup (MR-A)

Setup and build notes for the `mWellness-Mobile-Runner` (MWR) React Native app
foundation authored in phase **MR-A (Foundation + Auth Shell)**.

> **Build/run NOT verified in this authoring environment.** Source was authored
> without running `npm install`, Metro, or a native build. The steps below are
> the intended path; verify on a real dev machine.

## Ratified stack (ADR-MWR-001)

- **Bare React Native CLI 0.74.5** (no Expo).
- **TypeScript** (strict).
- **React Navigation v6** (`@react-navigation/native` + native-stack).
- **react-native-keychain** for secure token storage (no plain AsyncStorage for
  tokens).

## Prerequisites

- Node >= 18, Watchman, Ruby/CocoaPods (iOS), Android SDK + JDK 17 (Android).
- The **native iOS/Android projects are not committed here.** Generate them from
  the ratified template, then keep this `src/` tree:

  ```sh
  # Generate the native shells at the ratified RN version, then merge this source in.
  npx react-native@0.74.5 init mWellnessMobileRunner --version 0.74.5
  # (Or use the community template; align app.json "name" = mWellnessMobileRunner.)
  ```

## Install + run

```sh
npm install
cd ios && pod install && cd ..   # iOS native deps (CocoaPods)

npm run start                    # Metro bundler
npm run ios                      # build + run iOS
npm run android                  # build + run Android

npm run typecheck                # tsc --noEmit (strict)
npm run lint                     # eslint
npm test                         # jest
```

## Environment

There is **no committed backend URL** and **no reachable backend** in this build.
`src/config/env.ts` defaults `apiBaseUrl` to `null` and `envLabel` to `dev`. A
real base URL is injected at build/config time via `configureEnv(...)` (e.g. from
a generated config module or CI substitution). With no backend, sign-in surfaces
`BACKEND_UNAVAILABLE` and the app shows the Backend-Unavailable state — never a
fake session.

## Source structure (`src/`)

```
App.tsx                          SafeAreaProvider > SessionProvider > NavigationContainer > RootNavigator
index.js                         AppRegistry registration
src/
  config/env.ts                  EnvConfig + getEnv()/configureEnv() seam (apiBaseUrl=null by default)
  backend/
    types.ts                     ApiError / ApiResult / RequestOptions / TokenProvider
    apiClient.ts                 fetch wrapper; no backend => BACKEND_UNAVAILABLE; x-request-id capture; status->code map
  auth/
    secureStorage.ts             react-native-keychain wrapper (tokens ONLY here)
    authApi.ts                   login / me / logout / refresh against the contract shapes
    SessionContext.tsx           session status state machine (booting|unauthenticated|authenticated|expired)
  navigation/
    types.ts                     RootStackParamList (MR-A routes only)
    RootNavigator.tsx            native-stack; routes from session status
  shared/
    theme.ts                     tokens (incl. dryRun/realWrite/danger/ok/warn semantics)
    redaction.ts                 redact() — masks tokens/secrets on every log path
    components/                  EnvBadge, SafetyBanner, StatusBadge, PrimaryButton
  screens/
    SplashScreen.tsx             P01 (restores session)
    LoginScreen.tsx              P02 (sign in to MWDS; backend-gap aware)
    DashboardScreen.tsx          P03 (identity, dry-run banner, capability placeholder, disabled Browse)
    SettingsScreen.tsx           S05 (safety not disableable, logout)
    errors/
      SessionExpiredScreen.tsx   E01
      BackendUnavailableScreen.tsx E02 (endpoint, code, requestId, retry)
__tests__/smoke.test.tsx         trivial render smoke test
```

## MR-A scope

Implemented: app shell + navigation, auth/session state machine, secure token
storage, backend client base, dashboard shell, and the session-expired /
backend-unavailable error states.

## Deferred (NOT in MR-A)

Test-case browser, version/scenario detail, execution plan, dry-run, capability
& permission flows, Apple Health / Health Connect writers, run orchestration,
diagnostics/export, Google Fit, vendor SDKs, RBAC/tenant/billing/admin, and any
catalog/authoring/seed/upload/reorder surface.

## Safety invariants honored

- No fake login / no fake native write success (no reachable backend => honest
  `BACKEND_UNAVAILABLE`).
- Tokens live only in OS secure storage (keychain), referenced by name, never
  logged; `redact()` masks secrets on every log path.
- No HealthKit / Health Connect / permission / write code in this phase.
- Terminology: Apple Health / HealthKit / iOS; Health Connect / Android. Never
  "Google HealthKit", never Google Fit.
```

# MOBILE_RUNNER_SAFETY_UX_MATRIX.md

Implementation-ready safety UX rules for `mWellness-Mobile-Runner`. Each row is a
mandatory behavior binding a framework gate to concrete UI. **These gates may not
be hidden, weakened, or made optional for visual simplicity.** Maps to the
framework gates in `.claude-framework/framework/rules/gates.md` and the Master REQ
§11 safety requirements (canonical).

## Gate → UX matrix

| # | Safety gate | Where (screen) | Required UI / behavior | Required copy | Blocked / fail behavior |
|---|---|---|---|---|---|
| 1 | **Dry-run precedes real write** (`DRY_RUN_NO_WRITE_GATE`) | P08 Plan Preview, P09 Dry-run Result | Mode badge **Dry-run**; "Run dry-run" is the primary action; real-write entry not primary until dry-run completes | "Dry-run only. No health data will be written." | Real-write actions disabled until P09 dry-run-completed. |
| 2 | **Capability checked before permission** (`CAPABILITY_PERMISSION_GATE`) | P04 Platform Capability, P08 builder step | Capability card (available · OS version · destination); plan builder runs "check capability" before classifying ops | "iOS · Apple Health" / "Android · Health Connect" readiness | Unsupported/not-installed → E03/E04; offer **Dry-run only**; real write blocked. |
| 3 | **Permission explained before OS prompt** (no silent prompt) | P10 Permission Explanation | Pre-prompt card listing metric types needing **write**; request button is the only trigger | "You will see the OS permission prompt next. No silent prompt — nothing is requested until you tap below." | If user declines explanation → no OS prompt fired. |
| 4 | **Permission result is honest & fail-closed** | P11 Permission Status | Per-metric granted/denied/not-requested; remediation path | "N scenarios affected. Denied operations will be skipped unless granted in Settings." | Denied(required) → Run Blocked; denied(partial) → skip those ops (`PERMISSION_MISSING`), never attempt. |
| 5 | **Explicit real-write confirmation** (`HUMAN`-style on-device gate) | P12 Real-write Confirmation | **Real-write** mode badge + danger banner + target + write-op count + skipped/blocked count + **required confirm checkbox**; Confirm disabled until gate chain satisfied | "This will write test data to your health platform. Use only on approved DEV/QA devices and accounts." + "I understand this writes real data to {Apple Health\|Health Connect} on this device." | Confirm disabled with the unmet reason: blocked-by-permissions / unsupported / safety-gate / environment-not-allowed. |
| 6 | **Unsupported metric surfaced, never silently dropped** (`PLATFORM_WRITER_GATE`) | P08 Plan Preview, P14 Result | Unsupported panel with count + reason; result lists skipped detail | "This metric is not writable on the current platform. It will be skipped." | Op status `unsupported`, `reason_code: METRIC_NOT_WRITABLE_ON_PLATFORM`; skipped, not attempted. |
| 7 | **No fake native write success** (`NO_FAKE_SUCCESS_GATE`) | P13 Run Progress, P14 Result, S04 Error Detail | Counts ok/fail/skip from **actual native results**; partial success rendered distinctly | "Partial success · {written} written · {failed} failed · {skipped} skipped" | `NATIVE_WRITE_FAILED` shown with native error; success count = native successes only. |
| 8 | **Partial success ≠ success** | P14 Run Result | Distinct terminal state + breakdown | "Partial success" (amber), never "Success" | — |
| 9 | **No accidental write path** | all run screens | No path jumps test-case-list → real write; cancel stops remaining ops | "No path jumps directly to real write." | Background/autonomous writes do not exist. |
| 10 | **Secret / token / payload safety** (`SECRET_AND_ENDPOINT_SAFETY_GATE`) | S03 Diagnostics, S01 Payload Preview | Sanitized logs; payload read-only + dev-gated | "No tokens, credentials, raw payloads, or personal health data are stored in logs." | Redaction on every log/diagnostic surface. |
| 11 | **Backend authority not bypassed** (`BACKEND_API_GATE`) | P06/P07, error flows | "Configuration is managed in MWDS Web App. Mobile Runner only executes validated scenarios." | same | Missing backend API → STOP (human-approval), never fabricate local data. |
| 12 | **Safety not user-disableable** | S05 Settings | No disable-safety / bypass-confirm / force-success toggles | "Safety gates and confirmation cannot be disabled in this build." | — |

## Real-write gate chain (must ALL be true before P12 Confirm enables)
```
dry_run_completed  AND  capability_ok  AND  permissions_resolved  AND  confirm_checkbox_checked
        ↓ (any false)
Confirm disabled → show the specific unmet gate
```

## Mode visibility rule
The **target platform** (iOS · Apple Health / Android · Health Connect) and the
**run mode** (Dry-run / Real-write) are visible on every plan/permission/run
screen via `PlatformBadge` + `ModeBadge`. Real-write uses danger styling + a
persistent `SafetyBanner`.

## Copy bank (canonical safety strings)
- Dry-run: "Dry-run only. No health data will be written."
- Dry-run done: "Dry-run completed. No health data was written."
- Real-write warning: "This will write test data to your health platform. Use only on approved DEV/QA devices and accounts."
- Real-write confirm: "I understand this writes real data to {Apple Health|Health Connect} on this device."
- Unsupported: "This metric is not writable on the current platform. It will be skipped."
- Permission pre-prompt: "The runner needs write permission for the selected health data types before it can execute this scenario."
- Backend authority: "Test case configuration is managed in MWDS Web App. Mobile Runner only executes validated scenarios."
- Diagnostics: "No tokens, credentials, raw payloads, or personal health data are stored in logs."

## Terminology guard (must hold in all safety copy)
Android destination is **Health Connect** — never "Google HealthKit", never Google Fit.
"HealthKit" names only Apple's iOS API. Destination ≠ platform API (Apple Health is the destination; HealthKit is the API).

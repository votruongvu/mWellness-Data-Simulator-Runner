#!/usr/bin/env bash
# PreToolUse hook — Protected edit guard (mWellness-Mobile-Runner / MWR)
#
# When the current route is Direct Patch AND an Edit/Write/MultiEdit
# targets a high-risk path, block the call with an escalation message.
# Ordinary UI / copy / view-model / test fixes are NOT blocked.
#
# Path patterns map the lane-classification.md denylist categories to
# likely MWR repo paths. The RN app is not yet scaffolded, so several
# patterns are best-effort + marked TO_VERIFY; tune them in
# .claude-framework/adapter/repository-map.md once real paths exist.
# Single-source gating of category NAMES in framework markdown does NOT
# apply to executable hooks, which must carry path patterns.

set -euo pipefail

INPUT="$(cat)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
ROUTE_FILE="$ROOT/.claude/state/route"

ROUTE=""
[ -f "$ROUTE_FILE" ] && ROUTE="$(cat "$ROUTE_FILE" 2>/dev/null || printf '')"
if [ "$ROUTE" != "direct-patch" ]; then
  exit 0
fi

TARGET="$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print('')
    sys.exit(0)
ti = d.get('tool_input', {}) or {}
print(ti.get('file_path') or ti.get('path') or '')
" 2>/dev/null || printf '')"

[ -z "$TARGET" ] && exit 0

# Durable adapter context — Direct Patch may not silently mutate it.
case "$TARGET" in
  *.claude-framework/adapter/*)
    cat >&2 <<EOF
🛑 Direct Patch cannot edit durable adapter context.

  File: $TARGET

Escalate to Focused CR or Full Framework. Adapter promotion runs through
/close-task + /refresh-context, not direct edit.
EOF
    exit 2
    ;;
esac

# High-risk path patterns (TO_VERIFY against the real MWR layout).
declare -a HIGH_RISK_PATTERNS=(
  'ios/'                          # iOS native project (HealthKit entitlement)
  'android/'                      # Android native project (Health Connect permissions)
  '.entitlements'                 # HealthKit share entitlement
  'Info.plist'                    # iOS usage strings
  'AndroidManifest'               # Android permissions
  'healthkit'                     # Apple HealthKit writer (iOS)
  'health-connect'                # Android Health Connect writer
  'healthconnect'                 # Health Connect (alt)
  'writer'                        # platform writer adapters
  'secret'                        # secret references / credentials
  'credential'                    # credentials
  'token'                         # tokens / session
  'endpoint'                      # backend endpoints
  '.env'                          # env / secrets
  'dry-run'                       # dry-run semantics
  'dryrun'                        # dry-run (alt)
  'confirm'                       # confirmation flow
  'permission'                    # permission flow
  'capability'                    # capability checks
  'scenario'                      # scenario interpretation / contract
  'execution-plan'                # execution plan build / classification
  'executionplan'                 # execution plan (alt)
  'backend'                       # backend client
  'auth'                          # auth / session
  'session'                       # session
  'idempot'                       # idempotency
  '__fixtures__'                  # fixtures (real-PHI risk)
)

for pat in "${HIGH_RISK_PATTERNS[@]}"; do
  case "$TARGET" in
    *"$pat"*)
      cat >&2 <<EOF
🛑 Direct Patch blocked — target is in a HIGH-RISK area.

  File:    $TARGET
  Pattern: $pat
  Source:  .claude-framework/framework/rules/lane-classification.md

Backend-client/auth/session · scenario-interpretation/contract ·
execution-plan · dry-run · capability/permission · Apple Health /
Health Connect writer · real-write · no-fake-success · secret/endpoint ·
idempotency · fixture · native iOS/Android surfaces are full-lane only.
Re-issue as:

  FOCUSED CR     — bounded behavior or wiring task
  FULL FRAMEWORK — compose → execute → review → close
  (safety-sensitive → /mwr-safety-critical)
EOF
      exit 2
      ;;
  esac
done

exit 0

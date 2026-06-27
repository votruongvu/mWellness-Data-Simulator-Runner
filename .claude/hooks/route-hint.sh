#!/usr/bin/env bash
# UserPromptSubmit hook — Route hint (mWellness-Mobile-Runner / MWR)
#
# When the user's prompt starts with DIRECT PATCH / FOCUSED CR /
# FULL FRAMEWORK, write a small session-state file naming the route and
# emit one short Route: line with MWR lane constraints. No adapter context
# loaded, no deep classification.

set -euo pipefail

INPUT="$(cat)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
STATE_DIR="$ROOT/.claude/state"
mkdir -p "$STATE_DIR"
ROUTE_FILE="$STATE_DIR/route"

PROMPT="$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print('')
    sys.exit(0)
print(d.get('prompt') or d.get('user_message') or '')
" 2>/dev/null || printf '')"

HEAD="$(printf '%s' "$PROMPT" | head -c 200)"

if printf '%s' "$HEAD" | grep -qiE '^[[:space:]]*(DIRECT PATCH\b|/direct-patch\b)'; then
  printf 'direct-patch\n' > "$ROUTE_FILE"
  echo 'Route: Direct Patch (tiny) — no agents, no adapter context, compact 5-field output (Result / Files / Tests / Risk / Next). High-risk surfaces are NOT allowed here: backend client/auth/session, scenario interpretation/contract, execution plan, dry-run semantics, capability/permission flow, Apple Health / Health Connect writer, any real-write path, no-fake-success reporting, secrets/tokens/endpoints, idempotency, fixtures, redaction, run-mode toggles, native iOS/Android.'
  exit 0
fi

if printf '%s' "$HEAD" | grep -qiE '^[[:space:]]*(FOCUSED PATCH|FOCUSED CR)'; then
  printf 'focused-cr\n' > "$ROUTE_FILE"
  echo 'Route: Focused CR (light) — bounded behavior/wiring task, focused context only. Escalate to Full Framework if a high-risk MWR surface is touched.'
  exit 0
fi

if printf '%s' "$HEAD" | grep -qiE '^[[:space:]]*FULL FRAMEWORK'; then
  printf 'full-framework\n' > "$ROUTE_FILE"
  echo 'Route: Full Framework (full) — high-risk workflow allowed (compose → execute → review → close). Health-write / dry-run / secrets / capability-permission gates and the hard human-approval gates apply.'
  exit 0
fi

# Not a route-marked prompt — clear stale route, inject nothing.
rm -f "$ROUTE_FILE"
exit 0

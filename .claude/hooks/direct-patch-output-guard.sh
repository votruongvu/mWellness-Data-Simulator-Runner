#!/usr/bin/env bash
# Stop hook — Direct Patch output guard (mWellness-Mobile-Runner / MWR)
#
# When the current route is Direct Patch, scan the last assistant message
# for FULL-lane report sections. If detected, block stop and ask for the
# 5-field compact shape. Other routes pass through.

set -euo pipefail

INPUT="$(cat)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
ROUTE_FILE="$ROOT/.claude/state/route"

ROUTE=""
[ -f "$ROUTE_FILE" ] && ROUTE="$(cat "$ROUTE_FILE" 2>/dev/null || printf '')"
if [ "$ROUTE" != "direct-patch" ]; then
  exit 0
fi

TRANSCRIPT="$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print('')
    sys.exit(0)
print(d.get('transcript_path') or '')
" 2>/dev/null || printf '')"

[ -z "$TRANSCRIPT" ] && exit 0
[ ! -f "$TRANSCRIPT" ] && exit 0

LAST_TEXT="$(python3 - "$TRANSCRIPT" <<'PY' 2>/dev/null || printf ''
import json, sys
path = sys.argv[1]
last = ""
try:
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            role = obj.get("role") or obj.get("message", {}).get("role")
            if role != "assistant":
                continue
            content = obj.get("content") or obj.get("message", {}).get("content", [])
            if isinstance(content, list):
                for c in content:
                    if isinstance(c, dict) and c.get("type") == "text":
                        last = c.get("text", "")
            elif isinstance(content, str):
                last = content
except Exception:
    pass
print(last[:8000])
PY
)"

if printf '%s' "$LAST_TEXT" | grep -qiE '^##[[:space:]]+(Human Summary|Portable handoff|Closure Report|Closure Summary|Refresh report)'; then
  cat >&2 <<'EOF'
🛑 Direct Patch output shape violation: last response contains FULL-lane sections.

Direct Patch uses the 5-field compact shape ONLY:

  Result:
  Files:
  Tests:
  Risk:
  Next:

Re-render without Human Summary / Portable handoff / Closure Report /
Closure Summary / Refresh report headers — those are FULL-lane only.
EOF
  exit 2
fi

exit 0

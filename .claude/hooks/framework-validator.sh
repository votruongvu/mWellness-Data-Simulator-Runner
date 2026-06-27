#!/usr/bin/env bash
# PostToolUse hook — Framework validator (mWellness-Mobile-Runner / MWR)
#
# After an Edit/Write/MultiEdit, if the changed file lives under .claude/
# or .claude-framework/, run the structural validator. Silent on pass;
# reports the tail on fail (exit 2 surfaces stderr). Does NOT run for
# ordinary MWR application source edits.

set -euo pipefail

INPUT="$(cat)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

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

case "$TARGET" in
  */.claude/*|*/.claude-framework/*|.claude/*|.claude-framework/*) ;;
  *) exit 0 ;;
esac

cd "$ROOT"
# During framework bootstrap the validator may not be authored yet; skip silently.
[ -f .claude-framework/scripts/validate-framework.sh ] || exit 0
if ! OUTPUT="$(bash .claude-framework/scripts/validate-framework.sh 2>&1)"; then
  echo "⚠️  validate-framework.sh FAILED after edit to $TARGET" >&2
  printf '%s\n' "$OUTPUT" | tail -12 >&2
  exit 2
fi

exit 0

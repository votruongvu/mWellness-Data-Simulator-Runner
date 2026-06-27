#!/usr/bin/env bash
# Claude Code Stop hook:
# Run the existing direct-patch guard, then show a macOS notification.
# Preserves the guard exit code.

set -u

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
HOOK_DIR="$PROJECT_DIR/.claude/hooks"
GUARD="$HOOK_DIR/direct-patch-output-guard.sh"

GUARD_EXIT=0

if [ -f "$GUARD" ]; then
  bash "$GUARD"
  GUARD_EXIT=$?
fi

if command -v terminal-notifier >/dev/null 2>&1; then
  terminal-notifier \
    -title "MWR Mobile Loop" \
    -message "Claude has stopped or finished a block. Please review the closeout." \
    -sound "Hero" >/dev/null 2>&1 || true
else
  /usr/bin/osascript -e 'display notification "Claude has stopped or finished a block. Please review the closeout." with title "MWR Mobile Loop" sound name "Funk"' >/dev/null 2>&1 || true
fi

exit "$GUARD_EXIT"

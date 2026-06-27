#!/usr/bin/env bash
# Claude Code Notification hook:
# Show a macOS notification when Claude needs attention.

set -u

if command -v terminal-notifier >/dev/null 2>&1; then
  terminal-notifier \
    -title "Claude Code" \
    -message "Claude needs your attention, approval, or input." \
    -sound "Submarine" >/dev/null 2>&1 || true
else
  /usr/bin/osascript -e 'display notification "Claude needs your attention, approval, or input." with title "Claude Code" sound name "Funk"' >/dev/null 2>&1 || true
fi

exit 0

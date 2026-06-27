#!/usr/bin/env bash
# Structural validator for the mWellness-Mobile-Runner (MWR) Claude operating module.
# Checks: existence + non-empty + agent tools + content guards + terminology guard
# + DM1 product-truth leakage guard + macOS-metadata guard + context-pack paths.
# Exit 0 = pass (warnings allowed), 1 = one or more failures.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || { echo "[mwr-validate] cannot cd to repo root"; exit 1; }

ERRORS=0
WARN=0
fail()  { echo "  ✗ FAIL: $*"; ERRORS=$((ERRORS+1)); }
warn()  { echo "  ! warn: $*"; WARN=$((WARN+1)); }
ok()    { :; }

need_file() { if [ -s "$1" ]; then ok; else fail "missing/empty: $1"; fi; }
need_dir()  { if [ -d "$1" ]; then ok; else fail "missing dir: $1"; fi; }

echo "[mwr-validate] root: $ROOT"

# 1. Root files -------------------------------------------------------------
echo "[1] root files"
for f in CLAUDE.md .claude/HANDOFF.md .claude/settings.json \
         .claude-framework/README.md \
         .claude-framework/scripts/validate-framework.sh \
         .claude-framework/scripts/validate_context_pack_paths.py; do
  need_file "$f"
done

# 2. Required directories ---------------------------------------------------
echo "[2] directories"
for d in .claude/commands .claude/skills .claude/agents .claude/hooks .claude/state \
         .claude-framework/adapter .claude-framework/execution \
         .claude-framework/framework/rules .claude-framework/framework/checklists \
         .claude-framework/framework/templates .claude-framework/framework/context \
         .claude-framework/scripts \
         .claude-framework/artifacts/requirements .claude-framework/artifacts/stories \
         .claude-framework/artifacts/tasks .claude-framework/artifacts/reviews \
         .claude-framework/artifacts/decision-briefs .claude-framework/artifacts/handoffs \
         docs/requirements docs/architecture docs/contracts docs/safety docs/roadmap; do
  need_dir "$d"
done

# 3. Adapter context files (current truth) ----------------------------------
echo "[3] adapter files"
for a in project-source-of-truth current-decisions known-risks human-approval-gates \
         repository-map settings-map test-map wiring-paths regression-fixtures \
         pending-promotions prompt-overrides known-legacy milestone-log; do
  need_file ".claude-framework/adapter/$a.md"
done

# 4. Lifecycle skill + command pairs ----------------------------------------
echo "[4] lifecycle skill+command pairs"
for s in refresh-context compose-req req-to-stories story-to-tasks compose-task \
         execute-task review-task close-task direct-patch; do
  need_file ".claude/skills/$s/SKILL.md"
  need_file ".claude/commands/$s.md"
done
# run-phase-loop is a command (no skill); confirm it exists
need_file ".claude/commands/run-phase-loop.md"

# 5. Execution loop layer ---------------------------------------------------
echo "[5] execution layer"
for e in MWR_EXECUTION_CONTROLLER MWR_EXECUTION_STATE MWR_LOOP_RUNBOOK \
         MWR_HUMAN_APPROVAL_GATES MWR_LOOP_CLOSEOUT_TEMPLATE MWR_STOP_CONDITIONS \
         MWR_PHASE_QUEUE; do
  need_file ".claude-framework/execution/$e.md"
done

# 6. Rules (load-bearing) ---------------------------------------------------
echo "[6] rules"
for r in operating-principles gates lane-classification prompt-rules report-format \
         documentation-rules testing-rules refactor-rules security-rules \
         secret-endpoint-safety-rules artifact-lifecycle internal-release-rules \
         rn-testing-rules rn-performance-rules rn-ui-quality-rules \
         test-data-safety-rules platform-writer-rules execution-plan-rules \
         backend-api-rules; do
  need_file ".claude-framework/framework/rules/$r.md"
done

# 7. Checklists (crown-jewel safety set must exist) -------------------------
echo "[7] checklists"
for c in apple-health-write-checklist health-connect-write-checklist \
         dry-run-no-write-checklist no-fake-success-checklist \
         capability-permission-checklist secret-endpoint-safety-checklist \
         test-data-safety-checklist scenario-contract-checklist \
         execution-plan-runner-checklist execution-determinism-checklist \
         platform-writer-contract-checklist backend-api-contract-checklist \
         run-reporting-checklist wiring-audit rn-testing-checklist \
         rn-performance-checklist rn-ui-quality-checklist \
         mobile-exploratory-qa-checklist post-patch-verification \
         prompt-review internal-release-checklist; do
  need_file ".claude-framework/framework/checklists/$c.md"
done

# 8. Templates --------------------------------------------------------------
echo "[8] templates"
for t in requirement story task task-brief task-brief-compact task-review-compact \
         review decision-brief handoff session-closeout-compact test-case-set \
         mobile-qa-report; do
  need_file ".claude-framework/framework/templates/$t.md"
done

# 9. Context ----------------------------------------------------------------
echo "[9] context"
for x in README mental-model mwr-skill-command-anatomy mwr-review-fanout-pattern \
         mwr-framework-guide context-pack-registry skill-registry; do
  need_file ".claude-framework/framework/context/$x.md"
done

# 10. Agents declare tools --------------------------------------------------
echo "[10] agents (must declare tools:)"
need_file ".claude/agents/README.md"
for ag in mwr-rn-architecture-reviewer mwr-test-reviewer mwr-doc-sync-reviewer \
          mwr-apple-health-write-reviewer mwr-health-connect-write-reviewer \
          mwr-backend-api-reviewer mwr-test-data-and-health-write-safety-reviewer \
          mwr-execution-plan-reviewer mwr-codebase-explorer \
          mwr-implementation-agent mwr-prompt-composer; do
  f=".claude/agents/$ag.md"
  need_file "$f"
  if [ -f "$f" ] && ! grep -qiE '^tools:' "$f"; then fail "agent missing 'tools:' frontmatter: $f"; fi
done

# 11. Hooks -----------------------------------------------------------------
echo "[11] hooks"
for h in notification-only framework-validator stop-guard-and-notify route-hint \
         direct-patch-output-guard protected-edit-guard; do
  need_file ".claude/hooks/$h.sh"
done

# 12. CLAUDE.md content guards ----------------------------------------------
echo "[12] CLAUDE.md content guards"
for phrase in "Context Layer" "Artifact truth" "Context Promotion" "source of truth" "human"; do
  grep -qi "$phrase" CLAUDE.md || fail "CLAUDE.md missing required phrase: '$phrase'"
done
grep -qi "scenario contract first" CLAUDE.md || warn "CLAUDE.md should state the operating principle (backend runnable scenario contract first ...)"

# 13. Skills are not routers ('## Agent crew' must not appear in a skill) ----
echo "[13] skills carry no '## Agent crew'"
if grep -rIl "## Agent crew" .claude/skills >/dev/null 2>&1; then
  fail "a SKILL.md contains '## Agent crew' (belongs in the command layer only)"
fi

# 14. Terminology guard: 'Google HealthKit' only in a correction/negation ---
# Markdown surfaces only (scripts/hooks legitimately carry guard pattern strings).
echo "[14] terminology guard (Health Connect, never 'Google HealthKit')"
while IFS= read -r line; do
  # OK if the term is quoted (named as the wrong term) ...
  echo "$line" | grep -qE '"Google HealthKit"' && continue
  # ... or the line carries a correction/negation marker.
  echo "$line" | grep -qiE 'never|not |not-|no |wrong|incorrect|forbidden|≠|instead|terminology|correction|P0|guard|prohibit|flag|reject|legacy|supersed|mislabel|call it|call Health' && continue
  fail "stray 'Google HealthKit' (Android target is Health Connect): ${line:0:120}"
done < <(grep -rInE --include='*.md' "Google HealthKit" CLAUDE.md .claude .claude-framework docs 2>/dev/null || true)

# 15. DM1 product-truth leakage guard (pure-rename tokens must never appear) -
# Markdown surfaces only; known-legacy.md and correction-context lines are allowed.
echo "[15] DM1 leakage guard"
LEAK=$(grep -rInE --include='*.md' "mwdm1|Mwdm1|ADR-MW-DM1|mWellness-DM1" \
        CLAUDE.md .claude .claude-framework docs 2>/dev/null \
        | grep -vi "known-legacy.md" \
        | grep -viE 'supersed|legacy|historical|replaced|former|previous|not |never|reused mechanics' || true)
if [ -n "$LEAK" ]; then
  echo "$LEAK" | while IFS= read -r l; do fail "DM1 rename leakage: ${l:0:120}"; done
fi

# 16. Artifact buckets non-empty or .gitkeep --------------------------------
echo "[16] artifact buckets"
for b in requirements stories tasks reviews decision-briefs handoffs; do
  d=".claude-framework/artifacts/$b"
  if [ -d "$d" ] && [ -z "$(ls -A "$d" 2>/dev/null)" ]; then warn "empty artifact bucket (add .gitkeep): $d"; fi
done

# 17. macOS metadata must not be tracked ------------------------------------
echo "[17] macOS metadata guard"
# Only git-TRACKED files matter — gitignored trees (node_modules/, ios/Pods,
# android/build, etc.) legitimately contain third-party .DS_Store and are never
# committed. The real risk is committing macOS cruft, so check the index.
if git ls-files 2>/dev/null | grep -qE '(^|/)(\.DS_Store|\._|__MACOSX)'; then
  fail "macOS metadata is git-tracked (__MACOSX/.DS_Store/._*) — git rm it before commit"
fi

# 18. Context-pack path validation ------------------------------------------
echo "[18] context-pack path validation"
if command -v python3 >/dev/null 2>&1; then
  if python3 .claude-framework/scripts/validate_context_pack_paths.py; then ok; else
    rc=$?
    if [ "$rc" = "1" ]; then fail "context-pack path validation reported missing non-deferred paths"; else warn "context-pack validator could not run (rc=$rc)"; fi
  fi
else
  warn "python3 not available; skipped context-pack path validation"
fi

# Summary -------------------------------------------------------------------
echo ""
echo "[mwr-validate] errors=$ERRORS warnings=$WARN"
if [ "$ERRORS" -gt 0 ]; then echo "[mwr-validate] RESULT: FAIL"; exit 1; fi
echo "[mwr-validate] RESULT: PASS"
exit 0

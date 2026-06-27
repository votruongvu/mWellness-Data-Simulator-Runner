#!/usr/bin/env python3
"""validate_context_pack_paths.py — mWellness-Mobile-Runner (MWR).

Validates that concrete repo-relative document paths referenced in
`.claude-framework/framework/context/context-pack-registry.md` actually
exist on disk, so context-pack <-> reality drift is caught before a prompt
relies on a broken pack.

Policy:
  * a concrete path that exists                                  -> OK
  * a concrete path on a line marked TO_VERIFY / "seed pending"
    / DEFERRED / "does not exist yet"                            -> INFO (expected-missing)
  * a concrete path that is missing and NOT deferred             -> ERROR (exit 1)

Only CONCRETE repo-relative markdown/json paths are checked
(docs/…, .claude-framework/…, .claude/…, CLAUDE.md). Conceptual slices,
gate names, and bare W-DM1-00x ids are NOT paths.

Stdlib only. Exit 0 = no hard errors; 1 = a non-deferred path missing;
2 = the validator could not run.
"""
import os
import re
import subprocess
import sys

REGISTRY = ".claude-framework/framework/context/context-pack-registry.md"
DEFER_MARKERS = ("TO_VERIFY", "seed pending", "DEFERRED", "does not exist yet", "pending)")
# concrete repo-relative path tokens we care about
PATH_RE = re.compile(r"(?:docs/[\w./-]+\.md|\.claude-framework/[\w./-]+\.md|\.claude/[\w./-]+\.md|\bCLAUDE\.md)")


def repo_root() -> str:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, check=True,
        )
        return out.stdout.strip()
    except Exception:
        return os.getcwd()


def main() -> int:
    root = repo_root()
    reg = os.path.join(root, REGISTRY)
    if not os.path.isfile(reg):
        print(f"[context-packs] ERROR: registry not found: {REGISTRY}", file=sys.stderr)
        return 2

    errors, infos, oks = [], [], 0
    with open(reg, encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            deferred = any(m in line for m in DEFER_MARKERS)
            for m in PATH_RE.findall(line):
                target = os.path.join(root, m)
                if os.path.isfile(target):
                    oks += 1
                elif deferred:
                    infos.append((lineno, m))
                else:
                    errors.append((lineno, m))

    for lineno, m in infos:
        print(f"[context-packs] INFO line {lineno}: deferred/expected-missing path: {m}")
    for lineno, m in errors:
        print(f"[context-packs] ERROR line {lineno}: missing non-deferred path: {m}", file=sys.stderr)

    print(f"[context-packs] {oks} path(s) OK, {len(infos)} deferred, {len(errors)} error(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())

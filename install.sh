#!/usr/bin/env bash
# Copy every skill in this repo into ~/.claude/skills/
# Re-run anytime to sync updates. Existing skills with the same name are overwritten.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

mkdir -p "$DEST"

count=0
# A skill is any directory containing a SKILL.md
while IFS= read -r -d '' skill; do
  name="$(basename "$skill")"
  rm -rf "${DEST:?}/$name"
  cp -R "$skill" "$DEST/$name"
  echo "  installed $name"
  count=$((count + 1))
done < <(find "$REPO" -mindepth 2 -maxdepth 2 -type d -exec test -f '{}/SKILL.md' \; -print0)

echo "Done — $count skill(s) installed into $DEST"
echo "Start a new Claude Code session to pick them up."

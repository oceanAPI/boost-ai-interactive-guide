#!/opt/homebrew/bin/bash
set -euo pipefail

INPUT=$(cat)
# Guard against infinite loop
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_FILE="$PROJECT_DIR/docs/STATE.md"

# Only update if STATE.md exists — don't create one
[ -f "$STATE_FILE" ] || exit 0

# Read existing STATE.md, replace the auto-managed block between the markers
# If markers don't exist, append the block at the bottom
TS=$(date -Iseconds)
BRANCH=$(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
STATUS=$(git -C "$PROJECT_DIR" status --short 2>/dev/null | head -20)
LAST_COMMIT=$(git -C "$PROJECT_DIR" log -1 --oneline 2>/dev/null || echo "(no commits)")

AUTO_BLOCK=$(cat <<EOF
<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: $TS
Branch: $BRANCH
Last commit: $LAST_COMMIT
Working tree:
\`\`\`
${STATUS:-(clean)}
\`\`\`
<!-- AUTO-HOOK-END -->
EOF
)

if grep -q "AUTO-HOOK-BEGIN" "$STATE_FILE"; then
  sed '/AUTO-HOOK-BEGIN/,/AUTO-HOOK-END/d' "$STATE_FILE" > "$STATE_FILE.tmp"
  printf '%s\n' "$AUTO_BLOCK" >> "$STATE_FILE.tmp"
  mv "$STATE_FILE.tmp" "$STATE_FILE"
else
  printf "\n%s\n" "$AUTO_BLOCK" >> "$STATE_FILE"
fi

exit 0

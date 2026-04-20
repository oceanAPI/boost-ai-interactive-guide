#!/opt/homebrew/bin/bash
set -euo pipefail

INPUT=$(cat)
SOURCE=$(echo "$INPUT" | jq -r '.source // "unknown"')
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

cat <<EOF
=== RESUMPTION CONTEXT (source=$SOURCE) ===

## Git
branch: $(git -C "$PROJECT_DIR" branch --show-current 2>/dev/null)
$(git -C "$PROJECT_DIR" status --short 2>/dev/null | head -20)

## Recent commits
$(git -C "$PROJECT_DIR" log --oneline -10 2>/dev/null)

## Current STATE.md
$(cat "$PROJECT_DIR/docs/STATE.md" 2>/dev/null || echo "(STATE.md not found)")

## Last 50 lines of JOURNAL.md
$(tail -50 "$PROJECT_DIR/docs/JOURNAL.md" 2>/dev/null || echo "(JOURNAL.md not found)")

=== END RESUMPTION CONTEXT ===
EOF
exit 0

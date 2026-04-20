#!/opt/homebrew/bin/bash
set -euo pipefail

INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
TRIGGER=$(echo "$INPUT" | jq -r '.trigger // "unknown"')
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

[ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ] || exit 0

# Backup transcript
BACKUP_DIR="$PROJECT_DIR/.claude/backups"
mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
cp "$TRANSCRIPT" "$BACKUP_DIR/transcript_${TRIGGER}_${TS}.jsonl"

# Prune: keep only the 10 most-recent backups
ls -1t "$BACKUP_DIR"/transcript_*.jsonl 2>/dev/null | tail -n +11 | xargs -r rm -- 2>/dev/null || true

# Append compaction checkpoint to JOURNAL.md
JOURNAL="$PROJECT_DIR/docs/JOURNAL.md"
[ -f "$JOURNAL" ] || exit 0

{
  echo ""
  echo "## Compaction checkpoint — $(date -Iseconds) (trigger=$TRIGGER)"
  echo ""
  echo "**Last 5 user prompts:**"
  jq -r 'select(.type=="user") | .message.content | if type=="string" then . else (.[]?.text // empty) end' "$TRANSCRIPT" 2>/dev/null \
    | grep -v '^$' | tail -5 | sed 's/^/- /' | head -c 2000
  echo ""
  echo ""
  echo "**Files edited this session:**"
  jq -r 'select(.type=="assistant") | .message.content[]?
         | select(.type=="tool_use" and (.name=="Edit" or .name=="Write" or .name=="MultiEdit"))
         | .input.file_path' "$TRANSCRIPT" 2>/dev/null | sort -u | sed 's/^/- /'
  echo ""
  echo "**Git at compact:**"
  echo '```'
  git -C "$PROJECT_DIR" status --short 2>/dev/null | head -20
  git -C "$PROJECT_DIR" log -1 --oneline 2>/dev/null
  echo '```'
} >> "$JOURNAL"

exit 0

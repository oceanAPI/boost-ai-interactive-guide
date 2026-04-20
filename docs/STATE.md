# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — 3 commits ahead of origin/main (unpushed): 6940a2a, c01fab6, 2420e3f

## Current goal
Stand up the structured context-management system so new Claude Code sessions resume without re-onboarding.

## Step
5 of ~8 in the setup plan.
- [x] Audit existing CLAUDE.md / AGENTS.md / REFERENCE.md
- [x] Move REFERENCE.md to docs/ with staleness header
- [x] Draft docs/ARCHITECTURE.md from current code (c01fab6)
- [x] Create STATE.md / JOURNAL.md / GOTCHAS.md (2420e3f)
- [x] Rewire CLAUDE.md as thin @import loader (2420e3f)
- [ ] Install hooks (SessionStart, PreCompact, Stop, PostToolUse)  ← next
- [ ] Add /prime slash command
- [ ] Add subagents (researcher, file-summarizer, pre-commit-reviewer)

## Last-green SHA
2420e3f (local, unpushed)

## Blockers
None. 3 commits ready to push to origin/main when user is ready.

## Next action
Install SessionStart + PreCompact + Stop + PostToolUse hooks under .claude/hooks/, wire them into .claude/settings.json.

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-04-20T21:49:34+02:00
Branch: main
Last commit: 2420e3f docs: thin CLAUDE.md loader + STATE/JOURNAL/GOTCHAS living docs
Working tree:
```
D  .claude/settings.local.json
 M .gitignore
 M docs/JOURNAL.md
 M docs/STATE.md
?? .claude/
?? customer_excellence_raw_data_pdfs/
```
<!-- AUTO-HOOK-END -->

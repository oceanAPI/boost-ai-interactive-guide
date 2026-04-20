# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main (up to date with origin/main after the pending push of c01fab6 + 6940a2a)

## Current goal
Stand up the structured context-management system (thin CLAUDE.md + living docs + hooks + subagents + slash commands) so new Claude Code sessions resume without re-onboarding.

## Step
3 of ~8 in the setup plan.
- [x] Audit existing CLAUDE.md / AGENTS.md / REFERENCE.md
- [x] Move REFERENCE.md to docs/ with staleness header
- [x] Draft docs/ARCHITECTURE.md from current code (commit c01fab6)
- [ ] Create STATE.md / JOURNAL.md / GOTCHAS.md  ← here
- [ ] Rewire CLAUDE.md as thin loader with @imports
- [ ] Install hooks (SessionStart, PreCompact, Stop, PostToolUse)
- [ ] Add /prime slash command
- [ ] Add subagents (researcher, file-summarizer, pre-commit-reviewer)

## Last-green SHA
c01fab6 (docs commit, local only, unpushed)

## Blockers
None.

## Next action
Create JOURNAL.md and GOTCHAS.md in this task, then move to CLAUDE.md rewire.

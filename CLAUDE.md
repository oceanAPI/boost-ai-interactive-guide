# Interactive Guide — Claude Code loader

@AGENTS.md
@docs/ARCHITECTURE.md
@docs/STATE.md
@docs/GOTCHAS.md

## Session start protocol

Do this before editing anything:

1. Read `docs/STATE.md` — the current goal, step, blockers, and next action.
2. Read the last 30 lines of `docs/JOURNAL.md` for recent context.
3. Run `git status` and `git log --oneline -10`. If the tree disagrees with STATE.md, STOP and ask.
4. Restate the plan in 3–6 bullets. Wait for confirmation before editing.

## Working rules

- **Read before you write.** When touching a section, component, or data file, read the live file in `src/` — do not rely on REFERENCE.md for page structure or admin shape. Trust `docs/ARCHITECTURE.md` for "how does the app work," `src/app/globals.css` + `src/**/_types.ts` when in doubt.
- **Mirror the golden path.** The 9 new CE sections (Agenda, Performance, Benchmarking, etc.) are the canonical pattern for section + modal + data-testid + customer-field reads. New sections follow their shape unless there's a written reason not to.
- **Preserve data-testids.** Pac-Man's feedback capture depends on them. Rename a testid only with intent.
- **No CI gates.** Deploy has no lint/test step. Before committing, run `npm run build` locally and smoke-check the dev server. Catch runtime breaks before push.
- **URL payload ceiling.** The encoded `?data=` param is dev-capped at 65 KB via `NODE_OPTIONS`. Any fixture enrichment that breaks that ceiling is a blocker — flag it, don't ship it.
- **Security industry stays HIDDEN.** Do not surface `security` in admin chips or public-facing UI without an explicit request to unhide.
- **Extensions staging tree.** New industries / variants / patterns / fixtures / agents are authored under `src/data/extensions/` FIRST, not in prod files. The user authors in `extensions/`, and wiring them into prod follows the splice recipe in `src/data/extensions/integration-guide.md`. If the user mentions "I added X" for any of these data types:
  1. Check `src/data/extensions/<kind>/` for new files.
  2. Follow `integration-guide.md` to wire them into their prod barrels (`COMPANY_PATTERNS`, `CUSTOMER_FIXTURES`, `INDUSTRIES`, `INDUSTRY_VARIANTS`, `ORCHESTRATOR_BY_INDUSTRY`, `SPECIALIST_AGENTS`).
  3. Do NOT duplicate data into prod files by hand — inline from EXTENSION_* exports via spread-append (patterns, fixtures, variants) or by copying the records verbatim (INDUSTRIES, to preserve `as const`).

## Checkpoint discipline

At every meaningful checkpoint (feature branch, PR opened, blocker resolved, end of a working session):

1. Overwrite `docs/STATE.md` with the new goal / step / blockers / next action.
2. Append an entry to `docs/JOURNAL.md` — timestamp, what, why, next. Newest at bottom.
3. If the same mistake appeared twice, add a symptom/cause/fix entry to `docs/GOTCHAS.md`.

Do not skip these because "it's obvious right now." The whole point is that the next session (possibly a crashed resume) has no memory of what was obvious.

## Compact instructions

When compacting this session, preserve:
- The current goal and open decisions from STATE.md.
- Files edited this session (path list).
- Test / build / smoke-check status.
- The single next action.

You may drop: tool-call transcripts, file-read contents (re-read from disk on demand), exploratory greps, web fetches, and any reasoning the new context doesn't need to act.

After compacting, re-read `docs/STATE.md` before the next edit.

## Commits

- Conventional Commits format: `type(scope): summary`.
- One logical change per commit.
- Never amend or force-push `main`.
- When Claude wrote ≥50% of the diff, include `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Do not run `git push`. I push manually.

## AGENTS.md

`AGENTS.md` at root is a Next.js 16 breaking-changes banner, auto-inserted by Next.js tooling. It may be regenerated on `next upgrade`. Its one substantive instruction — check `node_modules/next/dist/docs/` before using Next APIs — stands.

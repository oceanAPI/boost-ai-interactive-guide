# Journal

> Append-only. Newest entries at the bottom. Each entry: timestamp, what, why, next.

---

## 2026-04-20 — Context-management foundation

**What**: Moved REFERENCE.md under docs/ with staleness header + freshness map. Drafted docs/ARCHITECTURE.md as the current-state onboarding doc, verified against main branch code (agent counts, audience defaults, route surface, Pac-Man/Worker wiring, build/deploy, known gaps). Committed as c01fab6 on top of c6940a2a (CE rebuild).

**Why**: REFERENCE.md had drifted ~40% stale — Page Architecture tree, admin structure, and agent-industry list no longer matched code. New Claude sessions were re-onboarding from scratch every time. ARCHITECTURE.md gives future sessions a trustworthy read at session start; REFERENCE.md survives as a lookup resource for its still-accurate sections (tokens, animations, UI components, hooks, orchestrator internals).

**Next**: Create STATE.md + JOURNAL.md + GOTCHAS.md (this entry), then rewire CLAUDE.md as a thin @import loader, then install SessionStart/PreCompact/Stop hooks.

---

## 2026-04-20 — Thin loader + living-state docs

**What**: Replaced the 1-line `@AGENTS.md` redirect in `CLAUDE.md` with a ~60-line thin loader: `@imports` for AGENTS + ARCHITECTURE + STATE + GOTCHAS, session-start protocol, working rules (read-before-write, golden-path mirroring, data-testid preservation, no-CI-gates awareness, URL payload ceiling, HIDDEN security industry), checkpoint discipline, compact instructions, and commit conventions. Seeded `STATE.md`, `JOURNAL.md` (this file), and `GOTCHAS.md` (3 known-gotcha entries). Committed as `2420e3f`.

**Why**: The live loader now auto-injects current project state on every session start — durable knowledge (ARCHITECTURE/REFERENCE/GOTCHAS) plus volatile state (STATE/JOURNAL) — so a resuming session reads its own situation instead of being re-onboarded by the user. The split between durable and volatile is deliberate: durable changes rarely, volatile is overwritten every turn.

**Next**: Install SessionStart + PreCompact + Stop + PostToolUse hooks under `.claude/hooks/` so state persistence becomes deterministic rather than discipline-dependent. These are the crash-safety layer — they write STATE/JOURNAL even when Claude forgets to.

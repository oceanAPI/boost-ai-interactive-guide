# Journal

> Append-only. Newest entries at the bottom. Each entry: timestamp, what, why, next.

---

## 2026-04-20 — Context-management foundation

**What**: Moved REFERENCE.md under docs/ with staleness header + freshness map. Drafted docs/ARCHITECTURE.md as the current-state onboarding doc, verified against main branch code (agent counts, audience defaults, route surface, Pac-Man/Worker wiring, build/deploy, known gaps). Committed as c01fab6 on top of c6940a2a (CE rebuild).

**Why**: REFERENCE.md had drifted ~40% stale — Page Architecture tree, admin structure, and agent-industry list no longer matched code. New Claude sessions were re-onboarding from scratch every time. ARCHITECTURE.md gives future sessions a trustworthy read at session start; REFERENCE.md survives as a lookup resource for its still-accurate sections (tokens, animations, UI components, hooks, orchestrator internals).

**Next**: Create STATE.md + JOURNAL.md + GOTCHAS.md (this entry), then rewire CLAUDE.md as a thin @import loader, then install SessionStart/PreCompact/Stop hooks.

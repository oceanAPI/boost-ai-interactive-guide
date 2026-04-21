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

---

## 2026-04-21 — Agents: support-family enrichment across 5 FS industries

**What**: Audited every agent file across all 7 industries vs the declared tier spec (primary = 6 caps / 6 quick actions / 10+ flow nodes / `avgResolutionTime` + `topTopic`). Finding: agent-content depth was on-spec across the board, but 4 industries (pension, wealth_management, fintech, credit_union) had only **one** topic group in their orchestrator config, while banking had 5. That flatness was what made the non-banking FS guides feel thin. Added 12 new primary-tier agents across insurance / pension / wealth / fintech / credit_union covering the support-family (customer-relationship, general-inquiries, join-or-leave equivalents, close-account). Regrouped each industry's `index.ts` into 3–4 topic groups + 1 cross-cutting standalone. One small data fix: `insurance/billing-and-payments.ts` was missing `topTopic` + `avgResolutionTime` — added both. Commits `9be4848` + the prior CE rebuild chain.

**Why**: User flagged the non-banking industries as visually flat. Banking was the clear exemplar. Matching its structural richness across the other industries brings the Orchestrator section up to the same scannable, group-driven feel regardless of customer industry.

**Next**: PS audience build — schema + fixture + 6 sections.

---

## 2026-04-21 — PS audience shipped (6/6 sections) + prod 414 fix

**What**: Built the full PS audience. Schema v1.2.0 with 7 new optional Customer fields (`handoff_checklist`, `project_framing`, `project_details`, `build_scope`, `roles_and_responsibilities`, `solution_architecture`, `out_of_scope`). Renamed from `ps_*` prefix to domain-named fields mid-sprint after user flagged the prefix as misleading (content is cross-audience — Sales/CE author most, PS enriches with technical depth). H&M fixture enriched with a full SoW for the "Launch 4 EU markets" expansion scenario (PL/CZ/AT/NL). Six sections wired into GuideClient: ProjectFraming (4-tab: brief/criteria/journey/math), BuildScope (4-tab: overview/channels/intelligence/integrations), Roles & Responsibilities (3-party swim lane), Solution Architecture (3-column flow poster), Out of Scope (numbered exclusions). HandoffChecklistChip was prototyped as a sticky top banner then deleted ("who asked for that" — fair, visual tax without payoff).

**Prod crash**: User reported "PS mode with H&M prefill keeps crashing in prod" after the PS build was live. Root-caused via `curl -sI` to HTTP 414 Request-URI Too Large from Varnish — GitHub Pages' CDN caps URLs at ~8 KB, and the H&M PS payload encodes to ~32 KB. Dev was masked by the `NODE_OPTIONS` header-size bump. Fix (commit `327948e`): moved `data` + `sections` params from query string to URL fragment. Fragments are client-only, never sent to server, no CDN cap. Admin emits fragment URLs; guide + slides pages read fragment-first with query-string fallback for back-compat with existing bookmarks. GOTCHAS.md updated with the 414 entry.

**User critique (end of session)**: ProjectFraming and SolutionArchitecture passed the design caliber bar (ImpactSection / ScopeOfWorkSection reference). BuildScope / Roles / OutOfScope did not — "shitty design, no icons, faded colour frames for tags, quality dropped mid-sprint." Root cause: I rushed the last 3 sections and never touched the `public/icons/purple/*.svg` library (99 icons) + `BoostIcon.tsx` component the project has been using everywhere else.

**Why**: PS is the other half of the audience model (Sales / CE / PS). Without it the three-audience architecture was only notional. The H&M expansion scenario demonstrates the Sales → PS → CE → PS (re-engage) lifecycle using one customer record, which is the product's core value prop.

**Next**: Redesign pass on BuildScope / Roles / OutOfScope using the real icon library + ImpactSection-caliber visual metaphors. One section at a time. No batching. ProjectFraming and SolutionArchitecture stay as they are unless a sweeping token change reaches them.

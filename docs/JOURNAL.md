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

## Compaction checkpoint — 2026-04-22T10:08:29+02:00 (trigger=auto)

**Last 5 user prompts:**
- </script>
- Embed script
- Chat panel
- Add the chat panel embed code before the closing </body> tag. This only adds the chat panel to the website.
- You still need to decide if you want to trigger the chat by using one of the out-of-the-box chat launcher alternatives we provide or if you would like to use custom code to let your developers have full control. Choose how to open it here.


**Files edited this session:**
- /Users/mikalmonslaup/.claude/plans/cheerful-waddling-treasure.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/.claude/hooks/pre-compact.sh
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/.claude/hooks/session-start.sh
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/.claude/hooks/stop.sh
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/.claude/hooks/user-prompt-submit.sh
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/.claude/settings.json
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/.gitignore
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/CLAUDE.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/docs/ARCHITECTURE.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/docs/GOTCHAS.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/docs/JOURNAL.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/docs/REFERENCE.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/docs/STATE.md
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/package.json
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/app/admin/page.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/app/guide/GuideClient.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/app/guide/page.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/app/page.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/app/slides/page.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/FeedbackBacklog.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/HandoffChecklistChip.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/SlideshowClient.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/AgendaSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/AgentSwotSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/AgenticBeforeAfterSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/BenchmarkingSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/BuildScopeSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/DemoPreviewSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/GovernanceSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/OutOfScopeSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/PerformanceSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/ProjectFramingSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/RolesAndResponsibilitiesSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/SolutionArchitectureSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/SuccessPlanSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/TopRecommendationsSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/UatStatusSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/agent-swot/AgentSwotDetailModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/agentic-before-after/AgenticOutcomeDetailModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/benchmarking/BenchmarkDetailModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/demo/LiveChatSection.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/governance/StakeholderModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/performance/PerformanceTileDetailModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/success-plan/InitiativeDetailModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/components/sections/top-recommendations/RecommendationDetailModal.tsx
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/credit_union/general-inquiries.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/credit_union/index.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/credit_union/member-relationship.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/fintech/close-account.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/fintech/customer-relationship.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/fintech/general-inquiries.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/fintech/index.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/index.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/insurance/billing-and-payments.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/insurance/cancel-or-change-policy.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/insurance/customer-relationship.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/insurance/general-inquiries.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/insurance/index.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/pension/customer-relationship.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/pension/general-inquiries.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/pension/index.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/pension/join-pension.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/pension/leave-or-transfer.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/wealth_management/become-a-client.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/wealth_management/client-relationship.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/wealth_management/general-inquiries.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/wealth_management/index.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/agents/wealth_management/offboarding.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/audience-sections.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/company-patterns.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/customer-fixtures.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/data/topics/_reference.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/lib/boost-chat.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/lib/company-detect/curated.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/lib/company-detect/types.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/lib/slide-sections.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/lib/slideshow-bridge.ts
- /Users/mikalmonslaup/Desktop/Claude projects/interactive_guide_financial_service_offering/src/lib/types.ts

**Git at compact:**
```
 M docs/JOURNAL.md
 M docs/STATE.md
?? .claude/launch.json
?? customer_excellence_raw_data_pdfs/
7549819 Chat Preview: demo-mode chooser + live Chat API v2 chat
```

## 2026-04-22 — Chat Preview live-demo mode shipped + prod verified

**What**: Phase 1 of the Chat Preview rebuild shipped in `7549819`. The demo section is now a router on `customer.demo_mode` with three options — `"simulated"` (existing flow, still the default, still gates the AI Review feature), `"live"` (real boost.ai chat against shared `financewizard.boost.ai` tenant), `"custom_live"` (chat against a customer-specified tenant). Admin gets a new section 11 "Demos" with a 3-card chooser + conditional tenant input. Custom UI built on Chat API v2 REST (`src/lib/boost-chat.ts` + `LiveChatSection.tsx`) — renders html/text/links/image/video/ssml/json element types, supports START / POST text / POST action_link / DELETE / RESUME.

**CORS saga**: Chat API v2 needs the calling origin whitelisted in `Admin Panel → Settings → IP and domain allowlisting` (per official docs — despite earlier suspicion this was only for the chat-panel widget). User saved `oceanapi.github.io` and `localhost`. Prod origin works — `curl -X OPTIONS` returns `access-control-allow-origin: https://oceanapi.github.io`. Dev origin does not — boost.ai strips scheme from saved entries but browser sends `Origin: http://localhost:3000`, and `localhost` alone only matches default ports. Saving `localhost:3000` was rejected by the admin field as "invalid domain". Dev live chat is therefore broken with no clean path via boost.ai config. Acceptable — the simulated demo still works in dev, and the feature ships on prod.

**Verified on prod**: direct API POST with `Origin: https://oceanapi.github.io` + `{"command":"START"}` returns HTTP 200 with a real conversation ID + welcome response. User confirmed UI working on their end. Chrome extension verification blocked by their org policy on `oceanapi.github.io` (separate from the chat feature).

**Why**: The simulated demo is scripted — value is controlled but low signal. The live demo proves during a sales call that the platform actually answers real questions against a live tenant, and the future raw-data side panel (deferred) will show NLU confidence / intents per response as proof of the AI layer, not just the UI layer.

**Next**: Back to the paused PS section-quality redesign (BuildScope / Roles / OutOfScope still need `BoostIcon` + ImpactSection-caliber visual metaphors). Open decision for next session: Phase 2 raw-data side panel on live-demo mode. Chat API v2 already returns the NLU shape in every response — building it is pure rendering, no new API integration needed.


## 2026-04-22 — Phase 2b: "Analyze" button + Export API v4 data funnel

**What**: Shipped the NLU / routing side of the live-demo data funnel. The DataFunnelPanel (Phase 2a) now carries an **"Analyze with Export API"** invitation card. On click it calls a new Cloudflare Worker endpoint `/boost-export` which OAuth2-authenticates against boost.ai, runs an Export API v4 search with a 15-min date window, finds the session containing the Chat API v2 `posted_id`s we collected, dereferences intents / filters / skills / system-action-triggers from cached KV maps (1h TTL), and returns a lean per-turn trace. The panel replaces the invitation card with a "Routing & NLU trace" block: session meta header (ID, duration, reviewed badge) + Refresh button with "+N new turns" badge, action-type distribution bar with legend, per-user-turn intent trace, conditional handover events, conditional classification chip. The turn-timeline drawer is enriched with per-turn Action / Trigger / Intent / Match / Filter / Skill rows when Export data is present.

**Files**:
- `cloudflare-worker/src/index.ts` — new `/boost-export` route, `getBoostToken` with KV token cache (`boost:oauth-token`, TTL = `expires_in - 120s`), `getDereferenceMap` with per-map KV cache (`boost:map:<name>`, 1h TTL), `handleBoostExport` core
- `cloudflare-worker/wrangler.toml` — new var `BOOST_EXPORT_TENANT = "financewizard.boost.ai"`; secrets `BOOST_EXPORT_CLIENT_ID` / `_SECRET` set via `wrangler secret put`
- `src/lib/boost-export.ts` — `fetchExportTrace(postedIds, opts)` with 2s/3s/4s/5s retry ladder (~14s budget) for the ~10s Export API indexing delay; abort-aware
- `src/components/sections/demo/LiveChatSection.tsx` — collects `posted_id` on every `ingestPostResponse`, `handleAnalyze` snapshots count-before-await so "+N new" math stays correct when the user types during the analyze fetch, cleanup on reset + unmount
- `src/components/sections/demo/DataFunnelPanel.tsx` — `AnalyzeOrRouting` switch (invitation card / routing block), `RoutingBlock` with `ActionTypeBar` + intent list + handover list + category chip, `DrawerExportExtras` that merges Export fields into the existing turn drawer

**Key discoveries during build**:
1. `posted_id` from Chat API v2 **equals** `message.id` in Export API v4 — same integer ID space. Cross-lookup works by scanning Export response for any matching `message.id`.
2. `Conversation.reference` on financewizard's tenant returns `null` — unreliable as a cross-lookup key. `posted_id` matching is the right path.
3. Export API indexing takes ~10s after the Chat API v2 response lands. 4s is too fast, 12s is reliable. Client retries on `{indexed: false}`.
4. financewizard is a **generative-only** tenant for most queries — `predicted_intent_id` / `matched_filter` / `skill` are null on most turns. `displayed_action.action_type === "generative"` is the routing story. Domain queries like "I want to apply for a mortgage" *do* hit real content. The panel degrades gracefully — populated fields render, empty ones stay hidden, no em-dash parade.
5. Auto-review (`session.category.automatic`) is a **delayed batch job**, not live. Category chip only renders when populated — we don't poll for it.

**Deploy**: User runs `npx wrangler secret put BOOST_EXPORT_CLIENT_ID` + `BOOST_EXPORT_CLIENT_SECRET` + `npx wrangler deploy` in `cloudflare-worker/`. Client ships via GitHub Actions on push to main. Failure mode if Worker is missing / mis-configured: Analyze button shows "Analyse is off-line — Export API is not configured" message, rest of panel unchanged.

**Security note**: The test OAuth2 client secret was pasted into chat history during setup. User should rotate it via the Reset button in boost.ai admin → Security & Privacy → OAuth 2.0 after verifying the feature works. KV token cache invalidates on its own via `expires_in`, so no manual flush needed after rotation.

**Next**: Return to the paused PS section-quality redesign (BuildScope / Roles / OutOfScope still need `BoostIcon` + ImpactSection-caliber visual metaphors). Open follow-up on Phase 2: if a tenant with classical intents configured becomes available, point live-demo at it — the Intent trace and Matched filter rows will light up.

## 2026-04-22 — Phase 2b v2: "Wow signals" redesign + first-click reliability fix

**Symptoms we were fixing**:
1. First click on **Analyze** often failed ("Could not reach…" / empty); second click worked. Cause: retry budget was 14s but Export API indexing can take 15–22s in practice.
2. Even when analysis succeeded, the panel looked "extremely boring" — an action-type bar with 1–2 colors and a user-question list where every intent row showed an em-dash (financewizard is generative-only).

**What changed**:

**Retry budget**: `boost-export.ts` now uses a 30s budget with backoffs 2/3/4/5/6/7s. First click is reliable in practice.

**Proxy turn shape** (`boost-export-proxy/src/index.js`) — forwards richer per-turn fields:
- `intent_action_meta_id` (from `displayed_action`) → "Flow #N" on the card
- `transfer_to_human` (from `displayed_action`)
- `came_from` (from `came_from_action`) — for button-click-originated user turns
- `content_snippet` — first ~160 chars of the bot's rendered reply text (HTML-stripped) so each card can show "what it actually said" without a second round-trip
- `clicked_button_id` — for button-initiated user turns

**Panel redesign** (`DataFunnelPanel.tsx`, `RoutingBlock`):
- Replaced aggregated "Actions dispatched" bar + em-dashed intent trace with **per-exchange cards**. One card per user→bot round-trip. Welcome turn becomes a compact "Session opener" card.
- `groupExchanges()` walks the `trace.turns` array and buckets bot turns under the user turn that preceded them.
- Each card shows (rows conditionally rendered only when populated):
  - `#<index>` + user question (or "Session opener · VA welcome" for the opener)
  - **Routed to** — intent title · confidence if present, else "Generative fallback" / "Scripted content" / "API connector" / action_type
  - **Flow** — `#<meta_action_id>`
  - **Think time** — ms or seconds, computed from timestamp diff (sanity-capped at 60s)
  - **Triggers** — joined list of `system_action_trigger.title`s across the exchange
  - **API call** — only when any bot turn in the exchange has `action_type === "api_connector"`
  - **Filter / Skill / Handover / Match / Language** — conditional
  - **Reply** — italic `content_snippet` separated by a thin top-border
- `routedToLabel()` is the single "where did boost.ai send this?" label; financewizard → "Generative fallback" is the headline story. Tenants with classical intents → "Intent · <title>".

**Auto-refresh**: `LiveChatSection` gains a small `useEffect` that schedules a silent `handleAnalyze()` 15s after `postedIds.length` exceeds `analyzedPostedCount` — but only after the user has analysed at least once (`analyzedPostedCount > 0`). New turns during the wait cancel + reschedule. So the panel stays live as the conversation continues without the user needing to click Refresh.

**Deploy**: Two steps — user runs `fly deploy` in `boost-export-proxy/` to pick up the new proxy fields (additive, no breaking changes to the endpoint contract), then pushes the client commit. If proxy hasn't redeployed when client ships, cards render minus `content_snippet` / `intent_action_meta_id` rows — safe, graceful.

**What this changes for the demo narrative**: instead of "boost.ai returned a reply", the panel shows "boost.ai recognized this was out-of-scope for scripted flows, routed to Generative (LLM) in 840 ms, which composed the following reply". The "puzzle pieces" (action type, triggers, API connectors, intents, filters, meta action IDs) are exactly the signals a CE audience wants to see — they prove the platform's routing, not just its front-end.

**Next**: push + fly deploy + prod verify. Still paused: PS section-quality redesign.

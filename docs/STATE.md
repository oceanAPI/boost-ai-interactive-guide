# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — Engagement Framework foundation shipped (`caa3b12`). Voice + AI-Agent vocabulary backlog captured this session, not yet shipped.

## Current goal
Backlog captured for the next push, ordered by leverage. User wants to "revert back" so this STATE.md is the resume baseline.

---

## Voice + AI-Agent backlog (THIS SESSION'S TAKE)

User's 7 items + answers + my findings. Order = recommended ship sequence.

### A. Vocabulary unification — "1 AI Agent"
Codebase-wide rename pass:
- "Virtual agent" / "Virtual agents" / "VA" / "VAs" → **"AI Agent"** (capital A, singular)
- "Chatbot" / "chat bot" → **"AI Agent"**
- "Generative action" → **"Agentic action"**
- Position: "boost.ai sells **1 AI Agent**" (one customer = one AI Agent across channels)

Touches: admin labels (chat_va_external, voice_va field labels in pricing builder), pricing-2026.ts comments, ROADMAP_LANES strings ("Specialist agents"), agent registry copy, Hero / Trust copy, Topics content blocks, every "VA" or "chatbot" string.

**Lift**: 1–2 hrs. Single focused commit. Lowest risk, highest visibility.

### B. Channel picker — Voice / Chat / Both
New chip group early in admin journey: Voice / Chat / Both. Drives:
- Chat Preview visible only when chat is in scope
- Voice-specific section flavor (when wired in C–E below)
- ROI baseline-cost capture per channel (D)

User confirmed: only Chat Preview is strictly chat-only today; everything else channel-agnostic.

**Lift**: 2–3 hrs.

### C. Voice ROI wiring (per-channel baseline cost)
Voice baseline = `$/minute` (vs chat's `$/conversation`). Add `voice_cost_per_minute` to admin Section 3 alongside `conversation_cost`. ROI calculator computes per-channel monthly cost, sums for total.

Pricing math (csv tiers + invoice) is already correctly per-channel — only the BASELINE-COST INPUT was chat-shaped. Voice automation default 60% (vs chat's 80%) — promote to engagement_framework or per-channel agent-set average.

**Lift**: 3–4 hrs.

### D. Voice migration playbook → Roadmap mapping
User's mapping (from playbook PDF):
- Build = playbook's pre-pilot stages (Align + Assess + Enable + Test + Fix and plan + Ready)
- Pilot = Go Live moment
- Scale = Hypercare (2 weeks per playbook) + onwards
- Discovery still exists but compressed for voice migrations

Engagement framework gains:
- `migration: boolean` flag — distinguishes greenfield voice (build new) from migration (existing → Boost Voice)
- Different default phase weeks for voice migration vs chat greenfield
- Maps the playbook 8-phase checklist (Align / Assess / Enable / Test / Fix and plan / Ready / Go Live / Hypercare) onto the existing 4-phase Roadmap as Key Milestones overrides

**Lift**: 3–4 hrs.

### E. Roadmap section vision revision toward PDS
Audit done. Source of truth: `~/Downloads/Product Roadmap 2026 .pdf` (143 pages, canonical content pages 1-39 — slide 39 says "All slides after this will be archived soon").

**Already aligned** in code:
- `src/data/product-roadmap-2026.ts` — all 21 PDF items match exactly (4 NOW Q1, 8 SOON Q2, 9 LATER Q3-Q4)
- `src/data/product-vision.ts` — all 4 focus area vision paragraphs match PDF wording

**Missing from code** (PDF has, code doesn't yet):
1. Overall company tagline: "Trust every conversation"
2. Overall vision paragraph: "The future isn't about automation — it's about conversations"
3. Three Product Strategy pillars: **Simplifying complexity / Right level of Control / Security & Safety first** (with their full-paragraph descriptions from PDF page 3)
4. Per focus area: 4-phase breakdowns ("Phase 1: ... Phase 4: ...") — currently absent
5. Per focus area: "Value for your team and end users" 5-bullet sets
6. Boost Voice 4-phase delivery: "Phase 1: in-house voice offering ... Phase 4: end-to-end user engagement analytics"
7. Adaptive Voice + WebRTC + Voice Cloning + Multi-modal Avatars — all in roadmap items but PDF has richer copy

**Lift**: 2–3 hrs to add to `product-vision.ts` + render in `VisionTab.tsx`.

### F. Academy + Help Centers + Community section (NEW big section)
Three external surfaces:
- **Academy** — `https://academy.boost.ai/student/catalog` — public, course catalog. Sections: Quick overview / How do we build an AI agent? / How boost.ai leverages generative AI / Interested in knowing more?
- **Support / Help Center** — `https://support.boost.ai/` — gated behind Freshdesk OAuth (login required, can't WebFetch)
- **Trust Center** — `https://trustcenter.boost.ai/` — Vanta-powered dashboard (JS-rendered, can't extract via WebFetch)

User flagged Boost Camp / Community as part of this section — `BOOST_CAMP_EVENTS` already exists as a partial subset. New section bundles all four (Academy / Help Center / Trust Center / Community).

**Open**: user said they "might have to give material" for Academy and Help Centers. Defer authoring until material lands. Wire the three external URLs as cards now.

**Lift**: 2–3 hrs once material is in hand.

### G. Greenfield vs migration — admin shape
Two flows in admin:
- Greenfield: customer with no current voice → builds on Boost Voice
- Migration: customer with existing voice → migrates to Boost (playbook flow)

**Open question**: top-level chip in journey (clutters entry) vs preset within engagement framework (cleaner)? My recommendation: preset-within-framework. Awaiting user confirmation before shipping.

---

## Five remaining open questions for the user

1. **Voice pricing doc** — when "documentation of pricing" was mentioned (item #3): (a) the voice tiers already in `src/data/pricing-2026.ts` (Enterprise/Express + per-minute) ARE the documentation, or (b) separate Boost Voice pricing PDF exists?

2. **Academy material** — when ready, what shape: outline / draft text / full doc / link to existing material elsewhere?

3. **Help Centers + Community** — what's the boundary: Help Center = static docs, Community = forum/peer events? Or different split?

4. **Greenfield vs migration UI placement** — top-level chip OR preset within framework? (Recommendation: preset.)

5. **Voice + Chat combined deck shape** — defer per-value discussion to when divergent values are actually surfaced (user said "discuss each single value").

---

## Recently shipped (commits behind this session)

- `caa3b12` Engagement Framework foundation — first set of timeline knobs (total_weeks, phase_weeks, milestones, pilot_traffic_pct) with Roadmap consumer wired
- `b74402b` Landing page reframe → "One interactive platform. Everything at work." + Analytics showcase tile
- `360872c` Currency defaults to USD
- `cdce56f` Currency picker moves into rail header
- `695dc52` Pricing leaks closed (slides field-completeness + SoW PDF currency-arg bug + parseConversationCost helper)
- `7d0fda8` Guide Sections cleanup (preset chrome stripped + row noise quieted)

## Last-green SHA
`caa3b12`

## Blockers
- F8 onboarding section — still blocked on CSM playbook
- Backlog F (Academy/Help/Trust/Community) — blocked on user-supplied material for Academy + Help Centers
- Backlog G (greenfield/migration) — blocked on UI placement decision

## Next action
1. **User answers the 5 open questions above** (especially Voice pricing doc + greenfield/migration placement).
2. **Ship A first** (vocabulary sweep) — lowest risk, broadest visibility, doesn't depend on any open answers.
3. **Then B → C → D** in sequence (channel picker → voice ROI wiring → playbook → Roadmap mapping).
4. **E in parallel** with B–D (vision revision is content-only, doesn't conflict).
5. **F + G** when the answers/material come in.

## Key context for next session
- **Roadmap data is already canonical** — `product-roadmap-2026.ts` matches the PDF deck 1:1. No new items to add.
- **Vision data is half-done** — paragraphs match, but Strategy pillars + Phase 1-4 breakdowns + Value bullets per focus area are missing.
- **AI Agent vocabulary** is the foundational naming sweep — should land before voice-specific work so new code uses unified terminology from the start.
- **Voice playbook** = migration only (existing voice → Boost). Greenfield voice = Boost Voice from scratch. Two flows.
- **Pricing source of truth**: `src/data/pricing-2026.ts`. CSV-mirrored, voice tiers (Enterprise / Express + per-minute) + chat tiers (per-conversation) both wired.
- **Engagement Framework** is the new home for tunable timeline knobs. Currently only Roadmap consumer wired; Ways of Working / Impact / SoW wiring deferred to follow-up commits.

## Auto-snapshot
Last updated: 2026-04-28T (this session)
Branch: main
Working tree pending the 6 unpushed commits listed above.

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-06-18T13:09:14+02:00
Branch: main
Last commit: 0994966 feat(cs): Customer Success Manager workspace at /cs
Working tree:
```
 M docs/JOURNAL.md
 M docs/STATE.md
 M src/app/actions/engagements.ts
 M src/app/cs/page.tsx
 M src/app/guide/GuideClient.tsx
 M src/components/builder/EngagementDetail.tsx
 M src/components/builder/sections/cs/AgendaInputPanel.tsx
 M src/components/builder/sections/cs/CompanyInputPanel.tsx
 M src/components/builder/workspace-config.ts
 M src/data/agents/_types.ts
 M src/data/agents/index.ts
 M src/data/audience-sections.ts
 M src/data/company-patterns.ts
 M src/data/extensions/agents/airline/index.ts
 M src/data/extensions/agents/telco/device-support.ts
 M src/data/extensions/agents/telco/index.ts
 M src/data/extensions/index.ts
 M src/lib/slide-sections.ts
 M src/lib/types.ts
?? scratch_match.mjs
```
<!-- AUTO-HOOK-END -->

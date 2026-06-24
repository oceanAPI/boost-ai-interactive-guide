# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.
> This is the HANDOVER for a fresh agent session — read it top to bottom,
> then `git log --oneline -8` and `git status` to confirm the tree.

## Branch & last-green

`main`. Round-2 CS story-spine work done IN THE WORKING TREE, **uncommitted**
(plus the earlier uncommitted entry-restructure + the throwaway
`scratch_match.mjs`). Nothing committed this session — awaiting explicit push.

Last commits (newest first):
```
93bdad5 chore(admin-x): track experimental admin route
5b4cb06 feat(cs): story-spine builder — Planhat-style entry, guided journey, deck-modeled sections
e86d287 feat(extensions): telco + airline agent rosters + extension-pointer comments
0994966 feat(cs): Customer Success Manager workspace at /cs
```
`npm run build` + `npx tsc --noEmit` both clean as of this handover.
Nothing pushed — the user pushes manually. Do NOT `git push`.

### Round-2 CS spine iteration (this session, uncommitted)

Addressed the 5-part deck-modeled design ask:
1. **Roadmap inside every chapter** — `STORY_CHAPTERS` carries per-chapter
   `roadmap`; ChapterBlock gate is `chapter.roadmap` (was Agentic-only).
2. **Benchmark tied to each chapter** — `ChapterBenchmark` + `ChapterBenchmarkViz`
   (live bars, `youFromPerformance` reads `automation_rate`, `dataset` chip =
   future dataset-filter placeholder).
3. **Channel profile "as our story"** (deck slide 40) under Channels —
   `ChannelProfile` type + `ChannelProfileViz` (inquiry-mix bar + per-channel
   automation cards + today→target gauge, live total via `automation_rate`).
4. **Value-vs-effort matrix** replaces TopRecommendations grid when any rec has
   `effort` — `CostEffortMatrix` + new `Recommendation` fields (`effort`,
   `value_label`, `how_to_proceed`, `considerations`, `resources`); detail
   modal renders the 3 new blocks. Data-presence branch (CE/Sales unaffected).
5. Placeholder customers' recs enriched so the matrix renders in `/cs`.

Files touched: `src/data/thought-leadership.ts`,
`src/components/sections/ThoughtLeadershipSection.tsx`,
`src/components/sections/TopRecommendationsSection.tsx`,
`src/components/sections/top-recommendations/CostEffortMatrix.tsx` (new),
`src/components/sections/top-recommendations/RecommendationDetailModal.tsx`,
`src/lib/types.ts`, `src/data/cs-placeholder-customers.ts`.

GOTCHA: the dev `preview_console_logs` buffer shows a stale
`TopRecommendationsSection:164` parse error — IGNORE IT. The module renders on
`/guide` and the production build compiles clean; the buffer just never cleared
from the brief broken interim while the value/effort ternary was being wired.

### Intent Traffic section (this session, uncommitted)

New CS section that ingests a boost.ai **intent-traffic CSV export** and renders
conversation analytics. **Option A** (per-engagement client-side parse): the
builder parses the CSV in-browser and persists only a compact
`IntentTrafficSummary` on `Customer.intent_traffic` — the 2,638 raw rows would
blow the URL-fragment ceiling, so only the rollup (totals + per-root + top-N
child intents) round-trips. Rendered dynamically.

Golden path, all 5 touched:
- `src/lib/types.ts` — `IntentTrafficSummary`/`*Stats`/`*Root`/`*Intent`/`*Totals`
  (counts only; percentages derived at render). `Customer.intent_traffic?`.
- `src/data/intent-traffic.ts` (new) — `parseIntentTrafficCsv(text, opts)`
  (quote-aware line parse, exact-name column map so "% of Traffic" never shadows
  "Traffic", junk-root + zero-traffic + empty-intent skip, top-N per root,
  sort by traffic desc) + `pct`/`reviewSplit` render helpers.
- `src/components/sections/IntentTrafficSection.tsx` (new) — KPI header (6 tiles),
  Legend, per-root `RootRow` (SplitBar green/gold/orange = auto/escalated/unsolved
  of reviewed, width ∝ traffic), opportunity/training-gap flags, drilldown to
  topIntents. data-testids `intent-kpi-*` / `intent-root-<slug>` / `intent-<slug>`.
- `src/components/builder/sections/cs/IntentTrafficInputPanel.tsx` (new) — file
  upload + paste textarea → `ingest` → summary card.
- `src/lib/slide-sections.ts` (intent-traffic, group proof) ·
  `src/data/audience-sections.ts` (CS_DEFAULTS between benchmarking+personalisation) ·
  `src/components/builder/workspace-config.ts` (sectionOrder + def) ·
  `src/app/cs/build/page.tsx` (PANELS+PREVIEWS) ·
  `src/app/guide/GuideClient.tsx` (import + nav item + render block).

Source data: Haugaland (Norwegian utility/broadband) Oct'25–Mar'26 export —
26,908 conversations / 2,638 intents / 20 root categories. `npx tsc --noEmit` +
`npm run build` (13 routes) both clean. Live-verified parse → summary → preview
→ drilldown → flags on `/cs/build`; numbers cross-checked vs awk aggregates.

---

## What this project is

Per-customer interactive guides for boost.ai, assembled from a shared,
additive `Customer` record. Static-export Next.js 16 (Turbopack) → GitHub
Pages, plus a Cloudflare Worker for feedback/search telemetry. Guide state
round-trips through a base64url URL **fragment** (`#data=`), not a backend.
Full architecture: `docs/ARCHITECTURE.md` (trust it over `docs/REFERENCE.md`).

Four audiences share one section catalogue, differing only by which sections
are default-enabled: **Sales** (`/admin`), **Customer Excellence**,
**Professional Services**, and **Customer Success / CSM** (`/cs`). The CS
workspace is the current focus.

---

## Where everything lives (redirection map)

**Routes** (`src/app/`): `/` chooser · `/admin` Sales builder · `/admin-x`
experimental (isolated) · `/cs` CSM home · `/cs/build` CSM builder ·
`/cs/mine` · `/cs/browse` · `/guide` render · `/slides` slideshow ·
`/signin` + `/api/auth/[...nextauth]` Google auth.

**The CS story spine (this session's work):**
- Data: `src/data/thought-leadership.ts` — `STORY_CHAPTERS` (4 chapters:
  agentic-adoption / personalised-cx / sales / channels). Each has stat,
  narrative, proofPoints, caseStudies, benchmark, optional roadmap (agentic
  only), `useCase` (today/future chat before-after), transition, and a
  `linkSection` anchor into its deep-dive. `THOUGHT_LEADERSHIP_DEFAULTS` =
  the 4 hero stats the CSM can override.
- Render: `src/components/sections/ThoughtLeadershipSection.tsx` — dynamic
  customer snapshot hero → "The state of conversational AI" four-challenge
  header (deck slide 3) → 4 ChapterBlocks. `UseCaseDemo`/`ChatColumn` render
  the opt-in today-vs-future chat before/after. `snapshot()` builds the
  dynamic headline from `performance.automation_rate` + recommendations.
- Two net-new sections: `PersonalisationSection.tsx` (intent→integration
  opportunities) + `RevenueSection.tsx` (lead-gen + sell journeys).
- Input panels: `src/components/builder/sections/cs/` —
  `ThoughtLeadershipInputPanel`, `PersonalisationInputPanel`,
  `RevenueInputPanel`, `CompanyInputPanel` (Planhat-style search + instance
  picker), `AgendaInputPanel` (auto-fills from completed chapters).
- Placeholder customers: `src/data/cs-placeholder-customers.ts` — 3 fake
  insurance customers, `searchPlaceholderCustomers(query)`.

**Wiring (the golden path — touch all 5 to add a section):**
1. Component in `src/components/sections/`.
2. Register in `src/lib/slide-sections.ts` (`SLIDE_SECTIONS`).
3. Render in `src/app/guide/GuideClient.tsx` (import + `activeSectionSet.has(id)` block).
4. CS input panel + preview/hasContent in `src/components/builder/workspace-config.ts` (`CS_WORKSPACE`).
5. Default-enable in `src/data/audience-sections.ts` (`CS_DEFAULTS`, deck order).

**Types:** `src/lib/types.ts` — `Customer` extends `GuideFormData`. CS fields
are optional, round-trip in JSONB / the URL fragment. Key fields: `performance`,
`benchmarks`, `agentic_outcomes`, `recommendations`, `accepted_initiatives`,
`agent_swot`, `uat_status`, `governance`, `br_context`, `thought_leadership`,
`personalisation_opportunities`, `revenue_story`, `selected_instance_ids`.

**URL encoding:** `src/lib/url-encoding.ts`. Encode =
`Buffer.from(JSON.stringify(data),"utf-8").toString("base64")` then base64url
(`+`→`-`, `/`→`_`, strip `=`). Guide URL shape:
`/guide?audience=customer-success#data=<base64url>&sections=<comma-list>`.
NB: a fragment-only change does NOT reload the page; set a different search
param (e.g. `&t=1`) to force navigation when testing, and never call
`location.reload()` in the same tick as setting `location.href` (it races and
drops the fragment — see GOTCHAS).

**Persistence:** `src/app/actions/engagements.ts` + `src/lib/supabase.ts`.
Migrations in `supabase/migrations/` (`0001_engagements.sql`,
`0002_access_requests.sql`).

**Reference deck (the gold standard the builder is modelling):**
`/Users/mikalmonslaup/Downloads/Copy of LähiTapiola & Turva 3.6.2026 Tampere.pdf`
(46 pages). Slide 3 = the four challenges. The narrative arc per chapter is
consistent: boost data-driven story → success stories → the customer's own
benchmark → how the transition looks for them.

---

## Current goal / next actions (Round 2)

The story spine + entry + guided journey ship. Verified end-to-end on
`/guide`. **Round 2 is the next big chunk — held for the next session
because it needs a concrete spec, not speculation:**

1. **Fork reused CE sections into CS-specific versions — NEEDS A SPEC FIRST.**
   Today the CS guide renders the SAME components as CE (Performance,
   Benchmarking, AgenticBeforeAfter, SuccessPlan, Governance, AgentSwot,
   UatStatus, TopRecommendations) — there is NO audience branching in
   GuideClient. Do NOT blind-fork all 8: that's duplicate code with no
   user-facing gain until we know HOW each should differ for CS. ASK THE USER
   per-section what should change (copy, density, ordering, which fields show)
   before forking. Pattern when forking: new `*CsSection.tsx`, gate in
   GuideClient on `audience === "customer-success"`.
2. **Remaining bespoke deck sections** — confirm with the user whether the
   Channels "what-if" savings wants its own section or stays folded into the
   existing `roi`/`impact` sections (the plan said reuse; the deck shows it as
   its own beat). Integration-journey polish on PersonalisationSection.
3. **Rail drag-reorder + make GuideClient honor `?sections=` order.** Today
   GuideClient renders in fixed JSX order regardless of the order in
   `?sections=`. If the CSM reorders chapters, the guide won't reflect it.
   Offered previously, awaiting go-ahead.

---

## Blockers

- **Supabase is DOWN** — `woefktcoizqotflzvsvg.supabase.co` resolves NXDOMAIN.
  All auto-save / save+present / engagement-list DB loops are unverifiable
  until it's restored. When back: run `0001` + `0002` migrations, then verify
  the save→reopen loop. Everything else (build/route/UI/prefill→render→Generate)
  verifies locally without it.
- A buggy local `.git/hooks/post-commit` prints `declare: -A` / `division by 0`
  noise on every commit. Harmless — the commit still lands. Ignore it.

---

## House rules (do not violate)

- NEVER `git push` and NEVER commit unless explicitly asked.
- One logical change per commit; Conventional Commits; add
  `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` when Claude wrote ≥50%.
- No CI gates — run `npm run build` + smoke-check before relying on a change.
- Never hand-roll chips — use `AdminChip`/`AdminChipRow`/`AdminPrompt`/
  `AdminMiniLabel` from `src/components/admin/primitives.tsx`.
- "instances" = AWS data-source deployments, NOT agents (`selected_instance_ids`).
- `security` industry stays HIDDEN. Extensions authored in `src/data/extensions/`
  first, then spliced per `integration-guide.md`.
- boost.ai is the engagement owner until the customer's tech team takes over
  (swappable keys).
- Preview server: serverId `337a296c-5bdb-4b5c-b419-8494974547fd`, port 3000.
  `npm run build` wipes `.next`, so reload the dev server after a build.

## Auto-snapshot
Last updated: 2026-06-18 (CS story spine + before/after demos + benchmark fix shipped)
Branch: main
Last commit: 93bdad5

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-06-24T10:58:05+02:00
Branch: main
Last commit: 1da6c20 docs: round-2 CS spine handover (channel profile, value/effort matrix)
Working tree:
```
 M docs/JOURNAL.md
 M docs/STATE.md
 M src/app/cs/build/page.tsx
 M src/app/guide/GuideClient.tsx
 M src/components/builder/sections/cs/RecommendationsInputPanel.tsx
 M src/components/builder/sections/cs/ThoughtLeadershipInputPanel.tsx
 M src/components/builder/workspace-config.ts
 M src/components/sections/ThoughtLeadershipSection.tsx
 M src/components/sections/TopRecommendationsSection.tsx
 M src/data/audience-sections.ts
 M src/data/cs-placeholder-customers.ts
 M src/data/thought-leadership.ts
 M src/lib/slide-sections.ts
 M src/lib/types.ts
?? scratch_match.mjs
?? src/components/builder/sections/cs/DetectedIssuesInputPanel.tsx
?? src/components/builder/sections/cs/IntentTrafficInputPanel.tsx
?? src/components/builder/sections/cs/SuccessStoriesInputPanel.tsx
?? src/components/sections/DetectedIssuesSection.tsx
?? src/components/sections/IntentTrafficSection.tsx
```
<!-- AUTO-HOOK-END -->

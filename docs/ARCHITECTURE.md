# Architecture

> **Status: CURRENT — verified 2026-04-20 against main branch**
> This is the onboarding doc. For per-element lookup detail
> (component props, CSS tokens, animation names) see `docs/REFERENCE.md`.
> When this doc and REFERENCE.md disagree, trust this one.

## Purpose & audience

Purpose: assemble and publish per-customer interactive guides from a shared, additive `Customer` record. The app is a static-export Next.js 16 site deployed to GitHub Pages, plus a thin Cloudflare Worker that holds feedback and search-log telemetry. There is no backend persistence for customer data; guide state round-trips through a base64url-encoded URL param.

Three audiences work the same customer at different lifecycle stages:

- **Sales** drives the prospect-facing guide before the contract.
- **Customer Excellence (CE)** runs post-sale business reviews, success planning, and quarterly inspiration sessions.
- **Professional Services (PS)** scopes and delivers the implementation.

All three read and write the same `Customer` shape (defined in `src/lib/types.ts`, extending `GuideFormData` with optional CE/PS-owned fields). What differs is which sections a given audience renders by default and which fields each audience tends to author. Nothing hard-gates access to any field or section — the audience model is a default-selection layer, not a permission layer.

## Routes

Four routes under `src/app/`. No dynamic segments.

| Path | File | Role |
|---|---|---|
| `/` | `src/app/page.tsx` | 3-card workspace chooser. Each card links to `/admin?audience=<sales\|customer-excellence\|professional-services>`. |
| `/admin` | `src/app/admin/page.tsx` | 10-section collapsible form. Reads `?audience=` to seed section defaults and drive the purple audience banner. Generate encodes form state and navigates to `/guide?data=...&sections=...&audience=...`. |
| `/guide` | `src/app/guide/page.tsx` + `src/app/guide/GuideClient.tsx` | Decodes `?data=` (base64url JSON) into `GuideFormData`, instantiates `Customer` via structural extension, passes both to `GuideClient`. `?sections=` filters which of the 29 sections render. Old `core-components` id is rewritten to `platform-vision` at decode time for bookmark back-compat. |
| `/slides` | `src/app/slides/page.tsx` | Same decoding path, renders via `SlideshowClient`. Back-link copy is "← Back to admin". |

## Audience model (Sales / CE / PS)

Three audiences share one section catalogue. Defaults live in `src/data/audience-sections.ts` as three readonly string arrays (`SALES_DEFAULTS`, `CE_DEFAULTS`, `PS_DEFAULTS`), plus an `AUDIENCE_DEFAULTS` map keyed by `Audience` and an `isDefaultForAudience(sectionId, audience, fallback)` helper.

| Audience | Defaults | Character |
|---|---|---|
| Sales | 19 | Prospect-facing: `hero`, `orchestrator`, `topics`, 4 topic pages, `platform-vision`, `voice`, `demo`, `impact`, `trust-validation`, `case-studies`, `community`, `boost-camp`, `commercial-offer`, `roi`, `scope-of-work`, `next-steps`. |
| CE | 19 | Post-sale BR flow. See callout below. |
| PS | 8 | Implementation-focused stub: `orchestrator`, `topics`, `topic-implementation`, `topic-integrations`, `topic-security`, `topic-ways-of-working`, `platform-vision`, `next-steps`. The full PS surface is deferred; defaults exist so the route does not blow up. |

**Critical callout on CE.** CE's 19 defaults are **9 new CE sections** (`agenda`, `performance`, `benchmarking`, `agentic-before-after`, `agent-swot`, `uat-status`, `success-plan`, `top-recommendations`, `governance`) plus **10 reused Sales sections** (`orchestrator`, `topic-integrations`, `topic-ways-of-working`, `platform-vision`, `impact`, `trust-validation`, `case-studies`, `community`, `boost-camp`, `next-steps`). CE is not 19 new components.

Admin seeds its section-item state from `AUDIENCE_DEFAULTS[audience]` when `?audience=` is read on mount (`src/app/admin/page.tsx`, via a `useEffect` tied to the `audience` state). There is **no visibility gate** — all 29 sections appear as toggles in admin regardless of audience. Only the default-enabled state differs. An AE can toggle a CE section into a Sales deck if they want.

The filter that actually controls what renders in `/guide` is `?sections=` in the URL, which admin emits from the enabled-state of the section picker. `GuideClient` filters its `SECTIONS` array by this list. The audience param is threaded through for banner chrome but is not read by the guide render path.

## Sections inventory (29 total)

29 sections registered in `src/lib/slide-sections.ts` as the `SLIDE_SECTIONS` array. Every section has `id`, `label`, `group` (one of `intro` | `topics` | `platform` | `proof` | `community` | `commercial` | `close`), `minutes`, and optional `defaultEnabled`. The same 29 are rendered by `src/app/guide/GuideClient.tsx` — sections drive both admin toggles and guide rendering from one source of truth.

9 new CE sections shipped in the current iteration. Each reads specific fields from the `Customer` record and, where interactive, has a detail modal in a sibling subdirectory.

| Section | File | Reads from `Customer` | Detail surface |
|---|---|---|---|
| AgendaSection | `src/components/sections/AgendaSection.tsx` | `br_context.agenda_items` | Inline expand (notes per item) |
| PerformanceSection | `src/components/sections/PerformanceSection.tsx` | `performance` + `performance_details` | `src/components/sections/performance/PerformanceTileDetailModal.tsx` (sparkline + narrative + linked initiatives) |
| GovernanceSection | `src/components/sections/GovernanceSection.tsx` | `governance` | `src/components/sections/governance/StakeholderModal.tsx` (sponsor); inline expand for last/next BR |
| BenchmarkingSection | `src/components/sections/BenchmarkingSection.tsx` | `benchmarks` + `performance` | `src/components/sections/benchmarking/BenchmarkDetailModal.tsx` |
| SuccessPlanSection | `src/components/sections/SuccessPlanSection.tsx` | `accepted_initiatives` + `recommendations` | `src/components/sections/success-plan/InitiativeDetailModal.tsx` (tasks, RAG, linked recs) |
| TopRecommendationsSection | `src/components/sections/TopRecommendationsSection.tsx` | `recommendations` | `src/components/sections/top-recommendations/RecommendationDetailModal.tsx` |
| AgentSwotSection | `src/components/sections/AgentSwotSection.tsx` | `agent_swot` | `src/components/sections/agent-swot/AgentSwotDetailModal.tsx` |
| UatStatusSection | `src/components/sections/UatStatusSection.tsx` | `uat_status` (entries carry `history`) | Inline expand (status history timeline) |
| AgenticBeforeAfterSection | `src/components/sections/AgenticBeforeAfterSection.tsx` | `agentic_outcomes` + `accepted_initiatives` | `src/components/sections/agentic-before-after/AgenticOutcomeDetailModal.tsx` |

**Three sections were removed this iteration** — unused and stale, not referenced by the live guide or admin:

- `src/components/sections/ArchitectureSection.tsx`
- `src/components/sections/ComparisonSection.tsx`
- `src/components/sections/TimelineSection.tsx`

**The earlier "block registry" CE stack was torn down completely.** Anything referencing the following in older context is gone:

- `src/data/blocks/` directory
- `src/lib/decision-engine/` (deferred to an eventual external API)
- `src/components/admin/AssemblyBuilder.tsx`
- `src/components/admin/CustomerExcellenceView.tsx`
- `src/app/guide/CeGuideClient.tsx`

CE now renders through the same `GuideClient` as Sales, filtered by `?sections=`.

For per-section prop detail on the older Sales sections (Hero, Orchestrator, Topic*, Demo, Impact, ROI, etc.), see `docs/REFERENCE.md` § per-section tables. Those tables are verified current.

## Data layer

### Agents

`src/data/agents/` holds 7 industry subdirectories. `src/data/agents/_types.ts` exports `INDUSTRIES` (6 public) and `HIDDEN_INDUSTRIES` (1 POC). `src/data/agents/index.ts` exports `getOrchestratorConfig(areasOfInterest, selectedVariants)` and `getAgentsForGuide(...)`, which power the Orchestrator section and the guide's search index.

| Industry | Agents | Notes |
|---|---|---|
| `banking` | 17 | Largest FS industry; mortgage/cards/accounts/fraud/relationship |
| `insurance` | 14 | Claims, underwriting, proactive outreach, variant-rich |
| `pension` | 6 | Workplace + personal + retirement |
| `wealth_management` | 7 | Portfolio, advisory, trading, tax |
| `fintech` | 7 | Digital-first: cards, BNPL, crypto, onboarding |
| `credit_union` | 8 | Member services, multi-product lending |
| `security` | **20 — HIDDEN** | Sector Alarm extensibility POC; gated by `HIDDEN_INDUSTRIES` so it does not render in admin's industry chips. |

Total: **79 agents** across 7 industries. `index.ts` caps the rendered set at `MAX_AGENTS_DISPLAYED = 20` and sorts by tier weight (primary < addon < light) so that when multiple industries are selected, the most-primary agents win the cap. `filterAgentsByVariants` narrows further when industry variants (e.g., `insurance:mutual`, `banking:retail`) are specified.

### Customer fixtures

`src/data/customer-fixtures.ts` exposes 6 seeded `Customer` records keyed by short handle. These overlay on top of `CompanyPattern.prefill` when `detectFromCurated` in `src/lib/company-detect/curated.ts` matches the pattern key.

| Key | Company | Lifecycle | Fixture depth |
|---|---|---|---|
| `hm` | H&M | live / strategic | Richest: full `performance` + `performance_details` history + `governance` + `br_context` + `agent_swot` + `benchmarks` + `recommendations` + `agentic_outcomes` |
| `cbna` | CBNA | live | Medium |
| `dna` | DNA | live | Medium |
| `juno` | Juno | delivering | Medium |
| `moi` | Moi | live | Medium |
| `sanoma` | Sanoma | live | Medium |

The fixture layer is the entire "backend" for customer data right now. A future real-backend persistence layer would replace `CUSTOMER_FIXTURES` with a fetch call and leave the rest of the stack untouched.

### Patterns and detect

`src/data/company-patterns.ts` holds 30+ Nordic FS company patterns (Folksam, Länsförsäkringar, SEB, DNB, Tryg, Klarna, etc.). Each pattern is a `{ key, name, domain, aliases, country, category, prefill: Partial<GuideFormData> }`. The company-search UI in admin (`src/components/CompanySearch.tsx`) calls into `src/lib/company-detect/`, which tries curated patterns first (`curated.ts`), falls back to a lightweight classifier (`classifier.ts`), then to live web lookup (`web.ts`). On a curated hit, the fixture overlay from `customer-fixtures.ts` merges on top of `pattern.prefill`, producing the richer CE-aware shape.

### Topics and other data files

`src/data/topics/registry.tsx` maps four topic keys to React components. The mapping is current: `implementation → RoadmapSection`, `integrations → IntegrationArchSection`, `security-compliance → SecurityComplianceSection`, `ways-of-working → WaysOfWorkingSection`.

Other data modules under `src/data/`: `agents.ts` (barrel), `case-studies.ts`, `demo-scripts.ts`, `guide-content.ts`, `integrations.ts`, `product-roadmap-2026.ts`, `product-vision.ts`, `roles.ts`, `roadmap-images.ts`, `community-videos.ts`, `boost-camp-events.ts`, and `content/` (industry-specific content templates).

## Interactive surfaces (Pac-Man, Feed-me-log, Search-log)

### Pac-Man feedback modal

Mount: `src/app/layout.tsx` wraps every route in `<FeedbackProvider>` (exported from `src/components/FeedbackBacklog.tsx`). The modal is available on every page.

Trigger: global keyboard shortcut **⌘/Ctrl + .** (period). The modal title is "Nom nom nom — feed me what to learn". The flow starts in *targeting mode* — the cursor becomes a reticle and the first click pins the target element, then opens the editor modal with fields for free text and a label (`bug` | `information` | `visual` | `idea`).

Capture: `src/lib/feedback-meta.ts` snapshots the full context at trigger time. The captured `FeedbackMeta` includes `url`, `pathname`, `route`, `viewport`, `devicePixelRatio`, `userAgent`, the fully decoded `guideState` (from the `?data=` param), `scroll`, `nearestSection` and `nearestSectionSource` (one of `click` | `hover` | `focus` | `viewport`), `sectionsInView` (up to 5 most-visible), `hoveredElement` (`tag`, `id`, `classes`, `text`, `ariaLabel`, **`dataTestId`**, `role`, `rect`), `cursor`, and `capturedAt`. The Copy-as-JSON button on each backlog entry writes this full blob to the clipboard so a reviewer can paste the complete reproducer straight into a Claude chat — the paste carries enough to re-render the exact scene and identify the exact element pinned.

### Cloudflare Worker: feed-me-log

`cloudflare-worker/src/index.ts` is the only server-side piece. It backs both feedback and search-log.

| Endpoint | Method | Auth | Behavior |
|---|---|---|---|
| `/feedback` | POST | `x-client-token: <CLIENT_TOKEN>` | Add a `FeedbackEntry`. |
| `/feedback` | GET | `x-admin-password: <ADMIN_PASSWORD>` | List entries (`?since=` and `?limit=` supported). |
| `/feedback/:id` | DELETE | `x-admin-password` | Remove a single entry. |
| `/search-log` | POST | `x-client-token` | Add a search entry. |
| `/search-log` | GET | `x-admin-password` | List searches. |
| `/search-log` | DELETE | `x-admin-password` | Clear the list. |

**Auth split.** `CLIENT_TOKEN` is embedded in the client bundle at build time via the `NEXT_PUBLIC_FEED_CLIENT_TOKEN` env var; anyone who loads the site can submit feedback. `ADMIN_PASSWORD` is never shipped to the client — reads and deletes require the admin to unlock `FeedbackBacklog` or `SearchLogPanel` by entering the password once per session (stored in `sessionStorage`).

Storage: KV namespace `FEED_KV` with two list keys (`feedback:list`, `search-log:list`), capped at 2000 entries each.

Rate limit: 30 writes/minute/IP (per-IP sliding bucket held in-memory in the Worker isolate; rough but sufficient for a 200-person team).

CORS: `ALLOWED_ORIGINS` env var is a comma-separated allow-list. Production includes `https://oceanapi.github.io`; dev includes `http://localhost:3000`.

When `NEXT_PUBLIC_FEED_API_URL` is blank at build time, the client falls back to localStorage-only mode — feedback is captured locally but never transmitted. This is the graceful-degradation path if the Worker is misconfigured on a given deploy.

### Search-log panel

`src/components/SearchLogPanel.tsx` is the admin-side viewer for the company-search history. It shares the admin-password unlock flow with `FeedbackBacklog` (same `sessionStorage` key) so unlocking one unlocks both.

## Styling & conventions

### Design tokens

Defined in `src/app/globals.css` as Tailwind v4 `@theme` variables. Primary palette: `boost-purple` (#59195d) and `boost-green-light` (#36b595) are the two load-bearing brand colors. `boost-lavender`, `boost-gold`, `boost-orange`, `boost-pink` handle accent roles. Semantic tokens (`boost-bg`, `boost-surface`, `boost-card`, `boost-border`, `boost-muted`, `boost-text`, `boost-text-secondary`) cover chrome. For the full table of values and usage, see `docs/REFERENCE.md` § Color System — that section is verified current.

### Design principles

`.impeccable.md` at the repo root is the design-direction spec. Five principles, in order:

1. Progressive disclosure over information dump.
2. Specificity over generics.
3. Structure communicates competence.
4. Restraint is confidence.
5. Interactive, not passive.

These drive the CE interactivity pattern (click-to-modal, filter chips, inline expand) and the no-blue/cyan/neon colour restrictions.

### Admin primitives

`src/components/admin/primitives.tsx` exports four primitives used by every admin section: `AdminPrompt` (question + helper + optional right-aligned action), `AdminChipRow` (flex-wrap container), `AdminChip` (toggle pill with primary/secondary tone variants and active-dot indicator), and `AdminMiniLabel` (small tracked-uppercase label). Use these instead of hand-rolling chip markup on any new admin surface.

### data-testid convention

Every interactive element on the 9 new CE sections carries a `data-testid` so Pac-Man's `hoveredElement.dataTestId` capture can identify entities across rename drift. The feedback paste-back flow depends on this.

| Section | Testid pattern |
|---|---|
| AgendaSection | `agenda-item-<index>` |
| PerformanceSection | `performance-tile-<metricKey>` |
| GovernanceSection | `governance-sponsor` / `governance-last-br` / `governance-next-br` |
| BenchmarkingSection | `benchmark-row-<metricKey>` |
| SuccessPlanSection | `initiative-<initiative_id>` |
| TopRecommendationsSection | `recommendation-rank-<n>` |
| AgentSwotSection | `agent-swot-<agent_key>` |
| UatStatusSection | `uat-<agent_key>-<market>` |
| AgenticBeforeAfterSection | `agentic-outcome-<topic-slug>` |

Prefer stable entity ids over positional indices; fall back to index only when there is no natural id.

### URL encoding

`src/lib/url-encoding.ts` implements a symmetric `encodeGuideData` / `decodeGuideData` pair. Encoding: `JSON.stringify` → `encodeURIComponent` → `btoa` → base64url (replace `+/=` with `-/_`). Decoding reverses. Both paths work in browser (`btoa`/`atob`) and Node (`Buffer`). The payload lives in `?data=`; `?sections=` and `?audience=` sit alongside as separate params.

### Asset path

`src/lib/asset-path.ts` exports `assetPath(path)`. In production it prepends `/boost-ai-interactive-guide` (the GitHub Pages basePath); in dev it returns the input unchanged. Absolute URLs pass through. Use this helper for every static asset reference.

## Build & deploy

### Next config

`next.config.ts` declares `output: "export"` with `basePath: "/boost-ai-interactive-guide"` and a matching `assetPrefix` in production, plus `images: { unoptimized: true }`. This produces a static `out/` directory suitable for GitHub Pages. There is no Node server in production.

### Dev script

`package.json` → `"dev": "NODE_OPTIONS='--max-http-header-size=65536' next dev"`. The header-size bump was added during the CE-interactivity session — the H&M fixture grew past Node's default 16 KB cap and `/guide?data=...` started returning 431. Static export in production is unaffected because GitHub Pages serves the URL without parsing it through Node.

### GitHub Actions

`.github/workflows/deploy.yml` runs on `push` to `main` only. Two jobs:

- **build**: checkout, `actions/setup-node@v4` (Node 20 + npm cache), `npm ci`, `npm run build` (with `NEXT_PUBLIC_FEED_API_URL` and `NEXT_PUBLIC_FEED_CLIENT_TOKEN` injected from repo `vars`), upload `out/` as Pages artifact.
- **deploy**: `needs: build`, runs `actions/deploy-pages@v4`, publishes to the `github-pages` environment.

**Critical: there is no test or lint step.** A commit that typechecks locally but breaks at runtime will still deploy. Local `npm run build` and manual smoke-check of the deployed URL are the only gates. Keep an eye on the runtime console and network panel after every push.

The feedback env vars are Actions **variables**, not **secrets**. This is intentional — the client token is meant to be client-visible (baked into the JS bundle), and variables stay inspectable in repo settings. When either var is blank, the client degrades gracefully to localStorage-only mode rather than erroring.

### Cloudflare Worker

`cloudflare-worker/wrangler.toml` names the Worker `feed-me-log`, binds a KV namespace as `FEED_KV`, and reads `ALLOWED_ORIGINS` from env. `CLIENT_TOKEN` and `ADMIN_PASSWORD` are set via `wrangler secret put`. The Worker deploys manually via `wrangler deploy` today — it is not wired into CI.

## Known gaps & watch-outs

A new session should not assume any of the following:

- **`docs/REFERENCE.md`'s Page Architecture tree is stale.** It enumerates sections 01–10 by position, pre-dating the audience-defaults layer and the 9 new CE sections. This `ARCHITECTURE.md` supersedes it for page-structure questions. Treat REFERENCE.md as a lookup resource only (tokens, animations, UI components, hooks, orchestrator internals — those sections are verified current).
- **No CI test or lint step.** Production can regress on a commit that typechecks locally but fails at runtime. Always smoke-check the deployed GitHub Pages URL after a push.
- **Security industry is `HIDDEN`.** Listed in `HIDDEN_INDUSTRIES` in `src/data/agents/_types.ts`. It does not appear in admin's industry chips and should not be exposed without an intentional unhide. Sector Alarm is an extensibility POC, not production content.
- **No hard visibility gate on sections by audience.** CE-only sections show as toggles for Sales reps and vice versa; only the default-enabled state differs. The actual control is the `?sections=` URL param emitted by admin's Generate button. Do not assume "a Sales deck cannot include Success Plan" — it can if someone toggles it on.
- **Old `core-components` section id is rewritten to `platform-vision`** at decode time in `src/app/guide/page.tsx` for back-compat with old bookmark URLs. Do not re-introduce the old id.
- **The 6 customer fixtures are the entire persistence layer for customer data.** There is no backend for `Customer` writes. The roadmap is to swap `CUSTOMER_FIXTURES` for an API fetch that returns the same shape. Until then, edits in admin survive only as long as the URL holds them.
- **H&M's URL payload is ~18 KB.** Any further enrichment of the customer fixture needs to keep the base64url-encoded URL under the header cap (65 KB in dev after the `NODE_OPTIONS` bump; in prod it is limited by browser and CDN URL-length ceilings, typically 8–32 KB). A real backend removes this ceiling entirely.
- **The block-era CE stack is gone.** Anything referencing `src/data/blocks/`, `src/lib/decision-engine/`, `AssemblyBuilder`, `CustomerExcellenceView`, or `CeGuideClient` is obsolete. CE renders through `GuideClient`.
- **Feedback telemetry is eventually-lossy.** KV caps at 2000 entries per list and rate-limits at 30 writes/minute/IP. A burst of activity during a big BR or demo can drop late entries. Export the backlog before it fills.

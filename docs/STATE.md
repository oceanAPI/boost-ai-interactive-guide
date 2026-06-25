# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.
> This is the HANDOVER for a fresh agent session — read it top to bottom,
> then `git log --oneline -8` and `git status` to confirm the tree.

## Branch & last-green

`main`, deploying via **Vercel** (auto-deploy on push to `main`). Last commit is
`37a77b2`. **This session's work is UNCOMMITTED** — a "success engine everywhere"
build. `npm run build` (17 routes) + `npx tsc --noEmit` both clean. The user
commits + pushes manually. Do NOT `git push` or commit without an ask.

### Percent-display fix (this session, UNCOMMITTED) — DONE + verified

A 0–1 ratio (e.g. `automation_rate: 0.404387` from a Planhat custom field)
was rendered raw next to a "%" unit → "0.404387%". New shared
`src/lib/format-metrics.ts` (`toPercent`, `roundPercent`,
`normalizePercentMetrics`): percent-typed keys (automation/unknown/escalation,
current + previous) in (0,1] are scaled ×100; a genuine % is always ≥1 so the
heuristic is safe. Applied at the top of `PerformanceSection` (normalize `perf`
+ `format: roundPercent` on the 3 % metrics — fixes tile, delta, modal,
sparkline), `BenchmarkingSection` (normalize in `buildRows` + round `%` display
in `AbsoluteBar` — fixes number AND bar width), and `ThoughtLeadershipSection`
(normalize the customer once → snapshot/tiles/ChapterBenchmarkViz/ChannelProfile).
Verified live on `/guide`: 0.404387→40.4% (+2.4% delta), 0.12→12%, 0.0721→7.2%,
benchmark "This customer 40.4%" vs Peer 48% / Industry 42%. tsc + build (17
routes) clean.

### Success-engine workstreams (this session, UNCOMMITTED)

Five-part ask: surface engine-driven suggestions everywhere + a transparency
view + a learnings loop + Planhat history. **3 of 5 shipped + verified:**

1. **Suggestion layer** (`src/lib/cs-engine/suggestions.ts`, new) — DONE. Ranks
   success stories, TL chapters, agentic outcomes, AND recommendations against
   the engine's detected issues / industry / metrics, each with reason chips.
   `_SuggestionBlock.tsx` (new) renders the "We suggest" cards (accept/override,
   never auto-applied) in the SuccessStories / ThoughtLeadership /
   AgenticOutcome / Recommendations input panels.
2. **Interactive recommendations grid** — DONE. `suggestRecommendations` maps
   engine `topPriorities` → `Recommendation` (rank + formula as rationale).
   `ListEditor` gained `reorderable` (up/down). Wired into
   `RecommendationsInputPanel`. Add/move/delete round-trips to engagement JSONB
   via the existing autosave.
3. **`/cs/analytics`** (`src/app/cs/analytics/page.tsx`, new) — DONE. Engine
   transparency: (a) live scoring constants (formula, DEFAULT_WEIGHTS,
   suggestion weights, hierarchy rules, issue→theme routing); (b) per-customer
   live signals (detected issues + ranked initiatives w/ formula + 4 suggestion
   lists, customer-picker chips over PLACEHOLDER_CUSTOMERS); (c) activity via
   `listMyEngagements`. Exported `ISSUE_THEME`/`CHAPTER_LABELS`/`W_*`/`BASE` from
   suggestions.ts to render source-of-truth values. 4th chooser card added on
   `/cs`. Verified live: Haugaland → 6 issues, 10 ranked initiatives w/ formula
   (`1.000 × 1.20 (Low) × 1.10 (company-level) = 1.3200`), suggestions with
   reasons, 3 activity rows; `hasErrorOverlay:false`.

**Workstreams #4 + #5 are GATED on two user decisions (see Open questions).**

### Open questions (block #4/#5, surfaced to user)

- **#4 learnings store scope:** global vs per-CSM vs per-industry weight tuning?
- **#5 Planhat history:** does Planhat return historical metric values (time
  series) or only the current snapshot? Offer to introspect if unsure.

GOTCHA re-confirmed: `preview_console_logs` keeps PINNED stale parse errors that
don't match the current file. Authoritative parse checks are `npm run build` +
fetching served HTML for `hasErrorOverlay`. Ignore the console buffer.

### Prior committed work (still current, `37a77b2` and below)

**Planhat assets-as-instances** (`b39a181`) on top of the live company pull
(`b50abe5`). VERIFIED live on `/cs/build`: company search + pull + missing-field
save→reopen, and assets → instance chips (Telenor Norge AS → TELENORNO,
TELENORVOICE). The user pushes manually. Do NOT `git push` without an ask.

### Field-map transforms + unmapped-fields view (this session — `37a77b2`)

Two of three requests from the 2026-06-25 Slack ask shipped + verified live
on `/admin/integrations`:
1. **Executable transforms.** The field-map `transform` column is now a
   `<select>` (was a free-text "not executed" note). `applyTransform(value,
   token)` in `integrations.ts` runs in BOTH `pullCustomer` (real pull) and
   `fetchPreview` (admin sample). Tokens: `ratio_to_percent` (×100, 1dp),
   `percent_to_ratio`, `round`, `round1`, `to_number`. `toNumber` tolerates
   comma decimals (`"0,72"`→0.72→72) — this is the automation_rate fix, since
   PerformanceSection renders the raw number + a "%" unit. Unknown/legacy
   strings → no-op, preserved in the dropdown as a `note: …` option. NB:
   `applyTransform` must stay non-exported — a "use server" file may only
   export async fns (build error if exported).
2. **Unmapped-fields panel.** `UnmappedFields` component under the field map
   lists `TOOL_FIELDS` targets not covered by the active map, grouped (shows
   "Unmapped engagement fields (87 of 97)"). `TRANSFORMS` const in page.tsx
   mirrors the action tokens.

**Request #3 NOT built — awaiting a design decision.** User wants a per-row
Customer-vs-Instance source-model selector. Blocker: a company has MULTIPLE
assets/instances, so an Instance-sourced field needs an aggregation rule.
Options put to user: (1) aggregate across instances [my rec], (2) one picked
instance, (3) per-instance storage (needs new guide fields). Build once chosen:
`source_object` col on `integration_field_maps` (migration `0005`) + row
selector + aggregation in `pullCustomer`.

### Planhat assets = instances (this session — `b39a181`)

`/companies` = customer brand (main pull); `/assets` = that company's
instances. `fetchPlanhatAssets(connId, companyId)` GETs
`/assets?companyId=<id>&limit=2000` (client-side companyId filter as backstop)
→ `AssetHit { planhatId, name, instanceId }`. `instanceId = externalId ||
name` (the boost instance id stored in `selected_instance_ids`); `name` is the
chip label. `introspectAssetSchema(connId)` (operator-gated) samples the live
asset shape. `CompanyInputPanel` fetches assets on company pull and renders
them as selectable instance chips (manual add kept as fallback). Real asset
keys: `_id, name, sourceId, companyId, externalId, companyName, custom, usage,
path, parentObject`. NB: if boost instances key on `sourceId` not `externalId`,
change the one line in `fetchPlanhatAssets`.

### Live Planhat company pull (this session — `b50abe5`)

The CS builder's Customer panel now pulls a REAL Planhat company through the
saved field map, and the admin field picker reflects the REAL Planhat shape.

- **Server actions added** to `src/app/actions/integrations.ts`:
  `introspectSchema(connId)` (operator-gated; samples 20 live companies →
  flattens every key incl. `custom.*` so the picker shows fields not on any
  static list), `getDefaultPlanhatConnection`, `searchPlanhatCompanies`,
  `pullCustomer` (fetch by id → run field map → deep-merge → overlay stored
  overrides → report still-missing targets), `loadOverrides`, `saveOverride`.
  The pull/search/override actions are gated on ANY signed-in session
  (`sessionEmail()`), broader than the admin allow-list, since pulling is the
  CS team feature. Secrets still server-only.
- **`/admin/integrations`** (`page.tsx`): `SOURCE_FIELDS.planhat` rewritten to
  REAL paths (root `name`/`mrr`/`nps`/`h`/`csmScore` + common `custom.*`); a
  "Discover fields from live data" button calls `introspectSchema` and
  replaces the picker with this connection's exact shape; `FieldCombo` now
  takes `allowCustom` so any free-text path can be mapped (provider source row).
- **`CompanyInputPanel.tsx`**: discovers the default Planhat connection on
  mount; debounced live search; pick → `pullCustomer` → `update(mergePatch)`;
  a "Missing data" section lists mapped targets Planhat returned empty, each a
  text input that `saveOverride`s to Supabase and merges into the form. Falls
  back to placeholder customers when no connection / not signed in.
- **Schema:** `supabase/migrations/0004_customer_overrides.sql` —
  `integration_customer_overrides` (connection_id FK, planhat_company_id,
  company_name, field_target, value jsonb, entered_by; unique on
  connection+company+target). RLS deny-all backstop; queryable via SQL. This
  is the persisted store of metadata Planhat doesn't have.

### Integration page baseline (prior session — `5af3241`)

`/admin/integrations` persistence: `0003_integrations.sql`
(`integration_connections` + `integration_field_maps`), CRUD server actions
(`listIntegrations`/`saveConnection`/`deleteConnection`/`saveFieldMap`/
`testConnection`/`fetchPreview`), operator + `ENV_KEY_PATTERN` allow-lists
sandboxing `process.env[name]`. `auth_env_key` holds the env-var NAME only —
secrets never stored. Auth input rejects pasted JWTs/secret-looking strings.

### Supabase status — RESTORED

Project ref `woefktcoizqotflzvsvg` online → URL
`https://woefktcoizqotflzvsvg.supabase.co`. `.env.local` has valid
`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `PLANHAT_API_TOKEN`
(0003 run; connection "Planhat api" saved; live search confirmed).

**User actions still required:**
1. **Run `supabase/migrations/0004_customer_overrides.sql`** in the SQL editor
   — the override table does NOT exist yet, so `saveOverride` errors and
   missing-field values won't persist until it's run. (`pullCustomer` itself
   still works without it — overrides just come back empty.)
2. Confirm `PLANHAT_API_TOKEN` + Supabase vars are in **Vercel env** so prod
   pulls + persistence work (with the laptop off).
3. The Planhat token pasted in chat earlier is COMPROMISED — rotate it and put
   the fresh value only in `.env.local` / Vercel (never in chat again).
GOTCHA: a `.select("*",{count:"exact",head:true})` existence check FALSE-POSITIVES
on a missing table — verify table existence with a real `.select()`.

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

- **Supabase RESTORED** (ref `woefktcoizqotflzvsvg`). Engagement loops work
  again. Remaining gap: `0003_integrations.sql` not yet run, so the integration
  page's save→reopen is unverifiable until the user runs it in the SQL editor.
  `PLANHAT_API_TOKEN` not yet set, so live fetch is unverifiable too.
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
Last updated: 2026-06-25T17:09:43+02:00
Branch: main
Last commit: 37a77b2 feat(integrations): executable field-map transforms + unmapped-fields view
Working tree:
```
 M docs/JOURNAL.md
 M docs/STATE.md
 M src/app/cs/build/page.tsx
 M src/app/cs/page.tsx
 M src/components/builder/sections/cs/AgenticOutcomeInputPanel.tsx
 M src/components/builder/sections/cs/RecommendationsInputPanel.tsx
 M src/components/builder/sections/cs/SuccessStoriesInputPanel.tsx
 M src/components/builder/sections/cs/ThoughtLeadershipInputPanel.tsx
 M src/components/builder/sections/cs/_fields.tsx
 M src/components/sections/BenchmarkingSection.tsx
 M src/components/sections/PerformanceSection.tsx
 M src/components/sections/ThoughtLeadershipSection.tsx
?? scratch_match.mjs
?? src/app/cs/analytics/
?? src/app/home/
?? src/app/sales/
?? src/components/builder/sections/cs/_SuggestionBlock.tsx
?? src/lib/cs-engine/suggestions.ts
?? src/lib/format-metrics.ts
```
<!-- AUTO-HOOK-END -->

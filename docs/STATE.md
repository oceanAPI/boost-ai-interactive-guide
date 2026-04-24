# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — Phase A of the "brand-polish + data surfacing" redesign shipped (`b520f73`). Phase B = visual redesign of `DataFunnelPanel`, not yet started.

## Current goal
Redesign the right-side live analyzer so it looks brand-polished, surfaces
the Export API v4 data we've been dropping, and supports interactive
drill-downs — not a spreadsheet. User locked these three calls:

- **Direction**: all three at once — brand polish + density + interactive drill-down.
- **Null fields**: hide rows entirely when null (financewizard has no intents/filters/skill — don't clutter with em-dashes).
- **Motion**: medium — pulse on live dot, hover-lift on cards, count-up on numbers, mount animation on new cards, chip shimmer on generative.

## Step
- [x] Phase A — proxy + client types. `boost-export-proxy/src/index.js` now dereferences `goals` + `persons`, and `shapeTurn` emits `goals[]`, `human_agent`, `sent_filters`, `feedback`, `link_text`, `translations[]` per turn. Session response gains `matched_filters[]`, `sent_filter_values[]`, `session_tags[]`, `feedback`. Client types in `src/lib/boost-export.ts` mirror. `npm run build` green.
- [ ] **User: `cd boost-export-proxy && fly deploy`** to ship proxy (additive — safe to deploy anytime, current panel ignores new fields).
- [ ] Phase B — `DataFunnelPanel.tsx` redesign:
  - [ ] Hero row at top — one-sentence auto-composed session summary ("6 exchanges · 5 generative · 1 curated · avg 2.4s · Norwegian+English").
  - [ ] Session chrome strip — chips for matched filters, sent filter values, goals triggered, session category (when present).
  - [ ] Routing-lane card redesign — visual pipeline per exchange, action-type color coding, left-border by action type, icon per type, generative chip shimmer.
  - [ ] New rows in the card when populated: Goal / Handover (skill + agent) / Feedback / Translated / Sent filters.
  - [ ] Action-type sparkbar — replaces the "Turn timeline" list. One colored segment per turn, click-to-highlight-card.
  - [ ] Inspector drawer — click any card → drawer with raw turn JSON + "Open in boost.ai admin" deep link.
  - [ ] Motion — pulse on live status dot, hover-lift on cards, count-up on numbers, `animate-modal-in` mount on new cards, CSS shimmer on generative chip.
- [ ] `npm run build` green.
- [ ] Push + prod verify.

## Last-green SHA
`b520f73` (Phase A — proxy + client types).

## Blockers
None. Proxy deploy is additive + optional (no UI regression if user doesn't deploy immediately — panel just won't see new fields until Phase B reads them AND proxy ships).

## Next action
1. User: `cd boost-export-proxy && fly deploy` (Phase A is safe on its own).
2. Next session: execute Phase B as a single PR. Touches `src/components/sections/demo/DataFunnelPanel.tsx` (~1400 LOC, surgical edits — not a full rewrite) and `src/app/globals.css` (one new keyframe for chip shimmer).

## Key context for next session
- **Phase B scope is locked.** The three design calls above drive every detail — don't re-litigate.
- **New data flowing from proxy** (once deployed):
  - Per-turn: `goals[]`, `human_agent`, `sent_filters`, `feedback`, `link_text`, `translations[]` — card rows, only render when populated.
  - Per-session: `matched_filters[]`, `sent_filter_values[]`, `session_tags[]`, `feedback` — session chrome strip chips.
- **Graceful null handling** — financewizard is generative-only, so most new fields will be empty. Panel hides empty rows entirely.
- **Visual language constraints** from `.impeccable.md` and `CLAUDE.md`:
  - No emojis in UI.
  - No blue/cyan/neon — boost-purple + boost-green + amber (handover) + gold (orchestrator).
  - Existing tokens in `globals.css` only — don't introduce new ones.
  - Existing animations: `animate-modal-in`, `animate-pulse`, `sparkle`. New needed: `@keyframes shimmer` for generative chip.
- **XSS fix on Chat API v2 `dangerouslySetInnerHTML`** — tracked in the prior security plan. Paused during this redesign, pick up after Phase B ships.

## Auto-snapshot
Last updated: 2026-04-22T20:05:00+02:00
Branch: main
Last commit: b520f73 feat(live-demo): surface Export API v4 goals / filters / handover / feedback (Phase A)
Working tree:
```
 M docs/STATE.md
?? .claude/launch.json
?? customer_excellence_raw_data_pdfs/
```

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-04-24T11:33:01+02:00
Branch: main
Last commit: 8b587a4 fix(security): input guardrails are AI too; rewrite flow copy (F2)
Working tree:
```
 M docs/STATE.md
```
<!-- AUTO-HOOK-END -->

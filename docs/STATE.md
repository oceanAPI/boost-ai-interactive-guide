# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — Sprint B + C + D shipped. Feedback batch (F1–F11) resolved except F8 onboarding (blocked on user doc).

## Current goal
Feedback-batch cleanup complete up through Sprint D. Next open items:
- F8 Onboarding section copy — still blocked on user-supplied doc (CSM playbook / Success Package deliverables / AI Trainer curriculum).
- Parked P1–P3 and S1–S11 items from the original feedback log — not worked this pass.

## Last commits (Sprints B / C / D)
- `444bf61` F3 currency mixing · `1e51d56` F5 3-bar breakeven · `67ad039` F7 per-phase complexity bars.
- `12f4b10` Sprint C · full 2026 pricing invoice re-plumbing (CSV → data → calculator → admin UI → Commercial).
- Pending commit: Sprint D · resource plan per-role (Solution Architect / AI Trainer / Integration Engineer / PM / CSM) with hours, phase breakdown, implementation one-time + ongoing monthly totals. Build green.

## Step
- [x] Sprint A — earlier fixes (breakeven F1, guardrails F2, admin chips F10/F11, Ageas F9, Impact tiles F4, PAYG copy F6).
- [x] Sprint B — currency picker in admin, F3 consistency, F5 3-bar breakdown on Impact, F7 phase-bar complexity.
- [x] Sprint C — 2026 pricing: `src/data/pricing-2026.ts` (CSV-mirrored tiers + add-ons), `src/lib/pricing-calculator.ts` (floating-tier math), admin Section 3 pricing builder, CommercialOfferSection `<InvoiceBlock />` with line-item monthly + annual totals.
- [x] Sprint D — resource plan: `ROLE_RATES` + `ROLE_PHASE_WEIGHTS` in pricing-2026.ts, `calculateResourcePlan()` with complexity multiplier from markets + integrations + team size, `<ResourcePlanBlock />` in Commercial with per-role hours, per-phase split, implementation one-time total + ongoing monthly.
- [ ] Commit Sprint D, push to prod, smoke-check `/guide` invoice + resource plan with H&M fixture.
- [ ] F8 — on hold pending user doc.

## Last-green SHA
`12f4b10` (Sprint C · full 2026 pricing invoice).

## Blockers
- F8 Onboarding section — need CSM playbook / Success Package deliverables / AI Trainer curriculum from the user to author the section body.

## Next action
1. Commit Sprint D.
2. User pushes to prod; smoke-check `/guide?...#data=...` with a fixture that populates `pricing_config` — verify invoice + resource plan render below the legacy commercial cards.
3. Circle back on F8 when user supplies the onboarding document.

## Key context for next session
- **Pricing source of truth**: `src/data/pricing-2026.ts`. When revenue bumps prices, edit that file — everything downstream (admin UI labels + commercial invoice) auto-reflects.
- **Floating-tier rule**: whole monthly volume prices at the landed-tier rate. Commit volume gets 10% off its share; overage pays landed-tier rate with no discount.
- **Complexity signal is shared**: `RoadmapSection` stretch bars and `ResourcePlanBlock` multiplier derive from the same markets + integrations inputs. Kept intentionally — stretch bars + rising cost should tell one story.
- **Legacy pricing cards remain**: Commercial still shows the 3-model cards below the invoice. Not removed because shared URLs without a `pricing_config` still render them. When revenue is ready, those cards can be deleted.
- **Admin Section 3** is now large. If it gets unwieldy, split into a dedicated "Pricing Builder" section (but for now same-section is easier to navigate than two).

## Auto-snapshot
Last updated: 2026-04-24T13:45:00+02:00
Branch: main
Working tree pending Sprint D commit.

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-04-24T13:42:34+02:00
Branch: main
Last commit: 12f4b10 feat(pricing): full 2026 line-item invoice (Sprint C)
Working tree:
```
 M docs/JOURNAL.md
 M docs/STATE.md
 M src/components/sections/CommercialOfferSection.tsx
 M src/data/pricing-2026.ts
 M src/lib/pricing-calculator.ts
```
<!-- AUTO-HOOK-END -->

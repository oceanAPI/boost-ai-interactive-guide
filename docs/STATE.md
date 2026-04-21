# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — clean, in sync with origin/main.

## Current goal
Section-quality redesign pass across the PS audience sections. User's critique (2026-04-21): "Build Scope / Roles & Responsibilities / Out of Scope have nice structure but shitty design — no icons, faded colour frames for tags, quality dropped mid-sprint." Only `ProjectFramingSection` and `SolutionArchitectureSection` hit the bar set by `ImpactSection` + `ScopeOfWorkSection`.

## Step
PS audience structurally complete (6/6 sections shipped + a critical prod fix). Redesign pass just starting.

- [x] Schema v1.2.0 + H&M expansion fixture
- [x] `audience-sections.ts` PS_DEFAULTS
- [x] ProjectFramingSection — 4 tabs (brief / criteria / journey / math) — passing caliber bar
- [x] BuildScopeSection — 4 tabs (overview / channels / intelligence / integrations) — **fails caliber bar**
- [x] RolesAndResponsibilitiesSection — 3-party swim lane — **fails caliber bar**
- [x] SolutionArchitectureSection — 3-column flow poster — passing
- [x] OutOfScopeSection — numbered exclusions — **fails caliber bar, footprint too heavy for content**
- [x] Prod 414 fix — fragment-encoded payloads (`327948e`)
- [ ] Redesign BuildScope / Roles / OutOfScope using `public/icons/purple` (99 real SVGs we've been ignoring)  ← next
- [ ] Decide whether OutOfScope folds into BuildScope

## Last-green SHA
327948e — fragment-URL prod fix, deployed + verified (Varnish returns 200 for `/guide` path, fragment payload client-only).

## Blockers
None. Critique is clear, redesign reference sections (`ImpactSection`, `ScopeOfWorkSection`) exist, icon library available at `public/icons/purple/*.svg` (99 icons) + `public/icons/white/*.svg`. `BoostIcon.tsx` component already wraps them.

## Next action
One section at a time, starting with **BuildScopeSection** (biggest opportunity — most content, worst current execution). Use `BoostIcon` for channel types, GenAI features, auth providers, API methods. Match the purposeful-animation + distinct-visual-metaphor bar of `ImpactSection`. Ship, verify, commit, move to next. No batching.

## Key context for next session
- Icon library: `public/icons/purple/*.svg` (99) + `public/icons/white/*.svg` (99) — see `src/components/BoostIcon.tsx` for usage pattern.
- User explicit feedback on speed: "take your time so we produce quality section by section." No more rushing.
- Prod payload fix means we can enrich fixtures further without 414 risk — URL now unlimited for client-parsed data.
- Docs: `customer_excellence_raw_data_pdfs/` untracked by design (inspiration, not source).

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-04-21T10:50:03+02:00
Branch: main
Last commit: 327948e fix: move guide payload to URL fragment to bypass 8KB CDN limit (prod crash)
Working tree:
```
 M docs/STATE.md
?? .claude/launch.json
?? customer_excellence_raw_data_pdfs/
```
<!-- AUTO-HOOK-END -->

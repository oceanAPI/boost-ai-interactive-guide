# Gotchas

> Add an entry only after the same mistake happens twice. Each entry: symptom, cause, fix.

---

## REFERENCE.md disagrees with code

**Symptom**: Page Architecture tree in REFERENCE.md says sections 01–10 in fixed positions; admin claims a 6-step form; agent industries list is incomplete.

**Cause**: REFERENCE.md is partially stale as of 2026-04-20. The 9 new CE sections, audience-defaults layer, 10-section admin, and hidden industries layer all post-date its last update.

**Fix**: Trust docs/ARCHITECTURE.md for page/admin/agent questions. REFERENCE.md is still correct for design tokens, animations, UI components, hooks, and orchestrator internals — its freshness map at the top of the file lists which sections to trust.

---

## `/guide?data=...` returns 431 in dev

**Symptom**: Next.js dev server returns 431 Request Header Fields Too Large when opening the guide URL for a richly-seeded customer (H&M).

**Cause**: The H&M fixture's encoded base64url payload is ~18 KB, past Node's default 16 KB header cap.

**Fix**: `package.json` dev script already sets `NODE_OPTIONS='--max-http-header-size=65536'`. If this regresses, restore the flag. As of `327948e` the admin emits fragment-encoded URLs (`/guide#data=...`) which side-step this problem entirely — fragments never go to the server — so the flag is only relevant for legacy `?data=` bookmarks.

---

## Prod returns HTTP 414 for large `?data=` URLs

**Symptom**: Guide or slides page fails to load on `oceanapi.github.io` when the customer payload is rich (PS + H&M and similar). The browser shows a blank / error page. `curl -sI` on the same URL returns `HTTP/2 414` from Varnish.

**Cause**: GitHub Pages fronts `oceanapi.github.io` with Varnish, which rejects any request URI over ~8 KB. A fully-populated PS + H&M fixture encodes to ~32 KB base64url — 4× the cap. Dev was masked because the `NODE_OPTIONS` header bump raised Node's cap to 65 KB, so local never hit the 414.

**Fix**: Payload moved from query string to URL fragment (`/guide#data=...&sections=...`) in commit `327948e`. Fragments are client-only, CDN never sees them, no practical size cap. Admin emits fragment URLs; the guide + slides pages read the fragment first, fall back to `?data=` query for existing bookmarks that fit under the cap. Legacy bookmarks past 8 KB can't be rescued — they need to be regenerated from admin.

---

## Deploy succeeds but runtime breaks silently

**Symptom**: A commit typechecks locally, `npm run build` succeeds, deploy lands on GitHub Pages, but the live site errors in the browser console.

**Cause**: `.github/workflows/deploy.yml` has no test or lint step. Anything that passes tsc but fails at runtime (missing import at runtime, unhandled undefined, client-side-only code without guard) ships.

**Fix**: Always smoke-check the deployed URL after every push. Long-term: add a test step or at least `npm run lint` to the workflow.

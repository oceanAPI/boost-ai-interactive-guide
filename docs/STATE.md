# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — Phase 2b client about to push. Worker extended but not yet deployed by user.

## Current goal
Phase 2b of the live-demo Chat Preview: **Analyze with Export API** button inside `DataFunnelPanel` that calls a Cloudflare Worker proxy to boost.ai's Export API v4 and renders a "Routing & NLU trace" block (action-type distribution, intent trace, handover events, category chip) + per-turn drawer enrichment.

## Step
Code complete. Build + typecheck green. Dev smoke-tested (LiveChatSection mounts, graceful "Failed to fetch" on expected localhost CORS, no stray `/boost-export` calls, no console errors). Worker extension is in the repo but needs `wrangler deploy` + two secrets. Client being pushed this commit.

- [x] `/boost-export` endpoint on existing `feed-me-log` Worker (OAuth2 client_credentials + KV token cache + Export search + cross-lookup by posted_id + dereference maps)
- [x] `wrangler.toml` — `BOOST_EXPORT_TENANT = "financewizard.boost.ai"`
- [x] `src/lib/boost-export.ts` — fetcher with 2s/3s/4s/5s retry ladder for ~10s Export indexing delay
- [x] `LiveChatSection` — `postedIds[]`, `analyzePhase`, `exportTrace`, `analyzedPostedCount`, `handleAnalyze` with snapshot-count-before-await
- [x] `DataFunnelPanel` — `AnalyzeOrRouting` + `RoutingBlock` + `ActionTypeBar` + `DrawerExportExtras`
- [x] `npm run build` green
- [x] Dev smoke-test
- [ ] User: `wrangler secret put BOOST_EXPORT_CLIENT_ID` + `BOOST_EXPORT_CLIENT_SECRET` + `wrangler deploy` in `cloudflare-worker/`
- [ ] Prod verify end-to-end on `oceanapi.github.io`

## Last-green SHA
`4c34ede` (Phase 2a polish) — next commit is Phase 2b.

## Blockers
None. Feature degrades gracefully at every step: no Worker deployment → Analyze button shows "off-line" message; no classical intents on tenant → rows render as em-dashes or hidden; Export indexing not-yet-ready → retries with shimmer then shows friendly error.

## Next action
Push this commit. User deploys Worker in parallel. Verify on prod by opening a guide in `demo_mode: "live"`, sending one message, clicking **Analyze**, confirming the Routing block appears with at least `displayed_action.action_type` populated per turn.

## Key context for next session
- **Worker endpoint**: `POST /boost-export` — body `{ posted_ids: number[], window_minutes?: number }`. Auth: same `x-client-token` as `/feedback`. Returns `{indexed:false}` during the ~10s Export indexing window; client retries.
- **ID cross-lookup**: Chat API v2's `posted_id` === Export API v4's `message.id`. Confirmed empirically. `Conversation.reference` is null on financewizard — do not rely on it.
- **Tenant reality check for financewizard**: `predicted_intent_id`, `matched_filter`, `skill`, `session.category` are all null/empty on most turns. Only `displayed_action.action_type` (`"generative"` vs `"content"`) and `predicted_language` are reliably populated. Panel designed to degrade gracefully. When pointed at a real tenant with intents + auto-review enabled, the Routing block fills out.
- **Dev CORS**: localhost live-chat stays broken. Prod is the only verification path for the full flow.
- **Secret rotation**: the OAuth2 client secret used during build hit chat history. Rotate via boost.ai admin → Security & Privacy → OAuth 2.0 → Reset after first successful prod verify.

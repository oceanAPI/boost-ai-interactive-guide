# STATE — right now

> Overwritten on every meaningful step. Read this first when resuming.

## Branch
main — Phase 2b v2 ready to ship. Proxy still needs `fly deploy`.

## Current goal
Phase 2b **v2** — redesigned RoutingBlock around "wow signals per conversation turn" not aggregate metrics. Every user→bot exchange renders as a card exposing the puzzle pieces boost.ai fired: Routed to (Intent / Generative fallback / Scripted content), Flow id (meta_action_id), Think time (ms), Triggers, API call (api_connector), optional Filter / Skill / Handover / Match / Language, plus a short bot-reply preview. Plus first-click-reliability fix (retry budget 14s→30s) + auto-refresh-on-new-turn (15s debounce).

## Step
- [x] Retry budget 14s→30s, backoffs 2/3/4/5/6/7s
- [x] Proxy (`boost-export-proxy/src/index.js`) passes through `intent_action_meta_id`, `transfer_to_human`, `came_from`, `content_snippet`, `clicked_button_id`
- [x] `ExportTurnTrace` type extended to match proxy shape
- [x] `RoutingBlock` rewritten → per-exchange cards (`ExchangeCard` + `groupExchanges` + `routedToLabel` + `thinkTimeMs` + `formatLatency`)
- [x] Auto-refresh effect in `LiveChatSection` — fires 15s after new turns once user has analysed once, debounced
- [x] `npm run build` green
- [ ] **User: `cd boost-export-proxy && fly deploy`** to pick up the new turn-shape fields
- [ ] Client commit pushed + prod verify

## Last-green SHA
`bda896d` (Fly.io static-IP proxy).

## Blockers
None. Proxy change is additive (new fields, same endpoint contract). Client renders gracefully if the proxy hasn't redeployed yet — it just doesn't get `content_snippet` / `intent_action_meta_id` rows until the proxy ships.

## Next action
1. User runs `fly deploy` in `boost-export-proxy/`
2. User pushes the client commit
3. Prod verify — open guide in `demo_mode: "live"`, send a message, wait for bot, click **Analyze**. Expect one card per exchange with Routed-to / Flow / Think time / etc. Send another message and wait 15s — panel should auto-refresh.

## Key context for next session
- **Fly egress IP**: `204.93.146.71` (allowlisted in boost.ai External APIs). Fly's dedicated IPv4 `149.248.213.183` is ingress-only — egress rides on the shared pool. `fly ssh console -C 'wget -qO- https://api.ipify.org'` to re-check if 403 returns.
- **Ingress URL**: `https://boost-export-proxy.fly.dev`. Client env var: `NEXT_PUBLIC_BOOST_EXPORT_URL`.
- **Proxy turn shape**: `shapeTurn` in `boost-export-proxy/src/index.js`. Any further Export API field we want surfaced must be added both there AND in `ExportTurnTrace` in `src/lib/boost-export.ts`.
- **Exchange grouping**: `groupExchanges()` pairs each user turn with the bot turns that follow. A leading bot turn (START welcome) becomes a `kind: "welcome"` card.
- **Financewizard tenant reality**: no classical intents → `predicted_intent` null on every user turn → cards lean on `action_type === "generative"` as the routing headline. When pointed at a tenant with intents configured, the Routed-to chip flips to `Intent · <title>` and extra rows (Filter / Match) appear automatically.
- **Auto-refresh guardrails**: only fires after first manual Analyze (gates on `analyzedPostedCount > 0`), only on new turns, only when not already loading. Dependency array covers all three.
- **Secret rotation**: the OAuth2 client secret used during build hit chat history. Rotate via boost.ai admin → Security & Privacy → OAuth 2.0 → Reset after verifying the new prod build. KV/Fly token cache invalidates automatically on token expiry.

<!-- AUTO-HOOK-BEGIN: do not edit, overwritten on every Stop -->
## Auto-snapshot
Last updated: 2026-04-22T15:19:37+02:00
Branch: main
Last commit: 0782321 chore: rebuild to pick up BOOST_EXPORT_URL
Working tree:
```
 M boost-export-proxy/fly.toml
 M docs/STATE.md
?? .claude/launch.json
?? customer_excellence_raw_data_pdfs/
```
<!-- AUTO-HOOK-END -->

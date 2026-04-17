# Feed me log — Cloudflare Worker

Tiny worker that stores feedback entries and the company search log in
Cloudflare KV so every browser using the tool writes to the same
place. No third party sees the data — it stays on your Cloudflare
account.

## First-time deploy

```bash
cd cloudflare-worker
npm install

# 1. Auth with Cloudflare (browser popup)
npx wrangler login

# 2. Create the KV namespace (one-time). Paste the returned id into
#    wrangler.toml under [[kv_namespaces]] → id.
npx wrangler kv namespace create FEED_KV

# 3. Set the two secrets. Pick any strings you like — the client token
#    is baked into the site bundle (public, just a bar-raiser). The
#    admin password is what you'll paste into the search-log + feedback
#    review UI to read entries.
npx wrangler secret put CLIENT_TOKEN
npx wrangler secret put ADMIN_PASSWORD

# 4. Deploy.
npx wrangler deploy
```

Wrangler will print the worker URL, e.g.
`https://feed-me-log.your-subdomain.workers.dev`.

## Wire the site

Add these to the site's `.env.local` (and to the GitHub Actions build
env for production):

```
NEXT_PUBLIC_FEED_API_URL=https://feed-me-log.your-subdomain.workers.dev
NEXT_PUBLIC_FEED_CLIENT_TOKEN=<same value you gave CLIENT_TOKEN>
```

Rebuild and the feedback modal + search log switch from localStorage
to the shared worker automatically.

## Reading the logs

In the admin Search Log panel, click "Unlock shared log" and paste
your `ADMIN_PASSWORD`. Same pattern for feedback review (TODO —
currently still local-first; admin read gated by same password).

## Costs

Cloudflare free tier: 100k requests/day and 1k KV writes/day. A
handful of AEs submitting a few feedback entries and searches per day
is nowhere close to that.

## Security model

- **Writes**: require `x-client-token` header matching `CLIENT_TOKEN`.
  Token is in the public site bundle — intent is "raise the bar for
  random internet scrapers", not "defend against a motivated attacker".
  Per-IP rate limit of 30 writes/min is the real floor.
- **Reads / deletes**: require `x-admin-password` header or `?admin=`
  query param matching `ADMIN_PASSWORD`. Only you know this.
- **CORS**: limited to `ALLOWED_ORIGINS` (edit in `wrangler.toml`).
  Browser-level defense only; anyone can bypass with curl, but again
  the rate limit catches abuse.
- **Worst case**: someone floods KV with junk. You wipe the keys with
  a `DELETE /search-log` + `wrangler kv key delete feedback:list`.

## Local dev

```bash
npx wrangler dev
```

Runs the worker at `http://localhost:8787`. Point
`NEXT_PUBLIC_FEED_API_URL` at it during local testing if needed.

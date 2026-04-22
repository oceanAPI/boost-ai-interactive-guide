# boost-export-proxy

Static-IP proxy to boost.ai's Export API v4. Lives on Fly.io so its outbound IP is single + stable and can be added to the tenant's **External APIs** allowlist (which only accepts `/32` entries — no CIDR, no "open to all").

Same contract as the Cloudflare Worker's `/boost-export` — the client can target either URL without code changes beyond the base URL.

## Why this exists

boost.ai's `/api/export/v4.json` enforces a caller-IP allowlist per tenant. The interactive guide's Chat Preview `Analyze` button needs to call this API. Cloudflare Workers egress from a dynamic pool → can't be allowlisted. This tiny Node server on Fly.io gives us one IP.

See `docs/STATE.md` in the root repo for the full reasoning trail.

## One-time setup

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Sign up or log in (Fly requires a card even for the $2/mo IPv4 to start)
fly auth signup   # or: fly auth login

cd boost-export-proxy

# Create the Fly app using fly.toml in this dir.
# --copy-config preserves our app name + region; --no-deploy lets us
# set secrets before first deploy.
fly launch --copy-config --no-deploy
# (Accept defaults; it may ask about the primary region — keep `arn`.)

# Allocate one dedicated IPv4. This is the whole point.
fly ips allocate-v4 --app boost-export-proxy

# Set secrets (substitute the real values):
fly secrets set \
  BOOST_EXPORT_CLIENT_ID="f0791b04-3757-4605-b006-bcf56613719c" \
  BOOST_EXPORT_CLIENT_SECRET="<paste secret>" \
  BOOST_EXPORT_TENANT="financewizard.boost.ai" \
  CLIENT_TOKEN="<same value as NEXT_PUBLIC_FEED_CLIENT_TOKEN>" \
  ALLOWED_ORIGINS="https://oceanapi.github.io,http://localhost:3000"

# Deploy!
fly deploy

# Inspect: grab the v4 IP and the public hostname
fly ips list
fly info
```

## After deploy

1. Grab the IPv4 from `fly ips list` and add it in boost.ai admin → **Settings → Security & Privacy → External APIs → Add to list**.
2. Tell Claude Code the Fly app's public URL (it's `https://<app-name>.fly.dev`). The client's `NEXT_PUBLIC_BOOST_EXPORT_URL` GitHub Actions variable gets set to that URL.
3. Push the client; verify `Analyze` on prod.

## Iterating

```bash
fly logs              # tail runtime logs
fly deploy            # push a new version
fly ssh console       # shell into the machine
fly status            # health + running machines
```

## Local dev

```bash
cd boost-export-proxy
cp .env.sample .env   # if you create one — not committed
node --env-file=.env --watch src/index.js
# curl http://localhost:8080/health
```

## Pricing (2026)

- 1 × `shared-cpu-1x` 256 MB machine running 24/7: ~$1.94/mo
- Dedicated IPv4: $2/mo
- Total: ~$4/mo

To reduce to ~$2/mo, flip `auto_stop_machines = "stop"` + `min_machines_running = 0` in `fly.toml`. First request after idle takes 2–5s to warm up the machine. Acceptable for non-demo traffic.

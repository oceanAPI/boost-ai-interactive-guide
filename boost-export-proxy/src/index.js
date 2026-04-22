/* ──────────────────────────────────────────────────────────────
 *  boost-export-proxy — tiny Node HTTP proxy that fronts
 *  boost.ai's Export API v4 from a known static IP.
 *
 *  Why this exists:
 *    boost.ai's "External APIs" allowlist on financewizard.boost.ai
 *    only accepts single /32 IPv4 entries (no CIDR, no "open to
 *    all" toggle). Cloudflare Workers egress from a dynamic pool
 *    of thousands of IPs so the Worker can't call Export API. We
 *    host this proxy on Fly.io with a dedicated IPv4 and add that
 *    one IP to the allowlist.
 *
 *  Client contract (identical to the Worker's /boost-export):
 *    POST /boost-export
 *      headers: content-type: application/json
 *               x-client-token: <CLIENT_TOKEN>
 *      body:    { posted_ids: number[], window_minutes?: number }
 *    200 { indexed: true,  conversation, session, turns[] }
 *    200 { indexed: false, tried_window_minutes }
 *    400 / 401 / 405 / 500 / 502 / 503 for error cases
 *
 *  Keep the proxy symmetric with the Worker version so the
 *  client can target either without changes beyond the base URL.
 *
 *  Zero dependencies: uses node:http + global fetch (Node 20+).
 * ────────────────────────────────────────────────────────────── */

import { createServer } from "node:http";

/* ─── env ──────────────────────────────────────────────────── */

const {
  BOOST_EXPORT_CLIENT_ID = "",
  BOOST_EXPORT_CLIENT_SECRET = "",
  BOOST_EXPORT_TENANT = "",
  CLIENT_TOKEN = "",
  ALLOWED_ORIGINS = "",
  PORT = "8080",
} = process.env;

const PORT_NUMBER = Number(PORT);
if (!Number.isFinite(PORT_NUMBER)) {
  throw new Error(`Invalid PORT env var: ${PORT}`);
}

/* ─── constants ────────────────────────────────────────────── */

// Refresh the OAuth token N seconds before its stated expiry to
// avoid races where a request uses an about-to-expire token.
const OAUTH_BUFFER_SECONDS = 120;
// Dereference maps (intents/filters/skills/system-action-triggers)
// rarely change on a real tenant — 1h TTL keeps upstream load low.
const MAP_TTL_MS = 60 * 60 * 1000;

const DEFAULT_WINDOW_MINUTES = 15;
const MAX_WINDOW_MINUTES = 60;
const MAX_POSTED_IDS = 200;

const DEREF_NAMES = /** @type {const} */ ([
  "intents",
  "filters",
  "skills",
  "system-action-triggers",
]);

/* ─── in-memory caches ─────────────────────────────────────── */

/** @type {{ access_token: string, expires_at: number } | null} */
let cachedToken = null;

/** @type {Record<string, { data: Record<string, Record<string, unknown>>, expires_at: number }>} */
const mapCache = Object.create(null);

/* ─── helpers ──────────────────────────────────────────────── */

const allowedOrigins = ALLOWED_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Select the CORS allow-origin for this request. Falls back to
 *  the first configured origin rather than "*" since we use
 *  credentials-free POST but still want deterministic behaviour. */
function corsAllowOrigin(origin) {
  if (!origin) return allowedOrigins[0] || "*";
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*";
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": corsAllowOrigin(origin),
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-client-token",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function sendJson(res, origin, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
    ...corsHeaders(origin),
  });
  res.end(payload);
}

function readBody(req, limitBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (c) => {
      total += c.length;
      if (total > limitBytes) {
        reject(new Error("body_too_large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function missingConfig() {
  const missing = [];
  if (!BOOST_EXPORT_CLIENT_ID) missing.push("BOOST_EXPORT_CLIENT_ID");
  if (!BOOST_EXPORT_CLIENT_SECRET) missing.push("BOOST_EXPORT_CLIENT_SECRET");
  if (!BOOST_EXPORT_TENANT) missing.push("BOOST_EXPORT_TENANT");
  if (!CLIENT_TOKEN) missing.push("CLIENT_TOKEN");
  return missing;
}

/* ─── boost.ai calls ───────────────────────────────────────── */

async function getToken() {
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: BOOST_EXPORT_CLIENT_ID,
    client_secret: BOOST_EXPORT_CLIENT_SECRET,
    scope: "export:v4",
  });
  const resp = await fetch(
    `https://${BOOST_EXPORT_TENANT}/api/oauth2/v1/token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    },
  );
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `oauth_failed status=${resp.status} body=${text.slice(0, 200)}`,
    );
  }
  const data = await resp.json();
  if (!data.access_token || !data.expires_in) {
    throw new Error("oauth_malformed_response");
  }
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - OAUTH_BUFFER_SECONDS) * 1000,
  };
  return cachedToken.access_token;
}

async function getMap(name, token) {
  const existing = mapCache[name];
  if (existing && existing.expires_at > Date.now()) return existing.data;
  const resp = await fetch(
    `https://${BOOST_EXPORT_TENANT}/api/export/v4/${name}/`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  mapCache[name] = { data, expires_at: Date.now() + MAP_TTL_MS };
  return data;
}

function resolveRef(map, id, titleKey) {
  if (id == null || !map) return null;
  const entry = map[String(id)];
  if (!entry) return { id, title: null };
  const raw = entry[titleKey];
  return { id, title: typeof raw === "string" ? raw : null };
}

/** Pull the first ~120 chars of readable reply text from a bot
 *  message's content[] array. Used as a card preview so the panel
 *  can show "what did the bot actually say" without a second round-
 *  trip to Chat API v2 or local state. Strips HTML tags, collapses
 *  whitespace, trims to a snippet size. Returns null for turns with
 *  no text (e.g. pure image/video replies). */
function extractContentSnippet(content) {
  if (!Array.isArray(content)) return null;
  const chunks = [];
  for (const c of content) {
    if (!c || typeof c !== "object") continue;
    if (c.type === "text" && typeof c.text === "string") {
      chunks.push(c.text);
    } else if (c.type === "html" && typeof c.text === "string") {
      chunks.push(c.text);
    }
    if (chunks.join(" ").length > 240) break;
  }
  if (chunks.length === 0) return null;
  const plain = chunks
    .join(" ")
    .replace(/<[^>]+>/g, " ") // strip tags
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return null;
  return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
}

function shapeTurn(m, intents, filters, skills, sats) {
  const role = m.is_customer
    ? "user"
    : m.is_support_human
      ? "agent"
      : "bot";
  const displayedAction = m.displayed_action ?? null;
  const cameFromAction = m.came_from_action ?? null;
  return {
    id: m.id,
    role,
    created: m.created,
    language: m.predicted_language ?? null,
    action_type: displayedAction?.action_type ?? null,
    // Meta action ID — the "flow id" that fired on this turn. Lets
    // the panel show "Flow #3149" as a stable fingerprint of which
    // configured logic the tenant matched.
    intent_action_meta_id: displayedAction?.intent_action_meta_id ?? null,
    transfer_to_human: displayedAction?.transfer_to_human ?? false,
    // If the user turn is the result of clicking a button, this
    // carries the meta action that originally rendered the button.
    came_from: cameFromAction
      ? {
          intent_action_meta_id: cameFromAction.intent_action_meta_id ?? null,
          action_type: cameFromAction.action_type ?? null,
        }
      : null,
    // Bot reply snippet so the card can show what was actually said.
    content_snippet: role === "bot" ? extractContentSnippet(m.content) : null,
    system_action_trigger: resolveRef(sats, m.system_action_trigger?.id, "title"),
    predicted_intent: resolveRef(
      intents,
      m.predicted_intent_id ?? m.predicted_intent?.id ?? null,
      "title",
    ),
    prediction_types: m.prediction_types ?? null,
    matched_filter: resolveRef(filters, m.matched_filter?.id, "title"),
    skill: resolveRef(skills, m.skill?.id, "name"), // upstream key; we store as .title
    original_question: m.original_question ?? null,
    is_human_chat: Boolean(m.is_human_chat),
    is_human_chat_queue: Boolean(m.is_human_chat_queue),
    is_unknown: Boolean(m.is_unknown),
    clicked_button_id: typeof m.clicked_button_id === "number" ? m.clicked_button_id : null,
  };
}

async function handleBoostExport(raw) {
  const missing = missingConfig();
  if (missing.length) {
    return {
      status: 503,
      body: {
        error: "boost_export_not_configured",
        missing,
      },
    };
  }

  const ids = Array.isArray(raw?.posted_ids)
    ? raw.posted_ids
        .map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null))
        .filter((v) => v !== null)
    : [];
  if (ids.length === 0) {
    return { status: 400, body: { error: "missing_posted_ids" } };
  }
  if (ids.length > MAX_POSTED_IDS) {
    return { status: 400, body: { error: "too_many_posted_ids" } };
  }

  let windowMinutes = DEFAULT_WINDOW_MINUTES;
  if (typeof raw?.window_minutes === "number" && raw.window_minutes > 0) {
    windowMinutes = Math.min(raw.window_minutes, MAX_WINDOW_MINUTES);
  }

  let token;
  try {
    token = await getToken();
  } catch (e) {
    return {
      status: 502,
      body: { error: "boost_oauth_failed", detail: String(e).slice(0, 200) },
    };
  }

  const now = new Date();
  const from = new Date(now.getTime() - windowMinutes * 60_000);
  const searchResp = await fetch(
    `https://${BOOST_EXPORT_TENANT}/api/export/v4.json`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        search: {
          from_date: from.toISOString(),
          to_date: now.toISOString(),
        },
      }),
    },
  );
  if (!searchResp.ok) {
    const text = await searchResp.text().catch(() => "");
    return {
      status: 502,
      body: {
        error: "boost_export_search_failed",
        upstream_status: searchResp.status,
        upstream_body: text.slice(0, 400),
      },
    };
  }
  const convs = await searchResp.json();

  const idSet = new Set(ids);
  let matchedConv = null;
  let matchedSession = null;
  outer: for (const conv of convs) {
    for (const s of conv.sessions ?? []) {
      for (const m of s.messages ?? []) {
        if (idSet.has(m.id)) {
          matchedConv = conv;
          matchedSession = s;
          break outer;
        }
      }
    }
  }

  if (!matchedConv || !matchedSession) {
    return {
      status: 200,
      body: {
        indexed: false,
        tenant: BOOST_EXPORT_TENANT,
        window_minutes: windowMinutes,
        tried_window_minutes: windowMinutes,
      },
    };
  }

  const [intents, filters, skills, sats] = await Promise.all(
    DEREF_NAMES.map((n) => getMap(n, token)),
  );
  const turns = (matchedSession.messages ?? []).map((m) =>
    shapeTurn(m, intents, filters, skills, sats),
  );
  const cat = matchedSession.category ?? {};

  return {
    status: 200,
    body: {
      indexed: true,
      tenant: BOOST_EXPORT_TENANT,
      window_minutes: windowMinutes,
      conversation: {
        id: matchedConv.id,
        environment: matchedConv.environment,
      },
      session: {
        id: matchedSession.id,
        duration: matchedSession.duration ?? "",
        created: matchedSession.created,
        category: {
          automatic: typeof cat.automatic === "string" ? cat.automatic : null,
          manual: typeof cat.manual === "string" ? cat.manual : null,
        },
        reviewed: Boolean(matchedSession.reviewed),
      },
      turns,
    },
  };
}

/* ─── HTTP server ──────────────────────────────────────────── */

const server = createServer(async (req, res) => {
  const origin = req.headers.origin ?? null;

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", "http://internal");

  if (url.pathname === "/health" || url.pathname === "/") {
    sendJson(res, origin, 200, { status: "ok", service: "boost-export-proxy" });
    return;
  }

  if (url.pathname === "/boost-export") {
    if (req.method !== "POST") {
      sendJson(res, origin, 405, { error: "method_not_allowed" });
      return;
    }
    if (req.headers["x-client-token"] !== CLIENT_TOKEN || !CLIENT_TOKEN) {
      sendJson(res, origin, 401, { error: "unauthorized" });
      return;
    }
    let raw = null;
    try {
      const body = await readBody(req);
      raw = body ? JSON.parse(body) : null;
    } catch {
      sendJson(res, origin, 400, { error: "invalid_body" });
      return;
    }
    try {
      const { status, body } = await handleBoostExport(raw);
      sendJson(res, origin, status, body);
    } catch (e) {
      sendJson(res, origin, 500, {
        error: "internal_error",
        detail: String(e).slice(0, 200),
      });
    }
    return;
  }

  sendJson(res, origin, 404, { error: "not_found" });
});

server.listen(PORT_NUMBER, "0.0.0.0", () => {
  console.log(
    `boost-export-proxy listening on :${PORT_NUMBER} (tenant=${BOOST_EXPORT_TENANT || "UNSET"})`,
  );
  const missing = missingConfig();
  if (missing.length) {
    console.warn(
      `[warn] missing env: ${missing.join(", ")} — /boost-export will return 503 until set`,
    );
  }
});

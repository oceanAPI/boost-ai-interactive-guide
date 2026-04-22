/**
 * Feed-me-log worker
 *
 * Small Cloudflare Worker that backs the "Feed me log" and search log
 * panels. All state lives in a single KV namespace bound as FEED_KV.
 *
 * Endpoints:
 *   POST   /feedback        add an entry   (client token)
 *   GET    /feedback        list entries   (admin password)
 *   DELETE /feedback/:id    remove entry   (admin password)
 *   POST   /search-log      log a search   (client token)
 *   GET    /search-log      list entries   (admin password)
 *   DELETE /search-log      clear all      (admin password)
 *
 * Env vars:
 *   CLIENT_TOKEN      — shared token baked into client bundle (bar-raiser)
 *   ADMIN_PASSWORD    — gate for read/delete endpoints
 *   ALLOWED_ORIGINS   — comma-separated allow-list for CORS (e.g. "https://oceanapi.github.io")
 *
 * KV bindings:
 *   FEED_KV           — namespace holding the two JSON arrays
 */

export interface Env {
  FEED_KV: KVNamespace;
  CLIENT_TOKEN: string;
  ADMIN_PASSWORD: string;
  ALLOWED_ORIGINS: string;
  // Optional — only required when the /boost-export endpoint is
  // in use. Missing values cause /boost-export to return 503 with
  // a clear error rather than crashing the worker.
  BOOST_EXPORT_CLIENT_ID?: string;
  BOOST_EXPORT_CLIENT_SECRET?: string;
  // Tenant host, e.g. "financewizard.boost.ai". Set in [vars] in
  // wrangler.toml. Not a secret.
  BOOST_EXPORT_TENANT?: string;
}

// Single-key KV entry cap. Bumped from 500 to give ~7-10 days of
// retention for a 200-person team at active use. Worst-case payload
// size stays under KV's 25MB value limit (2000 × ~10KB max meta).
// When / if usage outpaces this, move to sharded keys (feedback:page:N).
const MAX_ENTRIES = 2000;

// Max entries returned per GET request. Hard cap that protects the
// Worker from OOM on very active stores and keeps response payloads
// under ~10MB. Clients can paginate further via the `since` cursor.
const DEFAULT_READ_LIMIT = 200;
const MAX_READ_LIMIT = 1000;

const FEEDBACK_KEY = "feedback:list";
const SEARCH_KEY = "search-log:list";

// Per-IP in-memory rate limiter (worker isolates are short-lived but this
// still knocks out simple floods). 30 writes per minute per IP.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

interface FeedbackEntry {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  // Optional contextual fields added with the section-scoped / labeled
  // flow. Older entries without these are still valid.
  label?: string;
  sectionRef?: string;
  meta?: unknown;
}

// "copy" kept for back-compat with entries stored before the rename to
// "information"; new submissions should use "information".
const ALLOWED_LABELS: readonly string[] = ["bug", "copy", "information", "visual", "idea"];
const MAX_META_BYTES = 8 * 1024;
const MAX_SECTION_REF_CHARS = 128;

interface SearchEntry {
  query: string;
  matchedKey: string | null;
  timestamp: number;
}

/* ─── helpers ──────────────────────────────────────────── */

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allow = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const matched = origin && allow.includes(origin) ? origin : allow[0] || "*";
  return {
    "access-control-allow-origin": matched,
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,x-client-token,x-admin-password",
    "access-control-max-age": "86400",
  };
}

function json(data: unknown, init: ResponseInit = {}, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...extraHeaders,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

function checkRate(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

async function readList<T>(kv: KVNamespace, key: string): Promise<T[]> {
  const raw = await kv.get(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * Apply `?since=<ms>` + `?limit=<n>` filtering to a list of entries
 * that carry a `timestamp` field. Entries are returned newest-first
 * within the filtered window, capped at `limit`.
 *
 * Returns { entries, total, hasMore } so the admin UI can say
 * "Showing 48 of 1,247 · last 30 days".
 */
function paginateByTime<T extends { timestamp: number }>(
  list: T[],
  url: URL,
): { entries: T[]; total: number; hasMore: boolean } {
  const total = list.length;
  const sinceRaw = url.searchParams.get("since");
  const limitRaw = url.searchParams.get("limit");

  let since = 0;
  if (sinceRaw) {
    const n = Number(sinceRaw);
    if (Number.isFinite(n) && n >= 0) since = n;
  }

  let limit = DEFAULT_READ_LIMIT;
  if (limitRaw) {
    const n = Number(limitRaw);
    if (Number.isFinite(n) && n > 0) limit = Math.min(n, MAX_READ_LIMIT);
  }

  const filtered = since > 0 ? list.filter((e) => e.timestamp >= since) : list;
  // Sort newest-first so the most recent entries come back even when
  // the filtered window exceeds `limit`. Original list stays in
  // insertion order (ascending) inside KV.
  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  const hasMore = sorted.length > limit;
  return { entries: sorted.slice(0, limit), total, hasMore };
}

async function writeList<T>(kv: KVNamespace, key: string, items: T[]): Promise<void> {
  const trimmed = items.slice(-MAX_ENTRIES);
  await kv.put(key, JSON.stringify(trimmed));
}

function requireClientToken(req: Request, env: Env): boolean {
  return req.headers.get("x-client-token") === env.CLIENT_TOKEN;
}

function requireAdmin(req: Request, env: Env, url: URL): boolean {
  const header = req.headers.get("x-admin-password");
  const query = url.searchParams.get("admin");
  return header === env.ADMIN_PASSWORD || query === env.ADMIN_PASSWORD;
}

/* ─── boost.ai Export API v4 proxy ──────────────────────────
 *
 * Why a worker proxy and not direct-from-browser:
 *   - Export API v4 requires an OAuth2 client_credentials bearer
 *     token. We cannot ship the client secret in the browser
 *     bundle — server-side flow only.
 *   - The CORS allowlist on boost.ai's tenant covers Chat API v2
 *     but does not guarantee Export API v4 exposure to browsers.
 *   - Caching the token + the dereference maps (intents, filters,
 *     skills, system-action-triggers) at the edge keeps latency
 *     low and quota use minimal.
 *
 * Shape of the client contract:
 *   POST /boost-export
 *     header: x-client-token: <CLIENT_TOKEN>        (same as /feedback)
 *     body:   { posted_ids: number[], window_minutes?: number }
 *
 *   200: {
 *     indexed: true,
 *     tenant: "financewizard.boost.ai",
 *     window_minutes: 15,
 *     conversation: { id: number, environment: string },
 *     session: { id: number, duration: string, created: string,
 *                category: {automatic?: string, manual?: string},
 *                reviewed: boolean },
 *     turns: Array<TurnTrace>    // one per posted_id that matched
 *   }
 *
 *   200: { indexed: false, tried_window_minutes: 15 }
 *     Returned when NO posted_id matched any message in the window.
 *     Client treats this as "retry with backoff" — Export indexing
 *     takes ~10s, so a first poll <10s after the message is likely
 *     to return this. Client should back off up to ~12s.
 *
 *   401 / 429 / 503 on common failure modes.
 * ────────────────────────────────────────────────────────────── */

// OAuth token cache. Tokens are ~1h; we refresh with a 120s buffer.
const BOOST_OAUTH_KV_KEY = "boost:oauth-token";
const BOOST_OAUTH_BUFFER_SECONDS = 120;

// Dereference-map cache. Intents/filters/skills rarely change on a
// real tenant — 1h TTL keeps the worker cheap. System action triggers
// change on admin saves; 1h is tolerable for a demo.
const BOOST_MAP_TTL_SECONDS = 3600;

// Defaults for the Export API search.
const BOOST_DEFAULT_WINDOW_MINUTES = 15;
const BOOST_MAX_WINDOW_MINUTES = 60;

interface CachedOAuthToken {
  access_token: string;
  expires_at: number; // ms epoch, already buffered
}

/** Retrieve a valid OAuth token, fetching + caching if missing or
 *  near expiry. Returns null if credentials are missing. */
async function getBoostToken(env: Env): Promise<string | null> {
  const clientId = env.BOOST_EXPORT_CLIENT_ID;
  const clientSecret = env.BOOST_EXPORT_CLIENT_SECRET;
  const tenant = env.BOOST_EXPORT_TENANT;
  if (!clientId || !clientSecret || !tenant) return null;

  const cachedRaw = await env.FEED_KV.get(BOOST_OAUTH_KV_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw) as CachedOAuthToken;
      if (cached.expires_at > Date.now()) {
        return cached.access_token;
      }
    } catch {
      // fall through to refresh
    }
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "export:v4",
  });
  const resp = await fetch(`https://${tenant}/api/oauth2/v1/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token || !data.expires_in) return null;

  const expires_at =
    Date.now() + (data.expires_in - BOOST_OAUTH_BUFFER_SECONDS) * 1000;
  const cached: CachedOAuthToken = {
    access_token: data.access_token,
    expires_at,
  };
  // KV expirationTtl is seconds from now. Match the buffered lifetime.
  await env.FEED_KV.put(BOOST_OAUTH_KV_KEY, JSON.stringify(cached), {
    expirationTtl: Math.max(60, data.expires_in - BOOST_OAUTH_BUFFER_SECONDS),
  });
  return data.access_token;
}

/** Fetch-and-cache a dereference map from the Export API. Maps
 *  look like { "1": {...}, "2": {...} } keyed by id. We store
 *  them as-is under `boost:map:<name>` in KV for 1h. */
async function getDereferenceMap(
  env: Env,
  token: string,
  name: "intents" | "filters" | "skills" | "system-action-triggers",
): Promise<Record<string, Record<string, unknown>> | null> {
  const tenant = env.BOOST_EXPORT_TENANT;
  if (!tenant) return null;
  const kvKey = `boost:map:${name}`;
  const cached = await env.FEED_KV.get(kvKey);
  if (cached) {
    try {
      return JSON.parse(cached) as Record<string, Record<string, unknown>>;
    } catch {
      // fall through
    }
  }
  const resp = await fetch(`https://${tenant}/api/export/v4/${name}/`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as Record<string, Record<string, unknown>>;
  await env.FEED_KV.put(kvKey, JSON.stringify(data), {
    expirationTtl: BOOST_MAP_TTL_SECONDS,
  });
  return data;
}

interface ExportTurnTrace {
  id: number;
  role: "user" | "bot" | "agent";
  created: string;
  language: string | null;
  action_type: string | null;
  system_action_trigger: { id: number; title: string | null } | null;
  predicted_intent: { id: number; title: string | null } | null;
  prediction_types: string[] | null;
  matched_filter: { id: number; title: string | null } | null;
  // Skills carry `name` in Export API; we unify on `title` here to
  // keep the client-side render logic uniform across ref types.
  skill: { id: number; title: string | null } | null;
  original_question: string | null;
  is_human_chat: boolean;
  is_human_chat_queue: boolean;
  is_unknown: boolean;
}

interface ExportTraceResponse {
  indexed: boolean;
  tenant: string;
  window_minutes: number;
  conversation?: { id: number; environment: string };
  session?: {
    id: number;
    duration: string;
    created: string;
    category: { automatic?: string | null; manual?: string | null } | null;
    reviewed: boolean;
  };
  turns?: ExportTurnTrace[];
  tried_window_minutes?: number;
}

/** Minimal shapes for the bits of the Export API response we read. */
interface RawConvMessage {
  id: number;
  created: string;
  is_customer?: boolean | null;
  is_support_human?: boolean | null;
  is_human_chat?: boolean | null;
  is_human_chat_queue?: boolean | null;
  is_unknown?: boolean | null;
  original_question?: string | null;
  predicted_language?: string | null;
  predicted_intent_id?: number | null;
  predicted_intent?: { id?: number } | null;
  prediction_types?: string[] | null;
  matched_filter?: { id?: number } | null;
  skill?: { id?: number } | null;
  system_action_trigger?: { id?: number } | null;
  displayed_action?: { action_type?: string | null } | null;
}
interface RawConvSession {
  id: number;
  created: string;
  duration?: string | null;
  reviewed?: boolean | null;
  category?: Record<string, unknown> | null;
  messages?: RawConvMessage[] | null;
}
interface RawConv {
  id: number;
  environment: string;
  sessions?: RawConvSession[] | null;
}

function resolveRef(
  map: Record<string, Record<string, unknown>> | null,
  id: number | null | undefined,
  titleKey: "title" | "name",
): { id: number; title: string | null } | null {
  if (id == null || !map) return null;
  const entry = map[String(id)];
  if (!entry) return { id, title: null };
  const raw = entry[titleKey];
  const title = typeof raw === "string" ? raw : null;
  return { id, title };
}

function shapeTurn(
  m: RawConvMessage,
  intents: Record<string, Record<string, unknown>> | null,
  filters: Record<string, Record<string, unknown>> | null,
  skills: Record<string, Record<string, unknown>> | null,
  sats: Record<string, Record<string, unknown>> | null,
): ExportTurnTrace {
  const role: ExportTurnTrace["role"] = m.is_customer
    ? "user"
    : m.is_support_human
      ? "agent"
      : "bot";
  return {
    id: m.id,
    role,
    created: m.created,
    language: m.predicted_language ?? null,
    action_type: m.displayed_action?.action_type ?? null,
    system_action_trigger: resolveRef(sats, m.system_action_trigger?.id, "title"),
    predicted_intent: resolveRef(
      intents,
      m.predicted_intent_id ?? m.predicted_intent?.id ?? null,
      "title",
    ),
    prediction_types: m.prediction_types ?? null,
    matched_filter: resolveRef(filters, m.matched_filter?.id, "title"),
    // Skills use `name` upstream; resolveRef normalises to `title`.
    skill: resolveRef(skills, m.skill?.id, "name"),
    // NOTE: the above call pulls entry.name but returns it in .title
    // — see resolveRef signature.
    original_question: m.original_question ?? null,
    is_human_chat: Boolean(m.is_human_chat),
    is_human_chat_queue: Boolean(m.is_human_chat_queue),
    is_unknown: Boolean(m.is_unknown),
  };
}

/** Core handler for POST /boost-export. Pulled out so the request
 *  fn stays compact. */
async function handleBoostExport(
  req: Request,
  env: Env,
): Promise<{ status: number; body: unknown }> {
  if (
    !env.BOOST_EXPORT_CLIENT_ID ||
    !env.BOOST_EXPORT_CLIENT_SECRET ||
    !env.BOOST_EXPORT_TENANT
  ) {
    return {
      status: 503,
      body: {
        error: "boost_export_not_configured",
        detail:
          "Worker is missing BOOST_EXPORT_CLIENT_ID / _CLIENT_SECRET / BOOST_EXPORT_TENANT",
      },
    };
  }

  const raw = (await req.json().catch(() => null)) as {
    posted_ids?: unknown;
    window_minutes?: unknown;
  } | null;

  const ids = Array.isArray(raw?.posted_ids)
    ? raw!.posted_ids
        .map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null))
        .filter((v): v is number => v !== null)
    : [];
  if (ids.length === 0) {
    return { status: 400, body: { error: "missing_posted_ids" } };
  }
  if (ids.length > 200) {
    return { status: 400, body: { error: "too_many_posted_ids" } };
  }

  let windowMinutes = BOOST_DEFAULT_WINDOW_MINUTES;
  if (typeof raw?.window_minutes === "number" && raw.window_minutes > 0) {
    windowMinutes = Math.min(raw.window_minutes, BOOST_MAX_WINDOW_MINUTES);
  }

  const token = await getBoostToken(env);
  if (!token) {
    return {
      status: 502,
      body: { error: "boost_oauth_failed" },
    };
  }
  const tenant = env.BOOST_EXPORT_TENANT;

  const now = new Date();
  const from = new Date(now.getTime() - windowMinutes * 60_000);
  const searchResp = await fetch(
    `https://${tenant}/api/export/v4.json`,
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
    return {
      status: 502,
      body: {
        error: "boost_export_search_failed",
        upstream_status: searchResp.status,
      },
    };
  }
  const convs = (await searchResp.json()) as RawConv[];

  // Find the session that contains ANY of the posted_ids. We assume
  // they all belong to the same conversation (true for a single
  // browser session), so the first hit wins.
  const idSet = new Set(ids);
  let matchedConv: RawConv | null = null;
  let matchedSession: RawConvSession | null = null;
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
        tenant,
        window_minutes: windowMinutes,
        tried_window_minutes: windowMinutes,
      } satisfies ExportTraceResponse,
    };
  }

  // Fetch (or pull cached) dereference maps. Parallelised. A null
  // map returns unresolved titles — we still show the ID.
  const [intents, filters, skills, sats] = await Promise.all([
    getDereferenceMap(env, token, "intents"),
    getDereferenceMap(env, token, "filters"),
    getDereferenceMap(env, token, "skills"),
    getDereferenceMap(env, token, "system-action-triggers"),
  ]);

  const turns: ExportTurnTrace[] = (matchedSession.messages ?? []).map((m) =>
    shapeTurn(m, intents, filters, skills, sats),
  );

  const cat = matchedSession.category ?? {};
  const normalizedCat = {
    automatic:
      typeof (cat as Record<string, unknown>)["automatic"] === "string"
        ? ((cat as Record<string, unknown>)["automatic"] as string)
        : null,
    manual:
      typeof (cat as Record<string, unknown>)["manual"] === "string"
        ? ((cat as Record<string, unknown>)["manual"] as string)
        : null,
  };

  const body: ExportTraceResponse = {
    indexed: true,
    tenant,
    window_minutes: windowMinutes,
    conversation: {
      id: matchedConv.id,
      environment: matchedConv.environment,
    },
    session: {
      id: matchedSession.id,
      duration: matchedSession.duration ?? "",
      created: matchedSession.created,
      category: normalizedCat,
      reviewed: Boolean(matchedSession.reviewed),
    },
    turns,
  };
  return { status: 200, body };
}

/* ─── handler ──────────────────────────────────────────── */

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get("origin");
    const cors = corsHeaders(origin, env);
    const ip = req.headers.get("cf-connecting-ip") || "unknown";

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const respond = (data: unknown, init: ResponseInit = {}) => json(data, init, cors);

    try {
      /* feedback */
      if (url.pathname === "/feedback") {
        if (req.method === "POST") {
          if (!requireClientToken(req, env)) return respond({ error: "unauthorized" }, { status: 401 });
          if (!checkRate(ip)) return respond({ error: "rate_limited" }, { status: 429 });

          const body = (await req.json().catch(() => null)) as {
            text?: string;
            author?: string;
            label?: string;
            sectionRef?: string;
            meta?: unknown;
          } | null;
          const text = body?.text?.trim().slice(0, 2000) || "";
          const author = (body?.author || "me").slice(0, 32);
          if (!text) return respond({ error: "empty_text" }, { status: 400 });

          // Validate + size-cap optional context fields. Anything
          // invalid is silently dropped so a malformed client can't
          // corrupt the store — the core text + author still get
          // recorded.
          const extras: Partial<Pick<FeedbackEntry, "label" | "sectionRef" | "meta">> = {};
          if (typeof body?.label === "string" && ALLOWED_LABELS.includes(body.label)) {
            extras.label = body.label;
          }
          if (typeof body?.sectionRef === "string" && body.sectionRef.length > 0) {
            extras.sectionRef = body.sectionRef.slice(0, MAX_SECTION_REF_CHARS);
          }
          if (body?.meta !== undefined && body?.meta !== null) {
            try {
              const serialized = JSON.stringify(body.meta);
              if (serialized.length <= MAX_META_BYTES) {
                extras.meta = body.meta;
              }
            } catch {
              // non-serializable meta — drop
            }
          }

          const entry: FeedbackEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text,
            author,
            timestamp: Date.now(),
            ...extras,
          };
          const list = await readList<FeedbackEntry>(env.FEED_KV, FEEDBACK_KEY);
          list.push(entry);
          await writeList(env.FEED_KV, FEEDBACK_KEY, list);
          return respond({ entry });
        }

        if (req.method === "GET") {
          // Reads locked behind admin password so the feedback list stays
          // private to the owner. Anyone with the public client token can
          // still write.
          if (!requireAdmin(req, env, url)) return respond({ error: "unauthorized" }, { status: 401 });
          const list = await readList<FeedbackEntry>(env.FEED_KV, FEEDBACK_KEY);
          const paged = paginateByTime(list, url);
          return respond(paged);
        }
      }

      /* feedback delete by id — admin only */
      const feedbackIdMatch = url.pathname.match(/^\/feedback\/([^/]+)$/);
      if (feedbackIdMatch && req.method === "DELETE") {
        if (!requireAdmin(req, env, url)) return respond({ error: "unauthorized" }, { status: 401 });
        const id = decodeURIComponent(feedbackIdMatch[1]);
        const list = await readList<FeedbackEntry>(env.FEED_KV, FEEDBACK_KEY);
        await writeList(
          env.FEED_KV,
          FEEDBACK_KEY,
          list.filter((e) => e.id !== id),
        );
        return respond({ ok: true });
      }

      /* search log */
      if (url.pathname === "/search-log") {
        if (req.method === "POST") {
          if (!requireClientToken(req, env)) return respond({ error: "unauthorized" }, { status: 401 });
          if (!checkRate(ip)) return respond({ error: "rate_limited" }, { status: 429 });

          const body = (await req.json().catch(() => null)) as {
            query?: string;
            matchedKey?: string | null;
          } | null;
          const query = body?.query?.slice(0, 500) || "";
          if (!query) return respond({ error: "empty_query" }, { status: 400 });

          const entry: SearchEntry = {
            query,
            matchedKey: body?.matchedKey ?? null,
            timestamp: Date.now(),
          };
          const list = await readList<SearchEntry>(env.FEED_KV, SEARCH_KEY);
          list.push(entry);
          await writeList(env.FEED_KV, SEARCH_KEY, list);
          return respond({ ok: true });
        }

        if (req.method === "GET") {
          if (!requireAdmin(req, env, url)) return respond({ error: "unauthorized" }, { status: 401 });
          const list = await readList<SearchEntry>(env.FEED_KV, SEARCH_KEY);
          const paged = paginateByTime(list, url);
          return respond(paged);
        }

        if (req.method === "DELETE") {
          if (!requireAdmin(req, env, url)) return respond({ error: "unauthorized" }, { status: 401 });
          await env.FEED_KV.delete(SEARCH_KEY);
          return respond({ ok: true });
        }
      }

      /* boost-export — POST only. Client-token gated like /feedback.
         Rate-limited per IP like writes. OAuth + dereferencing happens
         inside handleBoostExport. */
      if (url.pathname === "/boost-export") {
        if (req.method !== "POST") {
          return respond({ error: "method_not_allowed" }, { status: 405 });
        }
        if (!requireClientToken(req, env)) {
          return respond({ error: "unauthorized" }, { status: 401 });
        }
        if (!checkRate(ip)) {
          return respond({ error: "rate_limited" }, { status: 429 });
        }
        const { status, body } = await handleBoostExport(req, env);
        return respond(body, { status });
      }

      if (url.pathname === "/" || url.pathname === "/health") {
        return respond({ status: "ok", service: "feed-me-log" });
      }

      return respond({ error: "not_found" }, { status: 404 });
    } catch (err) {
      return respond({ error: "internal_error", detail: String(err) }, { status: 500 });
    }
  },
};

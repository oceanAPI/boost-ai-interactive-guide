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
}

const MAX_ENTRIES = 500;
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
          return respond({ entries: list });
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
          return respond({ entries: list });
        }

        if (req.method === "DELETE") {
          if (!requireAdmin(req, env, url)) return respond({ error: "unauthorized" }, { status: 401 });
          await env.FEED_KV.delete(SEARCH_KEY);
          return respond({ ok: true });
        }
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

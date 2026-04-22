/* ──────────────────────────────────────────────────────────────
 *  boost-export.ts — client-side fetcher for the "Analyze with
 *  Export API" flow on the live-demo section.
 *
 *  Calls a static-IP proxy at POST /boost-export which fronts
 *  boost.ai's Export API v4 (OAuth2 client_credentials).
 *
 *  Backend resolution (in priority order):
 *    1. NEXT_PUBLIC_BOOST_EXPORT_URL — dedicated static-IP proxy
 *       (Fly.io app). This is the production path because
 *       boost.ai's External APIs allowlist rejects CIDR ranges so
 *       dynamic-IP platforms (Cloudflare Workers, Vercel Hobby,
 *       etc.) are rejected by Export API with 403.
 *    2. NEXT_PUBLIC_FEED_API_URL + "/boost-export" — fallback to
 *       the Cloudflare Worker. Only works on tenants that don't
 *       enforce the External APIs IP allowlist. Kept for forward
 *       compatibility with such tenants.
 *
 *  The backend returns either:
 *    - indexed=true: full trace with turns[] enriched via the
 *      Export API's dereference endpoints
 *    - indexed=false: not yet in the Export index. Indexing takes
 *      ~10s so we back off and retry.
 *
 *  We do NOT surface the "not yet indexed" state as an error. The
 *  UI should show a single "analysing" state while fetchExportTrace
 *  retries internally, then flip to loaded on success.
 * ────────────────────────────────────────────────────────────── */

import { FEED_API_URL, FEED_CLIENT_TOKEN } from "@/lib/feed-api";

/** Dedicated static-IP proxy URL. Set as a GitHub Actions variable
 *  to the Fly.io app URL, e.g. `https://boost-export-proxy.fly.dev`.
 *  When set, takes precedence over the Cloudflare Worker fallback. */
const BOOST_EXPORT_URL = (process.env.NEXT_PUBLIC_BOOST_EXPORT_URL || "")
  .trim()
  .replace(/\/$/, "");

/** Resolve the endpoint to call. Returns null when neither backend
 *  is configured — `isExportConfigured()` reflects that. */
function resolveExportEndpoint(): string | null {
  if (BOOST_EXPORT_URL) return `${BOOST_EXPORT_URL}/boost-export`;
  if (FEED_API_URL) return `${FEED_API_URL}/boost-export`;
  return null;
}

export interface ExportTurnTrace {
  id: number;
  role: "user" | "bot" | "agent";
  created: string;
  language: string | null;
  action_type: string | null;
  system_action_trigger: { id: number; title: string | null } | null;
  predicted_intent: { id: number; title: string | null } | null;
  prediction_types: string[] | null;
  matched_filter: { id: number; title: string | null } | null;
  skill: { id: number; title: string | null } | null;
  original_question: string | null;
  is_human_chat: boolean;
  is_human_chat_queue: boolean;
  is_unknown: boolean;
}

export interface ExportTraceSuccess {
  indexed: true;
  tenant: string;
  window_minutes: number;
  conversation: { id: number; environment: string };
  session: {
    id: number;
    duration: string;
    created: string;
    category: { automatic: string | null; manual: string | null } | null;
    reviewed: boolean;
  };
  turns: ExportTurnTrace[];
}

export interface ExportTraceNotIndexed {
  indexed: false;
  tenant: string;
  window_minutes: number;
  tried_window_minutes: number;
}

export type ExportTraceResponse = ExportTraceSuccess | ExportTraceNotIndexed;

/** Error categories the caller can differentiate in UI copy. */
export type ExportTraceError =
  | { kind: "not_configured" }
  | { kind: "request_failed" }
  | { kind: "not_indexed_after_retries"; tried_ms: number };

export type ExportTraceResult =
  | { ok: true; trace: ExportTraceSuccess }
  | { ok: false; error: ExportTraceError };

export function isExportConfigured(): boolean {
  // Need (a) a backend URL — Fly proxy preferred, Worker fallback —
  // AND (b) the shared client token baked into the bundle. Server-
  // side may still 503 if the backend's own secrets are missing,
  // but from the client's POV we're "configured" if these two are
  // set, so the Analyze button renders.
  return !!FEED_CLIENT_TOKEN && resolveExportEndpoint() !== null;
}

interface FetchOptions {
  /** Total ms budget for retries on not-yet-indexed. Default 14000. */
  timeoutMs?: number;
  /** AbortSignal so the caller can cancel on reset/unmount. */
  signal?: AbortSignal;
  /** Window (minutes) to search in Export API. Default 15. */
  windowMinutes?: number;
}

/** Fetch Export-API trace for a set of Chat API v2 posted_ids.
 *
 *  Retry schedule when indexed=false: 2s, 3s, 4s, 5s. Caps total
 *  wait at ~14s so the UI doesn't spin forever when something is
 *  genuinely missing. */
export async function fetchExportTrace(
  postedIds: number[],
  opts: FetchOptions = {},
): Promise<ExportTraceResult> {
  if (!isExportConfigured()) {
    return { ok: false, error: { kind: "not_configured" } };
  }
  if (postedIds.length === 0) {
    return { ok: false, error: { kind: "request_failed" } };
  }

  const budget = opts.timeoutMs ?? 14_000;
  const backoffs = [0, 2_000, 3_000, 4_000, 5_000];
  const started = Date.now();

  for (let i = 0; i < backoffs.length; i++) {
    if (opts.signal?.aborted) {
      return { ok: false, error: { kind: "request_failed" } };
    }
    if (backoffs[i] > 0) {
      try {
        await sleep(backoffs[i], opts.signal);
      } catch {
        // AbortError during backoff — treat as cancelled request
        return { ok: false, error: { kind: "request_failed" } };
      }
    }
    if (Date.now() - started >= budget) break;

    const endpoint = resolveExportEndpoint();
    if (!endpoint) {
      return { ok: false, error: { kind: "not_configured" } };
    }

    let res: ExportTraceResponse | null = null;
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-client-token": FEED_CLIENT_TOKEN,
        },
        body: JSON.stringify({
          posted_ids: postedIds,
          window_minutes: opts.windowMinutes ?? 15,
        }),
        signal: opts.signal,
      });
      if (r.ok) {
        res = (await r.json()) as ExportTraceResponse;
      }
    } catch {
      // network error / abort — fall through to null-handling
    }

    if (res === null) {
      // Network/HTTP error — treat as recoverable only briefly.
      // If we've already used half the budget, bail so the user
      // gets a clear error rather than waiting another 4s for the
      // same failure.
      if (Date.now() - started > budget / 2) {
        return { ok: false, error: { kind: "request_failed" } };
      }
      continue;
    }

    if (res.indexed) {
      return { ok: true, trace: res };
    }

    // indexed === false → keep retrying until we run out of budget
  }

  return {
    ok: false,
    error: {
      kind: "not_indexed_after_retries",
      tried_ms: Date.now() - started,
    },
  };
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/* ─────────────────────────────────────────────
 *  Search log.
 *
 *  In shared mode (Cloudflare worker env vars set): writes stream to
 *  the worker in the background (fire-and-forget) so every browser's
 *  searches land in the same KV store. Reads require the admin
 *  password.
 *
 *  In local mode: falls back to localStorage.
 *
 *  Capped at 500 entries on both sides; oldest drop off first.
 * ───────────────────────────────────────────── */

import { feedDelete, feedGet, feedPost, isSharedBackendEnabled } from "./feed-api";

export interface SearchLogEntry {
  query: string;
  matchedKey: string | null;
  timestamp: number;
}

const LOG_KEY = "boost.ai:search-log";
const MAX_ENTRIES = 500;

/* ─── localStorage ─── */

function writeLocal(query: string, matchedKey: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readLocal();
    existing.push({ query: query.slice(0, 500), matchedKey, timestamp: Date.now() });
    const trimmed = existing.slice(-MAX_ENTRIES);
    window.localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail
  }
}

function readLocal(): SearchLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/* ─── public API ─── */

export function logSearch(query: string, matchedKey: string | null): void {
  const q = query.slice(0, 500);
  if (!q) return;
  if (isSharedBackendEnabled()) {
    // Fire and forget — don't block the UI on the round-trip.
    feedPost("/search-log", { query: q, matchedKey }).catch(() => {});
  }
  // Always mirror locally so the searcher's own browser shows their
  // recent queries even when the full shared log is password-gated.
  writeLocal(q, matchedKey);
}

export interface SearchLogFetchOptions {
  /** Only include entries with `timestamp >= since` (epoch ms). */
  since?: number;
  /** Cap the number of remote entries returned. Server also enforces a hard ceiling. */
  limit?: number;
}

export interface SearchLogFetchResult {
  entries: SearchLogEntry[];
  total?: number;
  hasMore?: boolean;
}

/**
 * Read the search log.
 *
 * In shared mode the admin password is required — reviewing queries
 * across the team is a leadership workflow, not a per-user feature.
 *
 * Pass `{ since, limit }` to narrow the window. The server returns
 * newest-first within the window.
 */
export async function getSearchLog(
  adminPassword?: string,
  options: SearchLogFetchOptions = {},
): Promise<SearchLogFetchResult> {
  if (isSharedBackendEnabled() && adminPassword) {
    const params = new URLSearchParams();
    if (options.since) params.set("since", String(options.since));
    if (options.limit) params.set("limit", String(options.limit));
    const qs = params.toString();
    const path = qs ? `/search-log?${qs}` : "/search-log";
    const data = await feedGet<{ entries: SearchLogEntry[]; total?: number; hasMore?: boolean }>(
      path,
      adminPassword,
    );
    const remote = data?.entries || [];
    // Merge this browser's local mirror to mask KV eventual-consistency
    // delay — a search run by the admin in this tab appears instantly
    // instead of needing a lock/unlock cycle.
    const localMirror = readLocal().filter(
      (e) => !options.since || e.timestamp >= options.since,
    );
    const seen = new Set(remote.map((e) => `${e.timestamp}:${e.query}`));
    const merged = [...remote];
    for (const e of localMirror) {
      const key = `${e.timestamp}:${e.query}`;
      if (!seen.has(key)) {
        merged.push(e);
        seen.add(key);
      }
    }
    return {
      entries: merged.sort((a, b) => a.timestamp - b.timestamp),
      total: data?.total,
      hasMore: data?.hasMore,
    };
  }
  // Locked or local mode — this browser's own search history, time-filtered.
  const local = readLocal().filter(
    (e) => !options.since || e.timestamp >= options.since,
  );
  return { entries: local };
}

export async function clearSearchLog(adminPassword?: string): Promise<boolean> {
  if (isSharedBackendEnabled()) {
    if (!adminPassword) return false;
    return feedDelete("/search-log", adminPassword);
  }
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(LOG_KEY);
    return true;
  } catch {
    return false;
  }
}

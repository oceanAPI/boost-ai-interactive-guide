/* ─────────────────────────────────────────────
 *  Search log — client-side only
 *
 *  Every time an AE searches the company pattern library we log the
 *  query, whether it matched, and the timestamp to localStorage. This
 *  gives us a zero-infra learning loop: periodically review "no match"
 *  entries to decide which companies/industries to add next.
 *
 *  Capped at 500 entries; oldest drop off first.
 * ───────────────────────────────────────────── */

export interface SearchLogEntry {
  query: string;
  matchedKey: string | null;
  timestamp: number;
}

const LOG_KEY = "boost.ai:search-log";
const MAX_ENTRIES = 500;

export function logSearch(query: string, matchedKey: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSearchLog();
    existing.push({
      query: query.slice(0, 500), // defensive truncate
      matchedKey,
      timestamp: Date.now(),
    });
    const trimmed = existing.slice(-MAX_ENTRIES);
    window.localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail — quota exceeded, disabled localStorage, etc.
  }
}

export function getSearchLog(): SearchLogEntry[] {
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

export function clearSearchLog(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOG_KEY);
  } catch {
    // Silent fail
  }
}

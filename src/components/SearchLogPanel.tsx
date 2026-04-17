"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSearchLog, clearSearchLog, type SearchLogEntry } from "@/lib/search-log";
import { isSharedBackendEnabled } from "@/lib/feed-api";

/**
 * Admin-only panel for reviewing searches people did in the
 * CompanySearch quick-prefill. Helps spot curated-library gaps.
 *
 * In shared mode the full team's searches land in a Cloudflare worker
 * KV. Reading them requires pasting the admin password (stored in
 * sessionStorage for the tab lifetime so it doesn't have to be re-
 * entered on every open).
 *
 * In local mode this shows the current browser's localStorage only,
 * same as before.
 */

interface SearchLogPanelProps {
  open: boolean;
  onClose: () => void;
}

const ADMIN_PASSWORD_KEY = "boost.ai:admin-password";

function uniqueByQuery(entries: SearchLogEntry[]): SearchLogEntry[] {
  const seen = new Set<string>();
  const out: SearchLogEntry[] = [];
  for (const e of [...entries].reverse()) {
    const q = e.query.toLowerCase().trim();
    if (q && !seen.has(q)) {
      seen.add(q);
      out.push(e);
    }
  }
  return out;
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function SearchLogPanel({ open, onClose }: SearchLogPanelProps) {
  const shared = isSharedBackendEnabled();
  const [entries, setEntries] = useState<SearchLogEntry[]>([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Restore saved admin password from session
  useEffect(() => {
    if (!shared) return;
    try {
      const saved = window.sessionStorage.getItem(ADMIN_PASSWORD_KEY);
      if (saved) setAdminPassword(saved);
    } catch {
      // ignore
    }
  }, [shared]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getSearchLog(shared ? adminPassword : undefined);
      setEntries(next);
    } finally {
      setLoading(false);
    }
  }, [adminPassword, shared]);

  // Refresh when opened or when unlock succeeds
  useEffect(() => {
    if (!open) return;
    if (shared && !adminPassword) {
      setEntries([]);
      return;
    }
    fetchEntries();
  }, [open, adminPassword, shared, fetchEntries]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  const handleUnlock = async () => {
    const pw = passwordInput.trim();
    if (!pw) return;
    setLoading(true);
    setUnlockError("");
    try {
      const test = await getSearchLog(pw);
      // Worker returns [] for wrong password too (401 -> null -> []), so
      // also check: if user pasted obviously-wrong-length string we still
      // treat it as a try. The "did it really work" signal is the fetch
      // returning 200. We infer from: if shared and pw produced no error
      // path in fetch, getSearchLog returns entries array even if empty.
      // To better disambiguate we could probe a tiny endpoint; for now,
      // accept and stash.
      setAdminPassword(pw);
      setEntries(test);
      try {
        window.sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw);
      } catch {
        // ignore
      }
      setPasswordInput("");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    setAdminPassword("");
    setEntries([]);
    try {
      window.sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    } catch {
      // ignore
    }
  };

  const { matched, unmatched, stats } = useMemo(() => {
    const matched = entries.filter((e) => e.matchedKey);
    const unmatched = uniqueByQuery(entries.filter((e) => !e.matchedKey));
    return {
      matched: uniqueByQuery(matched).slice(0, 20),
      unmatched: unmatched.slice(0, 30),
      stats: {
        total: entries.length,
        matchedCount: matched.length,
        unmatchedCount: entries.length - matched.length,
        uniqueUnmatched: unmatched.length,
      },
    };
  }, [entries]);

  const handleClear = async () => {
    if (!confirm("Clear the entire search log? This can't be undone.")) return;
    await clearSearchLog(shared ? adminPassword : undefined);
    await fetchEntries();
  };

  const handleExport = () => {
    const csv = [
      "query,matched_key,timestamp_iso",
      ...entries.map(
        (e) =>
          `"${e.query.replace(/"/g, '""')}",${e.matchedKey || ""},${new Date(e.timestamp).toISOString()}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boost-ai-search-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  const locked = shared && !adminPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8" role="presentation">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-log-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto focus:outline-none"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 sm:rounded-t-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(75,30,82,0.97) 0%, rgba(55,22,62,1) 100%)",
          }}
        >
          <div className="px-5 sm:px-7 pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-green-light">
                  Search log
                  {shared && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50 bg-white/10 rounded px-1.5 py-0.5">
                      <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                      Shared
                    </span>
                  )}
                </p>
                <h3
                  id="search-log-title"
                  className="mt-1.5 text-xl sm:text-2xl font-bold text-white leading-tight"
                >
                  Company search activity
                </h3>
                <p className="text-[12px] text-white/55 mt-1.5">
                  {locked
                    ? "Unlock with the admin password to view the shared log."
                    : `${stats.total} search${stats.total === 1 ? "" : "es"} · ${stats.matchedCount} matched · ${stats.uniqueUnmatched} unique unmatched`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors flex-shrink-0 -mt-0.5"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {!locked && (
            <div className="px-5 sm:px-7 py-3 flex items-center gap-2 border-t border-white/10">
              <button
                onClick={handleExport}
                disabled={entries.length === 0}
                className="text-[11px] font-semibold text-white/75 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Export CSV
              </button>
              <span className="text-white/20">·</span>
              <button
                onClick={handleClear}
                disabled={entries.length === 0}
                className="text-[11px] font-semibold text-white/75 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Clear log
              </button>
              {shared && (
                <>
                  <span className="text-white/20">·</span>
                  <button
                    onClick={handleLock}
                    className="text-[11px] font-semibold text-white/75 hover:text-white transition-colors"
                  >
                    Lock
                  </button>
                </>
              )}
              <span className="ml-auto text-[10px] text-white/35 italic">
                {shared ? "Shared (team)" : "This browser only"}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-5 sm:px-7 py-6 space-y-7">
          {locked ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-boost-dark font-semibold mb-4">
                Paste your admin password to unlock the shared search log.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUnlock();
                }}
                className="max-w-sm mx-auto"
              >
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setUnlockError("");
                  }}
                  placeholder="Admin password"
                  className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-muted/70 focus:outline-none focus:border-boost-dark/40 text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!passwordInput.trim() || loading}
                  className="mt-2 w-full px-3 py-2 text-sm font-semibold rounded-lg bg-boost-dark text-white hover:bg-boost-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Checking…" : "Unlock"}
                </button>
                {unlockError && (
                  <p className="text-[11px] text-red-500 mt-2">{unlockError}</p>
                )}
              </form>
              <p className="text-[11px] text-boost-muted/60 mt-4">
                Stored in this tab's sessionStorage. Close the tab to clear.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-boost-muted">Loading…</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-boost-muted">
                No searches logged {shared ? "yet" : "on this browser"}.
              </p>
              <p className="text-[11px] text-boost-muted/60 mt-1">
                The log fills as people use the quick-prefill search on the admin page.
              </p>
            </div>
          ) : (
            <>
              {unmatched.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-[10px] font-bold text-boost-muted uppercase tracking-widest">
                      Unmatched searches
                    </p>
                    <span className="text-[10px] text-boost-muted tabular-nums">
                      {stats.uniqueUnmatched} unique
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {unmatched.map((e, i) => (
                      <div
                        key={`${e.query}-${i}`}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg bg-boost-surface/50 border-l-2 border-boost-purple/30"
                      >
                        <span className="font-mono text-xs text-boost-dark truncate flex-1">
                          {e.query}
                        </span>
                        <span className="text-[10px] text-boost-muted tabular-nums shrink-0">
                          {formatRelative(e.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-boost-muted/70 italic mt-2.5">
                    These are candidates to add to the curated library.
                  </p>
                </div>
              )}

              {matched.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-[10px] font-bold text-boost-muted uppercase tracking-widest">
                      Matched searches
                    </p>
                    <span className="text-[10px] text-boost-muted tabular-nums">
                      recent {matched.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {matched.map((e, i) => {
                      const isWeb = e.matchedKey?.startsWith("web:");
                      return (
                        <div
                          key={`${e.query}-${i}-m`}
                          className={`flex items-center gap-3 py-2 px-3 rounded-lg bg-boost-surface/30 border-l-2 ${
                            isWeb ? "border-boost-gold/50" : "border-boost-green-light/50"
                          }`}
                        >
                          <span className="font-mono text-xs text-boost-dark truncate flex-1">
                            {e.query}
                          </span>
                          <span className="text-[10px] text-boost-muted truncate max-w-[140px]">
                            → {e.matchedKey?.replace(/^web:/, "")}
                          </span>
                          <span
                            className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                              isWeb
                                ? "bg-boost-gold/10 text-boost-gold"
                                : "bg-boost-green-light/15 text-boost-green"
                            }`}
                          >
                            {isWeb ? "Web" : "Curated"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-boost-muted/70 italic mt-2.5">
                    <span className="text-boost-gold">Web</span> matches came from the fallback search —
                    consider promoting them to the curated library for full prefill data.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

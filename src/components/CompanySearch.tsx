"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  detectCompanyFast,
  detectCompany,
  type DetectionResult,
} from "@/lib/company-detect";
import { logSearch } from "@/lib/search-log";

interface CompanySearchProps {
  /**
   * Fired when the user applies a detection result. The caller merges
   * `result.prefill` into form state (merge semantics are caller-owned).
   */
  onApply: (result: DetectionResult) => void;
}

/**
 * Company quick-fill search.
 *
 * Two-tier behaviour:
 *  1. On every keystroke → synchronous curated-library lookup (instant)
 *  2. If no curated match and query has been idle for 600ms → async web
 *     fallback (DuckDuckGo) returns a best-guess with a visible "guess"
 *     badge so the AE knows they should review before applying.
 *
 * Every apply + every "no match" query is logged to localStorage for
 * later curation review.
 */
export default function CompanySearch({ onApply }: CompanySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const webTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const missLogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef(""); // guards against stale async results

  /* ── Instant curated lookup on every keystroke ── */
  useEffect(() => {
    currentQueryRef.current = query;

    if (query.trim().length < 2) {
      setResults([]);
      setWebLoading(false);
      if (webTimerRef.current) clearTimeout(webTimerRef.current);
      if (missLogTimerRef.current) clearTimeout(missLogTimerRef.current);
      return;
    }

    const curated = detectCompanyFast(query);
    setResults(curated);

    // Clear previous timers before scheduling new ones
    if (webTimerRef.current) clearTimeout(webTimerRef.current);
    if (missLogTimerRef.current) clearTimeout(missLogTimerRef.current);

    // Schedule web fallback only if curated empty
    if (curated.length === 0) {
      setWebLoading(true);
      webTimerRef.current = setTimeout(async () => {
        const q = query;
        const webResults = await detectCompany(q);
        // Ignore if the user has moved on to a new query
        if (currentQueryRef.current !== q) return;
        setResults(webResults);
        setWebLoading(false);

        // After the async round, if still no results, log the miss
        if (webResults.length === 0) {
          missLogTimerRef.current = setTimeout(() => {
            if (currentQueryRef.current === q) logSearch(q, null);
          }, 200);
        }
      }, 600);
    } else {
      setWebLoading(false);
    }

    return () => {
      if (webTimerRef.current) clearTimeout(webTimerRef.current);
      if (missLogTimerRef.current) clearTimeout(missLogTimerRef.current);
    };
  }, [query]);

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* ── Reset active index when results change ── */
  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

  /* ── Apply a detection result ── */
  const applyResult = useCallback(
    (result: DetectionResult) => {
      const key =
        result.source === "curated"
          ? result.match?.name?.toLowerCase().replace(/\s+/g, "-") || "curated"
          : `web:${result.match?.name || "unknown"}`;
      logSearch(query, key);
      onApply(result);
      setQuery("");
      setOpen(false);
      setResults([]);
    },
    [query, onApply],
  );

  /* ── Keyboard navigation ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      applyResult(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  /* ── Shared badge colours per source ── */
  const sourceBadge = (result: DetectionResult) => {
    if (result.source === "curated") {
      return {
        text: result.match?.country || "",
        className:
          "w-8 h-8 rounded-md bg-boost-surface border border-boost-border flex items-center justify-center text-[10px] font-bold text-boost-muted shrink-0",
      };
    }
    // web = best-guess
    return {
      text: "✨",
      className:
        "w-8 h-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[14px] shrink-0",
    };
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-boost-text-secondary mb-1">
        Quick prefill
        <span className="text-boost-muted font-normal ml-1">(optional)</span>
      </label>

      {/* Input with search icon */}
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-boost-muted pointer-events-none"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search company name or paste URL…"
          className="w-full pl-9 pr-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-colors text-sm"
          autoComplete="off"
        />
      </div>

      {/* Helper text */}
      {!query && (
        <p className="text-xs text-boost-muted mt-1">
          Curated Nordic financial-services library · web fallback for unknowns
        </p>
      )}

      {/* Results dropdown */}
      {open && query.length >= 1 && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-boost-border shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-boost-muted">
              {query.length < 2 ? (
                "Keep typing…"
              ) : webLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin text-boost-green-light" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Searching the web for <span className="text-boost-dark font-medium">{query}</span>…
                </span>
              ) : (
                <>
                  <span className="block">
                    No match for <span className="text-boost-dark font-medium">{query}</span>
                  </span>
                  <span className="text-xs">
                    We&apos;ve noted it so we can add it to the library later.
                  </span>
                </>
              )}
            </div>
          ) : (
            <ul className="py-1 max-h-80 overflow-y-auto">
              {results.map((r, i) => {
                const badge = sourceBadge(r);
                return (
                  <li key={`${r.source}-${r.match?.name || i}`}>
                    <button
                      type="button"
                      onClick={() => applyResult(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                        i === activeIdx
                          ? r.source === "web"
                            ? "bg-amber-50/60"
                            : "bg-boost-green-light/10"
                          : "hover:bg-boost-surface"
                      }`}
                    >
                      <span className={badge.className}>{badge.text}</span>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-boost-dark truncate">
                            {r.match?.name}
                          </p>
                          {r.source === "web" && (
                            <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Best guess
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-boost-muted truncate">
                          {r.match?.category}
                          {r.match?.domain && ` · ${r.match.domain}`}
                        </p>
                        {r.source === "web" && r.match?.summary && (
                          <p className="text-[11px] text-boost-muted/80 mt-1 line-clamp-2">
                            {r.match.summary}
                          </p>
                        )}
                      </div>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`shrink-0 mt-1.5 transition-colors ${
                          i === activeIdx
                            ? r.source === "web"
                              ? "text-amber-600"
                              : "text-boost-green-light"
                            : "text-boost-muted/40"
                        }`}
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

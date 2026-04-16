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
 *     fallback (DuckDuckGo). Web results are visually de-emphasised with
 *     an unobtrusive source label so AEs know to verify before applying.
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

    if (webTimerRef.current) clearTimeout(webTimerRef.current);
    if (missLogTimerRef.current) clearTimeout(missLogTimerRef.current);

    if (curated.length === 0) {
      setWebLoading(true);
      webTimerRef.current = setTimeout(async () => {
        const q = query;
        const webResults = await detectCompany(q);
        if (currentQueryRef.current !== q) return;
        setResults(webResults);
        setWebLoading(false);

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

  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

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

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-boost-text-secondary mb-1">
        Quick prefill
        <span className="text-boost-muted font-normal ml-1">(optional)</span>
      </label>

      {/* Input */}
      <div className="relative">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-boost-muted pointer-events-none"
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
          placeholder="Search company or paste URL"
          className="w-full pl-10 pr-3 py-2.5 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-muted/70 focus:outline-none focus-visible:outline-none focus:border-boost-muted/50 transition-colors text-[13px] tracking-tight"
          style={{ outline: "none", outlineColor: "transparent" }}
          autoComplete="off"
        />
      </div>

      {/* Helper text */}
      {!query && (
        <p className="text-[11px] text-boost-muted mt-1.5 tracking-tight">
          Curated library · web fallback when nothing matches
        </p>
      )}

      {/* Results dropdown */}
      {open && query.length >= 1 && (
        <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-boost-border overflow-hidden" style={{
          boxShadow: "0 1px 2px rgba(35,21,40,0.04), 0 8px 24px -8px rgba(35,21,40,0.12)",
        }}>
          {results.length === 0 ? (
            <div className="px-4 py-3.5 text-[13px] text-boost-muted">
              {query.length < 2 ? (
                <span>Keep typing…</span>
              ) : webLoading ? (
                <span className="flex items-center gap-2.5">
                  <svg className="w-3.5 h-3.5 animate-spin text-boost-muted" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>Searching for <span className="text-boost-dark">{query}</span></span>
                </span>
              ) : (
                <div className="space-y-0.5">
                  <p>
                    No match for <span className="text-boost-dark">{query}</span>
                  </p>
                  <p className="text-[11px] text-boost-muted/80">
                    Noted — we&apos;ll add it to the library.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <ul className="py-1 max-h-80 overflow-y-auto">
              {results.map((r, i) => {
                const active = i === activeIdx;
                const isWeb = r.source === "web";
                return (
                  <li key={`${r.source}-${r.match?.name || i}`}>
                    <button
                      type="button"
                      onClick={() => applyResult(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`group w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                        active ? "bg-boost-surface" : "hover:bg-boost-surface/60"
                      }`}
                    >
                      {/* Source glyph */}
                      <span className="shrink-0 w-8 h-8 rounded-md bg-white border border-boost-border flex items-center justify-center">
                        {isWeb ? (
                          <svg className="w-3.5 h-3.5 text-boost-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-semibold text-boost-dark/70 tracking-wider">
                            {r.match?.country}
                          </span>
                        )}
                      </span>

                      {/* Text column */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <p className="text-[13px] font-semibold text-boost-dark truncate tracking-tight">
                            {r.match?.name}
                          </p>
                          {isWeb && (
                            <span className="text-[10px] font-medium text-boost-muted/80 uppercase tracking-[0.08em] shrink-0">
                              Web
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-boost-muted truncate">
                          {r.match?.category}
                          {r.match?.domain && (
                            <span className="text-boost-muted/60">  ·  {r.match.domain}</span>
                          )}
                        </p>
                        {isWeb && r.match?.summary && (
                          <p className="text-[11px] text-boost-muted/80 mt-1 line-clamp-2 leading-relaxed">
                            {r.match.summary}
                          </p>
                        )}
                      </div>

                      {/* Chevron */}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 mt-2 transition-opacity ${
                          active ? "text-boost-muted opacity-100" : "text-boost-muted/30 opacity-0 group-hover:opacity-100"
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

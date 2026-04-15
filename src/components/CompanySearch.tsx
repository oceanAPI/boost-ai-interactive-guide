"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  searchCompanies,
  type CompanyPattern,
} from "@/data/company-patterns";
import { logSearch } from "@/lib/search-log";

interface CompanySearchProps {
  /** Fired when the user applies a matched pattern. Receiver merges into form state. */
  onApply: (pattern: CompanyPattern) => void;
}

/**
 * Autocomplete search that matches a user query against the curated
 * company pattern library. Every query is logged to localStorage (even
 * misses) so the team can later review what AEs searched for that
 * wasn't in the library.
 */
export default function CompanySearch({ onApply }: CompanySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => searchCompanies(query), [query]);

  // Debounced miss-logger: only log queries that sat idle for 800ms
  // and have no matches. Avoids logging every keystroke.
  useEffect(() => {
    if (logTimerRef.current) clearTimeout(logTimerRef.current);
    if (query.length < 3 || results.length > 0) return;

    logTimerRef.current = setTimeout(() => {
      logSearch(query, null);
    }, 800);

    return () => {
      if (logTimerRef.current) clearTimeout(logTimerRef.current);
    };
  }, [query, results.length]);

  // Close on outside click
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

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

  const applyPattern = useCallback(
    (pattern: CompanyPattern) => {
      logSearch(query, pattern.key);
      onApply(pattern);
      setQuery("");
      setOpen(false);
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
      applyPattern(results[activeIdx]);
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
          placeholder="Type a company name or paste a URL…"
          className="w-full pl-9 pr-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-colors text-sm"
          autoComplete="off"
        />
      </div>

      {/* Helper text when empty */}
      {!open && !query && (
        <p className="text-xs text-boost-muted mt-1">
          Matches against a curated list of Nordic financial-services companies.
        </p>
      )}

      {/* Results dropdown */}
      {open && query.length >= 1 && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-boost-border shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-boost-muted">
              {query.length < 2 ? (
                "Keep typing…"
              ) : (
                <>
                  <span className="block">
                    No match for <span className="text-boost-dark font-medium">{query}</span>
                  </span>
                  <span className="text-xs">
                    We&apos;ll note this so we can add it to the library.
                  </span>
                </>
              )}
            </div>
          ) : (
            <ul className="py-1 max-h-80 overflow-y-auto">
              {results.map((r, i) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => applyPattern(r)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      i === activeIdx
                        ? "bg-boost-green-light/10"
                        : "hover:bg-boost-surface"
                    }`}
                  >
                    {/* Country flag pill */}
                    <span className="w-8 h-8 rounded-md bg-boost-surface border border-boost-border flex items-center justify-center text-[10px] font-bold text-boost-muted shrink-0">
                      {r.country}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-boost-dark truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-boost-muted truncate">
                        {r.category} · {r.domain}
                      </p>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`shrink-0 transition-colors ${
                        i === activeIdx ? "text-boost-green-light" : "text-boost-muted/40"
                      }`}
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

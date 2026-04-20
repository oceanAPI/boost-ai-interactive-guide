"use client";

/* ──────────────────────────────────────────────────────────────
 *  RecommendationDetailModal — card-click detail for Top Recs.
 *
 *  Expands a recommendation card into a full-context view: title,
 *  confidence / urgency / weight chips, rationale, expected
 *  outcomes (what "done" looks like), prerequisites (what needs to
 *  be in place — ✓ met / ● pending), tags.
 *
 *  Same chrome as InitiativeDetailModal: focus-trap, Esc-close,
 *  body-scroll lock, return-focus. Keeps the interaction
 *  consistent across CE modals.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { Recommendation } from "@/lib/types";

interface RecommendationDetailModalProps {
  recommendation: Recommendation;
  rank: number;
  onClose: () => void;
}

const CONFIDENCE_STYLE: Record<NonNullable<Recommendation["confidence"]>, string> = {
  high:   "bg-boost-green-light text-white",
  medium: "bg-boost-gold text-white",
  low:    "bg-boost-muted/70 text-white",
};

const URGENCY_LABEL: Record<NonNullable<Recommendation["urgency"]>, string> = {
  immediate:       "Immediate",
  "this-quarter":  "This quarter",
  "this-year":     "This year",
  exploratory:     "Exploratory",
};

const URGENCY_STYLE: Record<NonNullable<Recommendation["urgency"]>, string> = {
  immediate:      "bg-boost-purple text-white",
  "this-quarter": "bg-boost-gold/15 text-boost-gold",
  "this-year":    "bg-boost-surface text-boost-muted",
  exploratory:    "bg-boost-lavender/40 text-boost-purple",
};

export default function RecommendationDetailModal({
  recommendation,
  rank,
  onClose,
}: RecommendationDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [onClose]);

  const weightPct =
    typeof recommendation.weight === "number"
      ? `${Math.round(recommendation.weight * 100)}%`
      : null;
  const outcomes = recommendation.expected_outcomes ?? [];
  const prereqs = recommendation.prerequisites ?? [];
  const prereqMet = prereqs.filter((p) => p.met).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rec-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green">
                  #{rank}
                </span>
                {weightPct && (
                  <>
                    <span aria-hidden="true" className="text-boost-border">·</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
                      Weight {weightPct}
                    </span>
                  </>
                )}
                {recommendation.confidence && (
                  <>
                    <span aria-hidden="true" className="text-boost-border">·</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] ${CONFIDENCE_STYLE[recommendation.confidence]}`}
                    >
                      {recommendation.confidence} confidence
                    </span>
                  </>
                )}
                {recommendation.urgency && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] ${URGENCY_STYLE[recommendation.urgency]}`}
                  >
                    {URGENCY_LABEL[recommendation.urgency]}
                  </span>
                )}
              </div>
              <h3
                id="rec-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {recommendation.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              aria-label="Close detail"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-6">
          {/* Why this matters */}
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
              Why this matters
            </p>
            <p className="text-sm text-boost-dark leading-relaxed">
              {recommendation.rationale}
            </p>
          </section>

          {/* Expected outcomes */}
          {outcomes.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                What success looks like
              </p>
              <ul className="space-y-2">
                {outcomes.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-boost-dark leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-boost-green-light"
                    />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  What needs to be in place
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
                  {prereqMet} / {prereqs.length} ready
                </p>
              </div>
              <ul className="space-y-2">
                {prereqs.map((p, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm leading-relaxed ${
                      p.met ? "text-boost-muted" : "text-boost-dark"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        p.met
                          ? "bg-boost-green-light border-boost-green-light"
                          : "bg-white border-boost-gold"
                      }`}
                    >
                      {p.met ? (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-boost-gold" />
                      )}
                    </span>
                    <span className={p.met ? "line-through" : ""}>{p.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags */}
          {recommendation.tags && recommendation.tags.length > 0 && (
            <section className="pt-4 border-t border-boost-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-boost-surface text-boost-muted border border-boost-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

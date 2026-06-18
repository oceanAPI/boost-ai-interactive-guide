"use client";

/* ──────────────────────────────────────────────────────────────
 *  TopRecommendationsSection — CE strategic recs.
 *
 *  Reads `customer.recommendations` (static today; identical shape
 *  will be returned by the external decision-engine API in a future
 *  iteration). Ranks by weight descending, renders one card per rec
 *  with title + rationale + confidence / urgency chips + tag chips.
 *
 *  The Recommendation type lives in `src/lib/types.ts` and matches
 *  the contract the eventual API will return — swap the data source
 *  with a fetch() call and this component doesn't change.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer, Recommendation } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import RecommendationDetailModal from "./top-recommendations/RecommendationDetailModal";
import CostEffortMatrix from "./top-recommendations/CostEffortMatrix";

interface TopRecommendationsSectionProps {
  customer?: Customer;
  sectionNumber?: string;
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

export default function TopRecommendationsSection({
  customer,
  sectionNumber,
}: TopRecommendationsSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const recs = (customer?.recommendations ?? [])
    .slice()
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const openRec = openIndex !== null ? recs[openIndex] : null;
  /** When initiatives carry an effort rating, prioritise them on a
   *  value-vs-effort matrix instead of the ranked card grid. */
  const useMatrix = recs.some((r) => r.effort);

  if (recs.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Top recommendations"
          subtitle="No recommendations captured yet. When the decision engine is wired, ranked initiatives land here."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title={useMatrix ? "Where to focus next" : "Top recommendations"}
        subtitle={
          useMatrix
            ? "Each initiative plotted by the value it drives against the effort to deliver. Tap any to see how to proceed, what to weigh up, and where to find resources."
            : "Ranked by strategic weight. Each card carries the engine's rationale + confidence."
        }
      />

      {useMatrix ? (
        <CostEffortMatrix recs={recs} onOpen={setOpenIndex} />
      ) : (
      <div
        ref={ref}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {recs.map((rec, i) => {
          const weightPct =
            typeof rec.weight === "number"
              ? `${Math.round(rec.weight * 100)}%`
              : null;
          return (
            <button
              key={`${rec.title}-${i}`}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="stagger-child relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              style={{ animationDelay: `${i * 60}ms` }}
              aria-label={`Open details for recommendation: ${rec.title}`}
              data-testid={`recommendation-rank-${i + 1}`}
            >
              {/* Rank badge — top-left, mirrors the eyebrow rhythm */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  <span className="text-boost-green">#{i + 1}</span>
                  {weightPct && (
                    <>
                      <span className="text-boost-border">·</span>
                      <span className="tabular-nums">Weight {weightPct}</span>
                    </>
                  )}
                </span>
                {rec.confidence && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] ${
                      CONFIDENCE_STYLE[rec.confidence]
                    }`}
                  >
                    {rec.confidence}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-boost-dark leading-snug">
                {rec.title}
              </h3>

              <p className="text-xs text-boost-text-secondary leading-relaxed flex-1">
                {rec.rationale}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-boost-border/60">
                {rec.urgency && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] ${
                      URGENCY_STYLE[rec.urgency]
                    }`}
                  >
                    {URGENCY_LABEL[rec.urgency]}
                  </span>
                )}
                {rec.tags?.map((t, ti) => (
                  <span
                    key={ti}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-boost-surface text-boost-muted border border-boost-border"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
      )}

      {openRec && (
        <RecommendationDetailModal
          recommendation={openRec}
          rank={(openIndex ?? 0) + 1}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}

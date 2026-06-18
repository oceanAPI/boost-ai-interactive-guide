"use client";

/* ──────────────────────────────────────────────────────────────
 *  CostEffortMatrix — value-vs-effort scatter of initiatives.
 *
 *  The deck's prioritisation view: each recommendation is plotted by
 *  the value it drives (Y, from `weight`) against the effort to
 *  deliver it (X, from `effort`). Quadrants frame the read — high
 *  value / low effort is the "quick wins" corner. Every dot is a
 *  button; clicking opens the same RecommendationDetailModal as the
 *  card grid (how to proceed / what to consider / resources).
 * ────────────────────────────────────────────────────────────── */

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Recommendation } from "@/lib/types";

const EFFORT_X: Record<NonNullable<Recommendation["effort"]>, number> = {
  low: 0.2,
  medium: 0.5,
  high: 0.8,
};

interface CostEffortMatrixProps {
  recs: Recommendation[];
  onOpen: (index: number) => void;
}

function pointFor(rec: Recommendation): { x: number; y: number } {
  const x = EFFORT_X[rec.effort ?? "medium"];
  const y = typeof rec.weight === "number" ? Math.max(0, Math.min(1, rec.weight)) : 0.5;
  return { x, y };
}

/** Quick win = high value (top half) and low effort (left third). */
function isQuickWin(rec: Recommendation): boolean {
  const { x, y } = pointFor(rec);
  return y >= 0.5 && x <= 0.35;
}

export default function CostEffortMatrix({ recs, onOpen }: CostEffortMatrixProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {/* Plot */}
      <div className="relative">
        {/* Axis labels */}
        <div className="absolute -left-1 top-0 bottom-7 flex items-center">
          <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted">
            Value driven →
          </span>
        </div>

        <div className="ml-6">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-boost-border bg-boost-surface"
            style={{ aspectRatio: "16 / 11" }}
          >
            {/* Quadrant tint — quick-wins corner (top-left) */}
            <div aria-hidden className="absolute left-0 top-0 h-1/2 w-1/3 bg-boost-green/8" />
            {/* Quadrant grid lines */}
            <div aria-hidden className="absolute inset-y-0 left-1/3 w-px bg-boost-border" />
            <div aria-hidden className="absolute inset-y-0 left-2/3 w-px bg-boost-border" />
            <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-boost-border" />

            {/* Quadrant captions */}
            <span className="absolute left-2 top-2 text-[9px] font-bold uppercase tracking-[0.12em] text-boost-green">
              Quick wins
            </span>
            <span className="absolute right-2 top-2 text-[9px] font-bold uppercase tracking-[0.12em] text-boost-muted/70">
              Big bets
            </span>
            <span className="absolute left-2 bottom-7 text-[9px] font-bold uppercase tracking-[0.12em] text-boost-muted/70">
              Fill-ins
            </span>
            <span className="absolute right-2 bottom-7 text-[9px] font-bold uppercase tracking-[0.12em] text-boost-muted/70">
              Reconsider
            </span>

            {/* Dots */}
            {recs.map((rec, i) => {
              const { x, y } = pointFor(rec);
              const quick = isQuickWin(rec);
              return (
                <button
                  key={`${rec.title}-${i}`}
                  type="button"
                  onClick={() => onOpen(i)}
                  data-testid={`value-effort-dot-${i + 1}`}
                  aria-label={`Open details for: ${rec.title}`}
                  className="group absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold shadow-sm transition-all duration-500 hover:z-10 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-1"
                  style={{
                    left: `${x * 100}%`,
                    top: `${(1 - y) * 100 * (1 - 0.07) + 2}%`,
                    backgroundColor: quick ? "#36b595" : "#59195d",
                    color: "white",
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  {i + 1}
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-boost-dark px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                    {rec.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* X axis */}
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted">
            <span>Low effort</span>
            <span className="text-boost-muted/60">Effort to deliver →</span>
            <span>High effort</span>
          </div>
        </div>
      </div>

      {/* Legend — numbered list, the readable index into the plot */}
      <ol className="space-y-2">
        {recs.map((rec, i) => {
          const quick = isQuickWin(rec);
          return (
            <li key={`${rec.title}-legend-${i}`}>
              <button
                type="button"
                onClick={() => onOpen(i)}
                className="flex w-full items-start gap-2.5 rounded-xl border border-boost-border bg-white p-2.5 text-left transition-all hover:border-boost-green-light/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: quick ? "#36b595" : "#59195d" }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-snug text-boost-dark">{rec.title}</span>
                  {rec.value_label && (
                    <span className="mt-0.5 block text-[11px] font-medium text-boost-green">{rec.value_label}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

"use client";

/* ──────────────────────────────────────────────────────────────
 *  PerformanceSection — CE operational telemetry
 *
 *  Reads `customer.performance` (optionally enriched with the
 *  `previous_*` fields added in PR 2) and renders a grid of KPI
 *  tiles with trend arrows. The 7 metrics match the
 *  PerformanceMetrics interface in `src/lib/types.ts`.
 *
 *  Metric direction is not uniform — for automation / CSAT /
 *  markets / agents / volume, higher is better; for unknown-rate
 *  and escalation-rate, lower is better. Each tile knows its own
 *  direction so the trend tint is semantically right.
 *
 *  Graceful when `performance` is absent or partial: tiles missing
 *  a current value render dashed and muted; tiles missing a
 *  previous value hide the delta chip.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { AcceptedInitiative, Customer, PerformanceMetrics } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import PerformanceTileDetailModal from "./performance/PerformanceTileDetailModal";

interface PerformanceSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/** Metric catalogue — stable order, used to render the tile grid. */
const METRICS: Array<{
  currentKey: keyof PerformanceMetrics;
  previousKey: keyof PerformanceMetrics;
  label: string;
  /** Unit rendered alongside the number. "%", "/ 5", "markets" etc. */
  unit?: string;
  /** When true, a drop in value is a positive trend (unknown-rate,
   *  escalation-rate). */
  lowerIsBetter?: boolean;
  /** Display formatter — defaults to integer toString + unit. */
  format?: (v: number) => string;
}> = [
  {
    currentKey: "automation_rate",
    previousKey: "previous_automation_rate",
    label: "Automation",
    unit: "%",
  },
  {
    currentKey: "csat_score",
    previousKey: "previous_csat_score",
    label: "CSAT",
    unit: "/ 5",
    format: (v) => v.toFixed(1),
  },
  {
    currentKey: "unknown_rate",
    previousKey: "previous_unknown_rate",
    label: "Unknown rate",
    unit: "%",
    lowerIsBetter: true,
  },
  {
    currentKey: "escalation_rate",
    previousKey: "previous_escalation_rate",
    label: "Escalation",
    unit: "%",
    lowerIsBetter: true,
  },
  {
    currentKey: "monthly_conversations",
    previousKey: "previous_monthly_conversations",
    label: "Monthly convos",
    format: (v) =>
      v >= 1_000_000
        ? `${(v / 1_000_000).toFixed(1)}M`
        : v >= 1_000
          ? `${(v / 1_000).toFixed(0)}k`
          : String(v),
  },
  {
    currentKey: "markets_live",
    previousKey: "previous_markets_live",
    label: "Markets",
  },
  {
    currentKey: "active_agents",
    previousKey: "previous_active_agents",
    label: "Active agents",
  },
];

type TrendTone = "up-good" | "down-good" | "flat" | "up-bad" | "down-bad" | "none";

function trendTone(delta: number | null, lowerIsBetter: boolean): TrendTone {
  if (delta === null) return "none";
  if (delta === 0) return "flat";
  const isPositiveChange = delta > 0;
  if (isPositiveChange) return lowerIsBetter ? "up-bad" : "up-good";
  return lowerIsBetter ? "down-good" : "down-bad";
}

const TREND_STYLES: Record<TrendTone, { text: string; bg: string; arrow: string }> = {
  "up-good":   { text: "text-boost-green",  bg: "bg-boost-green-light/10",  arrow: "↑" },
  "down-good": { text: "text-boost-green",  bg: "bg-boost-green-light/10",  arrow: "↓" },
  "flat":      { text: "text-boost-muted",       bg: "bg-boost-surface",         arrow: "→" },
  "up-bad":    { text: "text-boost-gold",        bg: "bg-boost-gold/10",         arrow: "↑" },
  "down-bad":  { text: "text-boost-gold",        bg: "bg-boost-gold/10",         arrow: "↓" },
  "none":      { text: "text-boost-muted",       bg: "bg-transparent",           arrow: "" },
};

export default function PerformanceSection({
  customer,
  sectionNumber,
}: PerformanceSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openMetricKey, setOpenMetricKey] = useState<keyof PerformanceMetrics | null>(null);

  const perf = customer?.performance;
  const details = customer?.performance_details;
  const allInitiatives: AcceptedInitiative[] = customer?.accepted_initiatives ?? [];

  /** Pull initiatives referenced by linked_initiative_ids in the
   *  performance_details map for the given metric. */
  const getLinkedInitiatives = (metricKey: keyof PerformanceMetrics): AcceptedInitiative[] => {
    const ids = details?.[metricKey]?.linked_initiative_ids ?? [];
    if (ids.length === 0) return [];
    return allInitiatives.filter((i) => ids.includes(i.initiative_id));
  };

  if (!perf) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Performance snapshot"
          subtitle="No telemetry captured yet. Populate performance metrics in admin to render this section."
        />
      </section>
    );
  }

  // Compose the subtitle from the measurement window when available.
  let subtitle = "Live KPIs vs. previous period.";
  if (perf.measured_from && perf.measured_to) {
    try {
      const from = new Date(perf.measured_from).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
      const to = new Date(perf.measured_to).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      });
      subtitle = `Measured ${from} – ${to}.`;
    } catch {
      /* fall back */
    }
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Performance snapshot"
        subtitle={subtitle}
      />

      <div
        ref={ref}
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {METRICS.map((m, i) => {
          const currentRaw = perf[m.currentKey];
          const previousRaw = perf[m.previousKey];
          const hasCurrent = typeof currentRaw === "number";
          const hasPrevious = typeof previousRaw === "number";

          const delta =
            hasCurrent && hasPrevious
              ? Number((currentRaw as number) - (previousRaw as number))
              : null;
          const tone = trendTone(delta, !!m.lowerIsBetter);
          const toneStyle = TREND_STYLES[tone];

          const formatted = hasCurrent
            ? (m.format ? m.format(currentRaw as number) : String(currentRaw))
            : "—";

          const deltaLabel = (() => {
            if (delta === null) return null;
            const abs = Math.abs(delta);
            const formattedDelta = m.format ? m.format(abs) : abs.toString();
            return `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${formattedDelta}${m.unit ?? ""}`;
          })();

          const hasDetail =
            !!details?.[m.currentKey] || hasPrevious;

          return (
            <button
              key={m.currentKey}
              type="button"
              onClick={() => setOpenMetricKey(m.currentKey)}
              disabled={!hasDetail && !hasCurrent}
              className="stagger-child relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 disabled:cursor-default disabled:hover:shadow-sm disabled:hover:translate-y-0"
              style={{ animationDelay: `${i * 40}ms` }}
              aria-label={`Open detail for ${m.label}`}
              data-testid={`performance-tile-${m.currentKey}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                {m.label}
              </p>
              <p className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-semibold text-boost-dark tabular-nums">
                  {formatted}
                </span>
                {hasCurrent && m.unit && (
                  <span className="text-sm text-boost-muted">{m.unit}</span>
                )}
              </p>
              {deltaLabel && (
                <p
                  className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] ${toneStyle.bg} ${toneStyle.text}`}
                >
                  <span aria-hidden="true">{toneStyle.arrow}</span>
                  <span className="tabular-nums normal-case tracking-normal font-semibold">
                    {deltaLabel}
                  </span>
                </p>
              )}
            </button>
          );
        })}
      </div>

      {openMetricKey && (() => {
        const m = METRICS.find((x) => x.currentKey === openMetricKey);
        if (!m) return null;
        const curRaw = perf[m.currentKey];
        const prevRaw = perf[m.previousKey];
        return (
          <PerformanceTileDetailModal
            metricKey={String(m.currentKey)}
            label={m.label}
            unit={m.unit ?? ""}
            currentValue={typeof curRaw === "number" ? curRaw : undefined}
            previousValue={typeof prevRaw === "number" ? prevRaw : undefined}
            lowerIsBetter={m.lowerIsBetter}
            detail={details?.[m.currentKey]}
            linkedInitiatives={getLinkedInitiatives(m.currentKey)}
            onClose={() => setOpenMetricKey(null)}
          />
        );
      })()}
    </section>
  );
}

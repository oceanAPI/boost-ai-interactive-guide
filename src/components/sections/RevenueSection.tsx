"use client";

/* ──────────────────────────────────────────────────────────────
 *  RevenueSection — "Sales & Revenue"
 *
 *  The deck's Sales challenge: lead-generation proof (metric tiles),
 *  the proactivity play, and sell-via-agent user journeys. Reads
 *  `customer.revenue_story`. Borrows metric-tile vocabulary from
 *  ImpactSection / case-study cards and the vertical journey flow
 *  from PersonalisationSection.
 * ────────────────────────────────────────────────────────────── */

import type { Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RevenueSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RevenueSection({ customer, sectionNumber }: RevenueSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const story = customer?.revenue_story;
  const metrics = story?.lead_metrics ?? [];
  const journeys = story?.sell_journeys ?? [];

  const isEmpty = !story || (metrics.length === 0 && journeys.length === 0 && !story.proactivity_note);

  if (isEmpty) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Sales & Revenue"
          subtitle="No revenue story captured yet. Add lead metrics or sell-via-agent journeys in the builder."
        />
        <div className="rounded-2xl border border-dashed border-boost-border bg-boost-surface/40 p-8 text-center">
          <p className="text-sm text-boost-muted">
            Empty — capture how the AI Agent drives leads and revenue.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Sales & Revenue"
        subtitle={story?.proactivity_note}
      />

      <div
        ref={ref}
        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Lead metric tiles */}
        {metrics.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            {metrics.map((m, i) => (
              <div
                key={i}
                data-testid={`revenue-metric-${i}`}
                className="rounded-2xl border border-boost-border bg-boost-card shadow-sm px-5 py-6 text-center"
              >
                <p className="text-3xl font-bold text-boost-purple tabular-nums leading-none">{m.value}</p>
                <p className="text-[13px] font-semibold text-boost-dark mt-2 leading-snug">{m.label}</p>
                {m.sublabel ? <p className="text-[11px] text-boost-muted mt-1">{m.sublabel}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {/* Sell-via-agent journeys */}
        {journeys.length > 0 ? (
          <div className="space-y-3">
            {journeys.map((j, i) => (
              <div
                key={i}
                data-testid={`revenue-journey-${slugify(j.title)}`}
                className="rounded-2xl border border-boost-border bg-boost-card shadow-sm px-5 py-4"
              >
                <p className="text-[14px] font-semibold text-boost-dark mb-3">{j.title}</p>
                <ol className="flex flex-wrap items-center gap-2">
                  {j.steps.map((step, si) => (
                    <li key={si} className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg bg-boost-green-light/12 text-boost-green px-3 py-1.5 text-[12px] font-medium">
                        {step}
                      </span>
                      {si < j.steps.length - 1 ? (
                        <span aria-hidden="true" className="text-boost-muted/50">→</span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

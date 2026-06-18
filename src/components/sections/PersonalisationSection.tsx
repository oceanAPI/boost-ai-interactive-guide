"use client";

/* ──────────────────────────────────────────────────────────────
 *  PersonalisationSection — "Personalised CX · Integration opportunities"
 *
 *  The deck's signature "Top intents & user-journey improvement
 *  suggestions" slide: a table of customer intents → the CRM/API
 *  integration that personalises them → projected 180-day impact,
 *  with top negative-feedback intents flagged. Clicking a row reveals
 *  the user-journey the integration enables (auth → intent → API →
 *  backend), rendered as a vertical flow — mirroring the deck's
 *  "Integrations | …" journey diagrams.
 *
 *  Reads `customer.personalisation_opportunities`. Borrows the
 *  card/expand vocabulary from TopRecommendationsSection + AgendaSection.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface PersonalisationSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PersonalisationSection({
  customer,
  sectionNumber,
}: PersonalisationSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const items = customer?.personalisation_opportunities ?? [];

  if (items.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Personalised CX"
          subtitle="No integration opportunities captured yet. Add top intents in the builder to populate this section."
        />
        <div className="rounded-2xl border border-dashed border-boost-border bg-boost-surface/40 p-8 text-center">
          <p className="text-sm text-boost-muted">
            Empty — add the top intents that would benefit from a CRM/API integration.
          </p>
        </div>
      </section>
    );
  }

  const totalRequests = items.reduce((sum, o) => sum + (o.requests ?? 0), 0);

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Top intents & user-journey improvements"
        subtitle={
          totalRequests > 0
            ? `${items.length} opportunities · ~${totalRequests.toLocaleString()} requests / 180 days`
            : `${items.length} personalisation ${items.length === 1 ? "opportunity" : "opportunities"}`
        }
      />

      <div
        ref={ref}
        className={`overflow-hidden rounded-2xl border border-boost-border bg-boost-card shadow-sm transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Column header */}
        <div className="hidden sm:grid grid-cols-[1.4fr_1.6fr_auto] gap-4 px-5 py-3 bg-boost-surface/60 border-b border-boost-border text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted">
          <span>Top topic</span>
          <span>Integration solution</span>
          <span className="text-right">Impact · 180 days</span>
        </div>

        <ul className="divide-y divide-boost-border">
          {items.map((o, i) => {
            const isOpen = openIdx === i;
            const hasJourney = (o.journey_steps?.length ?? 0) > 0;
            return (
              <li key={i} data-testid={`personalisation-${slugify(o.intent)}`}>
                <button
                  type="button"
                  onClick={() => hasJourney && setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full text-left grid grid-cols-1 sm:grid-cols-[1.4fr_1.6fr_auto] gap-1.5 sm:gap-4 px-5 py-4 hover:bg-boost-surface/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {hasJourney ? (
                      <span aria-hidden="true" className="text-boost-muted/50 text-xs">
                        {isOpen ? "▾" : "▸"}
                      </span>
                    ) : null}
                    <span className="text-[14px] font-semibold text-boost-dark truncate">{o.intent}</span>
                    {o.negative_feedback ? (
                      <span className="flex-shrink-0 inline-flex items-center rounded-full bg-boost-orange/15 text-boost-orange px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]">
                        Top neg. feedback
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[13px] text-boost-purple leading-snug">{o.solution}</span>
                  <span className="text-[13px] font-semibold text-boost-dark tabular-nums sm:text-right">
                    {o.impact_180d ?? (o.requests ? `${o.requests.toLocaleString()} requests` : "—")}
                  </span>
                </button>

                {hasJourney && isOpen ? (
                  <div className="px-5 pb-5 pt-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-3">
                      User journey
                    </p>
                    <ol className="flex flex-wrap items-center gap-2">
                      {o.journey_steps!.map((step, si) => (
                        <li key={si} className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-lg bg-boost-purple/8 text-boost-purple px-3 py-1.5 text-[12px] font-medium">
                            {step}
                          </span>
                          {si < o.journey_steps!.length - 1 ? (
                            <span aria-hidden="true" className="text-boost-muted/50">→</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-3 text-[12px] text-boost-muted">
        &lt;10 integrations typically personalise 15–20% of chat traffic.
      </p>
    </section>
  );
}

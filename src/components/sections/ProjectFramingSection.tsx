"use client";

/* ──────────────────────────────────────────────────────────────
 *  ProjectFramingSection — PS opener
 *
 *  Reads `customer.project_framing` (PsFraming in types.ts). Renders
 *  three bands stacked:
 *
 *    1. Introduction — narrative paragraph in a wide callout card,
 *       purple-accented to set PS chrome apart from Sales/CE.
 *    2. Goals + KPI tiles — goals paragraph, followed by a 2-4
 *       column grid of target-carrying KPI tiles (automation,
 *       containment, escalation, CSAT — whatever is captured).
 *    3. Use cases — a list of click-to-expand cards. Each card
 *       shows a title always; clicking opens a today-vs-tomorrow
 *       split with an optional call-flow narrative underneath.
 *
 *  Design intent (from .impeccable.md):
 *    - Progressive disclosure: introduction → goals → use-cases
 *    - Information absorption: every use-case is scannable at rest,
 *      deep on demand
 *    - Restraint: single purple accent, no gradients, no blue/cyan
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ProjectFramingSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

export default function ProjectFramingSection({
  customer,
  sectionNumber,
}: ProjectFramingSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [expandedUseCase, setExpandedUseCase] = useState<number | null>(null);
  const framing = customer?.project_framing;

  if (!framing || (!framing.introduction && !framing.goals && (!framing.kpis || framing.kpis.length === 0) && (!framing.use_cases || framing.use_cases.length === 0))) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Project framing"
          subtitle="No framing captured yet. Fill in introduction, goals, KPIs, and use-cases in admin to render this section."
        />
      </section>
    );
  }

  const hasIntro = !!framing.introduction;
  const hasGoals = !!framing.goals;
  const kpis = framing.kpis ?? [];
  const useCases = framing.use_cases ?? [];

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Project framing"
        subtitle="What we're solving, who wins when it lands, and what a single use-case looks like end-to-end."
      />

      <div
        ref={ref}
        className={`space-y-8 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Introduction card — purple-accented, wide-canvas feel */}
        {hasIntro && (
          <article
            className="stagger-child relative overflow-hidden rounded-2xl bg-boost-purple text-white p-6 sm:p-8 lg:p-10"
            data-testid="project-framing-introduction"
          >
            {/* Subtle green-accent radial glow for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 50% 40% at 90% 100%, rgba(54,181,149,0.22) 0%, transparent 65%)",
              }}
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-boost-green-light mb-3">
              Introduction
            </p>
            <p className="relative text-base sm:text-lg leading-relaxed text-white/95 whitespace-pre-wrap">
              {framing.introduction}
            </p>
          </article>
        )}

        {/* Goals + KPI tiles */}
        {(hasGoals || kpis.length > 0) && (
          <div className="stagger-child space-y-5" style={{ animationDelay: "80ms" }}>
            {hasGoals && (
              <div className="rounded-xl border border-boost-border bg-white p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-3">
                  Goals &amp; success criteria
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-boost-dark whitespace-pre-wrap">
                  {framing.goals}
                </p>
              </div>
            )}

            {kpis.length > 0 && (
              <div
                className={`grid gap-3 sm:gap-4 ${
                  kpis.length === 1
                    ? "grid-cols-1"
                    : kpis.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : kpis.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {kpis.map((kpi, i) => (
                  <article
                    key={`${kpi.label}-${i}`}
                    data-testid={`project-framing-kpi-${i}`}
                    className="stagger-child relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    style={{ animationDelay: `${(i + 1) * 60}ms` }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-boost-green-light"
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                      {kpi.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-boost-dark tabular-nums">
                      {kpi.target}
                    </p>
                    {kpi.notes && (
                      <p className="text-xs text-boost-muted mt-2 leading-relaxed">
                        {kpi.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Use-case cards */}
        {useCases.length > 0 && (
          <div className="stagger-child space-y-3" style={{ animationDelay: "160ms" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
              Example use-cases
            </p>
            <div className="space-y-2.5">
              {useCases.map((uc, i) => {
                const isOpen = expandedUseCase === i;
                const slug = uc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return (
                  <article
                    key={`${slug}-${i}`}
                    data-testid={`project-use-case-${slug}`}
                    className="rounded-xl border border-boost-border bg-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedUseCase(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full text-left flex items-start gap-4 px-5 py-4 hover:bg-boost-surface/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-inset"
                    >
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-boost-purple text-white text-xs font-bold tabular-nums flex items-center justify-center mt-0.5"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="flex-1 min-w-0 text-sm sm:text-base font-semibold text-boost-dark leading-snug">
                        {uc.title}
                      </p>
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 text-boost-muted text-xs mt-2"
                      >
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-boost-border bg-boost-surface/30 px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {/* Today */}
                          <div className="rounded-lg bg-white border border-boost-border p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                              Today
                            </p>
                            <p className="text-sm text-boost-dark leading-relaxed">
                              {uc.today}
                            </p>
                          </div>
                          {/* Tomorrow — green-accented to mark the "after" state */}
                          <div className="rounded-lg bg-white border border-boost-green-light/40 p-4 relative">
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-boost-green-light rounded-l-lg"
                            />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green-light mb-2">
                              Tomorrow
                            </p>
                            <p className="text-sm text-boost-dark leading-relaxed">
                              {uc.tomorrow}
                            </p>
                          </div>
                        </div>

                        {uc.call_flow && (
                          <div className="mt-3 rounded-lg bg-boost-dark/95 text-white/90 p-3 sm:p-4 font-mono text-xs leading-relaxed overflow-x-auto">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green-light mb-1.5 font-sans">
                              Example call flow
                            </p>
                            <p className="whitespace-pre-wrap">{uc.call_flow}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

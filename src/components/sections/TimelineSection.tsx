"use client";

import type { GuideData } from "@/lib/types";
import { getTimeline } from "@/data/guide-content";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function TimelineSection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const phases = getTimeline(guide.company_name);

  const totalFTEs = (guide.resources?.stakeholder_owners || 0) +
    (guide.resources?.ai_trainers || 0) +
    (guide.resources?.technical_resources || 0);

  return (
    <section>
      <SectionHeader
        number="11"
        title="Implementation Plan"
        subtitle={`From kickoff to production in 6-8 weeks for ${guide.company_name}`}
      />

      {/* Resource callout */}
      {totalFTEs > 0 && (
        <div className="bg-boost-surface rounded-xl border border-boost-border p-4 mb-6 text-sm text-boost-text-secondary">
          <span className="font-semibold text-boost-dark">Your team: </span>
          {guide.resources?.stakeholder_owners ? `${guide.resources.stakeholder_owners} stakeholder owner${guide.resources.stakeholder_owners > 1 ? "s" : ""}, ` : ""}
          {guide.resources?.ai_trainers ? `${guide.resources.ai_trainers} AI trainer${guide.resources.ai_trainers > 1 ? "s" : ""} (active in Phase 3-4), ` : ""}
          {guide.resources?.technical_resources ? `${guide.resources.technical_resources} technical resource${guide.resources.technical_resources > 1 ? "s" : ""} (active in Phase 2-3)` : ""}
          {guide.deployment_markets > 1 && (
            <span className="block mt-1 text-boost-muted">
              Deploying across {guide.deployment_markets} markets — phased rollout recommended
            </span>
          )}
        </div>
      )}

      {/* Horizontal timeline */}
      <div ref={ref} className="relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-[42px] left-[5%] right-[5%] h-0.5 bg-boost-border z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {phases.map((phase, i) => (
            <div
              key={phase.title}
              className={`relative bg-white rounded-xl border border-boost-border p-5 transition-all duration-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Phase badge */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: phase.color }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[10px] text-boost-muted uppercase tracking-wider">{phase.weeks}</p>
                  <p className="text-sm font-semibold text-boost-dark">{phase.title}</p>
                </div>
              </div>

              {/* Tasks */}
              <ul className="space-y-2">
                {phase.tasks.map((task) => (
                  <li key={task} className="flex items-start gap-2 text-xs text-boost-text-secondary">
                    <span className="text-boost-green-light mt-0.5 flex-shrink-0">•</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

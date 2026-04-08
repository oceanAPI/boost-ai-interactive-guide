"use client";

import type { GuideData } from "@/lib/types";
import { SPECIALIST_AGENTS } from "@/data/agents";
import { ROI_HIGHLIGHTS } from "@/data/guide-content";

const HIGHLIGHT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  emerald: { border: "border-boost-green-light", bg: "bg-boost-green-light/5", text: "text-boost-green" },
  purple: { border: "border-boost-purple", bg: "bg-boost-purple/5", text: "text-boost-purple" },
  amber: { border: "border-boost-orange", bg: "bg-boost-orange/5", text: "text-boost-orange" },
  rose: { border: "border-boost-pink", bg: "bg-boost-pink/5", text: "text-boost-pink" },
};

export default function ROISection({ guide }: { guide: GuideData }) {
  const agents =
    guide.areas_of_interest.length > 0
      ? SPECIALIST_AGENTS.filter((a) => guide.areas_of_interest.includes(a.key))
      : SPECIALIST_AGENTS;

  const sortedAgents = [...agents].sort((a, b) => b.automationRate - a.automationRate);
  const avgRate = Math.round(agents.reduce((sum, a) => sum + a.automationRate, 0) / agents.length);
  const maxRate = Math.max(...agents.map((a) => a.automationRate));

  return (
    <section className="section-enter">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-boost-dark mb-2">Automation Rates & ROI Impact</h2>
        <p className="text-boost-muted">
          Every conversation not escalated to a human is a direct, measurable cost saving
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Bar chart */}
        <div className="bg-white border border-boost-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-boost-dark uppercase tracking-wider mb-6">
            Automation Rate by Agent
          </h3>
          <div className="space-y-4">
            {sortedAgents.map((agent) => (
              <div key={agent.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-boost-text-secondary">{agent.name}</span>
                  <span className="text-sm text-boost-green font-bold tabular-nums">
                    {agent.automationRate}%
                  </span>
                </div>
                <div className="w-full h-3 bg-boost-light rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar"
                    style={{
                      width: `${(agent.automationRate / maxRate) * 100}%`,
                      background:
                        agent.automationRate >= 82
                          ? "linear-gradient(90deg, #208269, #36b595)"
                          : agent.automationRate >= 79
                          ? "linear-gradient(90deg, #59195d, #8a4d8e)"
                          : "linear-gradient(90deg, #e383b7, #ef8b00)",
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Overall average */}
            <div className="pt-4 mt-4 border-t border-boost-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-boost-dark font-semibold">Overall Average</span>
                <span className="text-sm text-boost-green font-bold tabular-nums">{avgRate}%</span>
              </div>
              <div className="w-full h-3 bg-boost-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-boost-green-light progress-bar"
                  style={{ width: `${(avgRate / maxRate) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Highlights */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-boost-dark uppercase tracking-wider mb-2">
            What This Means for {guide.company_name}
          </h3>
          {ROI_HIGHLIGHTS.map((item, idx) => {
            const c = HIGHLIGHT_COLORS[item.color] || HIGHLIGHT_COLORS.emerald;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border-l-4 ${c.border} ${c.bg}`}
              >
                <h4 className={`font-semibold text-sm ${c.text} mb-1`}>{item.title}</h4>
                <p className="text-xs text-boost-muted leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volume-based ROI if data present */}
      {Object.keys(guide.channel_volumes).length > 0 && (
        <div className="mt-8 bg-boost-green-light/5 border border-boost-green-light/20 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-boost-dark uppercase tracking-wider mb-4">
            Estimated Impact — {guide.company_name} Volumes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(guide.channel_volumes).map(([ch, vol]) => {
              if (!vol) return null;
              const automated = Math.round(vol * (avgRate / 100));
              return (
                <div key={ch} className="text-center">
                  <p className="text-xs text-boost-muted uppercase mb-1">{ch}</p>
                  <p className="text-boost-dark font-bold text-2xl tabular-nums">
                    {automated.toLocaleString()}
                  </p>
                  <p className="text-xs text-boost-green">
                    of {vol.toLocaleString()} automated/mo
                  </p>
                </div>
              );
            })}
          </div>
          {guide.cost_per_employee && (
            <p className="text-xs text-boost-muted mt-4 pt-4 border-t border-boost-green-light/20">
              Current cost: {guide.cost_per_employee} — with boost.ai, expect reduction to under $0.50 per automated contact.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

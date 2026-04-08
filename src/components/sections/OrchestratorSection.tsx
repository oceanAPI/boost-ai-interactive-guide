"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { SPECIALIST_AGENTS } from "@/data/agents";

export default function OrchestratorSection({
  guide,
  onDrillDown,
}: {
  guide: GuideData;
  onDrillDown: (agentKey: string) => void;
}) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const agents =
    guide.areas_of_interest.length > 0
      ? SPECIALIST_AGENTS.filter((a) => guide.areas_of_interest.includes(a.key))
      : SPECIALIST_AGENTS;

  return (
    <section className="section-enter">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-boost-dark mb-2">Boost Agent Orchestrator</h2>
        <p className="text-boost-muted">
          How boost.ai routes and resolves every interaction for {guide.company_name}
        </p>
      </div>

      {/* Intelligence Hub */}
      <div className="relative mb-8">
        <div className="bg-boost-purple rounded-xl p-5 text-center">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Agent Orchestrator</p>
          <p className="text-white font-semibold">boost.ai Intelligence Hub</p>
        </div>
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gradient-to-b from-boost-purple to-boost-green-light/40" />
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {agents.map((agent) => (
          <button
            key={agent.key}
            onClick={() => onDrillDown(agent.key)}
            onMouseEnter={() => setHoveredAgent(agent.key)}
            onMouseLeave={() => setHoveredAgent(null)}
            className={`relative text-left p-5 rounded-xl border transition-all duration-200 group cursor-pointer ${
              hoveredAgent === agent.key
                ? "bg-boost-green-light/5 border-boost-green-light shadow-lg shadow-boost-green-light/10 -translate-y-0.5"
                : "bg-white border-boost-border hover:border-boost-green-light/50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-boost-dark font-semibold text-sm leading-tight">{agent.name}</h3>
              <span className="text-boost-green font-bold text-lg tabular-nums">{agent.automationRate}%</span>
            </div>
            <div className="w-full h-1.5 bg-boost-light rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-boost-green-light rounded-full progress-bar"
                style={{ width: `${agent.automationRate}%` }}
              />
            </div>
            <p className="text-xs text-boost-muted">{agent.automationRate}% automated</p>
            <div className={`absolute bottom-3 right-4 text-xs text-boost-green transition-opacity ${
              hoveredAgent === agent.key ? "opacity-100" : "opacity-0"
            }`}>
              Explore →
            </div>
          </button>
        ))}
      </div>

      {/* Three pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-boost-border rounded-xl p-5">
          <div className="w-8 h-8 rounded-lg bg-boost-purple/10 flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-purple">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h4 className="text-boost-dark font-semibold text-sm mb-2">Industry-Tailored Guardrails</h4>
          <p className="text-xs text-boost-muted leading-relaxed">
            Built-in control and safety for every interaction. Compliance, risk reduction, and prevention of inaccurate responses — out of the box.
          </p>
        </div>
        <div className="bg-white border border-boost-border rounded-xl p-5">
          <div className="w-8 h-8 rounded-lg bg-boost-green-light/10 flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-green">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h4 className="text-boost-dark font-semibold text-sm mb-2">Industry-Specific Instructions</h4>
          <p className="text-xs text-boost-muted leading-relaxed">
            Pre-configured for financial services — compliance, accuracy, and auditability from day one. Controlled flows with generative flexibility.
          </p>
        </div>
        <div className="bg-white border border-boost-border rounded-xl p-5">
          <div className="w-8 h-8 rounded-lg bg-boost-purple/10 flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-purple">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h4 className="text-boost-dark font-semibold text-sm mb-2">Human Escalation — by Design</h4>
          <p className="text-xs text-boost-muted leading-relaxed">
            Complex disputes and sensitive situations route to human agents with full context. AI handles everything else: 90%+ of conversations.
          </p>
        </div>
      </div>
    </section>
  );
}

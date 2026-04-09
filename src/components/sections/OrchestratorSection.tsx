"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import type { StakeholderRole } from "@/data/roles";
import { SPECIALIST_AGENTS } from "@/data/agents";
import { getRoleDefinition } from "@/data/roles";
import { SectionHeader, ProgressRing, CalloutBanner } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SIMULATION_STEPS = [
  { label: "Customer sends message", detail: "\"I need to file a claim for water damage in my basement\"", icon: "💬" },
  { label: "Orchestrator analyzes intent", detail: "Intent: home_property_claim → Confidence: 94%", icon: "🧠" },
  { label: "Routes to specialist agent", detail: "Home & Property Agent activated with claim context", icon: "🎯" },
  { label: "Agent resolves or escalates", detail: "FNOL filed, reference #HC-29481 generated, adjuster scheduled", icon: "✅" },
];

export default function OrchestratorSection({
  guide,
  role = "general",
  onDrillDown,
}: {
  guide: GuideData;
  role?: StakeholderRole;
  onDrillDown: (agentKey: string) => void;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [simStep, setSimStep] = useState(-1);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const roleDef = getRoleDefinition(role);
  const highlight = roleDef.highlights["orchestrator"];

  const agents = guide.areas_of_interest.length > 0
    ? SPECIALIST_AGENTS.filter((a) => guide.areas_of_interest.includes(a.key))
    : SPECIALIST_AGENTS;

  const runSimulation = () => {
    setSimStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= SIMULATION_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setSimStep(-1), 3000);
      } else {
        setSimStep(step);
      }
    }, 1800);
  };

  return (
    <section>
      <SectionHeader
        number="02"
        title="Boost Agent Orchestrator"
        subtitle={`How boost.ai routes and resolves every interaction for ${guide.company_name}`}
      />

      {highlight && (
        <CalloutBanner
          title="Why this matters for you"
          description={highlight}
          variant="purple"
        />
      )}

      {/* Hub and spoke layout */}
      <div ref={ref} className="relative mt-8">
        {/* Central hub */}
        <div className="flex justify-center mb-8">
          <div className={`
            relative bg-gradient-to-br from-boost-purple to-boost-purple-dark
            rounded-2xl px-8 py-6 text-center shadow-xl max-w-sm w-full
            transition-all duration-700
            ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          `}>
            <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Intelligence Hub</div>
            <div className="text-white font-bold text-lg">Agent Orchestrator</div>
            <div className="text-boost-green-light text-xs mt-1">NLP + Intent Routing + Guardrails</div>

            <button
              onClick={runSimulation}
              disabled={simStep >= 0}
              className="mt-3 px-4 py-1.5 bg-boost-green-light/20 border border-boost-green-light/40 text-boost-green-light text-xs rounded-lg hover:bg-boost-green-light/30 disabled:opacity-50 transition-colors"
            >
              {simStep >= 0 ? "Running..." : "See it in action →"}
            </button>
          </div>
        </div>

        {/* Simulation overlay */}
        {simStep >= 0 && (
          <div className="mb-8 mx-auto max-w-lg">
            <div className="bg-boost-surface rounded-xl border border-boost-border p-4 space-y-3">
              {SIMULATION_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 transition-all duration-300 ${
                    i <= simStep ? "opacity-100" : "opacity-20"
                  }`}
                >
                  <span className={`text-lg flex-shrink-0 ${i === simStep ? "animate-pulse" : ""}`}>
                    {step.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-boost-dark">{step.label}</p>
                    <p className="text-xs text-boost-muted font-mono">{step.detail}</p>
                  </div>
                  {i < simStep && (
                    <span className="ml-auto text-boost-green flex-shrink-0">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent spoke cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <button
              key={agent.key}
              onClick={() => onDrillDown(agent.key)}
              onMouseEnter={() => setHoveredAgent(agent.key)}
              onMouseLeave={() => setHoveredAgent(null)}
              className={`
                relative bg-white rounded-xl border border-boost-border p-5 text-left
                card-lift transition-all duration-500
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-semibold text-boost-dark text-sm">{agent.name}</h3>
                  <p className="text-xs text-boost-muted mt-0.5 line-clamp-2">{agent.description}</p>
                </div>
                <ProgressRing
                  percentage={agent.automationRate}
                  size={52}
                  strokeWidth={4}
                />
              </div>

              {/* Hover preview: top 3 capabilities */}
              <div className={`
                overflow-hidden transition-all duration-300
                ${hoveredAgent === agent.key ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}
              `}>
                <div className="border-t border-boost-border pt-2 space-y-1">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <p key={cap.title} className="text-[11px] text-boost-text-secondary flex items-center gap-1.5">
                      <span className="text-boost-green-light">•</span>
                      {cap.title}
                    </p>
                  ))}
                </div>
              </div>

              <div className={`
                text-xs text-boost-green font-medium mt-2 transition-opacity
                ${hoveredAgent === agent.key ? "opacity-100" : "opacity-0"}
              `}>
                Explore agent →
              </div>
            </button>
          ))}
        </div>

        {/* Bottom pillars */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: "🛡️", title: "Guardrails", desc: "Every response validated against policy rules and compliance requirements" },
            { icon: "🏦", title: "Industry-Specific", desc: "Pre-trained on financial services terminology, regulations, and workflows" },
            { icon: "🤝", title: "Human Escalation", desc: "Seamless handoff to live agents with full conversation context preserved" },
          ].map((pillar, i) => (
            <div
              key={pillar.title}
              className={`
                bg-boost-surface rounded-xl p-4 text-center border border-boost-border
                transition-all duration-500
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
              `}
              style={{ transitionDelay: `${(agents.length + i + 1) * 100}ms` }}
            >
              <span className="text-2xl block mb-2">{pillar.icon}</span>
              <h4 className="text-sm font-semibold text-boost-dark">{pillar.title}</h4>
              <p className="text-xs text-boost-muted mt-1">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

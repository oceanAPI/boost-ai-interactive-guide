"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { getAgentsForGuide } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import { SectionHeader, ProgressRing, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import FlowDiagram from "./orchestrator/FlowDiagram";

export default function OrchestratorSection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const agents = getAgentsForGuide(guide.areas_of_interest);

  const toggleAgent = (key: string) => {
    setExpandedAgent((prev) => (prev === key ? null : key));
  };

  return (
    <section>
      <SectionHeader
        number="02"
        title="Boost Agent Orchestrator"
        subtitle={`How boost.ai routes and resolves every interaction for ${guide.company_name}`}
      />

      {/* Hub card */}
      <div ref={ref} className="flex justify-center mb-8">
        <div
          className={`
            relative inline-flex items-center gap-4 px-8 py-5 rounded-2xl
            bg-gradient-to-br from-boost-purple to-boost-purple-dark
            text-white shadow-lg transition-all duration-700
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
          `}
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <BoostIcon name="robot-brain" variant="white" size={28} />
          </div>
          <div>
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Central Hub</span>
            <h3 className="text-lg font-bold">Agent Orchestrator</h3>
            <p className="text-xs text-white/60 max-w-xs">
              Analyzes every incoming message, determines intent, and routes to the right specialist agent.
            </p>
          </div>
        </div>
      </div>

      {/* SVG connector from hub to grid */}
      <div className="flex justify-center mb-4" aria-hidden="true">
        <svg width="200" height="32" viewBox="0 0 200 32" fill="none">
          <line x1="100" y1="0" x2="40" y2="32" stroke="#36b595" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
          <line x1="100" y1="0" x2="100" y2="32" stroke="#36b595" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
          <line x1="100" y1="0" x2="160" y2="32" stroke="#36b595" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent, i) => {
          const isExpanded = expandedAgent === agent.key;
          const isDimmed = expandedAgent !== null && !isExpanded;

          return (
            <div
              key={agent.key}
              className={`transition-all duration-300 ${
                isExpanded ? "sm:col-span-2 lg:col-span-3" : ""
              }`}
              style={{
                opacity: isDimmed ? 0.5 : 1,
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {/* Agent card header */}
              <button
                onClick={() => toggleAgent(agent.key)}
                aria-expanded={isExpanded}
                className={`
                  w-full text-left rounded-xl p-4 transition-all
                  border-l-4 border-boost-green-light
                  ${isExpanded
                    ? "bg-boost-surface border border-boost-border shadow-md rounded-b-none"
                    : "bg-white border border-boost-border hover:shadow-md card-lift"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-boost-green-light/10 flex items-center justify-center">
                    <BoostIcon name={agent.icon} variant="purple" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-boost-dark">{agent.name}</h4>
                      <div className="flex items-center gap-2">
                        <ProgressRing
                          percentage={agent.automationRate}
                          size={36}
                          strokeWidth={3}
                          showValue
                        />
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          className={`text-boost-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-boost-muted mt-0.5 line-clamp-1">{agent.description}</p>
                  </div>
                </div>

                {/* Quick actions — only when collapsed */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-1 mt-3 ml-13">
                    {agent.quickActions.slice(0, 4).map((action) => (
                      <Badge key={action} variant="muted" size="sm">{action}</Badge>
                    ))}
                    {agent.quickActions.length > 4 && (
                      <Badge variant="muted" size="sm">+{agent.quickActions.length - 4}</Badge>
                    )}
                  </div>
                )}
              </button>

              {/* Expanded content */}
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 bg-boost-surface border border-t-0 border-boost-border border-l-4 border-l-boost-green-light rounded-b-xl">
                      {/* Capabilities */}
                      <div className="mb-5">
                        <h5 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-2">
                          Capabilities ({agent.capabilities.length})
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {agent.capabilities.map((cap) => (
                            <div key={cap.title} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-boost-border">
                              <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light mt-1.5 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-boost-dark">{cap.title}</span>
                                <p className="text-[11px] text-boost-muted leading-snug">{cap.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Flow architecture */}
                      <div>
                        <h5 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-2">
                          Agent Architecture
                        </h5>
                        <div className="bg-white rounded-xl border border-boost-border p-4">
                          <FlowDiagram agent={agent} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
        {[
          { icon: "shield-medal", title: "Built-in Guardrails", desc: "Hallucination detection, PII protection, and compliance checks on every response." },
          { icon: "brain-integration", title: "Industry-Specific NLP", desc: "Pre-trained on financial services terminology, products, and workflows." },
          { icon: "headset", title: "Seamless Escalation", desc: "Intelligent human handover with full context transfer when needed." },
        ].map((pillar) => (
          <div key={pillar.title} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-boost-border">
            <div className="w-9 h-9 rounded-lg bg-boost-purple/10 flex items-center justify-center flex-shrink-0">
              <BoostIcon name={pillar.icon} variant="purple" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-boost-dark">{pillar.title}</h4>
              <p className="text-xs text-boost-muted mt-0.5">{pillar.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

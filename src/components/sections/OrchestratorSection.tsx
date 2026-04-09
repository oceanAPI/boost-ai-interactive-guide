"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { getOrchestratorConfig } from "@/data/agents";
import type { SpecialistAgent, TopicGroup } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import FlowNodeCard from "./orchestrator/FlowNodeCard";

/* ─── Agent card (small, inside topic group) ─── */
function AgentCard({
  agent,
  isExpanded,
  onClick,
}: {
  agent: SpecialistAgent;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <button onClick={onClick} className="w-full text-left">
        <FlowNodeCard
          category="agentic"
          name={agent.name}
          className={`w-full max-w-none cursor-pointer transition-shadow hover:shadow-md ${
            isExpanded ? "ring-2 ring-boost-green-light shadow-md" : ""
          }`}
        />
      </button>

      {/* Expanded placeholder */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {isExpanded && (
            <div className="mt-2 p-4 bg-boost-surface rounded-lg border border-boost-border">
              <p className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-2">
                Agent details coming soon
              </p>
              <p className="text-xs text-boost-muted">{agent.description}</p>
              {agent.capabilities.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {agent.capabilities.slice(0, 4).map((cap) => (
                    <div key={cap.title} className="flex items-start gap-2 p-2 rounded bg-white border border-boost-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light mt-1.5 flex-shrink-0" />
                      <span className="text-[11px] text-boost-dark">{cap.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Topic group column ─── */
function TopicGroupColumn({
  group,
  expandedAgent,
  onToggleAgent,
}: {
  group: TopicGroup;
  expandedAgent: string | null;
  onToggleAgent: (key: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Vertical dashed stub from horizontal line */}
      <div className="flex justify-center h-8" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Count badge */}
      <div className="flex justify-center -mt-1 mb-1" aria-hidden="true">
        <span className="w-5 h-5 rounded-full bg-white border text-[10px] font-semibold text-boost-muted flex items-center justify-center"
          style={{ borderColor: "#b2dfdb" }}
        >
          {group.agents.length}
        </span>
      </div>

      {/* Vertical dashed stub below badge */}
      <div className="flex justify-center h-4" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Column header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-lg bg-boost-purple/90 text-white"
      >
        <div className="flex items-center gap-2 min-w-0">
          <BoostIcon name={group.icon} variant="white" size={14} />
          <span className="text-xs font-semibold truncate">{group.label}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`flex-shrink-0 transition-transform ${collapsed ? "" : "rotate-180"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Agent cards */}
      {!collapsed && (
        <div className="space-y-2 pt-2">
          {group.agents.map((agent) => (
            <AgentCard
              key={agent.key}
              agent={agent}
              isExpanded={expandedAgent === agent.key}
              onClick={() => onToggleAgent(agent.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Standalone agent column (no topic group header) ─── */
function StandaloneColumn({
  agent,
  isExpanded,
  onClick,
}: {
  agent: SpecialistAgent;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Vertical dashed stub */}
      <div className="flex justify-center h-12" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      <AgentCard agent={agent} isExpanded={isExpanded} onClick={onClick} />
    </div>
  );
}

/* ─── Main Section ─── */
export default function OrchestratorSection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const config = getOrchestratorConfig(guide.areas_of_interest);
  const totalColumns = config.standaloneAgents.length + config.topicGroups.length;

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

      {/* Orchestrator card */}
      <div ref={ref} className={`flex justify-center mb-0 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <FlowNodeCard
          category="agentic"
          name="Agent Orchestrator"
          description="The main orchestrator handles all incoming requests and traffic to pass on to agents."
          className="min-w-[280px] max-w-[360px]"
        />
      </div>

      {/* Vertical line from orchestrator down to horizontal bar */}
      <div className="flex justify-center h-8" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Horizontal dashed bar spanning all columns */}
      <div className="mx-4" aria-hidden="true">
        <div className="border-t-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Columns grid — responsive, wraps on small screens */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(totalColumns, 6)}, minmax(0, 1fr))`,
        }}
      >
        {/* Standalone agents */}
        {config.standaloneAgents.map((agent) => (
          <StandaloneColumn
            key={agent.key}
            agent={agent}
            isExpanded={expandedAgent === agent.key}
            onClick={() => toggleAgent(agent.key)}
          />
        ))}

        {/* Topic groups */}
        {config.topicGroups.map((group) => (
          <TopicGroupColumn
            key={group.key}
            group={group}
            expandedAgent={expandedAgent}
            onToggleAgent={toggleAgent}
          />
        ))}
      </div>
    </section>
  );
}

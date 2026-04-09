"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { getOrchestratorConfig } from "@/data/agents";
import type { SpecialistAgent, TopicGroup } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import FlowNodeCard from "./orchestrator/FlowNodeCard";
import AgentModal from "./orchestrator/AgentModal";

/* ─── Agent card (clickable, opens modal) ─── */
function AgentCard({
  agent,
  onClick,
}: {
  agent: SpecialistAgent;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <FlowNodeCard
        category="agentic"
        name={agent.name}
        className="w-full max-w-none cursor-pointer transition-shadow hover:shadow-md hover:border-boost-green-light/50"
      />
    </button>
  );
}

/* ─── Topic group column ─── */
function TopicGroupColumn({
  group,
  onSelectAgent,
}: {
  group: TopicGroup;
  onSelectAgent: (agent: SpecialistAgent) => void;
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
              onClick={() => onSelectAgent(agent)}
            />
          ))}
        </div>
      )}
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
  const [selectedAgent, setSelectedAgent] = useState<SpecialistAgent | null>(null);

  const config = getOrchestratorConfig(guide.areas_of_interest);
  const totalColumns = config.standaloneAgents.length + config.topicGroups.length;

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

      {/* Columns grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(totalColumns, 6)}, minmax(0, 1fr))`,
        }}
      >
        {/* Standalone agents */}
        {config.standaloneAgents.map((agent) => (
          <div key={agent.key} className="flex flex-col">
            <div className="flex justify-center h-12" aria-hidden="true">
              <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
            </div>
            <AgentCard agent={agent} onClick={() => setSelectedAgent(agent)} />
          </div>
        ))}

        {/* Topic groups */}
        {config.topicGroups.map((group) => (
          <TopicGroupColumn
            key={group.key}
            group={group}
            onSelectAgent={setSelectedAgent}
          />
        ))}
      </div>

      {/* Agent detail modal */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { getOrchestratorConfig } from "@/data/agents";
import type { SpecialistAgent, TopicGroup } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import FlowNodeCard from "./orchestrator/FlowNodeCard";
import FlowConnector from "./orchestrator/FlowConnector";

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

      {/* Expanded placeholder content */}
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
              <p className="text-xs text-boost-muted">
                {agent.description}
              </p>
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
    <div className="flex flex-col min-w-[200px] max-w-[240px]">
      {/* Column header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-lg bg-boost-purple/90 text-white"
      >
        <div className="flex items-center gap-2">
          <BoostIcon name={group.icon} variant="white" size={14} />
          <span className="text-xs font-semibold truncate">{group.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
            {group.agents.length}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${collapsed ? "" : "rotate-180"}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
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

/* ─── Main Section ─── */
export default function OrchestratorSection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const config = getOrchestratorConfig(guide.areas_of_interest);

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

      {/* Orchestrator card (FlowNodeCard style, not purple hub) */}
      <div ref={ref} className={`flex justify-center mb-6 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <FlowNodeCard
          category="agentic"
          name="Agent Orchestrator"
          description="The main orchestrator handles all incoming requests and traffic to pass on to agents."
          className="min-w-[280px] max-w-[360px]"
        />
      </div>

      {/* Connector lines from orchestrator to columns */}
      <div className="flex justify-center" aria-hidden="true">
        <svg
          width="100%"
          height="50"
          viewBox="0 0 800 50"
          preserveAspectRatio="xMidYMin meet"
          className="max-w-3xl"
        >
          {/* Vertical line from orchestrator down */}
          <line x1="400" y1="0" x2="400" y2="20" stroke="#b2dfdb" strokeWidth="1.5" strokeDasharray="6 4" />
          {/* Horizontal line spanning columns */}
          <line x1="60" y1="20" x2="740" y2="20" stroke="#b2dfdb" strokeWidth="1.5" strokeDasharray="6 4" />
          {/* Vertical stubs down to each column (evenly spaced) */}
          {[60, 180, 310, 440, 570, 700].map((x) => (
            <line key={x} x1={x} y1="20" x2={x} y2="50" stroke="#b2dfdb" strokeWidth="1.5" strokeDasharray="6 4" />
          ))}
          {/* Count badges */}
          {[
            { x: 180, n: config.topicGroups[0]?.agents.length || 0 },
            { x: 310, n: config.topicGroups[1]?.agents.length || 0 },
            { x: 440, n: config.topicGroups[2]?.agents.length || 0 },
            { x: 570, n: config.topicGroups[3]?.agents.length || 0 },
            { x: 700, n: config.topicGroups[4]?.agents.length || 0 },
          ].map(({ x, n }) => n > 0 ? (
            <g key={x}>
              <circle cx={x} cy="12" r="10" fill="white" stroke="#b2dfdb" strokeWidth="1" />
              <text x={x} y="16" textAnchor="middle" fontSize="10" fill="#7a6b80" fontWeight="600">{n}</text>
            </g>
          ) : null)}
        </svg>
      </div>

      {/* Columns: standalone agents + topic groups */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Standalone agents (e.g. Customer relationship) */}
        {config.standaloneAgents.map((agent) => (
          <div key={agent.key} className="flex flex-col min-w-[200px] max-w-[240px]">
            <AgentCard
              agent={agent}
              isExpanded={expandedAgent === agent.key}
              onClick={() => toggleAgent(agent.key)}
            />
          </div>
        ))}

        {/* Topic group columns */}
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

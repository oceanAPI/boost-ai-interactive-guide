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

/* ─── Mobile topic group (accordion style) ─── */
function MobileTopicGroup({
  group,
  onSelectAgent,
}: {
  group: TopicGroup;
  onSelectAgent: (agent: SpecialistAgent) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-boost-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-boost-purple/90 text-white"
      >
        <div className="flex items-center gap-2">
          <BoostIcon name={group.icon} variant="white" size={16} />
          <span className="text-sm font-semibold">{group.label}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{group.agents.length}</span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="p-3 space-y-2 bg-boost-surface">
          {group.agents.map((agent) => (
            <AgentCard key={agent.key} agent={agent} onClick={() => onSelectAgent(agent)} />
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

  // Build orchestrator as a clickable agent with its own flow data
  const orchestratorAgent: SpecialistAgent = {
    key: "orchestrator",
    name: "Agent Orchestrator",
    icon: "robot-brain",
    automationRate: 95,
    description: "The main orchestrator handles all incoming requests and traffic to pass on to agents.",
    capabilities: [
      { title: "Intent Classification", description: "Classifies incoming customer requests and routes to the correct specialist agent" },
      { title: "Language Detection", description: "Detects the customer's language and routes to the correct language model" },
      { title: "Fallback Handling", description: "Manages unrecognized intents with graceful fallback responses" },
      { title: "Context Management", description: "Maintains conversation context across agent hand-offs" },
    ],
    quickActions: ["Route to agent", "Detect language", "Classify intent", "Manage context", "Handle fallback"],
    flow: {
      knowledgeSources: [
        { id: "orch-kb-routing", name: "Routing Rules", type: "faq", icon: "books", description: "Rules and logic for routing conversations to specialist agents" },
        { id: "orch-kb-lang", name: "Language Models", type: "api", icon: "computer-api", description: "NLU models for intent classification and language detection" },
      ],
      guardrails: [
        { id: "orch-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents the orchestrator from misrouting conversations" },
        { id: "orch-gr-loop", name: "Loop Prevention", type: "compliance", icon: "lock-security", description: "Detects and breaks circular routing between agents" },
      ],
      actionHooks: [
        { id: "orch-ah-escalate", name: "Escalate to Human", type: "transfer", icon: "headset", description: "Escalates to a live agent when no specialist can handle the request" },
      ],
      processes: [
        { id: "orch-pr-classify", name: "Intent Classification", type: "workflow", icon: "hierarchy", description: "Multi-step intent classification using NLU pipeline" },
      ],
      standardResponses: [
        { id: "orch-sr-welcome", name: "Welcome Message", type: "confirmation", icon: "thumbs-up", description: "Greets the customer and asks how to help" },
        { id: "orch-sr-fallback", name: "Fallback Response", type: "fallback", icon: "route", description: "Default response when intent is not recognized" },
      ],
    },
  };

  return (
    <section>
      <SectionHeader
        number="02"
        title="Boost Agent Orchestrator"
        subtitle={`How boost.ai routes and resolves every interaction for ${guide.company_name}`}
      />

      {/* Orchestrator card — clickable */}
      <div ref={ref} className={`flex justify-center mb-0 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}>
        <button
          onClick={() => setSelectedAgent(orchestratorAgent)}
          className="text-left cursor-pointer transition-shadow hover:shadow-lg rounded-lg"
        >
          <FlowNodeCard
            category="agentic"
            name="Agent Orchestrator"
            description="The main orchestrator handles all incoming requests and traffic to pass on to agents."
            className="min-w-[280px] max-w-[360px]"
          />
        </button>
      </div>

      {/* Vertical line from orchestrator down */}
      <div className="flex justify-center h-8" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Desktop: horizontal bar + columns grid */}
      {/* Mobile: vertical list of topic groups */}

      {/* Horizontal bar — hidden on mobile */}
      <div className="mx-4 hidden md:block" aria-hidden="true">
        <div className="border-t-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Desktop grid */}
      <div
        className="hidden md:grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(totalColumns, 6)}, minmax(0, 1fr))`,
        }}
      >
        {config.standaloneAgents.map((agent) => (
          <div key={agent.key} className="flex flex-col">
            {/* Same vertical treatment as topic groups to align */}
            <div className="flex justify-center h-8" aria-hidden="true">
              <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
            </div>
            <div className="flex justify-center -mt-1 mb-1" aria-hidden="true">
              <span className="w-5 h-5 rounded-full bg-white border text-[10px] font-semibold text-boost-muted flex items-center justify-center"
                style={{ borderColor: "#b2dfdb" }}
              >1</span>
            </div>
            <div className="flex justify-center h-4" aria-hidden="true">
              <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
            </div>
            {/* Header matching topic group button exactly */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-lg bg-boost-purple/90 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold truncate">No group</span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <AgentCard agent={agent} onClick={() => setSelectedAgent(agent)} />
            </div>
          </div>
        ))}
        {config.topicGroups.map((group) => (
          <TopicGroupColumn
            key={group.key}
            group={group}
            onSelectAgent={setSelectedAgent}
          />
        ))}
      </div>

      {/* Mobile vertical list */}
      <div className="md:hidden space-y-3">
        {config.standaloneAgents.map((agent) => (
          <AgentCard key={agent.key} agent={agent} onClick={() => setSelectedAgent(agent)} />
        ))}
        {config.topicGroups.map((group) => (
          <MobileTopicGroup
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

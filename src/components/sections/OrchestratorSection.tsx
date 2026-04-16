"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { GuideData } from "@/lib/types";
import { getOrchestratorConfig, getAgentsForGuide } from "@/data/agents";
import type { SpecialistAgent, TopicGroup } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import { SectionHeader } from "@/components/ui";

import AgentModal from "./orchestrator/AgentModal";
import OrchestratorBuilder from "./orchestrator/OrchestratorBuilder";

/* ─────────────────────────────────────────────────────────────────────
 *  Orchestrator Section — redesigned to match boost.ai platform
 *
 *  Purple gradient background, dark agent cards with "Active" badges,
 *  white orchestrator card at top, white connector lines.
 * ───────────────────────────────────────────────────────────────────── */

const CONNECTOR_COLOR = "rgba(89,25,93,0.15)";

/* ─── Tier badge ─── */
function tierBadgeLabel(agent: SpecialistAgent): string | null {
  if (!agent.tier || agent.tier === "primary") return null;
  return "Expandable";
}

/* ─── Platform-style agent card (matches boost.ai platform UI) ─── */
function AgentCard({
  agent,
  onClick,
}: {
  agent: SpecialistAgent;
  onClick: () => void;
}) {
  const badge = tierBadgeLabel(agent);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/10"
      style={{
        background: "linear-gradient(145deg, rgba(75,30,82,0.95) 0%, rgba(55,22,62,0.98) 100%)",
      }}
    >
      {/* Top section — clickable, opens modal */}
      <button
        onClick={onClick}
        className="w-full text-left px-4 pt-3.5 pb-2.5 flex flex-col gap-1.5"
      >
        {/* Active badge + tier */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light" />
            <span className="text-white/80">Active</span>
          </span>
          {badge && (
            <span className="text-[8px] text-white/25 uppercase tracking-wider font-medium">
              {badge}
            </span>
          )}
        </div>

        {/* Agent name */}
        <p className="text-sm font-semibold text-white leading-snug truncate">
          {agent.name}
        </p>

        {/* Description — shown when expanded */}
        {expanded && agent.description && (
          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-4">
            {agent.description}
          </p>
        )}
      </button>

      {/* Bottom section — icon buttons (matches platform layout) */}
      <div className="px-3.5 pb-3 pt-1 flex items-center justify-between">
        {/* Left: shield, globe, webhook */}
        <div className="flex items-center gap-2">
          <button onClick={onClick} className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors" title="Guardrails">
            <svg width="13" height="13" viewBox="0 0 512 512" fill="white" fillOpacity="0.5"><path d="M256 0c4.6 0 9.2 1 13.3 2.9L457.8 83c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/></svg>
          </button>
          <button onClick={onClick} className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors" title="Knowledge">
            <svg width="13" height="13" viewBox="0 0 512 512" fill="white" fillOpacity="0.5"><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM232 280V232h-24c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v72h8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-80c-13.3 0-24-10.7-24-24s10.7-24 24-24h24zm24-120a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"/></svg>
          </button>
          <button onClick={onClick} className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors" title="Action hooks">
            <svg width="13" height="13" viewBox="0 0 576 512" fill="white" fillOpacity="0.5"><path d="M288 0a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM64 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm384 0a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM24 440c0-39.8 32.2-72 72-72h16c13.2 0 25.7 3.6 36.4 9.8-4.5 9.3-7.8 19.2-9.7 29.6C134.7 419.3 128 434.7 128 452v20H24v-32zm464 32H392v-20c0-17.3-6.7-32.7-10.7-44.6-1.9-10.4-5.2-20.3-9.7-29.6 10.7-6.2 23.2-9.8 36.4-9.8h16c39.8 0 72 32.2 72 72v32zM336 452c0 22.1-17.9 40-40 40H280c-22.1 0-40-17.9-40-40v-20c0-39.8 32.2-72 72-72h-48c-39.8 0-72 32.2-72 72v20c0 22.1-17.9 40-40 40h-16c-22.1 0-40-17.9-40-40v-20c0-57.4 46.6-104 104-104h16c20.9 0 40.4 6.2 56.7 16.8a103.7 103.7 0 0 1 56.7-16.8h16c57.4 0 104 46.6 104 104v20c0 22.1-17.9 40-40 40h-16z"/></svg>
          </button>
        </div>

        {/* Right: settings, expand */}
        <div className="flex items-center gap-2">
          <button onClick={onClick} className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors" title="Settings">
            <svg width="13" height="13" viewBox="0 0 512 512" fill="white" fillOpacity="0.5"><path d="M256 0c17 0 33.6 1.7 49.8 4.8c7.9 1.5 21.8 6.1 29.4 20.1c2.4 4.4 12.2 23.1 12.2 23.1l.1 .2c7.9 14.8 3.7 33-9.6 43.2-4.5 3.4-8.5 7.4-12 11.8-9.6 12.2-15 26.8-15.8 41.5v1.2c-.2 14.9 4.5 29.8 14 42.3 3.5 4.5 7.6 8.6 12 12 13.2 10.2 17.3 28.3 9.5 43.1l-.2 .3s-9.7 18.7-12.1 23.1c-7.6 13.9-21.5 18.5-29.3 20-16.2 3.2-33 4.9-50.1 4.9-17 0-33.6-1.7-49.8-4.8-7.9-1.5-21.8-6.1-29.4-20.1-2.4-4.4-12.2-23.1-12.2-23.1l-.1-.2c-7.9-14.8-3.7-33 9.6-43.2 4.5-3.4 8.5-7.4 12-11.8 9.6-12.2 15-26.8 15.8-41.5v-1.2c.2-14.9-4.5-29.8-14-42.3-3.5-4.5-7.6-8.6-12-12-13.2-10.2-17.3-28.3-9.5-43.1l.2-.3s9.7-18.7 12.1-23.1C176.9 10.9 190.8 6.3 198.6 4.8 214.8 1.7 231.4 0 248.4 0h7.2zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-7 h-7 rounded-md bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            <svg width="12" height="12" viewBox="0 0 448 512" fill="white" fillOpacity="0.5" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              <path d="M207.5 411c9.4 9.4 24.6 9.4 33.9 0l200-200c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L224 360.5 40.5 177c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l200 200z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Topic group column (desktop) ─── */
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
      {/* Connector stub */}
      <div className="flex justify-center h-6" aria-hidden="true">
        <div className="w-px" style={{ backgroundColor: CONNECTOR_COLOR }} />
      </div>

      {/* Count badge */}
      <div className="flex justify-center mb-1" aria-hidden="true">
        <span className="w-5 h-5 rounded-full bg-white text-[10px] font-bold text-boost-purple flex items-center justify-center shadow-sm border border-boost-purple/20">
          {group.agents.length}
        </span>
      </div>

      {/* Connector stub below badge */}
      <div className="flex justify-center h-3" aria-hidden="true">
        <div className="w-px" style={{ backgroundColor: CONNECTOR_COLOR }} />
      </div>

      {/* Group header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl text-white"
        style={{ background: "rgba(89,25,93,0.6)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BoostIcon name={group.icon} variant="white" size={14} />
          <span className="text-[11px] font-semibold truncate">{group.label}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`flex-shrink-0 text-white/50 transition-transform ${collapsed ? "" : "rotate-180"}`}
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

/* ─── Mobile topic group ─── */
function MobileTopicGroup({
  group,
  onSelectAgent,
}: {
  group: TopicGroup;
  onSelectAgent: (agent: SpecialistAgent) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(89,25,93,0.4)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-white"
        style={{ background: "rgba(89,25,93,0.6)" }}
      >
        <div className="flex items-center gap-2">
          <BoostIcon name={group.icon} variant="white" size={16} />
          <span className="text-sm font-semibold">{group.label}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{group.agents.length}</span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="p-3 space-y-2">
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
  onRegisterOpenAgent,
}: {
  guide: GuideData;
  onRegisterOpenAgent?: (fn: (agentKey: string) => void) => void;
}) {
  const [selectedAgent, setSelectedAgent] = useState<SpecialistAgent | null>(null);
  const [cameFromOrchestrator, setCameFromOrchestrator] = useState(false);
  const [builderMode, setBuilderMode] = useState(false);

  const config = useMemo(
    () => getOrchestratorConfig(guide.areas_of_interest, guide.selected_variants),
    [guide.areas_of_interest, guide.selected_variants],
  );
  const availableAgents = useMemo(
    () => getAgentsForGuide(guide.areas_of_interest, guide.selected_variants),
    [guide.areas_of_interest, guide.selected_variants],
  );

  const allAgents = useCallback(() => {
    const agents: SpecialistAgent[] = [...config.standaloneAgents];
    for (const group of config.topicGroups) agents.push(...group.agents);
    return agents;
  }, [config]);

  useEffect(() => {
    if (onRegisterOpenAgent) {
      onRegisterOpenAgent((agentKey: string) => {
        const agent = allAgents().find((a) => a.key === agentKey);
        if (agent) setSelectedAgent(agent);
      });
    }
  }, [onRegisterOpenAgent, allAgents]);

  const totalColumns = config.standaloneAgents.length + config.topicGroups.length;

  const orchestratorAgent: SpecialistAgent = {
    key: "orchestrator",
    name: "Agent Orchestrator",
    icon: "robot-brain",
    automationRate: 95,
    description: "The central routing engine that classifies every incoming request and routes it to the best specialist agent. When no agent fits, it responds directly using its own knowledge and instructions.",
    capabilities: [
      { title: "Intent Classification & Routing", description: "LLM-powered classification that analyzes each message and routes to the most suitable specialist agent" },
      { title: "Clarification Handling", description: "When a request is vague, incomplete, or ambiguous, asks focused follow-up questions to remove uncertainty" },
      { title: "Direct Response", description: "Handles general or out-of-scope requests directly when no specialist agent is suitable, using its own knowledge base" },
      { title: "Global Safety Layer", description: "Enforces global guardrails (hallucination prevention, jailbreak protection) across all conversations before routing" },
    ],
    quickActions: [],
    flow: {
      knowledgeSources: [
        { id: "orch-kb-general", name: "General Knowledge Base", type: "faq", icon: "books", description: "General company knowledge used when no specialist agent is suitable." },
        { id: "orch-kb-routing", name: "LLM Routing Model", type: "api", icon: "computer-api-3671765", description: "boost.ai-hosted LLM that powers intent classification and agent selection." },
      ],
      guardrails: [
        { id: "orch-gr-hallucination", name: "Hallucination Prevention", type: "hallucination", icon: "shield-medal", description: "Global guardrail that prevents the orchestrator from generating inaccurate information." },
        { id: "orch-gr-jailbreak", name: "Jailbreak Protection", type: "compliance", icon: "lock-security", description: "Global guardrail that detects and blocks prompt injection and jailbreak attempts." },
      ],
      actionHooks: [
        { id: "orch-ah-transfer", name: "Transfer to Human", type: "transfer", icon: "headset", description: "Global action hook that transfers the conversation to a live agent." },
      ],
      processes: [
        { id: "orch-pr-classify", name: "Intent Classification", type: "workflow", icon: "hierarchy", description: "Multi-step LLM pipeline that classifies the customer's intent and selects the optimal specialist agent." },
      ],
      standardResponses: [
        { id: "orch-sr-clarify", name: "Clarification Request", type: "confirmation", icon: "speech", description: "Asks a short focused question to remove uncertainty when the request is vague." },
        { id: "orch-sr-fallback", name: "Fallback Response", type: "fallback", icon: "route", description: "Generated when no suitable agent exists. Uses the orchestrator's own knowledge." },
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

      {builderMode ? (
        <OrchestratorBuilder
          availableAgents={availableAgents}
          onSelectAgent={setSelectedAgent}
          onSelectOrchestrator={() => setSelectedAgent(orchestratorAgent)}
          onExit={() => setBuilderMode(false)}
        />
      ) : (
        /* ─── Platform-style gradient container ─── */
        <div
          className="rounded-2xl px-4 sm:px-6 py-8 sm:py-10"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 20% 30%, rgba(89,25,93,0.15) 0%, transparent 70%),
              radial-gradient(ellipse 60% 50% at 80% 70%, rgba(54,181,149,0.12) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 50% 0%, rgba(180,140,200,0.1) 0%, transparent 60%),
              linear-gradient(135deg, #ede4f0 0%, #e8e0ed 30%, #dde8e8 70%, #d8ebe6 100%)
            `,
          }}
        >
          {/* Orchestrator card — white on gradient */}
          <div className="flex justify-center mb-0 animate-fade-in">
            <div className="relative">
              <button
                onClick={() => setSelectedAgent(orchestratorAgent)}
                className="text-left cursor-pointer transition-shadow hover:shadow-xl rounded-xl"
              >
                <div className="bg-white rounded-xl shadow-lg shadow-black/10 px-5 py-4 min-w-[280px] max-w-[360px]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <BoostIcon name="robot-brain" variant="purple" size={20} />
                    <span className="text-base font-bold text-boost-dark">Agent Orchestrator</span>
                  </div>
                  <p className="text-xs text-boost-muted leading-relaxed mb-3">
                    The main orchestrator handles all incoming requests and traffic to pass on to agents.
                  </p>
                  {/* Platform-style icons */}
                  <div className="flex items-center gap-2">
                    <BoostIcon name="shield-medal" variant="purple" size={14} />
                    <BoostIcon name="books" variant="purple" size={14} />
                    <BoostIcon name="hierarchy" variant="purple" size={14} />
                  </div>
                </div>
              </button>

              {/* Try it button */}
              <div className="absolute -top-3 -right-3 z-10 animate-modal-in">
                <span className="absolute inset-0 rounded-full bg-boost-green/30 animate-ping" />
                <button
                  onClick={(e) => { e.stopPropagation(); setBuilderMode(true); }}
                  className="relative bg-boost-green text-white text-[11px] font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-boost-green-light transition-all flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Try it
                </button>
              </div>
            </div>
          </div>

          {/* Connector: vertical line down from orchestrator */}
          <div className="flex justify-center h-8" aria-hidden="true">
            <div className="w-px" style={{ backgroundColor: CONNECTOR_COLOR }} />
          </div>

          {/* Horizontal connector bar — desktop only */}
          <div className="mx-4 hidden md:block" aria-hidden="true">
            <div className="h-px" style={{ backgroundColor: CONNECTOR_COLOR }} />
          </div>

          {/* Desktop grid */}
          <div
            className="hidden md:grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(totalColumns, 10)}, minmax(0, 1fr))`,
            }}
          >
            {config.standaloneAgents.map((agent) => (
              <div key={agent.key} className="flex flex-col">
                <div className="flex justify-center h-6" aria-hidden="true">
                  <div className="w-px" style={{ backgroundColor: CONNECTOR_COLOR }} />
                </div>
                {/* Standalone agent — no group header, card connects directly */}
                <AgentCard agent={agent} onClick={() => setSelectedAgent(agent)} />
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
              <MobileTopicGroup
                key={agent.key}
                group={{ key: agent.key, label: agent.name, icon: agent.icon, agents: [agent] }}
                onSelectAgent={setSelectedAgent}
              />
            ))}
            {config.topicGroups.map((group) => (
              <MobileTopicGroup
                key={group.key}
                group={group}
                onSelectAgent={setSelectedAgent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Agent detail modal */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          onClose={() => { setSelectedAgent(null); setCameFromOrchestrator(false); }}
          orchestratorConfig={selectedAgent.key === "orchestrator" ? config : undefined}
          onSwitchAgent={selectedAgent.key === "orchestrator" ? (agent) => {
            setCameFromOrchestrator(true);
            setSelectedAgent(agent);
          } : undefined}
          onBackToOrchestrator={cameFromOrchestrator && selectedAgent.key !== "orchestrator" ? () => {
            setCameFromOrchestrator(false);
            setSelectedAgent(orchestratorAgent);
          } : undefined}
        />
      )}
    </section>
  );
}

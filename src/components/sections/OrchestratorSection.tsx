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
  return null; // Don't show badges — all agents are equal in the orchestrator view
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

      {/* Bottom section — darker purple band with outline icons (matches platform) */}
      <div className="px-3.5 pb-2.5 pt-2 flex items-center justify-between rounded-b-xl" style={{ background: "rgba(0,0,0,0.15)" }}>
        {/* Left: shield-check, globe, webhook */}
        <div className="flex items-center gap-2.5">
          <button onClick={onClick} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors" title="Guardrails">
            <svg width="16" height="16" viewBox="0 0 512 512" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="32"><path d="M256.1 0c4.6 0 9.2 1 13.3 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.2-263.9-213.7-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256.1 0z" strokeLinejoin="round"/><path d="M352 161.8L234 303l-70-66" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"/></svg>
          </button>
          <button onClick={onClick} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors" title="Knowledge">
            <svg width="16" height="16" viewBox="0 0 512 512" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="32"><circle cx="256" cy="256" r="232"/><path d="M176 208c0-44.2 35.8-80 80-80s80 35.8 80 80c0 35-22.4 64.8-53.7 75.7-8.3 2.9-14.3 10.5-14.3 19.3v9m0 56v8" strokeLinecap="round"/></svg>
          </button>
          <button onClick={onClick} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors" title="Action hooks">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
        </div>

        {/* Right: settings, expand */}
        <div className="flex items-center gap-2.5">
          <button onClick={onClick} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors" title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9"/>
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

  const totalColumns = config.topicGroups.length;

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
                    {/* Generative AI agent icon (from platform SVG) */}
                    <svg width="22" height="22" viewBox="0 0 27 20" fill="#59195d">
                      <path opacity="0.4" d="M23.7 7.17l-.53-1.82-1.82-.53c-.19-.04-.3-.19-.3-.38s.11-.34.3-.38l1.82-.53.53-1.82c.04-.19.15-.3.38-.3s.34.11.38.3l.53 1.82 1.82.53c.19.04.3.19.3.38s-.11.34-.3.38l-1.82.53-.53 1.82c-.04.19-.15.3-.38.3s-.34-.11-.38-.3zM.23 10.6l1.48.42.42 1.48c.04.11.15.23.3.23s.27-.08.3-.23l.42-1.48 1.48-.42c.11-.04.23-.15.23-.3s-.08-.27-.23-.3l-1.48-.42-.42-1.48c-.04-.11-.15-.23-.3-.23s-.27.08-.3.23l-.42 1.48-1.48.42c-.11.04-.23.15-.23.3s.11.27.23.3z"/>
                      <path d="M10.15 6.06c0 1.67 1.36 3.03 3.03 3.03s3.03-1.36 3.03-3.03h-6.06zM8.33 6.06V1.21c0-.34.27-.6.6-.6h.11c.11 0 .23.04.34.11l.76.49.08.04c.49.34 1.14.27 1.55-.15l.91-.87c.11-.15.3-.23.49-.23s.38.08.53.23l.91.91c.38.38 1.02.45 1.51.15l.08-.08.76-.49c.11-.08.23-.11.34-.11h.11c.34 0 .6.27.6.6v4.85c0 2.69-2.16 4.85-4.85 4.85s-4.85-2.16-4.85-4.85zm3.34 8.48c-2.5 0-4.55 2.05-4.55 4.55 0 .49-.42.91-.91.91s-.91-.42-.91-.91c0-3.52 2.84-6.36 6.36-6.36h3.03c3.52 0 6.36 2.84 6.36 6.36 0 .49-.42.91-.91.91s-.91-.42-.91-.91c0-2.5-2.05-4.55-4.55-4.55h-3.03z"/>
                    </svg>
                    <span className="text-base font-bold text-boost-dark">Agent Orchestrator</span>
                  </div>
                  <p className="text-xs text-boost-muted leading-relaxed mb-3">
                    The main orchestrator handles all incoming requests and traffic to pass on to agents.
                  </p>
                  {/* Platform-style outline icons */}
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 512 512" fill="none" stroke="#59195d" strokeOpacity="0.4" strokeWidth="32"><path d="M256.1 0c4.6 0 9.2 1 13.3 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.2-263.9-213.7-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256.1 0z" strokeLinejoin="round"/><path d="M352 161.8L234 303l-70-66" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"/></svg>
                    <svg width="16" height="16" viewBox="0 0 512 512" fill="none" stroke="#59195d" strokeOpacity="0.4" strokeWidth="32"><circle cx="256" cy="256" r="232"/><path d="M176 208c0-44.2 35.8-80 80-80s80 35.8 80 80c0 35-22.4 64.8-53.7 75.7-8.3 2.9-14.3 10.5-14.3 19.3v9m0 56v8" strokeLinecap="round"/></svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#59195d" strokeOpacity="0.4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
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

          {/* Desktop grid — only topic groups, standalones go below */}
          <div
            className="hidden md:grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${config.topicGroups.length}, minmax(0, 1fr))`,
            }}
          >
            {config.topicGroups.map((group) => (
              <TopicGroupColumn
                key={group.key}
                group={group}
                onSelectAgent={setSelectedAgent}
              />
            ))}
          </div>

          {/* Ungrouped agents — below the main grid */}
          {config.standaloneAgents.length > 0 && (
            <div className="hidden md:block mt-4">
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(89,25,93,0.3)" }}>
                {/* Group header */}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    <span className="text-white/90 text-xs font-semibold">Ungrouped</span>
                  </div>
                  <span className="text-white/40 text-[10px]">{config.standaloneAgents.length}</span>
                </div>
                {/* Cards in a row */}
                <div className="px-2 pb-2 flex flex-wrap gap-2">
                  {config.standaloneAgents.map((agent) => (
                    <div key={agent.key} className="w-[200px]">
                      <AgentCard agent={agent} onClick={() => setSelectedAgent(agent)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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

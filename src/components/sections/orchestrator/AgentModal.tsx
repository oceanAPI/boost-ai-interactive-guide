"use client";

import { useEffect, useState } from "react";
import type { SpecialistAgent, OrchestratorConfig } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowDiagram from "./FlowDiagram";
import OrchestratorExplainer from "./OrchestratorExplainer";

/* ─── Placeholder FAQ bar chart ─── */
function FAQChart({ agent }: { agent: SpecialistAgent }) {
  const faqData = agent.quickActions.slice(0, 8).map((q, i) => ({
    label: q,
    value: Math.max(15, 95 - i * 10 - Math.round(Math.random() * 5)),
  }));

  if (faqData.length === 0) return null;

  const maxVal = Math.max(...faqData.map((d) => d.value));

  return (
    <div className="space-y-2">
      {faqData.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-[11px] text-boost-dark w-[140px] sm:w-[180px] truncate text-right flex-shrink-0">
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-boost-surface rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-boost-green to-boost-green-light rounded transition-all duration-700"
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-boost-muted w-8 text-right flex-shrink-0">
            {item.value}%
          </span>
        </div>
      ))}
      <p className="text-[10px] text-boost-muted text-right pt-1">
        Sample distribution — will reflect live data
      </p>
    </div>
  );
}

/* ─── Section wrapper ─── */
function ModalSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-3">
        {title}
        {count !== undefined && (
          <span className="ml-1.5 text-boost-green-light">({count})</span>
        )}
      </h4>
      {children}
    </div>
  );
}

/* ─── Connected Agents grid (orchestrator only) ─── */
function ConnectedAgents({
  config,
  onSelectAgent,
}: {
  config: OrchestratorConfig;
  onSelectAgent: (agent: SpecialistAgent) => void;
}) {
  const allGroups = [
    ...config.standaloneAgents.length > 0
      ? [{ label: "Standalone", agents: config.standaloneAgents }]
      : [],
    ...config.topicGroups.map((g) => ({ label: g.label, agents: g.agents })),
  ];

  if (allGroups.length === 0) return null;

  return (
    <div className="space-y-4">
      {allGroups.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-wider mb-2">
            {group.label}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.agents.map((agent) => (
              <button
                key={agent.key}
                onClick={() => onSelectAgent(agent)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-boost-surface border border-boost-border hover:border-boost-green-light/50 hover:shadow-sm transition-all text-left"
              >
                <BoostIcon name={agent.icon} variant="purple" size={16} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-boost-dark truncate">{agent.name}</p>
                  <p className="text-[9px] text-boost-muted truncate">{agent.automationRate}% automation</p>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#b0a3b5" strokeWidth="2" className="flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main modal ─── */
interface AgentModalProps {
  agent: SpecialistAgent;
  onClose: () => void;
  /** Only passed when opening the orchestrator — enables "connected agents" section */
  orchestratorConfig?: OrchestratorConfig;
  /** Callback to switch to a different agent's modal */
  onSwitchAgent?: (agent: SpecialistAgent) => void;
  /** If set, shows a back button to return to the orchestrator */
  onBackToOrchestrator?: () => void;
}

export default function AgentModal({
  agent,
  onClose,
  orchestratorConfig,
  onSwitchAgent,
  onBackToOrchestrator,
}: AgentModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const [isDrilledIn, setIsDrilledIn] = useState(false);

  const isOrchestrator = agent.key === "orchestrator";
  const hasFlow =
    agent.flow.knowledgeSources.length > 0 ||
    agent.flow.guardrails.length > 0 ||
    agent.flow.actionHooks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-3xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-4 sm:px-6 py-4">
          {/* Back to orchestrator breadcrumb */}
          {onBackToOrchestrator && (
            <button
              onClick={onBackToOrchestrator}
              className="flex items-center gap-1.5 text-[11px] text-boost-muted hover:text-boost-green transition-colors mb-2 -mt-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <BoostIcon name="robot-brain" variant="purple" size={12} />
              <span>Agent Orchestrator</span>
            </button>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BoostIcon name={agent.icon} variant="purple" size={24} />
              <div>
                <h3 className="text-lg font-bold text-boost-dark">{agent.name}</h3>
                <p className="text-xs text-boost-muted max-w-md">{agent.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-5 space-y-6">
          {/* ─── Orchestrator-only: How it Works ─── */}
          {isOrchestrator && !isDrilledIn && (
            <OrchestratorExplainer />
          )}

          {/* ─── Agent Architecture ─── */}
          {hasFlow && (
            <ModalSection title="Agent architecture">
              <FlowDiagram agent={agent} onDrillChange={setIsDrilledIn} />
            </ModalSection>
          )}

          {/* Placeholder for agents without flow data */}
          {!hasFlow && (
            <div className="text-center py-8">
              <BoostIcon name={agent.icon} variant="purple" size={48} className="mx-auto opacity-30 mb-3" />
              <p className="text-sm text-boost-muted">
                Detailed agent architecture coming soon.
              </p>
            </div>
          )}

          {/* ─── Orchestrator-only: Connected Agents ─── */}
          {isOrchestrator && !isDrilledIn && orchestratorConfig && onSwitchAgent && (
            <ModalSection title="Connected agents">
              <ConnectedAgents
                config={orchestratorConfig}
                onSelectAgent={onSwitchAgent}
              />
            </ModalSection>
          )}

          {/* ─── Top-level only: FAQ chart ─── */}
          {!isDrilledIn && agent.quickActions.length > 0 && (
            <ModalSection title="Most frequently asked questions">
              <FAQChart agent={agent} />
            </ModalSection>
          )}

          {/*
           * ─── Future sections (uncomment when ready) ───
           *
           * <ModalSection title="Capabilities" count={agent.capabilities.length}>...</ModalSection>
           * <ModalSection title="Common requests">...</ModalSection>
           * <ModalSection title="Resolution metrics">...</ModalSection>
           * <ModalSection title="Case studies">...</ModalSection>
           */}
        </div>
      </div>
    </div>
  );
}

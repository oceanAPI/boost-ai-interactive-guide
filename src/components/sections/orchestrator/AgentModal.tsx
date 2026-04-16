"use client";

import { useEffect, useRef, useState } from "react";
import type { SpecialistAgent, OrchestratorConfig } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowDiagram from "./FlowDiagram";
import OrchestratorExplainer from "./OrchestratorExplainer";

/* ─── Simple hash for deterministic "random" values ─── */
function seededValue(seed: string, index: number): number {
  let hash = 0;
  const str = `${seed}-${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 8); // 0-7 range for small variance
}

/* ─── FAQ bar chart ─── */
function FAQChart({ agent }: { agent: SpecialistAgent }) {
  const faqData = agent.quickActions.slice(0, 8).map((q, i) => ({
    label: q,
    value: Math.max(15, 95 - i * 10 - seededValue(agent.key, i)),
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
                  <p className="text-[11px] text-boost-muted truncate">{agent.automationRate}% automation</p>
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    // Auto-focus the modal
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [onClose]);

  const [isDrilledIn, setIsDrilledIn] = useState(false);

  const isOrchestrator = agent.key === "orchestrator";
  const hasFlow =
    agent.flow.knowledgeSources.length > 0 ||
    agent.flow.guardrails.length > 0 ||
    agent.flow.actionHooks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8" role="presentation">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-3xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none">
        {/* Header — platform-style dark purple band, mirrors the agent card */}
        <div
          className="sticky top-0 z-10 sm:rounded-t-2xl"
          style={{
            background: "linear-gradient(145deg, rgba(75,30,82,0.98) 0%, rgba(55,22,62,1) 100%)",
          }}
        >
          <div className="px-4 sm:px-6 pt-4 pb-0">
            {/* Back to orchestrator breadcrumb */}
            {onBackToOrchestrator && (
              <button
                onClick={onBackToOrchestrator}
                className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/90 transition-colors mb-3"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Back to Agent Orchestrator</span>
              </button>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Active pill + tier badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light" />
                    <span className="text-white/85">Active</span>
                  </span>
                  {agent.tier && agent.tier !== "primary" && (
                    <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/35">
                      Expandable
                    </span>
                  )}
                </div>

                {/* Agent name */}
                <h3 id="agent-modal-title" className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {agent.name}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-white/55 max-w-xl mt-1.5 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors flex-shrink-0 -mt-0.5"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Platform-style outline icon row — matches agent card bottom band */}
          <div className="mt-4 px-4 sm:px-6 py-2.5 flex items-center gap-3" style={{ background: "rgba(0,0,0,0.18)" }}>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/40 font-semibold mr-1">
              Agent capabilities
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              <span className="w-7 h-7 flex items-center justify-center" title="Guardrails">
                <svg width="14" height="14" viewBox="0 0 512 512" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="32"><path d="M256.1 0c4.6 0 9.2 1 13.3 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.2-263.9-213.7-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256.1 0z" strokeLinejoin="round"/><path d="M352 161.8L234 303l-70-66" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"/></svg>
              </span>
              <span className="w-7 h-7 flex items-center justify-center" title="Knowledge">
                <svg width="14" height="14" viewBox="0 0 512 512" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="32"><circle cx="256" cy="256" r="232"/><path d="M176 208c0-44.2 35.8-80 80-80s80 35.8 80 80c0 35-22.4 64.8-53.7 75.7-8.3 2.9-14.3 10.5-14.3 19.3v9m0 56v8" strokeLinecap="round"/></svg>
              </span>
              <span className="w-7 h-7 flex items-center justify-center" title="Action hooks">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </span>
              <span className="w-7 h-7 flex items-center justify-center" title="Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </span>
            </div>
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

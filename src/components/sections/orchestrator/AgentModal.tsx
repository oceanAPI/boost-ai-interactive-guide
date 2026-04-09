"use client";

import { useEffect } from "react";
import type { SpecialistAgent } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowDiagram from "./FlowDiagram";

/* ─── Placeholder FAQ bar chart ─── */
function FAQChart({ agent }: { agent: SpecialistAgent }) {
  // Placeholder data — will be replaced with real production data
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

/* ─── Expandable section wrapper (for future use) ─── */
function ModalSection({
  title,
  count,
  children,
  defaultVisible = true,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultVisible?: boolean;
}) {
  if (!defaultVisible) return null;

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

/* ─── Main modal ─── */
interface AgentModalProps {
  agent: SpecialistAgent;
  onClose: () => void;
}

export default function AgentModal({ agent, onClose }: AgentModalProps) {
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
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BoostIcon name={agent.icon} variant="purple" size={24} />
            <div>
              <h3 className="text-lg font-bold text-boost-dark">{agent.name}</h3>
              <p className="text-xs text-boost-muted">{agent.description}</p>
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

        {/* Body */}
        <div className="px-4 sm:px-6 py-5 space-y-6">
          {/* Agent Architecture */}
          {hasFlow && (
            <ModalSection title="Agent architecture">
              <FlowDiagram agent={agent} />
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

          {/* Most Frequently Asked Questions — placeholder chart */}
          <ModalSection title="Most frequently asked questions">
            <FAQChart agent={agent} />
          </ModalSection>

          {/*
           * ─── Future sections (uncomment when ready) ───
           *
           * <ModalSection title="Capabilities" count={agent.capabilities.length}>
           *   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
           *     {agent.capabilities.map((cap) => (
           *       <div key={cap.title} className="flex items-start gap-2 p-3 rounded-lg bg-boost-surface border border-boost-border">
           *         <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light mt-1.5 flex-shrink-0" />
           *         <div>
           *           <span className="text-xs font-semibold text-boost-dark">{cap.title}</span>
           *           <p className="text-[11px] text-boost-muted leading-snug mt-0.5">{cap.description}</p>
           *         </div>
           *       </div>
           *     ))}
           *   </div>
           * </ModalSection>
           *
           * <ModalSection title="Common requests">
           *   <div className="flex flex-wrap gap-2">
           *     {agent.quickActions.map((action) => (
           *       <span key={action} className="px-3 py-1.5 text-xs font-medium text-boost-dark bg-boost-surface border border-boost-border rounded-full">
           *         {action}
           *       </span>
           *     ))}
           *   </div>
           * </ModalSection>
           *
           * <ModalSection title="Resolution metrics">
           *   {/* Real-time resolution rates, CSAT, etc. *\/}
           * </ModalSection>
           *
           * <ModalSection title="Case studies">
           *   {/* Related case studies / success stories *\/}
           * </ModalSection>
           */}
        </div>
      </div>
    </div>
  );
}

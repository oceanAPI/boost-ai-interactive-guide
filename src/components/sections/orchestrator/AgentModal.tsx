"use client";

import { useEffect } from "react";
import type { SpecialistAgent } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowDiagram from "./FlowDiagram";

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

  const hasFlow = agent.flow.knowledgeSources.length > 0
    || agent.flow.guardrails.length > 0
    || agent.flow.actionHooks.length > 0;

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
          {/* Agent Architecture — first, static view */}
          {hasFlow && (
            <div>
              <h4 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-3">
                Agent architecture
              </h4>
              <FlowDiagram agent={agent} />
            </div>
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

          {/* Capabilities — below architecture */}
          {agent.capabilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-3">
                Capabilities ({agent.capabilities.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {agent.capabilities.map((cap) => (
                  <div key={cap.title} className="flex items-start gap-2 p-3 rounded-lg bg-boost-surface border border-boost-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-boost-dark">{cap.title}</span>
                      <p className="text-[11px] text-boost-muted leading-snug mt-0.5">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common requests — last */}
          {agent.quickActions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-3">
                Common requests
              </h4>
              <div className="flex flex-wrap gap-2">
                {agent.quickActions.map((action) => (
                  <span key={action} className="px-3 py-1.5 text-xs font-medium text-boost-dark bg-boost-surface border border-boost-border rounded-full">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

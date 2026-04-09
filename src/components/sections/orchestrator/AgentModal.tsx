"use client";

import { useEffect } from "react";
import type { SpecialistAgent } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowNodeCard from "./FlowNodeCard";
import FlowDiagram from "./FlowDiagram";

interface AgentModalProps {
  agent: SpecialistAgent;
  onClose: () => void;
}

export default function AgentModal({ agent, onClose }: AgentModalProps) {
  // Close on Escape key
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-boost-border max-w-2xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-boost-green-light/10 flex items-center justify-center">
              <BoostIcon name={agent.icon} variant="purple" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-boost-dark">{agent.name}</h3>
              <p className="text-xs text-boost-muted">{agent.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Capabilities */}
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

          {/* Quick actions */}
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

          {/* Flow architecture */}
          {hasFlow && (
            <div>
              <h4 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-3">
                Agent architecture
              </h4>
              <div className="bg-boost-surface rounded-xl border border-boost-border p-4">
                <FlowDiagram agent={agent} />
              </div>
            </div>
          )}

          {/* Placeholder for agents without flow data yet */}
          {!hasFlow && agent.capabilities.length === 0 && (
            <div className="text-center py-8">
              <BoostIcon name={agent.icon} variant="purple" size={48} className="mx-auto opacity-30 mb-3" />
              <p className="text-sm text-boost-muted">
                Detailed agent architecture coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

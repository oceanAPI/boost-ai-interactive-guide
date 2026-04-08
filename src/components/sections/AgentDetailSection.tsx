"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { SPECIALIST_AGENTS } from "@/data/agents";

export default function AgentDetailSection({
  guide,
  focusedAgent,
  onBack,
}: {
  guide: GuideData;
  focusedAgent: string | null;
  onBack: () => void;
}) {
  const [expandedCapability, setExpandedCapability] = useState<number | null>(null);
  const agents =
    guide.areas_of_interest.length > 0
      ? SPECIALIST_AGENTS.filter((a) => guide.areas_of_interest.includes(a.key))
      : SPECIALIST_AGENTS;
  const displayAgents = focusedAgent ? agents.filter((a) => a.key === focusedAgent) : agents;

  return (
    <section className="section-enter">
      <div className="flex items-center gap-4 mb-8">
        {focusedAgent && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-boost-border hover:border-boost-green-light transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-purple">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div>
          <h2 className="text-3xl font-bold text-boost-dark">
            {focusedAgent ? displayAgents[0]?.name : "Specialist Agents"}
          </h2>
          <p className="text-boost-muted">
            {focusedAgent
              ? displayAgents[0]?.description
              : `Every automation rate above 77% — built for ${guide.company_name}`}
          </p>
        </div>
      </div>

      {displayAgents.map((agent) => (
        <div key={agent.key} className="mb-8">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-boost-green-light/10 border border-boost-green-light/30 rounded-xl p-4 text-center">
              <p className="text-boost-green font-bold text-3xl tabular-nums">{agent.automationRate}%</p>
              <p className="text-xs text-boost-muted mt-1">Automation Rate</p>
            </div>
            {agent.avgResolutionTime && (
              <div className="bg-white border border-boost-border rounded-xl p-4 text-center">
                <p className="text-boost-dark font-bold text-3xl">{agent.avgResolutionTime}</p>
                <p className="text-xs text-boost-muted mt-1">Avg Resolution</p>
              </div>
            )}
            {agent.topTopic && (
              <div className="bg-white border border-boost-border rounded-xl p-4 text-center">
                <p className="text-boost-purple font-bold text-lg">#1</p>
                <p className="text-xs text-boost-muted mt-1">{agent.topTopic}</p>
              </div>
            )}
            <div className="bg-white border border-boost-border rounded-xl p-4 text-center">
              <p className="text-boost-purple font-bold text-lg">24/7</p>
              <p className="text-xs text-boost-muted mt-1">Availability</p>
            </div>
          </div>

          {/* Capabilities */}
          {!focusedAgent && (
            <h3 className="text-boost-dark font-semibold mb-3 flex items-center gap-2">
              {agent.name}
              <span className="text-boost-green text-sm font-bold">{agent.automationRate}%</span>
            </h3>
          )}

          <div className="space-y-2 mb-6">
            {agent.capabilities.map((cap, idx) => (
              <div key={idx}>
                <button
                  onClick={() =>
                    setExpandedCapability(expandedCapability === idx ? null : idx)
                  }
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white border border-boost-border hover:border-boost-green-light/40 transition-colors group"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                    expandedCapability === idx ? "bg-boost-green-light text-white" : "bg-boost-surface text-boost-green group-hover:bg-boost-green-light/20"
                  }`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      {expandedCapability === idx ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                  </div>
                  <span className="text-sm text-boost-dark font-medium">{cap.title}</span>
                </button>
                {expandedCapability === idx && (
                  <div className="ml-9 mt-1 mb-2 px-3 py-2 text-sm text-boost-muted bg-boost-surface rounded-lg border-l-2 border-boost-green-light/30">
                    {cap.description}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-xs text-boost-muted uppercase tracking-wider mb-2">Common requests</p>
            <div className="flex flex-wrap gap-2">
              {agent.quickActions.map((action) => (
                <span
                  key={action}
                  className="px-3 py-1.5 bg-boost-purple/5 border border-boost-purple/15 rounded-lg text-xs text-boost-purple font-medium"
                >
                  {action}
                </span>
              ))}
            </div>
          </div>

          {!focusedAgent && displayAgents.indexOf(agent) < displayAgents.length - 1 && (
            <hr className="border-boost-border my-8" />
          )}
        </div>
      ))}
    </section>
  );
}

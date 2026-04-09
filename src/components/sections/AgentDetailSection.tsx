"use client";

import { useState, useEffect } from "react";
import type { GuideData } from "@/lib/types";
import type { StakeholderRole } from "@/data/roles";
import { SPECIALIST_AGENTS } from "@/data/agents";
import { getRoleDefinition } from "@/data/roles";
import { SectionHeader, TabGroup, ExpandableCard, Badge, CalloutBanner } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

function AgentStats({ automationRate, avgResolutionTime, topTopic }: {
  automationRate: number;
  avgResolutionTime?: string;
  topTopic?: string;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const rate = useCountUp({ target: automationRate, enabled: isVisible });

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-boost-green-light/5 rounded-lg p-3 text-center border border-boost-green-light/20">
        <span className="text-2xl font-bold text-boost-green tabular-nums">{rate}%</span>
        <p className="text-[11px] text-boost-muted mt-0.5">Automation Rate</p>
      </div>
      {avgResolutionTime && (
        <div className="bg-boost-surface rounded-lg p-3 text-center border border-boost-border">
          <span className="text-2xl font-bold text-boost-purple">{avgResolutionTime}</span>
          <p className="text-[11px] text-boost-muted mt-0.5">Avg Resolution</p>
        </div>
      )}
      {topTopic && (
        <div className="bg-boost-surface rounded-lg p-3 text-center border border-boost-border">
          <span className="text-sm font-bold text-boost-dark">{topTopic}</span>
          <p className="text-[11px] text-boost-muted mt-0.5">#1 Topic</p>
        </div>
      )}
      <div className="bg-boost-surface rounded-lg p-3 text-center border border-boost-border">
        <span className="text-2xl font-bold text-boost-dark">24/7</span>
        <p className="text-[11px] text-boost-muted mt-0.5">Availability</p>
      </div>
    </div>
  );
}

export default function AgentDetailSection({
  guide,
  role = "general",
  focusedAgent,
  onBack,
}: {
  guide: GuideData;
  role?: StakeholderRole;
  focusedAgent: string | null;
  onBack: () => void;
}) {
  const agents = guide.areas_of_interest.length > 0
    ? SPECIALIST_AGENTS.filter((a) => guide.areas_of_interest.includes(a.key))
    : SPECIALIST_AGENTS;

  const [activeTab, setActiveTab] = useState(focusedAgent || agents[0]?.key || "claims");

  useEffect(() => {
    if (focusedAgent) setActiveTab(focusedAgent);
  }, [focusedAgent]);

  const roleDef = getRoleDefinition(role);
  const highlight = roleDef.highlights["agents"];

  const tabs = agents.map((a) => ({
    key: a.key,
    label: a.name,
    badge: `${a.automationRate}%`,
  }));

  const currentAgent = agents.find((a) => a.key === activeTab) || agents[0];
  if (!currentAgent) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        {focusedAgent && (
          <button
            onClick={onBack}
            className="text-boost-green hover:text-boost-green-light text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <SectionHeader
          number="03"
          title="Specialist Agents"
          subtitle="Deep dive into each agent's capabilities and automation coverage"
        />
      </div>

      {highlight && (
        <CalloutBanner title="For you" description={highlight} variant="green" />
      )}

      {/* Tab navigation */}
      {agents.length > 1 && (
        <div className="mb-6">
          <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} size="sm" />
        </div>
      )}

      {/* Agent detail */}
      <div key={currentAgent.key}>
        <AgentStats
          automationRate={currentAgent.automationRate}
          avgResolutionTime={currentAgent.avgResolutionTime}
          topTopic={currentAgent.topTopic}
        />

        {/* Capabilities */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-boost-dark mb-3">
            Capabilities ({currentAgent.capabilities.length})
          </h3>
          {currentAgent.capabilities.map((cap) => (
            <ExpandableCard
              key={cap.title}
              title={cap.title}
              preview={cap.description.slice(0, 60) + "..."}
              icon={<span className="text-boost-green-light text-sm">●</span>}
            >
              <p className="text-sm text-boost-text-secondary leading-relaxed">
                {cap.description}
              </p>
            </ExpandableCard>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-boost-dark mb-3">Common Requests Handled</h3>
          <div className="flex flex-wrap gap-2">
            {currentAgent.quickActions.map((action) => (
              <Badge key={action} variant="green" size="md">
                {action}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

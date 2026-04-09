"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import BoostIcon from "@/components/BoostIcon";

const PLATFORM_COMPONENTS = [
  { label: "NLP Engine", desc: "Intent classification with 95%+ accuracy", icon: "brain-integration" },
  { label: "Agent Orchestrator", desc: "Multi-agent routing and context management", icon: "robot-brain" },
  { label: "Guardrails", desc: "Policy compliance and hallucination prevention", icon: "shield-medal" },
  { label: "Generative AI", desc: "LLM-powered responses within safe boundaries", icon: "integration-artificial-intelligence" },
  { label: "Knowledge Base", desc: "Document ingestion and retrieval", icon: "books" },
  { label: "Analytics", desc: "Conversation insights and performance dashboards", icon: "bar-chart" },
];

function ArchLayer({
  label,
  iconName,
  items,
  color,
  isVisible,
  delay,
}: {
  label: string;
  iconName: string;
  items: string[];
  color: string;
  isVisible: boolean;
  delay: number;
}) {
  return (
    <div
      className={`rounded-xl border border-boost-border bg-white p-4 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <BoostIcon name={iconName} variant="purple" size={24} />
        <h4 className="text-sm font-semibold text-boost-dark">{label}</h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="px-2.5 py-1 rounded-md text-xs font-medium border"
            style={{
              backgroundColor: `${color}08`,
              borderColor: `${color}25`,
              color: color,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ArchitectureSection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [showPlatformDetail, setShowPlatformDetail] = useState(false);

  const channels = guide.integrations?.channel?.length
    ? guide.integrations.channel
    : ["Web Chat", "Voice", "WhatsApp", "SMS", "Email"];

  const handover = guide.integrations?.human_handover?.length
    ? guide.integrations.human_handover
    : ["Contact Center", "Live Agent Platform"];

  const backends = [
    ...(guide.integrations?.utility?.length ? guide.integrations.utility : ["CRM", "Core Platform", "Knowledge Base"]),
    ...(guide.integrations?.openid?.length ? guide.integrations.openid.map(i => `${i} (Auth)`) : []),
  ];

  const voiceInteg = guide.integrations?.voice?.length
    ? guide.integrations.voice
    : [];

  const totalIntegrations = channels.length + handover.length + backends.length + voiceInteg.length;

  return (
    <section>
      <SectionHeader
        number="05"
        title="System Architecture"
        subtitle={`How boost.ai integrates with ${guide.company_name}'s technology stack`}
      />

      <div ref={ref} className="space-y-3">
        {/* Layer 1: Channels */}
        <ArchLayer
          label="Customer Channels"
          iconName="chat"
          items={channels}
          color="#36b595"
          isVisible={isVisible}
          delay={0}
        />

        {/* Flow arrow */}
        <div className="flex justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1c7d2" strokeWidth="2" className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>

        {/* Layer 2: boost.ai Platform */}
        <div
          className={`rounded-xl border-2 border-boost-purple/30 bg-gradient-to-br from-boost-purple/5 to-boost-green-light/5 p-5 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BoostIcon name="robot-brain" variant="purple" size={24} />
              <h4 className="text-sm font-semibold text-boost-purple">boost.ai Platform</h4>
              <Badge variant="purple">Core</Badge>
            </div>
            <button
              onClick={() => setShowPlatformDetail(!showPlatformDetail)}
              className="text-xs text-boost-purple hover:text-boost-green transition-colors"
            >
              {showPlatformDetail ? "Collapse" : "Expand platform"}
            </button>
          </div>

          {showPlatformDetail ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {PLATFORM_COMPONENTS.map((comp) => (
                <div key={comp.label} className="bg-white rounded-lg p-3 border border-boost-purple/15 flex items-start gap-2">
                  <BoostIcon name={comp.icon} variant="purple" size={20} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-boost-purple">{comp.label}</p>
                    <p className="text-[11px] text-boost-muted mt-0.5">{comp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {PLATFORM_COMPONENTS.map((comp) => (
                <span key={comp.label} className="px-2.5 py-1 rounded-md text-xs font-medium bg-boost-purple/10 text-boost-purple border border-boost-purple/20">
                  {comp.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Flow arrows */}
        <div className="flex justify-center gap-16">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1c7d2" strokeWidth="2" className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1c7d2" strokeWidth="2" className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>

        {/* Layer 3: Human Handover + Backend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ArchLayer
            label="Human Handover"
            iconName="human-interaction"
            items={handover}
            color="#59195d"
            isVisible={isVisible}
            delay={400}
          />
          <ArchLayer
            label="Backend Systems"
            iconName="cogs"
            items={backends}
            color="#208269"
            isVisible={isVisible}
            delay={500}
          />
        </div>

        {voiceInteg.length > 0 && (
          <ArchLayer
            label="Voice Integrations"
            iconName="headset"
            items={voiceInteg}
            color="#ef8b00"
            isVisible={isVisible}
            delay={600}
          />
        )}

        {/* Summary */}
        <div className="bg-boost-surface rounded-xl p-4 border border-boost-border text-center mt-4">
          <p className="text-sm text-boost-text-secondary">
            <span className="font-semibold text-boost-dark">{totalIntegrations} integrations</span> configured
            {" | "}100+ pre-built connectors available
            {" | "}Custom API connector for anything else
          </p>
        </div>
      </div>
    </section>
  );
}

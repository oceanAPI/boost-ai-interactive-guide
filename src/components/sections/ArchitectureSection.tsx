"use client";

import type { GuideData } from "@/lib/types";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import BoostLogo from "@/components/BoostLogo";

const CATEGORY_ICONS: Record<string, string> = {
  channel: "💬",
  human_handover: "🤝",
  openid: "🔐",
  utility: "⚙️",
  voice: "🎙️",
};

export default function ArchitectureSection({ guide }: { guide: GuideData }) {
  const hasIntegrations = Object.values(guide.integrations).some((arr) => arr && arr.length > 0);

  return (
    <section className="section-enter">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-boost-dark mb-2">System Architecture</h2>
        <p className="text-boost-muted">
          {hasIntegrations
            ? `How boost.ai integrates with ${guide.company_name}'s existing technology stack`
            : "boost.ai connects to your existing systems through 100+ pre-built integrations"}
        </p>
      </div>

      {/* Architecture diagram */}
      <div className="bg-white border border-boost-border rounded-xl p-6 mb-8">
        <div className="flex flex-col items-center gap-4">
          {/* End users */}
          <div className="flex items-center gap-3 px-5 py-3 bg-boost-surface rounded-xl border border-boost-border">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-muted">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-sm text-boost-text-secondary">End Users / Customers</span>
          </div>

          <div className="w-px h-6 bg-boost-border" />

          {/* Channels row */}
          <div className="w-full">
            <p className="text-xs text-boost-muted text-center uppercase tracking-wider mb-3">Channels</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(hasIntegrations && guide.integrations.channel?.length
                ? guide.integrations.channel
                : ["Web Chat", "Voice", "WhatsApp", "SMS", "Facebook"]
              ).map((ch) => (
                <span key={ch} className="px-3 py-1.5 bg-boost-green-light/10 border border-boost-green-light/20 rounded-lg text-xs text-boost-green font-medium">
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-boost-border" />

          {/* boost.ai core */}
          <div className="w-full max-w-md px-6 py-5 bg-boost-purple rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BoostLogo height={20} color="#ffffff" showText={false} />
              <span className="text-white font-bold">boost.ai Agent Orchestrator</span>
            </div>
            <p className="text-xs text-white/60">NLP Engine · Guardrails · Intent Routing · Generative AI</p>
          </div>

          <div className="w-px h-6 bg-boost-border" />

          {/* Human handover row */}
          <div className="w-full">
            <p className="text-xs text-boost-muted text-center uppercase tracking-wider mb-3">Human Handover</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(hasIntegrations && guide.integrations.human_handover?.length
                ? guide.integrations.human_handover
                : ["Contact Center", "Live Agent Platform"]
              ).map((hh) => (
                <span key={hh} className="px-3 py-1.5 bg-boost-purple/5 border border-boost-purple/15 rounded-lg text-xs text-boost-purple font-medium">
                  {hh}
                </span>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-boost-border" />

          {/* Backend systems */}
          <div className="w-full">
            <p className="text-xs text-boost-muted text-center uppercase tracking-wider mb-3">Backend Systems</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(hasIntegrations && guide.integrations.utility?.length
                ? guide.integrations.utility
                : ["CRM", "Core Platform", "Knowledge Base", "Ticketing"]
              ).map((sys) => (
                <span key={sys} className="px-3 py-1.5 bg-boost-surface border border-boost-border rounded-lg text-xs text-boost-text-secondary">
                  {sys}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integration categories */}
      {hasIntegrations && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTEGRATION_CATEGORIES.map((cat) => {
            const selected = guide.integrations[cat.key as keyof typeof guide.integrations] || [];
            if (selected.length === 0) return null;
            return (
              <div key={cat.key} className="bg-white border border-boost-border rounded-xl p-4">
                <h4 className="text-sm font-semibold text-boost-dark mb-3 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[cat.key] || "📦"}</span>
                  {cat.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selected.map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1.5 bg-boost-green-light/10 border border-boost-green-light/20 rounded-lg text-xs text-boost-green font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* API note */}
      <div className="mt-6 p-4 bg-boost-surface border border-boost-border rounded-xl">
        <p className="text-xs text-boost-muted">
          <span className="text-boost-dark font-medium">Custom integrations:</span> Beyond 100+ pre-built connectors, boost.ai&apos;s API connector lets you build integrations to any system with a REST API.
        </p>
      </div>
    </section>
  );
}

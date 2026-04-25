"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { GuideData } from "@/lib/types";
import { getAgentsForGuide } from "@/data/agents";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import { ROADMAP_PHASES, ROADMAP_LANES } from "@/data/roadmap";
import { calculateROI, resolveCurrency, formatWithCurrency } from "@/lib/roi-calculator";
import { getInvoiceContext } from "@/lib/pricing-calculator";
import { SectionHeader, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ─── Types ─── */
type TabId = "overview" | "team" | "timeline" | "integrations-roi";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Scope Overview" },
  { id: "team", label: "Team & Resources" },
  { id: "timeline", label: "Timeline" },
  { id: "integrations-roi", label: "Integrations & ROI" },
];

/* ─── Tab activation hook (resets animation on tab switch) ─── */
function useTabActivation(active: boolean) {
  const [ready, setReady] = useState(false);
  const prevRef = useRef(false);
  useEffect(() => {
    if (active && !prevRef.current) {
      setReady(false);
      const t = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(t);
    }
    prevRef.current = active;
  }, [active]);
  return ready;
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 1 — Scope Overview
 * ═══════════════════════════════════════════════════════════════════ */

const PRICING_LABELS: Record<string, string> = {
  fixed: "Fixed Price",
  usage: "Pay by Usage",
  outcome: "Pay by Outcome",
};

function ScopeOverview({ guide, active }: { guide: GuideData; active: boolean }) {
  const ready = useTabActivation(active);
  const vol = Object.values(guide.channel_volumes).reduce((s, v) => s + (v || 0), 0);
  const channels = guide.channel_volumes;

  const maxVol = Math.max(
    channels.chat || 0,
    channels.voice || 0,
    channels.email || 0,
    channels.social || 0,
    1,
  );

  const channelEntries: { label: string; value: number; color: string }[] = [
    { label: "Chat", value: channels.chat || 0, color: "bg-boost-green-light" },
    { label: "Voice", value: channels.voice || 0, color: "bg-boost-purple" },
    { label: "Email", value: channels.email || 0, color: "bg-boost-orange" },
    { label: "Social", value: channels.social || 0, color: "bg-boost-green" },
  ].filter((c) => c.value > 0);

  return (
    <div className="py-4 space-y-6">
      {/* Key stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Company", value: guide.company_name || "—" },
          { label: "Start Date", value: guide.start_date || "TBD" },
          { label: "Markets", value: String(guide.deployment_markets || 1) },
          { label: "Pricing", value: PRICING_LABELS[guide.pricing_model] || guide.pricing_model },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-boost-surface rounded-lg border border-boost-border p-3 transition-all"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "translateY(0)" : "translateY(8px)",
              transitionDuration: "500ms",
              transitionDelay: `${200 + i * 100}ms`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-boost-muted font-medium">{stat.label}</p>
            <p className="text-sm font-bold text-boost-dark mt-1 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Areas of interest */}
      {guide.areas_of_interest.length > 0 && (
        <div
          className="transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transitionDuration: "500ms",
            transitionDelay: "600ms",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider text-boost-muted font-medium mb-2">Areas of Interest</p>
          <div className="flex flex-wrap gap-1.5">
            {guide.areas_of_interest.map((area) => (
              <Badge key={area} variant="purple" size="md">
                {area.charAt(0).toUpperCase() + area.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Channel volumes as horizontal bars */}
      {channelEntries.length > 0 && (
        <div
          className="transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transitionDuration: "500ms",
            transitionDelay: "750ms",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider text-boost-muted font-medium mb-3">Channel Volumes (monthly)</p>
          <div className="space-y-2.5">
            {channelEntries.map((ch, i) => (
              <div key={ch.label} className="flex items-center gap-3">
                <span className="text-xs text-boost-dark font-medium w-12 shrink-0">{ch.label}</span>
                <div className="flex-1 h-5 bg-boost-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full ${ch.color} rounded-full transition-all`}
                    style={{
                      width: ready ? `${Math.max(8, (ch.value / maxVol) * 100)}%` : "0%",
                      transitionDuration: "800ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: `${900 + i * 120}ms`,
                    }}
                  />
                </div>
                <span className="text-xs text-boost-muted tabular-nums w-16 text-right shrink-0">
                  {ch.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {vol > 0 && (
            <p className="text-xs text-boost-muted mt-2">
              Total: <span className="font-semibold text-boost-dark">{vol.toLocaleString()}</span> conversations/month
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 2 — Team & Resources
 * ═══════════════════════════════════════════════════════════════════ */

const BOOST_TEAM = [
  { role: "Solution Architect", icon: "◆" },
  { role: "AI Trainer Lead", icon: "◈" },
  { role: "Integration Engineer", icon: "⚙" },
  { role: "Customer Success Manager", icon: "★" },
];

function TeamResources({ guide, active }: { guide: GuideData; active: boolean }) {
  const ready = useTabActivation(active);
  const res = guide.resources;

  const clientTeam: { role: string; count: number | undefined }[] = [
    { role: "Stakeholder Owners", count: res?.stakeholder_owners },
    { role: "AI Trainers", count: res?.ai_trainers },
    { role: "Technical Resources", count: res?.technical_resources },
  ].filter((r) => r.count && r.count > 0);

  const departments = res?.supporting_departments || [];

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client team */}
        <div
          className="transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateX(0)" : "translateX(-12px)",
            transitionDuration: "500ms",
            transitionDelay: "200ms",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-boost-purple/10 flex items-center justify-center">
              <span className="text-[10px] text-boost-purple">●</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-boost-muted font-semibold">
              {guide.company_name || "Client"} Team
            </p>
          </div>
          <div className="space-y-2">
            {clientTeam.length > 0 ? (
              clientTeam.map((member, i) => (
                <div
                  key={member.role}
                  className="flex items-center justify-between bg-boost-surface rounded-lg border border-boost-border px-3 py-2.5 transition-all"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? "translateY(0)" : "translateY(6px)",
                    transitionDuration: "400ms",
                    transitionDelay: `${350 + i * 100}ms`,
                  }}
                >
                  <span className="text-sm text-boost-dark">{member.role}</span>
                  <span className="text-sm font-bold text-boost-purple tabular-nums">{member.count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-boost-muted italic">Not specified yet</p>
            )}
          </div>

          {/* Supporting departments */}
          {departments.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-boost-muted font-medium mb-2">Supporting Departments</p>
              <div className="flex flex-wrap gap-1.5">
                {departments.map((dept) => (
                  <Badge key={dept} variant="muted" size="sm">{dept}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* boost.ai team */}
        <div
          className="transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateX(0)" : "translateX(12px)",
            transitionDuration: "500ms",
            transitionDelay: "400ms",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-boost-green-light/15 flex items-center justify-center">
              <span className="text-[10px] text-boost-green">●</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-boost-muted font-semibold">boost.ai Team</p>
          </div>
          <div className="space-y-2">
            {BOOST_TEAM.map((member, i) => (
              <div
                key={member.role}
                className="flex items-center gap-3 bg-boost-surface rounded-lg border border-boost-border px-3 py-2.5 transition-all"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? "translateY(0)" : "translateY(6px)",
                  transitionDuration: "400ms",
                  transitionDelay: `${550 + i * 100}ms`,
                }}
              >
                <span className="text-[11px] text-boost-green-light opacity-60">{member.icon}</span>
                <span className="text-sm text-boost-dark">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 3 — Timeline (condensed roadmap)
 * ═══════════════════════════════════════════════════════════════════ */

const PHASE_COLORS: Record<string, string> = {
  purple: "bg-boost-purple text-white",
  "purple-dark": "bg-boost-dark text-white",
  green: "bg-boost-green text-white",
  "green-light": "bg-boost-green-light text-white",
};

const PHASE_BORDER_COLORS: Record<string, string> = {
  purple: "border-boost-purple/20",
  "purple-dark": "border-boost-dark/20",
  green: "border-boost-green/20",
  "green-light": "border-boost-green-light/20",
};

function TimelineView({ active }: { active: boolean }) {
  const ready = useTabActivation(active);

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ROADMAP_PHASES.map((phase, pi) => {
          // Gather key milestones for this phase from all lanes
          const milestones: string[] = [];
          for (const lane of ROADMAP_LANES) {
            for (const item of lane.items) {
              if (
                item.startWeek >= phase.startWeek &&
                item.startWeek <= phase.endWeek &&
                item.highlight
              ) {
                milestones.push(item.name);
              }
            }
          }
          // Also gather non-milestone items for this phase
          const activities: string[] = [];
          for (const lane of ROADMAP_LANES) {
            for (const item of lane.items) {
              if (
                item.startWeek >= phase.startWeek &&
                item.endWeek <= phase.endWeek &&
                !item.highlight
              ) {
                activities.push(item.name);
              }
            }
          }

          return (
            <div
              key={phase.name}
              className={`rounded-xl border ${PHASE_BORDER_COLORS[phase.color]} bg-white overflow-hidden transition-all`}
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(12px)",
                transitionDuration: "500ms",
                transitionDelay: `${200 + pi * 150}ms`,
              }}
            >
              {/* Phase header */}
              <div className={`${PHASE_COLORS[phase.color]} px-3 py-2`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Phase {pi + 1}
                </p>
                <p className="text-sm font-bold">{phase.name}</p>
                <p className="text-[10px] opacity-70 mt-0.5">
                  Week {phase.startWeek}–{phase.endWeek}
                </p>
              </div>

              {/* Milestones & activities */}
              <div className="p-3 space-y-1.5">
                {milestones.map((m) => (
                  <div key={m} className="flex items-start gap-1.5">
                    <span className="text-boost-green-light text-[10px] mt-0.5 shrink-0">◆</span>
                    <span className="text-[11px] text-boost-dark font-medium leading-snug">{m}</span>
                  </div>
                ))}
                {activities.slice(0, 3).map((a) => (
                  <div key={a} className="flex items-start gap-1.5">
                    <span className="text-boost-muted text-[10px] mt-0.5 shrink-0">·</span>
                    <span className="text-[11px] text-boost-muted leading-snug">{a}</span>
                  </div>
                ))}
                {activities.length > 3 && (
                  <p className="text-[10px] text-boost-muted/60 pl-3">
                    +{activities.length - 3} more
                  </p>
                )}
                {milestones.length === 0 && activities.length === 0 && (
                  <p className="text-[10px] text-boost-muted italic">Ongoing activities</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lane summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {ROADMAP_LANES.map((lane) => (
          <span
            key={lane.name}
            className="text-[10px] text-boost-muted bg-boost-surface border border-boost-border px-2 py-1 rounded-md"
          >
            {lane.name} · {lane.items.length} items
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 4 — Integrations & ROI
 * ═══════════════════════════════════════════════════════════════════ */

function IntegrationsROI({
  guide,
  active,
}: {
  guide: GuideData;
  active: boolean;
}) {
  const ready = useTabActivation(active);

  const agents = useMemo(
    () => getAgentsForGuide(guide.areas_of_interest, guide.selected_variants),
    [guide.areas_of_interest, guide.selected_variants],
  );
  const avgRate =
    agents.length > 0
      ? Math.round(agents.reduce((s, a) => s + a.automationRate, 0) / agents.length)
      : 80;

  // Invoice-first: when 2026 pricing is populated, the SoW's ROI
  // aside reads the same monthly + implementation totals as the
  // Commercial invoice + resource plan.
  const _ig = guide.integrations ?? {};
  const integrationCount =
    (_ig.channel?.length || 0) + (_ig.human_handover?.length || 0) +
    (_ig.openid?.length || 0) + (_ig.utility?.length || 0) + (_ig.voice?.length || 0);
  const teamSize =
    (guide.resources?.stakeholder_owners || 0) +
    (guide.resources?.ai_trainers || 0) +
    (guide.resources?.technical_resources || 0);
  const invoice = getInvoiceContext(guide.pricing_config, {
    deployment_markets: guide.deployment_markets,
    integration_count: integrationCount,
    customer_team_size: teamSize,
  });

  const vol = invoice?.expectedMonthlyChat
    ? invoice.expectedMonthlyChat
    : Object.values(guide.channel_volumes).reduce((s, v) => s + (v || 0), 0) || 10000;
  const costNum = parseFloat(guide.conversation_cost?.replace(/[^0-9.]/g, "") || "0") || 8;

  const currency = resolveCurrency(guide.currency, guide.conversation_cost);
  const roi = useMemo(
    () =>
      calculateROI({
        monthlyConversations: vol,
        costPerConversation: costNum,
        pricingModel: guide.pricing_model || "fixed",
        automationRate: avgRate,
        markets: guide.deployment_markets || 1,
        currency,
        invoiceMonthlyCostUSD: invoice?.monthlyUSD,
        invoiceImplementationUSD: invoice?.implementationOneTimeUSD,
      }),
    [vol, costNum, guide.pricing_model, avgRate, guide.deployment_markets, currency, invoice?.monthlyUSD, invoice?.implementationOneTimeUSD],
  );

  const fmt = (n: number) => formatWithCurrency(n, currency);

  // Group selected integrations by category
  const groupedIntegrations: { label: string; items: string[] }[] = [];
  for (const cat of INTEGRATION_CATEGORIES) {
    const selected = (guide.integrations[cat.key as keyof typeof guide.integrations] || []) as string[];
    if (selected.length > 0) {
      groupedIntegrations.push({ label: cat.label, items: selected });
    }
  }

  const savingsCount = useCountUp({ target: roi.annualSavings, enabled: ready, duration: 1200 });
  const reductionCount = useCountUp({ target: roi.roiPercentage, enabled: ready, duration: 1000 });
  const fteCount = useCountUp({ target: roi.fteEquivalent, enabled: ready, duration: 1000, decimals: 1 });
  const breakEvenCount = useCountUp({ target: roi.breakEvenMonths, enabled: ready, duration: 800, decimals: roi.breakEvenMonths < 1 ? 1 : 0 });

  return (
    <div className="py-4 space-y-6">
      {/* Integrations grouped by category */}
      {groupedIntegrations.length > 0 && (
        <div
          className="transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transitionDuration: "500ms",
            transitionDelay: "200ms",
          }}
        >
          <p className="text-[10px] uppercase tracking-wider text-boost-muted font-medium mb-3">Selected Integrations</p>
          <div className="space-y-3">
            {groupedIntegrations.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-boost-dark mb-1.5">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item} variant="outline" size="sm">{item}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI stat boxes */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-boost-muted font-medium mb-3">Projected ROI</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Annual Savings", value: fmt(savingsCount), color: "text-boost-green" },
            { label: "Cost Reduction", value: `${reductionCount}%`, color: "text-boost-green" },
            { label: "FTE Equivalent", value: String(fteCount), color: "text-boost-purple" },
            { label: "Break-even", value: `${breakEvenCount} mo`, color: "text-boost-purple" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-boost-surface rounded-xl border border-boost-border p-4 text-center transition-all"
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "scale(1)" : "scale(0.95)",
                transitionDuration: "500ms",
                transitionDelay: `${500 + i * 120}ms`,
              }}
            >
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-boost-muted mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  MAIN SECTION
 * ═══════════════════════════════════════════════════════════════════ */

export default function ScopeOfWorkSection({
  guide,
  sectionNumber,
}: {
  guide: GuideData;
  sectionNumber?: string;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <section>
      <SectionHeader
        number={sectionNumber}
        title="Scope of Work"
        subtitle={`Implementation scope for ${guide.company_name || "your organization"}`}
      />

      <div
        ref={ref}
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Dark header band */}
        <div className="bg-boost-dark rounded-t-xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg">{guide.company_name || "Organization"}</p>
            <p className="text-white/50 text-xs mt-0.5">Statement of Work</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">{guide.start_date || "TBD"}</p>
            <p className="text-white/40 text-[10px] mt-0.5">Projected start</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-x border-boost-border">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-[12px] font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-boost-green-light text-boost-dark bg-boost-surface/50"
                    : "border-transparent text-boost-muted hover:text-boost-dark hover:bg-boost-surface/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-b-xl border-x border-b border-boost-border px-6 pb-6 min-h-[340px]">
          {activeTab === "overview" && <ScopeOverview guide={guide} active={activeTab === "overview"} />}
          {activeTab === "team" && <TeamResources guide={guide} active={activeTab === "team"} />}
          {activeTab === "timeline" && <TimelineView active={activeTab === "timeline"} />}
          {activeTab === "integrations-roi" && <IntegrationsROI guide={guide} active={activeTab === "integrations-roi"} />}
        </div>
      </div>
    </section>
  );
}

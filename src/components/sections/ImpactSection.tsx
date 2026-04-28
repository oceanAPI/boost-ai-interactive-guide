"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { GuideData } from "@/lib/types";
import { getAgentsForGuide } from "@/data/agents";
import { calculateROI, resolveCurrency, formatWithCurrency, parseConversationCost } from "@/lib/roi-calculator";
import { getInvoiceContext } from "@/lib/pricing-calculator";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ─────────────────────────────────────────────────────────────────────
 *  Business Impact — 4 tabs, each with a DISTINCT visual
 *
 *  CSAT:        Score-distribution bar chart (before vs after)
 *  Automation:  Vertical conversation-flow split (AI vs Human)
 *  Data:        Mini analytics dashboard mockup (4 widgets)
 *  Commercial:  Savings timeline with animated fill + break-even
 *
 *  Each tab looks and feels genuinely different. No two tabs share
 *  the same visual structure.
 * ───────────────────────────────────────────────────────────────────── */

type TabId = "csat" | "automation" | "data" | "commercial";
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "csat", label: "CSAT", icon: "★" },
  { id: "automation", label: "Automation", icon: "◎" },
  { id: "data", label: "Data Insights", icon: "◈" },
  { id: "commercial", label: "Commercial", icon: "◇" },
];

/* ─── Shared hook: reset animation when tab activates ─── */
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
 *  TAB 1 — CSAT: Score distribution shift
 *
 *  5 horizontal bars for scores 1-5. "Before" (muted) and "After"
 *  (green) side by side. The after bars animate their widths to show
 *  the distribution shifting right (toward 4-5).
 * ═══════════════════════════════════════════════════════════════════ */

const CSAT_DATA = [
  { score: 5, before: 12, after: 48 },
  { score: 4, before: 18, after: 32 },
  { score: 3, before: 35, after: 12 },
  { score: 2, before: 25, after: 6 },
  { score: 1, before: 10, after: 2 },
];

function CSATDistribution({ active }: { active: boolean }) {
  const ready = useTabActivation(active);
  const maxVal = 50; // scale ceiling

  return (
    <div className="space-y-3 py-4">
      {/* Legend */}
      <div className="flex items-center gap-5 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-boost-muted/25" />
          <span className="text-[10px] text-boost-muted">Before</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-boost-green-light" />
          <span className="text-[10px] text-boost-dark font-medium">After</span>
        </div>
      </div>

      {CSAT_DATA.map((row, i) => (
        <div key={row.score} className="flex items-center gap-3">
          {/* Score label */}
          <span className="w-4 text-right text-[11px] font-bold text-boost-dark tabular-nums shrink-0">
            {row.score}
          </span>

          {/* Bar pair */}
          <div className="flex-1 space-y-1">
            {/* Before bar */}
            <div className="h-3 bg-boost-surface rounded-sm overflow-hidden">
              <div
                className="h-full bg-boost-muted/25 rounded-sm transition-all"
                style={{
                  width: ready ? `${(row.before / maxVal) * 100}%` : "0%",
                  transitionDuration: "800ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: `${200 + i * 80}ms`,
                }}
              />
            </div>
            {/* After bar */}
            <div className="h-3 bg-boost-surface rounded-sm overflow-hidden">
              <div
                className="h-full bg-boost-green-light rounded-sm transition-all"
                style={{
                  width: ready ? `${(row.after / maxVal) * 100}%` : "0%",
                  transitionDuration: "1000ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: `${400 + i * 80}ms`,
                }}
              />
            </div>
          </div>

          {/* Percentage labels */}
          <div className="w-16 shrink-0 text-right space-y-1">
            <p className="text-[9px] text-boost-muted tabular-nums">{row.before}%</p>
            <p className="text-[9px] text-boost-green font-semibold tabular-nums">{row.after}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 2 — Automation: Conversation flow split
 *
 *  Visual flow: incoming conversations → orchestrator decision →
 *  two branches (AI resolved / Human handled) with counts.
 * ═══════════════════════════════════════════════════════════════════ */

function AutomationFlow({ active, volume }: { active: boolean; volume: number }) {
  const ready = useTabActivation(active);
  const aiCount = Math.round(volume * 0.8);
  const humanCount = volume - aiCount;

  const aiDisplay = useCountUp({ target: aiCount, enabled: ready, duration: 1200 });
  const humanDisplay = useCountUp({ target: humanCount, enabled: ready, duration: 1200 });

  return (
    <div className="py-4">
      {/* Incoming */}
      <div className="text-center mb-3">
        <span
          className="inline-block px-3 py-1.5 rounded-lg bg-boost-surface border border-boost-border text-[11px] font-semibold text-boost-dark transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(-8px)",
            transitionDuration: "400ms",
          }}
        >
          {volume.toLocaleString()} monthly conversations
        </span>
      </div>

      {/* Connector down */}
      <div className="flex justify-center">
        <div
          className="w-px h-6 transition-all"
          style={{
            backgroundColor: ready ? "var(--color-boost-border)" : "transparent",
            transitionDuration: "300ms",
            transitionDelay: "300ms",
          }}
        />
      </div>

      {/* Orchestrator decision node */}
      <div className="flex justify-center mb-1">
        <div
          className="w-8 h-8 rounded-full bg-boost-purple/10 border border-boost-purple/20 flex items-center justify-center transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "scale(1)" : "scale(0.5)",
            transitionDuration: "400ms",
            transitionDelay: "400ms",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-purple">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>
      </div>

      {/* Branch connectors + results */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* AI branch */}
        <div
          className="text-center transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(12px)",
            transitionDuration: "500ms",
            transitionDelay: "600ms",
          }}
        >
          <div className="flex justify-center mb-2">
            <div className="w-px h-4 bg-boost-green-light/40" />
          </div>
          <div className="rounded-xl bg-boost-green-light/5 border border-boost-green-light/15 p-4">
            <p className="text-2xl font-bold text-boost-green tabular-nums">{aiDisplay.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-boost-green uppercase tracking-wider mt-1">AI-resolved</p>
            <p className="text-[10px] text-boost-muted mt-2 leading-relaxed">
              Instant, 24/7. No queue, no wait. Full self-service or guided resolution.
            </p>
          </div>
        </div>

        {/* Human branch */}
        <div
          className="text-center transition-all"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(12px)",
            transitionDuration: "500ms",
            transitionDelay: "750ms",
          }}
        >
          <div className="flex justify-center mb-2">
            <div className="w-px h-4 bg-boost-purple/30" />
          </div>
          <div className="rounded-xl bg-boost-purple/[0.03] border border-boost-purple/10 p-4">
            <p className="text-2xl font-bold text-boost-purple tabular-nums">{humanDisplay.toLocaleString()}</p>
            <p className="text-[10px] font-semibold text-boost-purple uppercase tracking-wider mt-1">Human-handled</p>
            <p className="text-[10px] text-boost-muted mt-2 leading-relaxed">
              Warm handover with full context. The agent never asks &ldquo;how can I help you?&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 3 — Data: Mini analytics dashboard mockup
 *
 *  4 decorative widget cards that look like real dashboard elements.
 *  Each has a different visual shape (bars, line, donut, heatmap).
 * ═══════════════════════════════════════════════════════════════════ */

/** Three illustrative tiles that stand in for the live admin
 *  dashboard. Replaces the earlier mini-widgets (bars / line / donut
 *  / heatmap) — reviewer couldn't tell if those were real data or
 *  chrome. These tiles are honestly labelled "Illustrative" and use
 *  "typical" language so nobody mistakes them for live telemetry. */
const DASHBOARD_METRICS = [
  {
    value: "80%+",
    label: "Auto-resolved",
    context: "Typical end-state coverage of FAQ + transactional flows",
  },
  {
    value: "~1.4 s",
    label: "Avg response time",
    context: "Customer-facing, measured end-to-end",
  },
  {
    value: "2,500+",
    label: "Topics from day one",
    context: "Pre-built service, support, and claims intents",
  },
];

function MiniDashboard({ active }: { active: boolean }) {
  const ready = useTabActivation(active);

  return (
    <div className="py-4">
      <p className="text-[9px] uppercase tracking-[0.18em] text-boost-muted mb-3">
        Illustrative · the live admin dashboard shows your real numbers
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DASHBOARD_METRICS.map((m, mi) => (
          <div
            key={m.label}
            className="rounded-lg bg-boost-dark p-4 text-white transition-all"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "translateY(0)" : "translateY(10px)",
              transitionDuration: "500ms",
              transitionDelay: `${200 + mi * 150}ms`,
            }}
          >
            <p className="text-2xl font-bold text-boost-green-light tabular-nums">
              {m.value}
            </p>
            <p className="text-[11px] font-semibold text-white/90 mt-1">
              {m.label}
            </p>
            <p className="text-[10px] text-white/50 mt-1 leading-snug">
              {m.context}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 4 — Commercial: Savings timeline
 *
 *  Horizontal timeline (months 1-12) with an animated line showing
 *  cumulative savings. Break-even marker pops in at the right month.
 * ═══════════════════════════════════════════════════════════════════ */

function SavingsTimeline({
  active,
  annualSavings,
  breakEvenMonths,
  currencySymbol,
  currentMonthlyCost,
  newMonthlyCost,
  rampMonths = 0,
  steadyStateMonthlySavings,
}: {
  active: boolean;
  annualSavings: number;
  breakEvenMonths: number;
  currencySymbol: string;
  currentMonthlyCost: number;
  newMonthlyCost: number;
  /** F3b — when > 0, the 3-bar reflects Year-1 average and a caption
   *  shows the steady-state target. Defaults to 0 (no ramp shown). */
  rampMonths?: number;
  /** Monthly savings at steady state — shown as a caption when a
   *  ramp is configured so the AE can pivot the conversation
   *  ("here's Year 1, here's where you'll be at Year 2"). */
  steadyStateMonthlySavings?: number;
}) {
  const ready = useTabActivation(active);
  const months = 12;
  const monthlySavings = annualSavings / 12;

  const savingsCount = useCountUp({ target: annualSavings, enabled: ready, duration: 1400 });

  const fmt = (n: number) => formatWithCurrency(n, currencySymbol);

  // F5 — 3-bar breakdown: current cost vs boost.ai cost vs savings.
  // Same axis (current monthly cost = 100%). Makes the $23.6M
  // figure stop being a mystery: the bars show exactly how much
  // of today's spend survives, how much is boost.ai's share, and
  // how much becomes savings.
  const scaleMax = Math.max(currentMonthlyCost, 1);
  const newCostPct = (newMonthlyCost / scaleMax) * 100;
  const savingsPct = Math.max(0, (monthlySavings / scaleMax) * 100);

  return (
    <div className="py-4">
      {/* Big number */}
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-boost-green tabular-nums">
          {fmt(savingsCount)}
        </p>
        <p className="text-[11px] text-boost-muted mt-1">Estimated annual savings</p>
      </div>

      {/* 3-bar breakdown — the math behind the big number */}
      <div className="mb-6 space-y-2.5 rounded-lg border border-boost-border bg-white p-4">
        <p className="text-[9px] font-bold text-boost-muted uppercase tracking-[0.16em] mb-1">
          Monthly cost breakdown
        </p>

        {/* Current cost — the 100% baseline */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-[11px]">
            <span className="text-boost-dark font-medium">
              Current cost
            </span>
            <span className="tabular-nums text-boost-dark font-semibold">
              {fmt(currentMonthlyCost)} / mo
            </span>
          </div>
          <div className="h-3 bg-boost-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-boost-dark rounded-full transition-all"
              style={{
                width: ready ? "100%" : "0%",
                transitionDuration: "900ms",
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: "200ms",
              }}
            />
          </div>
        </div>

        {/* boost.ai cost — what the customer pays post-implementation */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-[11px]">
            <span className="text-boost-purple font-medium">
              boost.ai cost
            </span>
            <span className="tabular-nums text-boost-purple font-semibold">
              {fmt(newMonthlyCost)} / mo
            </span>
          </div>
          <div className="h-3 bg-boost-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-boost-purple rounded-full transition-all"
              style={{
                width: ready ? `${newCostPct}%` : "0%",
                transitionDuration: "900ms",
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: "450ms",
              }}
            />
          </div>
        </div>

        {/* Savings — what's left = your return */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-[11px]">
            <span className="text-boost-green font-medium">
              Monthly savings
            </span>
            <span className="tabular-nums text-boost-green font-semibold">
              {fmt(monthlySavings)} / mo
            </span>
          </div>
          <div className="h-3 bg-boost-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-boost-green rounded-full transition-all"
              style={{
                width: ready ? `${savingsPct}%` : "0%",
                transitionDuration: "900ms",
                transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: "700ms",
              }}
            />
          </div>
        </div>

        <p className="text-[10px] text-boost-muted leading-snug pt-1">
          All three bars share the same axis (current monthly cost =
          100%). Boost.ai&apos;s share shrinks as automation rate rises;
          the green bar is what you keep as savings.
        </p>

        {/* F3b — ramp caption: only renders when a months-to-target
            value is configured. Tells the AE / customer that the
            green bar above is the Year-1 average, and where steady-
            state lands. Stays silent when no ramp is set so the
            default (steady-state) story is unchanged. */}
        {rampMonths > 0 && steadyStateMonthlySavings != null && (
          <div className="mt-3 pt-3 border-t border-boost-border/60 flex items-baseline justify-between gap-3">
            <p className="text-[10px] text-boost-muted leading-snug">
              <span className="font-semibold text-boost-dark">Year 1 average</span>
              {" — "}
              {rampMonths}-month ramp from go-live. Steady state lands at
            </p>
            <p className="text-[11px] tabular-nums font-semibold text-boost-green whitespace-nowrap">
              {fmt(steadyStateMonthlySavings)} / mo
            </p>
          </div>
        )}
      </div>

      {/* Timeline bar */}
      <div className="relative mx-2">
        {/* Track */}
        <div className="h-2 bg-boost-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-boost-green-light/70 rounded-full transition-all"
            style={{
              width: ready ? "100%" : "0%",
              transitionDuration: "2000ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "300ms",
            }}
          />
        </div>

        {/* Month markers */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: months }).map((_, i) => (
            <span key={i} className="text-[8px] text-boost-muted/50 tabular-nums">
              {i + 1}
            </span>
          ))}
        </div>

        {/* Break-even marker */}
        <div
          className="absolute top-0 -translate-x-1/2 transition-all"
          style={{
            left: `${((breakEvenMonths - 1) / (months - 1)) * 100}%`,
            opacity: ready ? 1 : 0,
            transform: `translateX(-50%) ${ready ? "translateY(0)" : "translateY(-4px)"}`,
            transitionDuration: "500ms",
            transitionDelay: `${300 + (breakEvenMonths / months) * 2000}ms`,
          }}
        >
          <div className="w-px h-8 bg-boost-purple/30 -mt-3" />
          <div className="bg-boost-purple/10 border border-boost-purple/20 rounded px-1.5 py-0.5 mt-0.5 whitespace-nowrap">
            <p className="text-[8px] font-semibold text-boost-purple">Break-even</p>
            <p className="text-[7px] text-boost-muted">Month {breakEvenMonths}</p>
          </div>
        </div>
      </div>

      {/* Supporting metrics */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="text-center">
          <p className="text-lg font-bold text-boost-dark tabular-nums">{breakEvenMonths} mo</p>
          <p className="text-[10px] text-boost-muted">Break-even</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-boost-dark tabular-nums">{fmt(monthlySavings)}</p>
          <p className="text-[10px] text-boost-muted">Monthly savings</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  MAIN SECTION
 * ═══════════════════════════════════════════════════════════════════ */

export default function ImpactSection({ guide, sectionNumber }: { guide: GuideData; sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [activeTab, setActiveTab] = useState<TabId>("csat");

  // Dynamic data — prefer the 2026 pricing invoice when available so
  // the savings math (current - boost.ai = savings) quotes the same
  // boost.ai cost as the Commercial Offer invoice.
  const ig = guide.integrations ?? {};
  const integrationCount =
    (ig.channel?.length || 0) + (ig.human_handover?.length || 0) +
    (ig.openid?.length || 0) + (ig.utility?.length || 0) + (ig.voice?.length || 0);
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
  const costNum = parseConversationCost(guide.conversation_cost, 8);
  const agents = getAgentsForGuide(guide.areas_of_interest, guide.selected_variants);
  const avgRate = agents.length > 0
    ? Math.round(agents.reduce((s, a) => s + a.automationRate, 0) / agents.length) : 80;

  const currency = resolveCurrency(guide.currency, guide.conversation_cost);
  const roi = useMemo(() => calculateROI({
    monthlyConversations: vol,
    costPerConversation: costNum,
    pricingModel: guide.pricing_model || "fixed",
    automationRate: avgRate,
    markets: guide.deployment_markets || 1,
    currency,
    fteCapacityPerMonth: guide.fte_capacity_per_month,
    automationRampMonths: guide.automation_ramp_months,
    invoiceMonthlyCostUSD: invoice?.monthlyUSD,
    invoiceImplementationUSD: invoice?.implementationOneTimeUSD,
  }), [vol, costNum, guide.pricing_model, avgRate, guide.deployment_markets, currency, guide.fte_capacity_per_month, guide.automation_ramp_months, invoice?.monthlyUSD, invoice?.implementationOneTimeUSD]);

  const fmt = (n: number) => formatWithCurrency(n, currency);

  // Tab descriptions
  const TAB_CONTENT: Record<TabId, { headline: string; sub: string }> = {
    csat: {
      headline: "The CSAT leap when customers don\u2019t wait",
      sub: "Instant resolution shifts the entire satisfaction distribution. Scores 4-5 jump from 30% to 80% of total responses.",
    },
    automation: {
      headline: `${Math.round(avgRate)}% of conversations resolved without a human`,
      sub: "The remaining conversations get a warm handover with full context \u2014 no cold transfers, no repeating the problem.",
    },
    data: {
      headline: "Every conversation becomes a data point",
      sub: "The analytics dashboard surfaces what your customers actually need \u2014 intents, sentiment, resolution rates, and volume patterns.",
    },
    commercial: {
      headline: `Path to ${fmt(roi.annualSavings)} in annual savings`,
      sub: `Based on ${vol.toLocaleString()} monthly conversations at ${fmt(costNum || 8)} per conversation.`,
    },
  };

  // fmt is defined above via detectCurrency + formatWithCurrency

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "09"}
        title="Business Impact"
        subtitle="What changes when AI handles your conversations"
      />

      <div
        ref={ref}
        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Tab row */}
        <div className="flex gap-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-boost-dark text-white"
                  : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface"
              }`}
            >
              <span className="text-[10px] opacity-60">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[380px]">
          {/* Headline + sub — changes per tab */}
          <div className="mb-4">
            <p className="text-lg font-semibold text-boost-dark leading-snug max-w-lg">
              {TAB_CONTENT[activeTab].headline}
            </p>
            <p className="text-sm text-boost-muted mt-2 max-w-md leading-relaxed">
              {TAB_CONTENT[activeTab].sub}
            </p>
          </div>

          {/* Visuals — each tab renders something genuinely different */}
          {activeTab === "csat" && <CSATDistribution active={activeTab === "csat"} />}
          {activeTab === "automation" && <AutomationFlow active={activeTab === "automation"} volume={vol} />}
          {activeTab === "data" && <MiniDashboard active={activeTab === "data"} />}
          {activeTab === "commercial" && (
            <SavingsTimeline
              active={activeTab === "commercial"}
              // When a ramp is set, the 3-bar tells the Year-1
              // truth (smaller-than-steady-state savings while
              // automation builds). When no ramp, year-1 ==
              // steady-state and these collapse to the original
              // values — so consumers without F3b see no change.
              annualSavings={roi.year1AverageMonthlySavings * 12}
              breakEvenMonths={roi.breakEvenMonths}
              currencySymbol={currency}
              currentMonthlyCost={roi.currentMonthlyCost}
              newMonthlyCost={roi.currentMonthlyCost - roi.year1AverageMonthlySavings}
              rampMonths={roi.rampMonths}
              steadyStateMonthlySavings={roi.monthlySavings}
            />
          )}
        </div>
      </div>
    </section>
  );
}

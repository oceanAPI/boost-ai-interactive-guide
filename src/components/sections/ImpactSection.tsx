"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ─────────────────────────────────────────────────────────────────────
 *  Business Impact — "What changes when AI handles your conversations"
 *
 *  Four tabs: CSAT, Automation, Data, Commercial. Each tab presents
 *  a single editorial insight with one visual focal point. No
 *  dashboard grids, no metric cards. Restraint is confidence.
 * ───────────────────────────────────────────────────────────────────── */

/* ─── Helpers ─── */

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
}

function parseCost(raw: string | undefined): number {
  return parseFloat(raw?.replace(/[^0-9.]/g, "") || "0") || 8;
}

function totalVolume(vols: GuideData["channel_volumes"]): number {
  return Object.values(vols).reduce((s, v) => s + (v || 0), 0);
}

/* ─── Tab definitions ─── */

type TabId = "csat" | "automation" | "data" | "commercial";

const TABS: { id: TabId; label: string }[] = [
  { id: "csat", label: "CSAT" },
  { id: "automation", label: "Automation" },
  { id: "data", label: "Data" },
  { id: "commercial", label: "Commercial" },
];

/* ─── Insight types for the Data tab ─── */

const DATA_INSIGHTS = [
  {
    label: "Intent trends",
    desc: "What customers ask about most, and how it shifts week to week.",
  },
  {
    label: "Sentiment shifts",
    desc: "Aggregate mood changes across channels, flagged before they escalate.",
  },
  {
    label: "Topic clusters",
    desc: "Conversations grouped by theme, revealing product or service gaps.",
  },
  {
    label: "Escalation patterns",
    desc: "Why, when, and where conversations require human intervention.",
  },
  {
    label: "Resolution rates",
    desc: "First-contact resolution tracked by agent, channel, and complexity.",
  },
  {
    label: "Peak-hour analysis",
    desc: "Volume patterns that inform staffing and routing decisions.",
  },
];

/* ─── CSAT visual: satisfaction scale with animated pointer ─── */

function CSATScale({ active }: { active: boolean }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const prevActiveRef = useRef(false);

  // Reset animation state when tab becomes active so it replays
  useEffect(() => {
    if (active && !prevActiveRef.current) {
      setHasAnimated(false);
      const timer = setTimeout(() => setHasAnimated(true), 80);
      return () => clearTimeout(timer);
    }
    prevActiveRef.current = active;
  }, [active]);

  const markers = [1, 2, 3, 4, 5];
  const beforePos = ((3.2 - 1) / 4) * 100; // percentage along the scale
  const afterPos = ((4.6 - 1) / 4) * 100;

  return (
    <div className="py-6">
      {/* Scale track */}
      <div className="relative h-2 bg-boost-surface rounded-full mx-6">
        {/* Filled region: before to after */}
        <div
          className="absolute top-0 h-full rounded-full bg-boost-green-light/20 transition-all"
          style={{
            left: `${beforePos}%`,
            width: hasAnimated ? `${afterPos - beforePos}%` : "0%",
            transitionDuration: "1200ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: "400ms",
          }}
        />

        {/* Marker dots */}
        {markers.map((n) => {
          const pos = ((n - 1) / 4) * 100;
          return (
            <div
              key={n}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${pos}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-boost-border" />
            </div>
          );
        })}

        {/* "Before" pointer */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
          style={{
            left: `${beforePos}%`,
            opacity: hasAnimated ? 1 : 0,
            transitionDuration: "500ms",
            transitionDelay: "200ms",
          }}
        >
          <div className="w-4 h-4 rounded-full bg-boost-muted/30 border-2 border-boost-muted/50" />
        </div>

        {/* "After" pointer — animates from before to after position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all"
          style={{
            left: hasAnimated ? `${afterPos}%` : `${beforePos}%`,
            opacity: hasAnimated ? 1 : 0,
            transitionDuration: "1200ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: "400ms",
          }}
        >
          <div className="w-5 h-5 rounded-full bg-boost-green border-2 border-white shadow-md shadow-boost-green/20" />
        </div>
      </div>

      {/* Scale labels */}
      <div className="relative mx-6 mt-3">
        {markers.map((n) => {
          const pos = ((n - 1) / 4) * 100;
          return (
            <span
              key={n}
              className="absolute -translate-x-1/2 text-[10px] text-boost-muted/60 tabular-nums"
              style={{ left: `${pos}%` }}
            >
              {n}
            </span>
          );
        })}
      </div>

      {/* Before / After legend */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <div
          className="flex items-center gap-2 transition-all"
          style={{
            opacity: hasAnimated ? 1 : 0,
            transitionDuration: "400ms",
            transitionDelay: "300ms",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-boost-muted/30 border border-boost-muted/50" />
          <span className="text-[11px] text-boost-muted">
            Before <span className="font-semibold tabular-nums">3.2</span>
          </span>
        </div>
        <div
          className="flex items-center gap-2 transition-all"
          style={{
            opacity: hasAnimated ? 1 : 0,
            transitionDuration: "400ms",
            transitionDelay: "1400ms",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-boost-green border border-white shadow-sm" />
          <span className="text-[11px] text-boost-dark font-medium">
            After <span className="font-semibold tabular-nums">4.6</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Automation visual: stacked horizontal bar ─── */

function AutomationBar({ active }: { active: boolean }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      setHasAnimated(false);
      const timer = setTimeout(() => setHasAnimated(true), 80);
      return () => clearTimeout(timer);
    }
    prevActiveRef.current = active;
  }, [active]);

  return (
    <div className="py-6">
      {/* Bar */}
      <div className="h-10 rounded-lg overflow-hidden bg-boost-surface flex">
        <div
          className="h-full bg-boost-green/90 flex items-center transition-all"
          style={{
            width: hasAnimated ? "80%" : "0%",
            transitionDuration: "1000ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transitionDelay: "300ms",
          }}
        >
          <span
            className="pl-3 text-[11px] font-semibold text-white whitespace-nowrap transition-opacity"
            style={{
              opacity: hasAnimated ? 1 : 0,
              transitionDuration: "300ms",
              transitionDelay: "900ms",
            }}
          >
            AI-resolved
          </span>
        </div>
        <div className="h-full flex-1 flex items-center">
          <span
            className="pl-3 text-[11px] font-medium text-boost-purple whitespace-nowrap transition-opacity"
            style={{
              opacity: hasAnimated ? 1 : 0,
              transitionDuration: "300ms",
              transitionDelay: "1100ms",
            }}
          >
            Human
          </span>
        </div>
      </div>

      {/* Percentage labels */}
      <div className="flex justify-between mt-2.5">
        <span
          className="text-[11px] font-semibold text-boost-green tabular-nums transition-opacity"
          style={{
            opacity: hasAnimated ? 1 : 0,
            transitionDuration: "300ms",
            transitionDelay: "1000ms",
          }}
        >
          80%
        </span>
        <span
          className="text-[11px] font-medium text-boost-purple tabular-nums transition-opacity"
          style={{
            opacity: hasAnimated ? 1 : 0,
            transitionDuration: "300ms",
            transitionDelay: "1200ms",
          }}
        >
          20%
        </span>
      </div>
    </div>
  );
}

/* ─── Data visual: sequential insight list ─── */

function DataInsightList({ active }: { active: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      setVisibleCount(0);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= DATA_INSIGHTS.length) clearInterval(interval);
      }, 140);
      return () => clearInterval(interval);
    }
    prevActiveRef.current = active;
  }, [active]);

  return (
    <div className="py-4 space-y-0">
      {DATA_INSIGHTS.map((insight, i) => (
        <div
          key={insight.label}
          className="flex items-start gap-3 py-2.5 border-b border-boost-border/40 last:border-b-0 transition-all"
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
            transitionDuration: "350ms",
          }}
        >
          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-boost-green-light" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-boost-dark leading-tight">
              {insight.label}
            </p>
            <p className="text-[12px] text-boost-muted leading-relaxed mt-0.5">
              {insight.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Commercial visual: side-by-side cost comparison ─── */

function CostComparison({
  active,
  currentMonthly,
  projectedMonthly,
}: {
  active: boolean;
  currentMonthly: number;
  projectedMonthly: number;
}) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      setHasAnimated(false);
      const timer = setTimeout(() => setHasAnimated(true), 80);
      return () => clearTimeout(timer);
    }
    prevActiveRef.current = active;
  }, [active]);

  const currentCount = useCountUp({
    target: currentMonthly,
    enabled: hasAnimated,
    duration: 1000,
  });

  const projectedCount = useCountUp({
    target: projectedMonthly,
    enabled: hasAnimated,
    duration: 1000,
  });

  const savings = currentMonthly - projectedMonthly;
  const savingsPercent = currentMonthly > 0 ? Math.round((savings / currentMonthly) * 100) : 0;

  return (
    <div className="py-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Current cost */}
        <div
          className="rounded-xl bg-boost-surface p-5 transition-all"
          style={{
            opacity: hasAnimated ? 1 : 0,
            transform: hasAnimated ? "translateY(0)" : "translateY(10px)",
            transitionDuration: "500ms",
            transitionDelay: "200ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.12em] mb-3">
            Current monthly
          </p>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">
            {formatCurrency(currentCount)}
          </p>
        </div>

        {/* Projected cost */}
        <div
          className="rounded-xl bg-boost-green-light/5 border border-boost-green-light/15 p-5 transition-all"
          style={{
            opacity: hasAnimated ? 1 : 0,
            transform: hasAnimated ? "translateY(0)" : "translateY(10px)",
            transitionDuration: "500ms",
            transitionDelay: "400ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-green uppercase tracking-[0.12em] mb-3">
            With boost.ai
          </p>
          <p className="text-2xl font-bold text-boost-green tabular-nums">
            {formatCurrency(projectedCount)}
          </p>
        </div>
      </div>

      {/* Savings callout */}
      <div
        className="mt-4 flex items-center gap-2 transition-all"
        style={{
          opacity: hasAnimated ? 1 : 0,
          transitionDuration: "400ms",
          transitionDelay: "800ms",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light" />
        <p className="text-[12px] text-boost-muted">
          Projected saving of{" "}
          <span className="font-semibold text-boost-dark">
            {formatCurrency(savings)}/month
          </span>{" "}
          — a{" "}
          <span className="font-semibold text-boost-dark">{savingsPercent}%</span>{" "}
          reduction
        </p>
      </div>
    </div>
  );
}

/* ─── Main section component ─── */

export default function ImpactSection({ guide }: { guide: GuideData }) {
  const { ref: sectionRef, isVisible } = useScrollReveal({ once: true });
  const [activeTab, setActiveTab] = useState<TabId>("csat");
  const [displayedTab, setDisplayedTab] = useState<TabId>("csat");
  const [isFading, setIsFading] = useState(false);

  /* Cross-fade tab transition */
  const handleTabSwitch = (id: TabId) => {
    if (id === activeTab) return;
    setIsFading(true);
    setTimeout(() => {
      setDisplayedTab(id);
      setActiveTab(id);
      setIsFading(false);
    }, 200);
  };

  /* Derive volume / cost data for Automation + Commercial tabs */
  const vol = totalVolume(guide.channel_volumes);
  const hasVolume = vol > 0;
  const monthlyVolume = hasVolume ? vol : 10_000;
  const costPerConv = parseCost(guide.conversation_cost);
  const currentMonthly = monthlyVolume * costPerConv;
  const projectedMonthly = Math.round(
    monthlyVolume * 0.2 * costPerConv + monthlyVolume * 0.8 * 0.5,
  ); // 20% human at full cost + 80% AI at ~$0.50

  const monthlySavings = currentMonthly - projectedMonthly;

  /* Tab content map */
  const tabContent: Record<TabId, {
    headline: React.ReactNode;
    visual: React.ReactNode;
    supporting: React.ReactNode;
  }> = {
    csat: {
      headline: (
        <p className="text-lg sm:text-xl text-boost-dark leading-relaxed max-w-xl">
          From <span className="font-bold tabular-nums">3.2</span> to{" "}
          <span className="font-bold tabular-nums">4.6</span> — the CSAT leap
          when customers don&apos;t wait.
        </p>
      ),
      visual: <CSATScale active={displayedTab === "csat" && isVisible} />,
      supporting: (
        <p className="text-sm text-boost-muted leading-relaxed max-w-lg">
          Instant resolution drives satisfaction more than any other factor.
          When the AI understands intent in the first message and resolves
          without transfers, customers notice — and their scores reflect it.
        </p>
      ),
    },

    automation: {
      headline: (
        <p className="text-lg sm:text-xl text-boost-dark leading-relaxed max-w-xl">
          <span className="font-bold">80% of conversations</span> resolved
          without a human in the loop.
        </p>
      ),
      visual: <AutomationBar active={displayedTab === "automation" && isVisible} />,
      supporting: (
        <p className="text-sm text-boost-muted leading-relaxed max-w-lg">
          {hasVolume ? (
            <>
              At{" "}
              <span className="font-medium text-boost-dark">
                {monthlyVolume.toLocaleString()} monthly conversations
              </span>
              , that means roughly{" "}
              <span className="font-medium text-boost-dark">
                {Math.round(monthlyVolume * 0.8).toLocaleString()}
              </span>{" "}
              handled end-to-end by AI.{" "}
            </>
          ) : (
            <>
              For a typical operation, that means thousands of interactions
              handled end-to-end by AI every month.{" "}
            </>
          )}
          The remaining 20% aren&apos;t cold transfers — they&apos;re warm
          handovers with full context, so the agent picks up exactly where the
          AI left off.
        </p>
      ),
    },

    data: {
      headline: (
        <p className="text-lg sm:text-xl text-boost-dark leading-relaxed max-w-xl">
          Every conversation becomes a{" "}
          <span className="font-bold">data point</span>, not a dead end.
        </p>
      ),
      visual: <DataInsightList active={displayedTab === "data" && isVisible} />,
      supporting: (
        <p className="text-sm text-boost-muted leading-relaxed max-w-lg">
          The analytics dashboard surfaces patterns that live agents
          can&apos;t report at scale — from emerging intent spikes to
          sentiment trends that predict churn before it happens.
        </p>
      ),
    },

    commercial: {
      headline: (
        <p className="text-lg sm:text-xl text-boost-dark leading-relaxed max-w-xl">
          A projected{" "}
          <span className="font-bold">
            {formatCurrency(monthlySavings)} saved every month
          </span>{" "}
          — cost that moves from overhead to investment.
        </p>
      ),
      visual: (
        <CostComparison
          active={displayedTab === "commercial" && isVisible}
          currentMonthly={currentMonthly}
          projectedMonthly={projectedMonthly}
        />
      ),
      supporting: (
        <p className="text-sm text-boost-muted leading-relaxed max-w-lg">
          Most deployments reach break-even within{" "}
          <span className="font-medium text-boost-dark">3-4 months</span>.
          After that, savings compound — especially as the AI improves
          through continuous learning and your automation rate climbs further.
        </p>
      ),
    },
  };

  const current = tabContent[displayedTab];

  return (
    <section>
      <SectionHeader
        number="09"
        title="Business Impact"
        subtitle="What changes when AI handles your conversations"
      />

      <div ref={sectionRef}>
        {/* ── Tab bar ── */}
        <div
          className={`flex gap-1 mb-0 transition-all duration-600 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`relative px-5 py-3 rounded-t-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-white text-boost-dark shadow-sm z-10"
                  : "bg-boost-surface/60 text-boost-muted hover:text-boost-dark hover:bg-boost-surface"
              }`}
              style={{
                transitionDelay: isVisible ? `${150 + i * 60}ms` : "0ms",
              }}
            >
              {tab.label}
              {/* Active indicator */}
              <span
                className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-boost-green-light"
                    : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </div>

        {/* ── Content panel ── */}
        <div
          className={`bg-white rounded-b-2xl rounded-tr-2xl border border-boost-border/50 border-t-0 shadow-sm transition-all duration-600 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div
            className="p-6 sm:p-8 lg:p-10 transition-opacity"
            style={{
              opacity: isFading ? 0 : 1,
              transitionDuration: "200ms",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left — editorial content */}
              <div className="space-y-5">
                {current.headline}
                <div className="lg:hidden">{current.visual}</div>
                {current.supporting}
              </div>

              {/* Right — visual (visible on lg+) */}
              <div className="hidden lg:block">
                <div className="h-full flex flex-col justify-center">
                  {current.visual}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Closing editorial ── */}
        <p
          className={`text-sm text-boost-muted mt-10 max-w-xl leading-relaxed transition-all duration-600 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "500ms" }}
        >
          These numbers aren&apos;t projections in isolation — they compound.
          Higher automation lifts CSAT, richer data improves routing, and
          lower cost per conversation funds the next phase of rollout.
        </p>
      </div>
    </section>
  );
}

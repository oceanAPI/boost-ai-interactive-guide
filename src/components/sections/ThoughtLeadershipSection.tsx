"use client";

/* ──────────────────────────────────────────────────────────────
 *  ThoughtLeadershipSection — "The state of conversational AI"
 *
 *  The narrative spine of the engagement, modelled on the reference
 *  deck. It opens on a DYNAMIC snapshot of where this customer is
 *  today, then the four-challenge header (deck slide 3), then walks
 *  each challenge as its own chapter following one consistent arc:
 *
 *    stat → boost data story → success stories → your benchmark →
 *    how the transition looks for you → go deeper into the section
 *
 *  Agentic + Orchestration are combined into one fuller "Agentic
 *  Adoption" chapter (with roadmap items); the other three each fill
 *  the section as their own chapter. Each chapter links into its
 *  dedicated deep-dive section (Personalisation, Revenue, etc.).
 *
 *  Reads `customer.thought_leadership` to override the per-chapter
 *  hero stat/narrative by position; chapter body content comes from
 *  STORY_CHAPTERS.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer } from "@/lib/types";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  STORY_CHAPTERS,
  type StoryChapter,
  type ChapterIcon,
  type ChapterUseCase,
  type UseCaseTranscript,
  type ChapterBenchmark,
  type BenchmarkInstance,
  type ChapterImpact,
  type ImpactRankRow,
  type ChannelProfile,
} from "@/data/thought-leadership";
import { getSuccessStory, toCaseStudy } from "@/data/success-stories";
import { getItem as getRoadmapItem, FOCUS_AREAS, type RoadmapItem } from "@/data/product-roadmap-2026";

interface ThoughtLeadershipSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/* ─── Challenge line-icons (deck slide 3) ──────────────────────── */
function ChallengeGlyph({ icon, className }: { icon: ChapterIcon; className?: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "agentic":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <rect x="4" y="8" width="12" height="9" rx="2" />
          <circle cx="8" cy="12.5" r="1" /><circle cx="12" cy="12.5" r="1" />
          <path d="M10 8V5M8 17h4" />
          <path d="M18.5 3.5l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L15 5.7l2-.3z" />
        </svg>
      );
    case "personalised":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <rect x="3" y="5" width="18" height="11" rx="1.5" />
          <path d="M9 20h6M12 16v4" />
          <path d="M8 10.5h2M14 10.5h2M11 8.5l-1 4" />
        </svg>
      );
    case "sales":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <path d="M4 18V14M9 18V11M14 18V8" />
          <path d="M4 11l5-5 4 3 6-6M16 3h4v4" />
        </svg>
      );
    case "channels":
      return (
        <svg viewBox="0 0 24 24" className={className} {...p}>
          <path d="M6 4.5c-1.5 0-2 1-2 2 0 6 5 11 11 11 1 0 2-.5 2-2v-2l-3.5-1.5-1.5 2c-2-1-3.5-2.5-4.5-4.5l2-1.5L8 4.5z" />
          <path d="M16 4a5 5 0 0 1 4 4M16 7a2 2 0 0 1 1.5 1.5" />
        </svg>
      );
  }
}

/* ─── Dynamic customer snapshot ────────────────────────────────── */
function snapshot(c?: Customer): { eyebrow: string; headline: string; highlight?: string; sub?: string } {
  const name = c?.company_name?.trim() || "Your organisation";
  const auto = c?.performance?.automation_rate;
  const recs = c?.recommendations ?? [];
  const inits = c?.accepted_initiatives?.length ?? 0;
  const topRec = recs[0]?.title;

  if (auto != null) {
    const headline =
      auto >= 80
        ? `${name} already resolves ${auto}% of conversations without a human.`
        : `${name} resolves ${auto}% of conversations without a human today — and there's clear headroom to go further.`;
    const moves =
      recs.length > 0
        ? `${recs.length} prioritised move${recs.length === 1 ? "" : "s"}${topRec ? ` — starting with "${topRec}"` : ""} could push that further.`
        : inits > 0
          ? `${inits} committed initiative${inits === 1 ? "" : "s"} are set to push that further.`
          : undefined;
    return { eyebrow: "Where you are today", headline, highlight: `${auto}%`, sub: moves };
  }

  return {
    eyebrow: "Where you are today",
    headline: `${name} is at the start of the agentic shift — and the next four moves define the trajectory.`,
    sub:
      topRec != null
        ? `Starting with "${topRec}".`
        : "Four core challenges shape what comes next.",
  };
}

/* Render a headline, colouring the highlighted token (e.g. "66%") green. */
function HeadlineWithHighlight({ headline, highlight }: { headline: string; highlight?: string }) {
  if (!highlight || !headline.includes(highlight)) return <>{headline}</>;
  const parts = headline.split(highlight);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <span className="font-bold text-boost-green-light">{highlight}</span>}
        </span>
      ))}
    </>
  );
}

/* ─── Hero drill-down tiles ──────────────────────────────────────
 *  The "where you are today" snapshot, made visual: a glanceable strip
 *  of the customer's live position read straight off `performance`, with
 *  trend deltas vs the previous window and mini progress bars where a
 *  percentage tells a story. Empty when no performance data is set. */
interface SnapTile {
  key: string;
  label: string;
  value: string;
  /** 0–100 fill for a mini progress bar (percentage metrics only). */
  bar?: number;
  /** Pre-formatted delta vs previous window, e.g. "+6 pp". */
  delta?: string;
  /** Whether the delta is a good move (green) or not (gold). */
  good?: boolean;
  /** Arrow direction for the delta chip. */
  up?: boolean;
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

function snapshotTiles(c?: Customer): SnapTile[] {
  const p = c?.performance;
  if (!p) return [];
  const tiles: SnapTile[] = [];
  const diff = (cur?: number, prev?: number) =>
    cur != null && prev != null ? Math.round((cur - prev) * 10) / 10 : undefined;
  const ppDelta = (d?: number) => (d != null ? `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)} pp` : undefined);

  if (p.automation_rate != null) {
    const d = diff(p.automation_rate, p.previous_automation_rate);
    tiles.push({ key: "automation", label: "Automation rate", value: `${p.automation_rate}%`, bar: p.automation_rate, delta: ppDelta(d), good: d == null ? undefined : d >= 0, up: d == null ? undefined : d >= 0 });
  }
  if (p.csat_score != null) {
    const d = diff(p.csat_score, p.previous_csat_score);
    tiles.push({ key: "csat", label: "CSAT", value: `${p.csat_score}`, delta: d != null ? `${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)}` : undefined, good: d == null ? undefined : d >= 0, up: d == null ? undefined : d >= 0 });
  }
  if (p.escalation_rate != null) {
    const d = diff(p.escalation_rate, p.previous_escalation_rate);
    tiles.push({ key: "escalation", label: "Escalations", value: `${p.escalation_rate}%`, bar: p.escalation_rate, delta: ppDelta(d), good: d == null ? undefined : d <= 0, up: d == null ? undefined : d > 0 });
  }
  if (p.monthly_conversations != null) {
    const d = diff(p.monthly_conversations, p.previous_monthly_conversations);
    tiles.push({ key: "volume", label: "Conversations / mo", value: fmtCount(p.monthly_conversations), delta: d != null && d !== 0 ? `${d > 0 ? "+" : "−"}${fmtCount(Math.abs(d))}` : undefined, good: d == null ? undefined : d >= 0, up: d == null ? undefined : d >= 0 });
  }
  if (p.markets_live != null) {
    tiles.push({ key: "markets", label: "Markets live", value: `${p.markets_live}` });
  }
  if (p.active_agents != null) {
    tiles.push({ key: "agents", label: "Agents in production", value: `${p.active_agents}` });
  }
  return tiles.slice(0, 6);
}

function DeltaChip({ delta, good, up }: { delta: string; good?: boolean; up?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${good === false ? "text-boost-gold" : "text-boost-green-light"}`}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={up ? "" : "rotate-180"}>
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
      {delta}
    </span>
  );
}

/* ─── Hero ring (deck donut) ───────────────────────────────────── */
function HeroRing({ stat, label, size = 116 }: { stat: string; label?: string; size?: number }) {
  const numeric = parseFloat(stat);
  const pct = Number.isFinite(numeric) && stat.includes("%") ? Math.min(100, numeric) : 70;
  const sw = 7, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const { ref, isVisible } = useScrollReveal({ once: true });
  return (
    <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
      <div ref={ref} className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={sw} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#36b595" strokeWidth={sw} strokeLinecap="round"
            style={{ strokeDasharray: c, strokeDashoffset: isVisible ? c - (pct / 100) * c : c, transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-white tabular-nums" style={{ fontSize: size > 100 ? "1.5rem" : "1.25rem" }}>{stat}</span>
      </div>
      {label && <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{label}</span>}
    </div>
  );
}

/* ─── Use-case chat before/after ("see it in action") ─────────────
 *  The same request, handled today vs going forward — side by side. */
function ChatColumn({
  variant, transcript,
}: { variant: "today" | "future"; transcript: UseCaseTranscript }) {
  const future = variant === "future";
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border ${future ? "border-boost-green/30" : "border-boost-border"}`}>
      <div className={`px-4 py-2 ${future ? "bg-boost-green/8" : "bg-boost-surface"}`}>
        <p className={`text-[11px] font-bold uppercase tracking-[0.12em] ${future ? "text-boost-green" : "text-boost-muted"}`}>
          {future ? "Going forward" : "Today"}
        </p>
      </div>
      <div className="flex-1 space-y-2.5 bg-boost-card p-3.5">
        {transcript.messages.map((m, i) =>
          m.from === "agent" ? (
            <div key={i} className="flex gap-2">
              <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${future ? "bg-boost-purple/10 text-boost-purple" : "bg-boost-muted/15 text-boost-muted"}`}>AI</span>
              <p className={`max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-1.5 text-[12.5px] leading-relaxed ${future ? "bg-boost-surface text-boost-dark" : "bg-boost-surface text-boost-text-secondary"}`}>{m.text}</p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className={`max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-1.5 text-[12.5px] leading-relaxed ${future ? "bg-boost-green text-white" : "bg-boost-lavender/40 text-boost-dark"}`}>{m.text}</p>
            </div>
          ),
        )}
      </div>
      {transcript.outcome && (
        <div className={`flex items-start gap-2 border-t px-3.5 py-2.5 ${future ? "border-boost-green/20 bg-boost-green/5" : "border-boost-border bg-boost-surface"}`}>
          {future ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#208269" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7a6b80" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><path d="M18 6L6 18M6 6l12 12" /></svg>
          )}
          <p className={`text-[12.5px] leading-snug ${future ? "font-medium text-boost-dark" : "text-boost-muted"}`}>{transcript.outcome}</p>
        </div>
      )}
    </div>
  );
}

function UseCaseDemo({ useCase }: { useCase: ChapterUseCase }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-boost-border">
      <div className="border-b border-boost-border bg-boost-surface px-4 py-2.5">
        <p className="text-[13px] font-semibold text-boost-dark">{useCase.label}</p>
        <p className="text-xs text-boost-muted mt-0.5 leading-snug">{useCase.scenario}</p>
      </div>
      <div className="grid gap-3 p-3.5 sm:grid-cols-2">
        <ChatColumn variant="today" transcript={useCase.today} />
        <ChatColumn variant="future" transcript={useCase.future} />
      </div>
    </div>
  );
}

/* ─── Live benchmark visuals (deck slides 7 / 12 / 35) ────────────
 *  Three shapes share the "Where you stand" frame:
 *    • distribution — the slide-7 cohort: every anonymised instance as
 *      its own full bar, sorted, with the customer highlighted and a
 *      cohort-average line across.
 *    • bars — a small set of named full bars (you vs peers vs leaders).
 *    • channels — per-channel you-vs-peer full bars.
 *  The dataset chip is the placeholder for the future dataset-filter. */

function FilterChip({ dataset }: { dataset: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-boost-purple/20 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-purple">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 9v6l-4 2v-8z" /></svg>
      {dataset}
    </span>
  );
}

/* Slide-7 cohort distribution — every anonymised instance as a full bar,
 *  sorted high→low, the customer highlighted, a cohort-average line over.
 *  Instance values are deck-modelled placeholders; they'll be fetched
 *  live per instance later and stay anonymised. */
function DistributionChart({
  distribution, average, unit, youValue, cohortLabel = "Anonymised peer instances",
}: { distribution: BenchmarkInstance[]; average?: number; unit: string; youValue?: number; cohortLabel?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const data = distribution.map((d) =>
    d.isYou && typeof youValue === "number" ? { ...d, value: youValue } : d,
  );
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(100, ...sorted.map((d) => d.value));

  return (
    <div ref={ref}>
      <div className="relative h-44 sm:h-52">
        {/* cohort-average line */}
        {average != null && (
          <div className="absolute inset-x-0 z-10 flex items-center" style={{ bottom: `${(average / max) * 100}%` }}>
            <div className="h-[2px] flex-1 rounded-full bg-boost-green" />
            <span className="ml-2 whitespace-nowrap rounded-full bg-boost-green px-2 py-0.5 text-[10px] font-bold text-white">Average {average}{unit}</span>
          </div>
        )}
        <div className="flex h-full items-end gap-[3px]">
          {sorted.map((d, i) => (
            <div key={d.label} className="group relative flex h-full flex-1 flex-col items-center justify-end" title={`${d.isYou ? "Your instance" : d.label}: ${d.value}${unit}`}>
              {d.isYou && (
                <span className="mb-1 whitespace-nowrap text-[10px] font-bold tabular-nums text-boost-green">{d.value}{unit}</span>
              )}
              <div
                className={`w-full rounded-t-sm ${d.isYou ? "bg-boost-green-light" : "bg-boost-purple/25 group-hover:bg-boost-purple/40"} transition-colors`}
                style={{ height: isVisible ? `${(d.value / max) * 100}%` : 0, transition: `height 0.9s ease-out ${i * 35}ms` }}
              />
              {d.isYou && <span className="mt-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-wide text-boost-green">You</span>}
            </div>
          ))}
        </div>
      </div>
      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-boost-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-boost-green-light" />Your instance</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-boost-purple/25" />{cohortLabel}</span>
        {average != null && <span className="inline-flex items-center gap-1.5"><span className="h-[2px] w-4 rounded-full bg-boost-green" />Cohort average</span>}
      </div>
    </div>
  );
}

function ChapterBenchmarkViz({ benchmark, customer }: { benchmark: ChapterBenchmark; customer?: Customer }) {
  const unit = benchmark.unit ?? "%";
  const live = benchmark.youFromPerformance ? customer?.performance?.[benchmark.youFromPerformance] : undefined;

  return (
    <div className="rounded-2xl border border-boost-purple/15 bg-boost-purple/5 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted">Where you stand</p>
          <p className="text-sm font-semibold text-boost-dark mt-0.5">{benchmark.title}</p>
        </div>
        {benchmark.dataset && <FilterChip dataset={benchmark.dataset} />}
      </div>

      <DistributionChart
        distribution={benchmark.distribution}
        average={benchmark.average}
        unit={unit}
        youValue={typeof live === "number" ? live : undefined}
        cohortLabel={benchmark.cohortLabel}
      />

      {benchmark.note && <p className="mt-3 text-xs leading-relaxed text-boost-muted">{benchmark.note}</p>}
    </div>
  );
}

/* ─── NLU → LLM impact ("why this matters") ──────────────────────
 *  Paired before/after bars per metric — the same chart language as
 *  "Where you stand", showing the uplift from moving NLU-based flows to
 *  LLM-based agentic answers. */
/* Slide-15 ranking variant — horizontal bars on a shared scale, the
 *  best/worst rows tinted to carry the "why this matters" punchline. */
function ImpactRanking({ impact }: { impact: ChapterImpact }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const rows = impact.ranking ?? [];
  const unit = impact.unit ?? "";
  const max = impact.scaleMax ?? Math.max(...rows.map((r) => r.value), 1);
  const fill = (tone?: ImpactRankRow["tone"]) =>
    tone === "best" ? "bg-boost-green-light" : tone === "worst" ? "bg-boost-gold/70" : "bg-boost-purple/30";
  const text = (tone?: ImpactRankRow["tone"]) =>
    tone === "best" ? "text-boost-green" : tone === "worst" ? "text-boost-gold" : "text-boost-dark";

  return (
    <div ref={ref} className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className={`text-xs leading-snug ${r.tone === "best" || r.tone === "worst" ? "font-bold" : "font-medium"} text-boost-dark`}>{r.label}</span>
            </div>
            <div className="h-5 overflow-hidden rounded-md bg-boost-surface">
              <div
                className={`h-full rounded-md ${fill(r.tone)}`}
                style={{ width: isVisible ? `${(r.value / max) * 100}%` : 0, transition: `width 0.9s ease-out ${i * 70}ms` }}
              />
            </div>
          </div>
          <span className={`text-sm font-bold tabular-nums ${text(r.tone)}`}>{r.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function ImpactChart({ impact }: { impact: ChapterImpact }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const unit = impact.unit ?? "%";
  const metrics = impact.metrics ?? [];
  const isRanking = !!impact.ranking?.length;
  const max = metrics.length ? Math.max(100, ...metrics.flatMap((m) => [m.nlu, m.llm])) : 100;

  return (
    <div className="rounded-2xl border border-boost-purple/15 bg-boost-purple/5 p-4 sm:p-5">
      <div className="mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted">Why this matters</p>
        <p className="text-sm font-semibold text-boost-dark mt-0.5">{impact.title}</p>
      </div>

      {isRanking ? (
        <ImpactRanking impact={impact} />
      ) : (
        <>
          <div ref={ref} className="flex items-stretch justify-around gap-2 sm:gap-4">
            {metrics.map((m, gi) => (
              <div key={m.metric} className="flex flex-1 flex-col items-center">
                <div className="flex h-40 w-full items-end justify-center gap-1.5 sm:h-48">
                  <div className="flex h-full w-7 flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-semibold tabular-nums text-boost-muted">{m.nlu}{unit}</span>
                    <div className="w-full rounded-t-sm bg-boost-purple/25" style={{ height: isVisible ? `${(m.nlu / max) * 100}%` : 0, transition: `height 0.9s ease-out ${gi * 60}ms` }} />
                  </div>
                  <div className="flex h-full w-7 flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-bold tabular-nums text-boost-green">{m.llm}{unit}</span>
                    <div className="w-full rounded-t-sm bg-boost-green-light" style={{ height: isVisible ? `${(m.llm / max) * 100}%` : 0, transition: `height 0.9s ease-out ${gi * 60 + 120}ms` }} />
                  </div>
                </div>
                <span className="mt-2 text-center text-[11px] font-medium leading-snug text-boost-dark">{m.metric}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-boost-muted">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-boost-purple/25" />NLU-based (before)</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-boost-green-light" />LLM-based (now)</span>
          </div>
        </>
      )}

      {impact.note && <p className="mt-3 text-xs leading-relaxed text-boost-muted">{impact.note}</p>}
      {impact.source && <p className="mt-2 text-[11px] italic text-boost-muted">{impact.source}</p>}
    </div>
  );
}

/* ─── Channel-mix profile ("our story", deck slide 40) ────────────
 *  The customer's inquiry mix told as a single living picture: a
 *  proportional segmented bar of where traffic sits, per-channel
 *  automation read-outs, and a today→target automation gauge. Less
 *  text, one glanceable shape. */
const CHANNEL_FILL = ["bg-boost-purple", "bg-boost-green-light", "bg-boost-lavender"];
const CHANNEL_DOT = ["#59195d", "#36b595", "#b7a3c9"];

function ChannelProfileViz({ profile, customer }: { profile: ChannelProfile; customer?: Customer }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const liveTotal = profile.totalFromPerformance ? customer?.performance?.[profile.totalFromPerformance] : undefined;
  const total = typeof liveTotal === "number" ? liveTotal : profile.totalAutomation;
  const target = profile.targetAutomation;

  return (
    <div ref={ref} className="rounded-2xl border border-boost-border bg-boost-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted">Where your traffic sits</p>
          <p className="text-sm font-semibold text-boost-dark mt-0.5">{profile.title}</p>
        </div>
        {profile.dataset && <FilterChip dataset={profile.dataset} />}
      </div>

      {/* Proportional mix bar */}
      <div className="flex h-8 w-full overflow-hidden rounded-lg">
        {profile.channels.map((c, i) => (
          <div
            key={c.channel}
            className={`flex items-center justify-center ${CHANNEL_FILL[i % CHANNEL_FILL.length]}`}
            style={{
              width: isVisible ? `${c.share}%` : "0%",
              transition: `width 1s ease-out ${i * 120}ms`,
            }}
          >
            <span className="text-[11px] font-bold text-white tabular-nums">{c.share}%</span>
          </div>
        ))}
      </div>

      {/* Per-channel cards — volume + automation today */}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {profile.channels.map((c, i) => (
          <div key={c.channel} className="rounded-xl border border-boost-border bg-white p-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHANNEL_DOT[i % CHANNEL_DOT.length] }} />
              <span className="text-xs font-semibold text-boost-dark">{c.channel}</span>
            </div>
            <p className="mt-1 text-[11px] tabular-nums text-boost-muted">{c.volume}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-boost-surface">
                <div className="h-full rounded-full bg-boost-green-light" style={{ width: isVisible ? `${Math.min(100, c.automation)}%` : 0, transition: `width 1s ease-out ${300 + i * 120}ms` }} />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-boost-dark">{c.automation}%</span>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-boost-muted">automated</p>
          </div>
        ))}
      </div>

      {/* Today → target automation gauge */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-boost-muted">Total automation today</span>
          <span className="text-[11px] font-semibold text-boost-green tabular-nums">Target {target}%</span>
        </div>
        <div className="relative mt-1.5 h-3 w-full overflow-hidden rounded-full bg-boost-purple/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-boost-purple to-boost-green-light"
            style={{ width: isVisible ? `${Math.min(100, total)}%` : 0, transition: "width 1.1s ease-out 200ms" }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums text-boost-dark"
            style={{ left: `calc(${Math.min(100, total)}% + 6px)` }}
          >
            {total}%
          </span>
        </div>
      </div>

      {profile.note && <p className="mt-3 text-xs leading-relaxed text-boost-muted">{profile.note}</p>}
    </div>
  );
}

/* ─── Proof point card ─────────────────────────────────────────────
 *  A single headline metric, animated in with a count-up feel via a
 *  growing accent rule, card-lift on hover, staggered reveal. The big
 *  number leads; the accent bar gives each card a living edge. */
/* Three rotating accent palettes — each proof card in a row gets its own
 *  colour so the row reads as three distinct mini-stories. */
const PROOF_ACCENTS = [
  { bar: "bg-boost-green-light", text: "text-boost-green", soft: "bg-boost-green-light/12", ring: "border-boost-green-light/30" },
  { bar: "bg-boost-purple", text: "text-boost-purple", soft: "bg-boost-purple/10", ring: "border-boost-purple/25" },
  { bar: "bg-boost-gold", text: "text-boost-gold", soft: "bg-boost-gold/15", ring: "border-boost-gold/30" },
];

function ProofCard({
  point, index,
}: { point: import("@/data/thought-leadership").ChapterProofPoint; index: number }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const a = PROOF_ACCENTS[index % PROOF_ACCENTS.length];
  const hasGraph = point.from != null && point.to != null;
  const max = hasGraph ? Math.max(point.from!, point.to!, 1) : 1;
  const fromH = hasGraph ? Math.max(10, (point.from! / max) * 100) : 0;
  const toH = hasGraph ? Math.max(10, (point.to! / max) * 100) : 0;
  const rising = hasGraph ? point.to! >= point.from! : true;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border ${a.ring} bg-boost-card p-4 card-lift transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      {/* title above */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-boost-muted leading-snug">{point.label}</p>

      {/* mini improvement graph + number beside */}
      <div className="mt-3 flex items-end justify-between gap-3">
        {hasGraph ? (
          <div className="flex h-14 items-end gap-1.5" aria-hidden>
            <div className="flex h-full w-3.5 flex-col justify-end">
              <span className="mb-1 text-center text-[9px] font-semibold tabular-nums text-boost-muted/70">{point.from}</span>
              <div className="w-full rounded-sm bg-boost-surface" style={{ height: isVisible ? `${fromH}%` : 0, transition: `height 0.8s ease-out ${index * 90}ms` }} />
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`mb-1 self-center ${a.text} ${rising ? "" : "rotate-90"}`}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <div className="flex h-full w-3.5 flex-col justify-end">
              <span className={`mb-1 text-center text-[9px] font-bold tabular-nums ${a.text}`}>{point.to}</span>
              <div className={`w-full rounded-sm ${a.bar}`} style={{ height: isVisible ? `${toH}%` : 0, transition: `height 0.8s ease-out ${index * 90 + 160}ms` }} />
            </div>
          </div>
        ) : (
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${a.soft}`} aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={a.text}>
              <path d="M4 18V14M9 18V11M14 18V8M4 11l5-5 4 3 6-6M16 3h4v4" />
            </svg>
          </div>
        )}
        <span className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${a.text}`}>{point.value}</span>
      </div>

      {point.sublabel && <p className="mt-2.5 text-[11px] leading-snug text-boost-muted">{point.sublabel}</p>}
    </div>
  );
}

/* ─── Today → going forward journey ────────────────────────────────
 *  The before/after as a single connected path rather than two static
 *  cards: a muted "today" state, an animated arrow connector, and the
 *  brand-accented "going forward" destination that lights up on reveal. */
function TransitionJourney({ transition }: { transition: { today: string; future: string } }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  return (
    <div ref={ref}>
      <Eyebrow>Today → going forward</Eyebrow>
      <div className="relative grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {/* Today */}
        <div
          className={`rounded-2xl border border-boost-border bg-boost-surface p-4 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-boost-muted">Today</p>
          <p className="text-sm text-boost-text-secondary mt-1.5 leading-relaxed">{transition.today}</p>
        </div>

        {/* Connector */}
        <div className="flex items-center justify-center sm:flex-col">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-boost-green text-white shadow-sm transition-all duration-500 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
            style={{ transitionDelay: "250ms" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="rotate-90 sm:rotate-0"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>

        {/* Going forward */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-boost-green/30 bg-boost-green/5 p-4 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <span aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 100% 100%, rgba(54,181,149,0.14) 0%, transparent 60%)" }} />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-boost-green">Going forward</p>
            <p className="text-sm text-boost-dark mt-1.5 leading-relaxed">{transition.future}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Roadmap item detail popup ──────────────────────────────────
 *  Opens from a chapter roadmap card, pulling the full entry from
 *  `product-roadmap-2026` (description + what it unlocks). */
function RoadmapDetailModal({ item, onClose }: { item: RoadmapItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-boost-dark/50 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-boost-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header band */}
        <div
          className="relative p-6 text-white"
          style={{ background: "linear-gradient(135deg, rgba(75,30,82,1) 0%, rgba(40,18,46,1) 55%, rgba(20,60,52,1) 100%)" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-boost-green-light/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-boost-green-light">{item.quarter}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{FOCUS_AREAS[item.focus].shortLabel}</span>
          </div>
          <h3 className="mt-3 text-xl font-bold tracking-tight">{item.title}</h3>
          <p className="mt-1.5 text-[13px] text-white/80 leading-relaxed">{item.summary}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-2">What it is</p>
            {item.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-boost-text-secondary mt-2 first:mt-0">{para}</p>
            ))}
          </div>
          <div className="rounded-2xl border border-boost-green-light/25 bg-boost-green-light/8 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-green mb-2">What this unlocks for you</p>
            <p className="text-sm leading-relaxed text-boost-dark">{item.unlocks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── One chapter block ────────────────────────────────────────── */
function ChapterBlock({
  chapter, hero, index, customer,
}: { chapter: StoryChapter; hero: { stat: string; narrative: string; headline: string }; index: number; customer?: Customer }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [showDetail, setShowDetail] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapItem | null>(null);

  // CSM-picked stories override the chapter defaults when a selection exists.
  const picked = customer?.story_selections?.[chapter.id];
  const caseStudies = picked?.length
    ? picked.map((id) => getSuccessStory(id)).filter(Boolean).map((s) => toCaseStudy(s!))
    : chapter.caseStudies;

  return (
    <div
      ref={ref}
      id={`chapter-${chapter.id}`}
      data-testid={`story-chapter-${chapter.id}`}
      className={`scroll-mt-24 rounded-3xl border border-boost-border bg-boost-card overflow-hidden transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Hero band */}
      <div
        className="relative p-6 sm:p-8 text-white"
        style={{ background: "linear-gradient(135deg, rgba(75,30,82,1) 0%, rgba(40,18,46,1) 55%, rgba(20,60,52,1) 100%)" }}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 65% at 95% 100%, rgba(54,181,149,0.30) 0%, transparent 62%)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3 sm:hidden">
            <ChallengeGlyph icon={chapter.icon} className="h-7 w-7 text-boost-green-light" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{chapter.challenge}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="hidden sm:flex items-center gap-2 mb-2">
              <ChallengeGlyph icon={chapter.icon} className="h-5 w-5 text-boost-green-light" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{chapter.challenge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{hero.headline}</h3>
            <p className="text-[13px] sm:text-sm text-white/80 mt-2 leading-relaxed max-w-2xl">{hero.narrative}</p>
          </div>
          {chapter.secondaryStat ? (
            <div className="flex items-start gap-5">
              <HeroRing stat={hero.stat} label={chapter.statLabel} size={96} />
              <HeroRing stat={chapter.secondaryStat} label={chapter.secondaryStatLabel} size={96} />
            </div>
          ) : (
            <HeroRing stat={hero.stat} label={chapter.statLabel} />
          )}
        </div>
      </div>

      {/* Body — the consistent arc */}
      <div className="p-6 sm:p-8 space-y-7">
        {/* 1. Proof points */}
        {chapter.proofPoints && chapter.proofPoints.length > 0 && (
          <div>
            <Eyebrow>The proof</Eyebrow>
            <div className={`grid gap-3 ${chapter.proofPoints.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {chapter.proofPoints.map((p, i) => (
                <ProofCard key={i} point={p} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* 2. Success stories */}
        {caseStudies && caseStudies.length > 0 && (
          <div>
            <Eyebrow>Success stories</Eyebrow>
            <div className={`grid gap-3 ${caseStudies.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {caseStudies.map((cs, i) => (
                <div key={i} className="rounded-2xl border border-boost-border p-4">
                  <p className="font-bold text-boost-dark">{cs.name}</p>
                  {cs.subtitle && <p className="text-xs text-boost-muted mt-0.5">{cs.subtitle}</p>}
                  {cs.before && cs.after && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0 rounded-full bg-boost-muted/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-boost-muted">Was</span>
                        <p className="text-[12.5px] leading-snug text-boost-text-secondary">{cs.before}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0 rounded-full bg-boost-green/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-boost-green">Now</span>
                        <p className="text-[12.5px] font-medium leading-snug text-boost-dark">{cs.after}</p>
                      </div>
                    </div>
                  )}
                  <div className={`mt-3 grid gap-x-4 gap-y-2.5 ${caseStudies!.length > 1 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {cs.metrics.map((m, j) => (
                      <div key={j}>
                        <p className="text-lg font-bold text-boost-green tabular-nums leading-none">{m.value}</p>
                        <p className="text-[11px] text-boost-muted mt-0.5 leading-snug">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Your data / benchmark — live bar comparison */}
        {chapter.benchmark && <ChapterBenchmarkViz benchmark={chapter.benchmark} customer={customer} />}

        {/* 3b. Your channel profile, told as our story (slide 40) */}
        {chapter.channelProfile && <ChannelProfileViz profile={chapter.channelProfile} customer={customer} />}

        {/* Roadmap — the items that help solve THIS challenge (opt-in detail) */}
        {chapter.roadmap && chapter.roadmap.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              data-testid={`chapter-${chapter.id}-roadmap-toggle`}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-boost-green hover:text-boost-green-light transition-colors"
            >
              <span>{chapter.roadmapLabel ?? "What's coming next"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${showDetail ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {showDetail && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {chapter.roadmap.map((r, i) => {
                  const full = r.roadmapItemId ? getRoadmapItem(r.roadmapItemId) : undefined;
                  const Tag = full ? "button" : "div";
                  return (
                    <Tag
                      key={i}
                      {...(full
                        ? {
                            type: "button" as const,
                            onClick: () => setActiveRoadmap(full),
                            "data-testid": `chapter-${chapter.id}-roadmap-${r.roadmapItemId}`,
                          }
                        : {})}
                      className={`block w-full rounded-2xl border border-boost-border p-4 text-left ${full ? "card-lift cursor-pointer hover:border-boost-green-light/50" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block rounded-full bg-boost-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-boost-green">{r.tag}</span>
                        {full && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-boost-muted/50"><path d="M9 18l6-6-6-6" /></svg>
                        )}
                      </div>
                      <p className="font-semibold text-boost-dark text-sm mt-2">{r.title}</p>
                      <p className="text-xs text-boost-muted mt-1 leading-relaxed">{r.body}</p>
                      {full && <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-green">Read more</p>}
                    </Tag>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeRoadmap && <RoadmapDetailModal item={activeRoadmap} onClose={() => setActiveRoadmap(null)} />}

        {/* See it in action — opt-in real-example chat mockup */}
        {chapter.useCase && (
          <div>
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              data-testid={`chapter-${chapter.id}-demo-toggle`}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-boost-green hover:text-boost-green-light transition-colors"
            >
              <span>{showDemo ? "Hide" : "See it"} in action</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${showDemo ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {showDemo && (
              <div className="mt-3">
                <UseCaseDemo useCase={chapter.useCase} />
              </div>
            )}
          </div>
        )}

        {/* 4. The transition — today vs future */}
        {chapter.transition && <TransitionJourney transition={chapter.transition} />}

        {/* 5. Why this matters — NLU→LLM impact chart */}
        {chapter.impact && <ImpactChart impact={chapter.impact} />}

        {/* Go deeper */}
        {chapter.linkSection && (
          <a
            href={`#${chapter.linkSection}`}
            data-testid={`chapter-${chapter.id}-deeper`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-boost-green hover:text-boost-green-light transition-colors"
          >
            <span>{chapter.linkLabel ?? "Go deeper"}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-3">{children}</p>;
}

export default function ThoughtLeadershipSection({ customer, sectionNumber }: ThoughtLeadershipSectionProps) {
  const overrides = customer?.thought_leadership ?? [];
  const snap = snapshot(customer);
  const tiles = snapshotTiles(customer);
  const { ref: headRef, isVisible: headVisible } = useScrollReveal({ once: true });

  return (
    <section className="space-y-7">
      {/* A. Dynamic customer snapshot */}
      <div
        ref={headRef}
        className={`relative overflow-hidden rounded-3xl p-7 sm:p-9 text-white transition-all duration-700 ${
          headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ background: "linear-gradient(135deg, rgba(69,17,73,1) 0%, rgba(53,16,57,1) 60%, rgba(20,60,52,1) 100%)" }}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 70% at 100% 0%, rgba(54,181,149,0.25) 0%, transparent 60%)" }} />
        <div className="relative">
          {sectionNumber && <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-boost-green-light">SECTION {sectionNumber}</span>}
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white mt-1">{snap.eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight mt-2 max-w-3xl leading-[1.15]">
            <HeadlineWithHighlight headline={snap.headline} highlight={snap.highlight} />
          </h2>
          {snap.sub && <p className="text-sm sm:text-base text-white/80 mt-3 max-w-2xl leading-relaxed">{snap.sub}</p>}

          {/* Visual drill-down — live position read off `performance` */}
          {tiles.length > 0 && (
            <div className={`mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 ${tiles.length >= 5 ? "lg:grid-cols-6" : tiles.length === 4 ? "lg:grid-cols-4" : ""}`}>
              {tiles.map((t) => (
                <div key={t.key} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">{t.label}</p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-2xl font-bold tabular-nums text-white leading-none">{t.value}</span>
                    {t.delta && <DeltaChip delta={t.delta} good={t.good} up={t.up} />}
                  </div>
                  {t.bar != null && (
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-boost-green-light" style={{ width: `${Math.min(100, t.bar)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* B. The four-challenge header (deck slide 3) */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-boost-dark">The state of conversational AI</h2>
        <p className="text-sm sm:text-base text-boost-muted mt-2 max-w-2xl leading-relaxed">
          Four core challenges we help our customers navigate — tap any one to jump straight to its chapter.
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STORY_CHAPTERS.map((ch, i) => (
            <a
              key={ch.id}
              href={`#chapter-${ch.id}`}
              data-testid={`challenge-${ch.id}`}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-boost-border bg-boost-card p-4 hover:border-boost-green-light/60 card-lift transition-all"
            >
              <span className="absolute right-3 top-3 text-[11px] font-bold tabular-nums text-boost-muted/50">0{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-boost-purple/8 text-boost-purple group-hover:bg-boost-green/10 group-hover:text-boost-green transition-colors">
                <ChallengeGlyph icon={ch.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-boost-dark">{ch.challenge}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-boost-green opacity-80 group-hover:opacity-100 transition-opacity">
                Open chapter
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* C. The four chapters */}
      <div className="space-y-5">
        {STORY_CHAPTERS.map((ch, i) => {
          const o = overrides[i];
          return (
            <ChapterBlock
              key={ch.id}
              chapter={ch}
              index={i}
              customer={customer}
              hero={{
                headline: o?.headline?.trim() || ch.headline,
                stat: o?.stat?.trim() || ch.stat,
                narrative: o?.narrative?.trim() || ch.narrative,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

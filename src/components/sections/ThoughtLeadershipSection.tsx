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
  type ChannelProfile,
} from "@/data/thought-leadership";

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
function snapshot(c?: Customer): { eyebrow: string; headline: string; sub?: string } {
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
    return { eyebrow: "Where you are today", headline, sub: moves };
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

/* ─── Hero ring (deck donut) ───────────────────────────────────── */
function HeroRing({ stat }: { stat: string }) {
  const numeric = parseFloat(stat);
  const pct = Number.isFinite(numeric) && stat.includes("%") ? Math.min(100, numeric) : 70;
  const size = 116, sw = 7, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const { ref, isVisible } = useScrollReveal({ once: true });
  return (
    <div ref={ref} className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#36b595" strokeWidth={sw} strokeLinecap="round"
          style={{ strokeDasharray: c, strokeDashoffset: isVisible ? c - (pct / 100) * c : c, transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white tabular-nums">{stat}</span>
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

/* ─── Live benchmark bars (deck slides 12 / 35) ───────────────────
 *  Reuses the BenchmarkingSection visual language — horizontal bars
 *  scaled 0–100%, you (green) vs peers (purple) vs leaders (muted) —
 *  but inline inside a chapter so the comparison lives next to the
 *  story instead of a separate section. The dataset chip is the
 *  placeholder for the future dataset-filter. */
const TONE_FILL: Record<"you" | "peer" | "industry", string> = {
  you: "bg-boost-green-light",
  peer: "bg-boost-purple",
  industry: "bg-boost-muted/55",
};

function FilterChip({ dataset }: { dataset: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-boost-purple/20 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-purple">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 9v6l-4 2v-8z" /></svg>
      {dataset}
    </span>
  );
}

function SimpleBar({ label, value, tone, unit }: { label: string; value: number; tone: "you" | "peer" | "industry"; unit: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div ref={ref} className="grid grid-cols-[8rem_1fr_2.75rem] items-center gap-3">
      <span className={`truncate text-xs ${tone === "you" ? "font-semibold text-boost-dark" : "text-boost-muted"}`}>{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-boost-surface">
        <div className={`h-full rounded-full ${TONE_FILL[tone]}`} style={{ width: isVisible ? `${pct}%` : 0, transition: "width 1s ease-out" }} />
      </div>
      <span className="text-right text-xs font-bold tabular-nums text-boost-dark">{value}{unit}</span>
    </div>
  );
}

function ChannelGroup({ channel, you, peer, unit }: { channel: string; you: number; peer: number; unit: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-boost-dark">{channel}</span>
        <span className="text-[11px] tabular-nums text-boost-muted">you {you}{unit} · peers {peer}{unit}</span>
      </div>
      <div className="mt-1.5 space-y-1">
        <div className="h-2.5 overflow-hidden rounded-full bg-boost-surface">
          <div className="h-full rounded-full bg-boost-green-light" style={{ width: isVisible ? `${Math.min(100, you)}%` : 0, transition: "width 1s ease-out" }} />
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-boost-surface">
          <div className="h-full rounded-full bg-boost-purple" style={{ width: isVisible ? `${Math.min(100, peer)}%` : 0, transition: "width 1s ease-out 120ms" }} />
        </div>
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

      {benchmark.channels ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {benchmark.channels.map((c) => (
            <ChannelGroup
              key={c.channel}
              channel={c.channel}
              you={c.channel === "Total" && typeof live === "number" ? live : c.you}
              peer={c.peer}
              unit={unit}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {(benchmark.bars ?? []).map((b) => (
            <SimpleBar
              key={b.label}
              label={b.label}
              value={b.tone === "you" && typeof live === "number" ? live : b.value}
              tone={b.tone}
              unit={unit}
            />
          ))}
        </div>
      )}

      {benchmark.channels && (
        <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-muted">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-boost-green-light" />You</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-boost-purple" />Peer avg</span>
        </div>
      )}

      {benchmark.note && <p className="mt-3 text-xs leading-relaxed text-boost-muted">{benchmark.note}</p>}
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

/* ─── One chapter block ────────────────────────────────────────── */
function ChapterBlock({
  chapter, hero, index, customer,
}: { chapter: StoryChapter; hero: { stat: string; narrative: string; headline: string }; index: number; customer?: Customer }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [showDetail, setShowDetail] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

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
          <HeroRing stat={hero.stat} />
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
                <div key={i} className="rounded-2xl border border-boost-border bg-boost-surface p-4">
                  <p className="text-xl sm:text-2xl font-bold text-boost-dark tabular-nums leading-none">{p.value}</p>
                  <p className="text-[13px] font-semibold text-boost-dark mt-2">{p.label}</p>
                  {p.sublabel && <p className="text-xs text-boost-muted mt-0.5">{p.sublabel}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Success stories */}
        {chapter.caseStudies && chapter.caseStudies.length > 0 && (
          <div>
            <Eyebrow>Success stories</Eyebrow>
            <div className={`grid gap-3 ${chapter.caseStudies.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {chapter.caseStudies.map((cs, i) => (
                <div key={i} className="rounded-2xl border border-boost-border p-4">
                  <p className="font-bold text-boost-dark">{cs.name}</p>
                  {cs.subtitle && <p className="text-xs text-boost-muted mt-0.5">{cs.subtitle}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
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
              <span>{showDetail ? "Hide" : "Show"} what's coming next</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${showDetail ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {showDetail && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {chapter.roadmap.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-boost-border p-4">
                    <span className="inline-block rounded-full bg-boost-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-boost-green">{r.tag}</span>
                    <p className="font-semibold text-boost-dark text-sm mt-2">{r.title}</p>
                    <p className="text-xs text-boost-muted mt-1 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
        {chapter.transition && (
          <div>
            <Eyebrow>Today → going forward</Eyebrow>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-boost-border bg-boost-surface p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-boost-muted">Today</p>
                <p className="text-sm text-boost-text-secondary mt-1.5 leading-relaxed">{chapter.transition.today}</p>
              </div>
              <div className="relative rounded-2xl border border-boost-green/30 bg-boost-green/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-boost-green">Going forward</p>
                <p className="text-sm text-boost-dark mt-1.5 leading-relaxed">{chapter.transition.future}</p>
              </div>
            </div>
          </div>
        )}

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 mt-1">{snap.eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-2 max-w-3xl leading-[1.15]">{snap.headline}</h2>
          {snap.sub && <p className="text-sm sm:text-base text-white/80 mt-3 max-w-2xl leading-relaxed">{snap.sub}</p>}
        </div>
      </div>

      {/* B. The four-challenge header (deck slide 3) */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-boost-dark">The state of conversational AI</h2>
        <p className="text-sm sm:text-base text-boost-muted mt-2 max-w-2xl leading-relaxed">
          Four core challenges we help our customers navigate — each a chapter in the story below.
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STORY_CHAPTERS.map((ch) => (
            <a
              key={ch.id}
              href={`#chapter-${ch.id}`}
              data-testid={`challenge-${ch.id}`}
              className="group flex flex-col items-center gap-2.5 rounded-2xl border border-boost-border bg-boost-card p-4 text-center hover:border-boost-green-light/50 card-lift transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-boost-purple/8 text-boost-purple group-hover:bg-boost-green/10 group-hover:text-boost-green transition-colors">
                <ChallengeGlyph icon={ch.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-boost-dark">{ch.challenge}</span>
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

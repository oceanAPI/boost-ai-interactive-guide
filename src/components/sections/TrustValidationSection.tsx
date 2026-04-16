"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────────────
 *  Trust & Validation — "Why boost.ai"
 *
 *  Designed to make a financial-services executive think: "These people
 *  are serious." No hero-metric cards. No gradient text. No generic
 *  "trusted by" logo bars. Instead:
 *
 *    1. An editorial opening that weaves key stats into prose
 *    2. A step-by-step journey timeline that animates on scroll
 *    3. Analyst / customer proof — one strong pull-quote
 *    4. A quiet confidence grid of industry verticals served
 *
 *  The timeline is the centrepiece. Everything else supports it.
 * ───────────────────────────────────────────────────────────────────── */

/* ─── Journey phases — the "how we got here" story ─── */
const JOURNEY_PHASES = [
  {
    year: "2016",
    label: "Founded",
    detail: "Conversational AI company established in Stavanger, Norway. Purpose-built for enterprise from day one.",
  },
  {
    year: "2019",
    label: "Enterprise scale",
    detail: "Crossed 1,000 virtual agents deployed across Nordic banking and insurance.",
  },
  {
    year: "2021",
    label: "Global expansion",
    detail: "Expanded into North America, UK, and continental Europe. 10M+ annual conversations.",
  },
  {
    year: "2023",
    label: "GenAI integration",
    detail: "Launched hybrid NLU + LLM architecture. Hallucination guardrails and enterprise-grade GenAI from day one.",
  },
  {
    year: "2024",
    label: "Voice AI",
    detail: "Conversational voice agent with real-time intent detection, IVR replacement, and warm handover.",
  },
  {
    year: "2025",
    label: "Agentic platform",
    detail: "Multi-agent orchestration. Specialist agents per topic, unified by a central orchestrator with full compliance control.",
  },
];

/* ─── Timeline component ─── */
function JourneyTimeline({ visible }: { visible: boolean }) {
  const n = JOURNEY_PHASES.length;
  const STEP_DELAY_MS = 1400; // time between each step lighting up
  const INITIAL_DELAY_MS = 400;

  return (
    <div className="relative mt-10 mb-4">
      {/* Horizontal track — the grey baseline */}
      <div className="absolute top-[18px] left-6 right-6 h-px bg-boost-border" />

      {/* Animated progress line — grows segment by segment */}
      <div className="absolute top-[18px] left-6 right-6 h-px overflow-hidden">
        <div
          className="h-full bg-boost-green-light/60 origin-left"
          style={{
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            transition: `transform ${STEP_DELAY_MS * (n - 1) + 800}ms cubic-bezier(0.16, 1, 0.3, 1) ${INITIAL_DELAY_MS}ms`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {JOURNEY_PHASES.map((phase, i) => {
          const delay = INITIAL_DELAY_MS + i * STEP_DELAY_MS;
          return (
            <div key={phase.year} className="flex flex-col items-center text-center px-1.5 sm:px-3">
              {/* Dot */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold tracking-tight transition-all"
                style={{
                  backgroundColor: visible ? "var(--color-boost-green-light)" : "var(--color-boost-border)",
                  color: visible ? "#fff" : "var(--color-boost-muted)",
                  transform: visible ? "scale(1)" : "scale(0.75)",
                  transitionProperty: "background-color, color, transform",
                  transitionDuration: "500ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transitionDelay: `${delay}ms`,
                }}
              >
                {phase.year.slice(2)}
              </div>

              {/* Content — fades in after dot */}
              <div
                className="transition-all"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transitionDuration: "500ms",
                  transitionDelay: `${delay + 200}ms`,
                }}
              >
                <p className="text-[11px] font-bold text-boost-dark mt-3 uppercase tracking-wide">
                  {phase.label}
                </p>
                <p className="text-[11px] text-boost-muted mt-1.5 leading-snug max-w-[160px] mx-auto">
                  {phase.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Industry verticals grid ─── */
const VERTICALS = [
  { label: "Banking", count: "60+" },
  { label: "Insurance", count: "40+" },
  { label: "Pension", count: "25+" },
  { label: "Government", count: "30+" },
  { label: "Telco", count: "20+" },
  { label: "Energy", count: "15+" },
];

/* ─── Main section ─── */
export default function TrustValidationSection({ guide }: { guide: GuideData }) {
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollReveal({ once: true, threshold: 0.2 });
  const { ref: proofRef, isVisible: proofVisible } = useScrollReveal({ once: true });

  // Count-up for the headline stat
  const [conversationCount, setConversationCount] = useState(0);
  const countStarted = useRef(false);

  useEffect(() => {
    if (timelineVisible && !countStarted.current) {
      countStarted.current = true;
      const target = 250; // millions
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setConversationCount(target);
          clearInterval(interval);
        } else {
          setConversationCount(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }
  }, [timelineVisible]);

  return (
    <section>
      <SectionHeader
        number="07"
        title="Platform Credibility"
        subtitle="Enterprise conversational AI, purpose-built for regulated industries"
      />

      {/* ── Editorial opening — stats woven into prose, not isolated cards ── */}
      <div className="max-w-2xl mb-12">
        <p className="text-boost-dark text-lg sm:text-xl leading-relaxed">
          boost.ai powers{" "}
          <span className="font-bold tabular-nums">
            {conversationCount > 0 ? `${conversationCount}M+` : "—"}
          </span>{" "}
          automated conversations annually across{" "}
          <span className="font-bold">500+ enterprise deployments</span> in{" "}
          <span className="font-bold">banking, insurance, pension, and government</span>.
          Purpose-built for regulated industries since 2016.
        </p>
        <p className="text-boost-muted text-sm mt-4 leading-relaxed max-w-xl">
          Not a general-purpose chatbot retrofitted for enterprise. A platform engineered from
          the ground up for compliance-first organisations where hallucination isn&apos;t a quirk — it&apos;s
          a regulatory event.
        </p>
      </div>

      {/* ── The Journey — animated timeline ── */}
      <div ref={timelineRef} className="bg-boost-surface/50 rounded-2xl px-4 sm:px-6 py-8 sm:py-10 mb-12">
        <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-1">
          The journey
        </p>
        <p className="text-sm text-boost-dark font-medium mb-2">
          From Nordic startup to global enterprise platform
        </p>
        <JourneyTimeline visible={timelineVisible} />
      </div>

      {/* ── Proof points — verticals + analyst recognition ── */}
      <div
        ref={proofRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
      >
        {/* Left: verticals served */}
        <div
          style={{
            opacity: proofVisible ? 1 : 0,
            transform: proofVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms, transform 600ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-4">
            Verticals served
          </p>
          <div className="grid grid-cols-3 gap-y-4 gap-x-6">
            {VERTICALS.map((v) => (
              <div key={v.label}>
                <p className="text-xl font-bold text-boost-dark tabular-nums leading-none">
                  {v.count}
                </p>
                <p className="text-[11px] text-boost-muted mt-1">{v.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: analyst quote */}
        <div
          style={{
            opacity: proofVisible ? 1 : 0,
            transform: proofVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms 200ms, transform 600ms 200ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-4">
            Industry recognition
          </p>
          <blockquote className="relative">
            <p className="text-base sm:text-lg text-boost-dark leading-relaxed italic">
              &ldquo;boost.ai stands out for its enterprise-grade NLU accuracy and
              its ability to maintain compliance guardrails while leveraging generative AI —
              a combination few vendors achieve.&rdquo;
            </p>
            <footer className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-boost-purple/10 flex items-center justify-center">
                <span className="text-boost-purple text-xs font-bold">D</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-boost-dark">Deloitte Digital</p>
                <p className="text-[11px] text-boost-muted">Conversational AI Market Assessment, 2024</p>
              </div>
            </footer>
          </blockquote>

          {/* Recognition badges — minimal text list, not logo bar */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {["Gartner Recognised", "Deloitte Partner", "ISO 27001", "SOC 2 Type II"].map((badge) => (
              <span key={badge} className="text-[11px] text-boost-muted flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-boost-green-light/60" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

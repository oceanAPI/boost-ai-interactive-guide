"use client";

import {
  VISION_PILLARS,
  TEST_STUDIO_SPOTLIGHT,
  A2A_HERITAGE,
  KNOWLEDGE_TRANSFORMATION,
  COMPANY_TAGLINE,
  VISION_OPENING,
  STRATEGY_PILLARS,
  FOCUS_AREAS_OUTRO,
} from "@/data/product-vision";

/* ─── Vision opening — Product Roadmap 2026 deck slide 2 ─── *
 * Tagline + the "complete shift through conversations" framing. Sits
 * at the very top of the Vision tab, before any pillars or strategy.
 * Quiet typography — purple tagline above two body paragraphs and an
 * italicised emphasis line. No card chrome; this is the section's
 * voice, not a tile. */
function VisionOpeningBlock({ visible }: { visible: boolean }) {
  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-purple">
        {COMPANY_TAGLINE}
      </p>
      <div className="mt-5 space-y-4 max-w-[68ch]">
        {VISION_OPENING.paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-[15px] sm:text-base text-boost-text-secondary leading-[1.7]"
          >
            {para}
          </p>
        ))}
        <p className="text-[15px] sm:text-base font-semibold italic text-boost-dark leading-[1.6]">
          {VISION_OPENING.emphasis}
        </p>
      </div>
    </div>
  );
}

/* ─── Strategy pillars — Product Roadmap 2026 deck slide 3 ─── *
 * "Our future is built on meaningful outcomes." Three pillars laid
 * out as a 1/3 grid (single column on mobile). The two-tone title
 * mirrors the Product Roadmap 2026 deck slide where the second word renders in italic
 * green. Body text is quiet, tight, descriptive. */
function StrategyPillarsBlock({ visible }: { visible: boolean }) {
  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transitionDelay: "100ms",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
        Our product strategy
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold text-boost-dark leading-tight max-w-[24ch]">
        Built on{" "}
        <span className="italic font-bold text-boost-green">
          meaningful outcomes
        </span>
        .
      </h3>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-7">
        {STRATEGY_PILLARS.map((pillar) => (
          <div key={pillar.id} className="space-y-2.5">
            <h4 className="text-[15px] font-bold text-boost-dark leading-tight">
              {pillar.title}{" "}
              <span className="italic font-bold text-boost-green">
                {pillar.emphasis}
              </span>
            </h4>
            <p className="text-[13px] text-boost-text-secondary leading-relaxed">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Lightweight pillar strip — 4 items, no cards, no rainbow ─── */
function PillarStrip({ visible }: { visible: boolean }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 sm:gap-y-7 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      {VISION_PILLARS.map((pillar) => (
        <div key={pillar.id}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-boost-green">
            {pillar.title}
          </p>
          <p className="text-[13px] text-boost-text-secondary leading-relaxed mt-2">
            {pillar.productVision}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Per-pillar delivery — Product Roadmap 2026 deck slides 15 / 22
 *  / 29 / 38 ─── *
 * One block per pillar. Above the fold: the pillar title, framing
 * question, and the canonical product-vision paragraph already shown
 * higher in the strip. Below: the 4-phase delivery on a connector
 * timeline (mirrors the deck's dot-and-line treatment), then the
 * "Value for your team and end users" 5-bullet list. */
function PillarDeliveryBlock({
  pillar,
  visible,
  delay,
}: {
  pillar: import("@/data/product-vision").VisionPillar;
  visible: boolean;
  delay: number;
}) {
  const accentColor =
    pillar.colour === "purple"
      ? "text-boost-purple"
      : pillar.colour === "green-light"
        ? "text-boost-green-light"
        : pillar.colour === "gold"
          ? "text-boost-gold"
          : "text-boost-green";
  const accentBg =
    pillar.colour === "purple"
      ? "bg-boost-purple"
      : pillar.colour === "green-light"
        ? "bg-boost-green-light"
        : pillar.colour === "gold"
          ? "bg-boost-gold"
          : "bg-boost-green";
  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Header */}
      <div className="mb-7">
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-2 ${accentColor}`}
        >
          {pillar.title}
        </p>
        <h3 className="text-xl sm:text-2xl font-semibold text-boost-dark leading-snug max-w-[60ch]">
          {pillar.question}
        </h3>
      </div>

      {/* 4-phase timeline */}
      <div className="relative mb-9">
        {/* Connector line */}
        <span
          aria-hidden="true"
          className={`absolute left-0 right-0 top-[6px] h-px ${accentBg} opacity-30`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-6">
          {pillar.phases.map((phase, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 w-3 h-3 rounded-full ${accentBg} ring-4 ring-white`}
              />
              <div className="pl-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1.5">
                  Phase {i + 1}
                </p>
                <p className="text-[13px] text-boost-text-secondary leading-relaxed">
                  {phase}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value bullets */}
      <div>
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.14em] mb-3 ${accentColor}`}
        >
          Value for your team and end users
        </p>
        <ul className="space-y-2">
          {pillar.valueBullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[13px] text-boost-text-secondary leading-relaxed"
            >
              <span
                aria-hidden="true"
                className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${accentBg} opacity-70`}
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Test Studio hero — centre-stage, the section's anchor ─── */
function SpotlightHero({ visible }: { visible: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: "200ms",
        background:
          "linear-gradient(180deg, #351039 0%, #451149 45%, #3a2d40 100%)",
      }}
    >
      <div className="relative px-8 py-14 sm:px-14 sm:py-16 lg:px-20 lg:py-20 max-w-[880px] mx-auto">
        {/* Eyebrow */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-green-light/90">
          {TEST_STUDIO_SPOTLIGHT.eyebrow}
        </p>

        {/* Heading — the rhetorical climax */}
        <h3 className="mt-4 text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.05] tracking-tight">
          {TEST_STUDIO_SPOTLIGHT.heading}
        </h3>

        {/* Body */}
        <div className="mt-7 space-y-5 max-w-[60ch]">
          {TEST_STUDIO_SPOTLIGHT.paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-[15px] text-white/70 leading-[1.7]"
            >
              {para}
            </p>
          ))}
        </div>

        {/* Test set examples — single quiet row */}
        <div className="mt-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-3">
            Example deterministic test sets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TEST_STUDIO_SPOTLIGHT.testSetExamples.map((ex) => (
              <span
                key={ex}
                className="inline-block px-2.5 py-1 rounded-md bg-white/[0.06] text-[11px] text-white/75 font-mono"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>

        {/* Credibility line — the payoff */}
        <p className="mt-10 pt-8 border-t border-white/[0.08] text-[14px] sm:text-[15px] text-white/90 italic leading-relaxed max-w-[52ch]">
          {TEST_STUDIO_SPOTLIGHT.credibilityLine}
        </p>
      </div>
    </div>
  );
}

/* ─── Pull-quote supporting callouts (A2A + Knowledge Transformation) ─── */
function PullQuote({
  eyebrow,
  heading,
  body,
  delay,
  visible,
}: {
  eyebrow: string;
  heading: string;
  body: string[];
  delay: number;
  visible: boolean;
}) {
  return (
    <blockquote
      className="relative pl-5 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-boost-green-light/50 rounded-full" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green">
        {eyebrow}
      </p>
      <p className="mt-2 text-base sm:text-lg font-semibold text-boost-dark leading-snug">
        {heading}
      </p>
      <div className="mt-3 space-y-2.5">
        {body.map((para, i) => (
          <p key={i} className="text-sm text-boost-text-secondary leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </blockquote>
  );
}

/* ─── Main ─── */
export default function VisionTab({ visible }: { visible: boolean }) {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Vision opening — Product Roadmap 2026 deck slide 2 */}
      <VisionOpeningBlock visible={visible} />

      {/* Strategy pillars — Product Roadmap 2026 deck slide 3 */}
      <StrategyPillarsBlock visible={visible} />

      {/* Pillar strip — light opening, no cards */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-5">
          Four focus areas
        </p>
        <PillarStrip visible={visible} />
        {/* Closing question — Product Roadmap 2026 deck slide 4. Splits cleanly around the
            accented phrase so the surrounding copy stays in sync if
            FOCUS_AREAS_OUTRO is edited later. */}
        {(() => {
          const accent = "regulated enterprises";
          const idx = FOCUS_AREAS_OUTRO.indexOf(accent);
          const before = idx >= 0 ? FOCUS_AREAS_OUTRO.slice(0, idx) : FOCUS_AREAS_OUTRO;
          const after = idx >= 0 ? FOCUS_AREAS_OUTRO.slice(idx + accent.length) : "";
          return (
            <p className="mt-7 text-[13px] text-boost-text-secondary leading-relaxed italic max-w-[68ch]">
              {before}
              {idx >= 0 && (
                <span className="not-italic font-semibold text-boost-purple">
                  {accent}
                </span>
              )}
              {after}
            </p>
          );
        })()}
      </div>

      {/* Per-pillar 4-phase delivery — Product Roadmap 2026 deck
          slides 15 / 22 / 29 / 38. Each pillar gets its connector
          timeline + 5-bullet value list. Sleek vertical stack,
          quiet dividers between pillars. */}
      <div className="space-y-12 sm:space-y-14 pt-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
            Per-pillar delivery
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-boost-dark leading-tight max-w-[28ch]">
            Where each pillar lands across the year.
          </h3>
        </div>
        {VISION_PILLARS.map((pillar, i) => (
          <div
            key={pillar.id}
            className={
              i > 0
                ? "border-t border-boost-border/70 pt-12 sm:pt-14"
                : ""
            }
          >
            <PillarDeliveryBlock
              pillar={pillar}
              visible={visible}
              delay={150 + i * 80}
            />
          </div>
        ))}
      </div>

      {/* Test Studio — the centrepiece */}
      <SpotlightHero visible={visible} />

      {/* Supporting pull-quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <PullQuote
          eyebrow={A2A_HERITAGE.eyebrow}
          heading={A2A_HERITAGE.heading}
          body={A2A_HERITAGE.body}
          delay={300}
          visible={visible}
        />
        <PullQuote
          eyebrow={KNOWLEDGE_TRANSFORMATION.eyebrow}
          heading={KNOWLEDGE_TRANSFORMATION.heading}
          body={KNOWLEDGE_TRANSFORMATION.body}
          delay={400}
          visible={visible}
        />
      </div>
    </div>
  );
}

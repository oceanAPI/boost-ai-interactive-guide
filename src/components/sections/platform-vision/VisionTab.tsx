"use client";

import {
  VISION_PILLARS,
  TEST_STUDIO_SPOTLIGHT,
  A2A_HERITAGE,
  KNOWLEDGE_TRANSFORMATION,
} from "@/data/product-vision";

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
      {/* Pillar strip — light opening, no cards */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-5">
          Four focus areas
        </p>
        <PillarStrip visible={visible} />
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

"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { GuideData } from "@/lib/types";
import { CASE_STUDIES, type CaseStudy } from "@/data/case-studies";
import { SectionHeader, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { assetPath } from "@/lib/asset-path";
import VideoModal from "@/components/VideoModal";

/* ─── Journey timeline — step-by-step sequential reveal ─── */
function JourneyTimeline({ phases, visible }: { phases: CaseStudy["journey"]; visible: boolean }) {
  if (!phases || phases.length === 0) return null;

  const n = phases.length;
  // Timing: each step takes ~600ms. Line segment grows, then dot lights up, then content fades in.
  const STEP_MS = 1200;
  const INITIAL_DELAY = 500;

  return (
    <div className="relative pt-1 pb-1">
      {/* Background track */}
      <div className="absolute top-5 left-[calc(100%/(2*var(--n)))] right-[calc(100%/(2*var(--n)))] h-[2px] bg-boost-border/50 rounded-full" style={{ "--n": n } as React.CSSProperties} />

      {/* Animated green line — grows segment by segment */}
      {phases.map((_, i) => {
        if (i === 0) return null; // no segment before first dot
        const segmentWidth = `calc(100% / ${n})`;
        const segmentLeft = `calc(${(i - 0.5) * (100 / n)}%)`;
        const segmentDelay = INITIAL_DELAY + (i - 1) * STEP_MS + 300; // starts after previous dot lights up

        return (
          <div
            key={`seg-${i}`}
            className="absolute top-5 h-[2px] rounded-full overflow-hidden"
            style={{ left: segmentLeft, width: segmentWidth }}
          >
            <div
              className="h-full bg-boost-green-light rounded-full"
              style={{
                width: visible ? "100%" : "0%",
                transitionProperty: "width",
                transitionDuration: `${STEP_MS * 0.6}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: `${segmentDelay}ms`,
              }}
            />
          </div>
        );
      })}

      {/* Steps */}
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {phases.map((phase, i) => {
          const dotDelay = INITIAL_DELAY + i * STEP_MS;
          const contentDelay = dotDelay + 200;

          return (
            <div key={phase.label} className="flex flex-col items-center text-center px-1 sm:px-2">
              {/* Dot — starts gray, lights up green */}
              <div
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                style={{
                  backgroundColor: visible ? "#36b595" : "#e2dce5",
                  color: visible ? "#fff" : "#7a6b80",
                  transform: visible ? "scale(1)" : "scale(0.8)",
                  transitionProperty: "background-color, color, transform, box-shadow",
                  transitionDuration: "400ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)", // slight overshoot
                  transitionDelay: `${dotDelay}ms`,
                  boxShadow: visible ? "0 0 0 4px rgba(54,181,149,0.12)" : "0 0 0 0px rgba(54,181,149,0)",
                }}
              >
                {/* Checkmark for completed steps, number for current */}
                {i + 1}
              </div>

              {/* Content — fades in after dot */}
              <div
                className="transition-all"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transitionDuration: "400ms",
                  transitionDelay: `${contentDelay}ms`,
                }}
              >
                <p className="text-[10px] font-semibold text-boost-dark mt-2.5 uppercase tracking-wide">
                  {phase.label}
                </p>
                <p className="text-[11px] text-boost-muted mt-1 leading-snug max-w-[150px]">
                  {phase.detail}
                </p>
                {phase.metric && (
                  <p className="text-xs font-bold text-boost-green mt-2">
                    {phase.metric}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Card selector row (always collapsed) ─── */
function CaseStudyCard({
  study,
  isRelevant,
  isActive,
  onSelect,
}: {
  study: CaseStudy;
  isRelevant: boolean;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left group"
    >
      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-boost-surface ring-2 ring-boost-green-light/30 shadow-sm"
          : "hover:bg-boost-surface"
      } ${isRelevant && !isActive ? "bg-boost-green-light/[0.03]" : ""}`}>
        {/* Thumbnail */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <Image src={assetPath(study.image)} alt={study.companyDescription} fill className="object-cover" sizes="64px" />
          {isActive && <div className="absolute inset-0 ring-2 ring-inset ring-boost-green-light/40 rounded-lg" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant={isRelevant ? "green" : "muted"} size="sm">{study.companyType}</Badge>
            {isRelevant && (
              <span className="text-[9px] font-semibold text-boost-green-light uppercase tracking-wider">Your industry</span>
            )}
          </div>
          <p className="text-sm font-semibold text-boost-dark truncate">{study.companyDescription}</p>
          <p className="text-xs text-boost-muted">{study.headline}</p>
        </div>
        {/* Key stat */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-lg font-bold text-boost-green tabular-nums">{study.results[0].value}</p>
          <p className="text-[10px] text-boost-muted">{study.results[0].metric}</p>
        </div>
        <svg className={`w-4 h-4 shrink-0 transition-all duration-200 ${
          isActive ? "text-boost-green-light rotate-90" : "text-boost-muted/40 group-hover:text-boost-dark"
        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

/* ─── Expanded story detail (renders in fixed container) ─── */
function CaseStudyDetail({
  study,
  isRelevant,
  visible,
}: {
  study: CaseStudy;
  isRelevant: boolean;
  visible: boolean;
}) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      {showVideo && study.videoUrl && (
        <VideoModal url={study.videoUrl} onClose={() => setShowVideo(false)} />
      )}

      {/* ─── Hero image band ─── */}
      <div className="relative h-56 sm:h-64 rounded-t-2xl overflow-hidden bg-boost-dark">
        <Image
          src={assetPath(study.image)}
          alt={study.companyDescription}
          fill
          className="object-cover object-center"
          sizes="(max-width: 900px) 100vw, 900px"
          priority={false}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(90deg, rgba(35,21,40,0.93) 0%, rgba(35,21,40,0.7) 60%, rgba(35,21,40,0.4) 100%)",
        }} />

        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
          {/* Top: context */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isRelevant ? "green" : "muted"} size="sm">{study.companyType}</Badge>
              {study.channel !== "chat" && (
                <span className="text-[10px] text-white/50 font-medium">{study.channel === "voice" ? "Voice" : "Chat + Voice"}</span>
              )}
            </div>
            {study.context && (
              <div className="hidden sm:flex items-center gap-4 text-[10px] text-white/40">
                {study.context.size && <span>{study.context.size}</span>}
                {study.context.employees && <span>{study.context.employees} employees</span>}
              </div>
            )}
          </div>

          {/* Bottom: headline */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-1">
              {study.timeline}
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight max-w-lg">
              {study.headline}
            </h3>
            <p className="text-sm text-white/50 mt-2 max-w-md leading-relaxed">
              {study.companyDescription}
            </p>
          </div>
        </div>

        {/* Video play button — if available */}
        {study.videoUrl && (
          <button
            type="button"
            onClick={() => setShowVideo(true)}
            className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5 text-boost-dark ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-[11px] text-white/70 font-medium">Watch story</span>
          </button>
        )}
      </div>

      {/* ─── Story body ─── */}
      <div className="bg-white rounded-b-2xl border border-t-0 border-boost-border">

        {/* Key results — the first thing you see */}
        <div className="px-6 sm:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-boost-border">
          {study.results.map((r, i) => (
            <div
              key={r.metric}
              className="px-4 first:pl-0 last:pr-0 transition-all"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transitionDuration: "500ms",
                transitionDelay: `${200 + i * 100}ms`,
              }}
            >
              <p className="text-2xl sm:text-3xl font-bold text-boost-dark tabular-nums leading-none">
                {r.value}
              </p>
              <p className="text-[10px] text-boost-muted uppercase tracking-wider mt-1.5 font-medium">
                {r.metric}
              </p>
              {r.improvement && (
                <p className="text-[11px] text-boost-green font-medium mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {r.improvement}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="h-px bg-boost-border" />

        {/* The story — challenge → solution */}
        <div className="px-6 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.12em] mb-3">The challenge</p>
            <p className="text-sm text-boost-text-secondary leading-relaxed">{study.challenge}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-boost-green uppercase tracking-[0.12em] mb-3">The solution</p>
            <p className="text-sm text-boost-text-secondary leading-relaxed">{study.solution}</p>
          </div>
        </div>

        {/* Journey timeline — if available */}
        {study.journey && study.journey.length > 0 && (
          <>
            <div className="h-px bg-boost-border" />
            <div className="px-6 sm:px-8 py-6">
              <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.12em] mb-5">The journey</p>
              <JourneyTimeline phases={study.journey} visible={visible} />
            </div>
          </>
        )}

        {/* Quote */}
        {study.quote && (
          <>
            <div className="h-px bg-boost-border" />
            <div className="px-6 sm:px-8 py-6 flex gap-4">
              <svg className="w-6 h-6 text-boost-purple/15 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
              <div>
                <p className="text-base text-boost-dark italic leading-relaxed">{study.quote.text}</p>
                <p className="text-xs text-boost-muted mt-3">
                  <span className="font-semibold text-boost-dark">{study.quote.author}</span> · {study.quote.role}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ─── Main section ─── */
export default function CaseStudiesSection({ guide }: { guide: GuideData }) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  // If AE selected specific case studies, use those in that order.
  // Otherwise show all, sorted by industry relevance.
  const selected = guide.selected_case_studies;
  const sorted = (selected && selected.length > 0)
    ? selected
        .map((id) => CASE_STUDIES.find((cs) => cs.id === id))
        .filter((cs): cs is CaseStudy => cs !== undefined)
    : [...CASE_STUDIES].sort((a, b) => {
        const aMatch = a.relevantIndustries.some((i) => guide.areas_of_interest.includes(i));
        const bMatch = b.relevantIndustries.some((i) => guide.areas_of_interest.includes(i));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

  const [activeId, setActiveId] = useState(sorted[0]?.id ?? "");
  const [displayedId, setDisplayedId] = useState(activeId);
  const [fading, setFading] = useState(false);

  const activeStudy = sorted.find((cs) => cs.id === displayedId) ?? sorted[0];

  const handleSelect = useCallback((id: string) => {
    if (id === activeId) return;
    setFading(true);
    setActiveId(id);
    // Cross-fade: fade out, swap content, fade in
    const timer = setTimeout(() => {
      setDisplayedId(id);
      setFading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeId]);

  return (
    <section>
      <SectionHeader
        number="06"
        title="Proven Results"
        subtitle="Real outcomes from financial services organizations using boost.ai"
      />

      <div ref={ref}>
        {/* Card selector list */}
        <div className="space-y-1 mb-4">
          {sorted.map((cs) => {
            const isRelevant = cs.relevantIndustries.some((ind) =>
              guide.areas_of_interest.includes(ind)
            );
            return (
              <CaseStudyCard
                key={cs.id}
                study={cs}
                isRelevant={isRelevant}
                isActive={activeId === cs.id}
                onSelect={() => handleSelect(cs.id)}
              />
            );
          })}
        </div>

        {/* Expanded detail — always in the same DOM position, cross-fades */}
        {activeStudy && (
          <div
            className="transition-opacity duration-250 ease-in-out"
            style={{ opacity: fading ? 0 : 1 }}
          >
            <CaseStudyDetail
              key={displayedId}
              study={activeStudy}
              isRelevant={activeStudy.relevantIndustries.some((ind) =>
                guide.areas_of_interest.includes(ind)
              )}
              visible={isVisible && !fading}
            />
          </div>
        )}
      </div>
    </section>
  );
}

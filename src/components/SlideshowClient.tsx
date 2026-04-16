"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { GuideData } from "@/lib/types";
import { SLIDE_SECTIONS } from "@/lib/slide-sections";
import { getTopicSections } from "@/data/topics";
import { TOPIC_COMPONENTS } from "@/data/topics/registry";
import { assetPath } from "@/lib/asset-path";

import HeroSection from "@/components/sections/HeroSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import TopicHubSection from "@/components/sections/TopicHubSection";
import DemoPreviewSection from "@/components/sections/DemoPreviewSection";
import PlatformVisionSection from "@/components/sections/PlatformVisionSection";
import VoiceSection from "@/components/sections/VoiceSection";
import ImpactSection from "@/components/sections/ImpactSection";
import TrustValidationSection from "@/components/sections/TrustValidationSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import CommercialOfferSection from "@/components/sections/CommercialOfferSection";
import ROISection from "@/components/sections/ROISection";
import NextStepsSection from "@/components/sections/NextStepsSection";
import TopicSection from "@/components/sections/topics/TopicSection";

/* ─── Topic data lookup ─── */
const topicSections = getTopicSections();
const topicBySectionId = new Map(topicSections.map((t) => [t.sectionId, t]));

/* ─── Label lookup ─── */
const labelById = new Map(SLIDE_SECTIONS.map((s) => [s.id, s.label]));

export default function SlideshowClient({
  guide,
  sectionIds,
}: {
  guide: GuideData;
  sectionIds: string[];
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [chromeVisible, setChromeVisible] = useState(true);
  const slideRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const total = sectionIds.length;
  const currentId = sectionIds[currentIndex] ?? sectionIds[0];
  const currentLabel = labelById.get(currentId) ?? currentId;

  /* ─── Navigation helpers ─── */
  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setDirection("right");
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("left");
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > currentIndex ? "right" : "left");
      setCurrentIndex(idx);
    },
    [currentIndex],
  );

  const exit = useCallback(() => {
    router.back();
  }, [router]);

  /* Reset scroll on slide change */
  useEffect(() => {
    slideRef.current?.scrollTo(0, 0);
  }, [currentIndex]);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, exit]);

  /* Auto-hide chrome after 3s of inactivity */
  const resetChromeTimer = useCallback(() => {
    setChromeVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChromeVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetChromeTimer();
    const handler = () => resetChromeTimer();
    window.addEventListener("mousemove", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("touchstart", handler);
      clearTimeout(hideTimer.current);
    };
  }, [resetChromeTimer]);

  /* TopicHub navigation: jump to slide if section is included */
  const handleTopicNavigate = useCallback(
    (sectionId: string) => {
      const idx = sectionIds.indexOf(sectionId);
      if (idx !== -1) goTo(idx);
    },
    [sectionIds, goTo],
  );

  /* ─── Slide renderer ─── */
  const slideContent = useMemo(() => {
    const id = sectionIds[currentIndex];

    /* Fixed sections */
    switch (id) {
      case "hero":
        return <HeroSection guide={guide} />;
      case "orchestrator":
        return <OrchestratorSection guide={guide} />;
      case "topics":
        return <TopicHubSection guide={guide} onNavigate={handleTopicNavigate} />;
      case "platform-vision":
        return <PlatformVisionSection guide={guide} />;
      case "voice":
        return <VoiceSection guide={guide} />;
      case "demo":
        return <DemoPreviewSection guide={guide} />;
      case "impact":
        return <ImpactSection guide={guide} />;
      case "trust-validation":
        return <TrustValidationSection guide={guide} />;
      case "case-studies":
        return <CaseStudiesSection guide={guide} />;
      case "commercial-offer":
        return <CommercialOfferSection guide={guide} />;
      case "roi":
        return <ROISection guide={guide} />;
      case "next-steps":
        return <NextStepsSection guide={guide} />;
    }

    /* Topic sections (topic-implementation, topic-integrations, etc.) */
    if (id?.startsWith("topic-")) {
      const topic = topicBySectionId.get(id);
      if (topic) {
        const topicKey = topic.key;
        const SpecializedComponent = TOPIC_COMPONENTS[topicKey];
        const sectionNumber = String(currentIndex + 1).padStart(2, "0");
        if (SpecializedComponent) {
          return (
            <SpecializedComponent
              guide={guide}
              sectionNumber={sectionNumber}
              headerBlocks={topic.headerContent}
              contentBlocks={topic.content}
            />
          );
        }
        return <TopicSection topic={topic} sectionNumber={sectionNumber} />;
      }
    }

    return (
      <div className="flex items-center justify-center h-full text-boost-muted">
        Section not found: {id}
      </div>
    );
  }, [currentIndex, guide, handleTopicNavigate, sectionIds]);

  return (
    <div className="fixed inset-0 bg-boost-bg z-[100] flex flex-col">
      {/* ─── Top chrome ─── */}
      <div
        className="fixed top-0 left-0 right-0 z-[110] transition-all duration-300"
        style={{ opacity: chromeVisible ? 1 : 0, pointerEvents: chromeVisible ? "auto" : "none" }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-boost-border">
          <div
            className="h-full bg-boost-green-light transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-sm border-b border-boost-border">
          {/* Left: logo + section title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo_purple-_main.svg")}
              alt="boost.ai"
              className="h-5 w-auto flex-shrink-0"
            />
            <span className="text-sm font-semibold text-boost-dark truncate">
              {currentLabel}
            </span>
          </div>

          {/* Center: progress dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {sectionIds.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-boost-green-light scale-125"
                    : i < currentIndex
                      ? "bg-boost-green-light/40"
                      : "bg-boost-border"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Right: counter + exit */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-boost-muted tabular-nums">
              {currentIndex + 1} / {total}
            </span>
            <button
              onClick={exit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors"
              aria-label="Exit presentation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Slide content ─── */}
      <div
        ref={slideRef}
        className="flex-1 overflow-y-auto pt-14"
      >
        <div
          key={`${currentIndex}-${direction}`}
          className={direction === "right" ? "slide-enter-right" : "slide-enter-left"}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
            {slideContent}
          </div>
        </div>
      </div>

      {/* ─── Bottom navigation ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[110] transition-all duration-300"
        style={{ opacity: chromeVisible ? 1 : 0, pointerEvents: chromeVisible ? "auto" : "none" }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-sm border-t border-boost-border">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-default text-boost-dark hover:bg-boost-surface"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {/* Mobile dots */}
          <div className="flex sm:hidden items-center gap-1">
            {sectionIds.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-boost-green-light scale-125" : "bg-boost-border"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentIndex === total - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-default bg-boost-green-light text-white hover:bg-boost-green"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

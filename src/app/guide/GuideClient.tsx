"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { GuideData } from "@/lib/types";
import { getTopicSections, getTopicsForGuide } from "@/data/topics";
import { getAgentsForGuide } from "@/data/agents";
import { getDemoScript, getEscalatedDemoScript } from "@/data/demo-scripts";
import GuideNav from "@/components/GuideNav";
import HeroSection from "@/components/sections/HeroSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import TopicHubSection from "@/components/sections/TopicHubSection";
import TopicSection from "@/components/sections/topics/TopicSection";
import DemoPreviewSection from "@/components/sections/DemoPreviewSection";
import CoreComponentsSection from "@/components/sections/CoreComponentsSection";
import TrustValidationSection from "@/components/sections/TrustValidationSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import ROISection from "@/components/sections/ROISection";
import NextStepsSection from "@/components/sections/NextStepsSection";
import { TOPIC_COMPONENTS } from "@/data/topics/registry";

const topicSections = getTopicSections();

/* Build the nav sections dynamically: fixed sections + topic sections */
const SECTIONS = [
  { id: "hero", label: "Overview", icon: "◆" },
  { id: "orchestrator", label: "Agent Orchestrator", icon: "⬡" },
  { id: "topics", label: "Deep Dive", icon: "◈" },
  ...topicSections.map((t, i) => ({
    id: t.sectionId,
    label: t.name,
    icon: "·",
  })),
  { id: "core-components", label: "Platform Components", icon: "⚙" },
  { id: "demo", label: "Live Demo", icon: "▶" },
  { id: "trust-validation", label: "Platform Credibility", icon: "◎" },
  { id: "case-studies", label: "Case Studies", icon: "★" },
  { id: "roi", label: "ROI Calculator", icon: "◇" },
  { id: "next-steps", label: "Next Steps", icon: "→" },
];

export default function GuideClient({ guide, sectionIds }: { guide: GuideData; sectionIds?: string[] }) {
  /* Filter sections if sectionIds provided */
  const activeSections = sectionIds
    ? SECTIONS.filter((s) => sectionIds.includes(s.id))
    : SECTIONS;
  const activeSectionSet = sectionIds ? new Set(sectionIds) : null;
  const [activeSection, setActiveSection] = useState("hero");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const openAgentRef = useRef<((agentKey: string) => void) | null>(null);

  /* Data for search index */
  const agents = useMemo(
    () => getAgentsForGuide(guide.areas_of_interest, guide.selected_variants),
    [guide.areas_of_interest, guide.selected_variants],
  );
  const topics = useMemo(() => getTopicsForGuide(), []);
  const demoScripts = useMemo(() => [
    getDemoScript(guide.company_name, guide.areas_of_interest),
    getEscalatedDemoScript(guide.company_name),
  ], [guide.company_name, guide.areas_of_interest]);

  /* Debounced setter — only commits after scroll has been stable for 150ms */
  const setActiveSectionDebounced = (id: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setActiveSection(id);
    }, 150);
  };

  const navigateTo = (id: string) => {
    /* Lock observer while programmatic scroll is in flight */
    isScrollingRef.current = true;
    clearTimeout(debounceRef.current);
    setActiveSection(id);

    const el = sectionRefs.current[id];
    if (el) {
      const nav = document.querySelector(".guide-nav");
      const navHeight = nav ? nav.getBoundingClientRect().height + 12 : 100;
      const y = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    /* Unlock after scroll fully settles — long enough for big jumps */
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1500);
  };

  const handleOpenAgent = useCallback((agentKey: string) => {
    openAgentRef.current?.(agentKey);
  }, []);

  const handleRegisterOpenAgent = useCallback((fn: (agentKey: string) => void) => {
    openAgentRef.current = fn;
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (isScrollingRef.current || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (isScrollingRef.current) return;

        const nav = document.querySelector(".guide-nav");
        const triggerY = nav ? nav.getBoundingClientRect().height + 40 : 140;
        const sectionIds = SECTIONS.map((s) => s.id);
        let bestId = sectionIds[0];

        for (const id of sectionIds) {
          const el = sectionRefs.current[id];
          if (el) {
            const top = el.getBoundingClientRect().top;
            if (top <= triggerY) {
              bestId = id;
            }
          }
        }

        setActiveSectionDebounced(bestId);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-boost-bg">
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <GuideNav
        sections={activeSections}
        activeSection={activeSection}
        onNavigate={navigateTo}
        companyName={guide.company_name}
        agents={agents}
        topics={topics}
        demoScripts={demoScripts}
        onOpenAgent={handleOpenAgent}
      />

      <main id="main-content">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-12 sm:space-y-16">
          {(!activeSectionSet || activeSectionSet.has("hero")) && (
            <div id="hero" ref={(el) => { sectionRefs.current["hero"] = el; }}>
              <HeroSection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("orchestrator")) && (
            <div id="orchestrator" ref={(el) => { sectionRefs.current["orchestrator"] = el; }}>
              <OrchestratorSection
                guide={guide}
                onRegisterOpenAgent={handleRegisterOpenAgent}
              />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("topics")) && (
            <div id="topics" ref={(el) => { sectionRefs.current["topics"] = el; }}>
              <TopicHubSection guide={guide} onNavigate={navigateTo} />
            </div>
          )}

          {/* Topic sections (04-07) — rendered from registry or generic fallback */}
          {topicSections.map((topic, i) => {
            if (activeSectionSet && !activeSectionSet.has(topic.sectionId)) return null;
            const SpecializedComponent = TOPIC_COMPONENTS[topic.key];
            return (
              <div
                key={topic.key}
                id={topic.sectionId}
                ref={(el) => { sectionRefs.current[topic.sectionId] = el; }}
              >
                {SpecializedComponent ? (
                  <SpecializedComponent
                    guide={guide}
                    sectionNumber={String(i + 4).padStart(2, "0")}
                    headerBlocks={topic.headerContent}
                    contentBlocks={topic.content}
                  />
                ) : (
                  <TopicSection
                    topic={topic}
                    sectionNumber={String(i + 4).padStart(2, "0")}
                  />
                )}
              </div>
            );
          })}

          {(!activeSectionSet || activeSectionSet.has("core-components")) && (
            <div id="core-components" ref={(el) => { sectionRefs.current["core-components"] = el; }}>
              <CoreComponentsSection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("demo")) && (
            <div id="demo" ref={(el) => { sectionRefs.current["demo"] = el; }}>
              <DemoPreviewSection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("trust-validation")) && (
            <div id="trust-validation" ref={(el) => { sectionRefs.current["trust-validation"] = el; }}>
              <TrustValidationSection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("case-studies")) && (
            <div id="case-studies" ref={(el) => { sectionRefs.current["case-studies"] = el; }}>
              <CaseStudiesSection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("roi")) && (
            <div id="roi" ref={(el) => { sectionRefs.current["roi"] = el; }}>
              <ROISection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("next-steps")) && (
            <div id="next-steps" ref={(el) => { sectionRefs.current["next-steps"] = el; }}>
              <NextStepsSection guide={guide} />
            </div>
          )}

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

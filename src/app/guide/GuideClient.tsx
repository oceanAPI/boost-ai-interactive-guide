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
import PlatformVisionSection from "@/components/sections/PlatformVisionSection";
import VoiceSection from "@/components/sections/VoiceSection";
import ImpactSection from "@/components/sections/ImpactSection";
import TrustValidationSection from "@/components/sections/TrustValidationSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import CommunitySection from "@/components/sections/CommunitySection";
import BoostCampSection from "@/components/sections/BoostCampSection";
import CommercialOfferSection from "@/components/sections/CommercialOfferSection";
import ROISection from "@/components/sections/ROISection";
import ScopeOfWorkSection from "@/components/sections/ScopeOfWorkSection";
import CustomSection from "@/components/sections/CustomSection";
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
  { id: "platform-vision", label: "Platform & Vision", icon: "⚙" },
  { id: "voice", label: "Voice Preview", icon: "◉" },
  { id: "demo", label: "Chat Preview", icon: "▶" },
  { id: "impact", label: "Business Impact", icon: "△" },
  { id: "trust-validation", label: "Platform Credibility", icon: "◎" },
  { id: "case-studies", label: "Case Studies", icon: "★" },
  { id: "community", label: "Boost.ai Community", icon: "◎" },
  { id: "boost-camp", label: "Boost Camp", icon: "▸" },
  { id: "commercial-offer", label: "Commercial Offer", icon: "◈" },
  { id: "roi", label: "ROI Calculator", icon: "◇" },
  { id: "scope-of-work", label: "Scope of Work", icon: "◫" },
  { id: "next-steps", label: "Next Steps", icon: "→" },
  { id: "custom", label: "Other", icon: "◌" },
];

export default function GuideClient({ guide, sectionIds }: { guide: GuideData; sectionIds?: string[] }) {
  /* Filter sections if sectionIds provided */
  const activeSections = sectionIds
    ? SECTIONS.filter((s) => sectionIds.includes(s.id))
    : SECTIONS;
  const activeSectionSet = sectionIds ? new Set(sectionIds) : null;

  /**
   * Dynamic section numbers — the green "01 / 02 / 03…" label shown in each
   * section header. Based on the current active-sections order so sections
   * never render with duplicate numbers, even after presets / toggles /
   * reorders on the admin page.
   */
  const sectionNumberById = useMemo(() => {
    const map: Record<string, string> = {};
    activeSections.forEach((s, i) => {
      map[s.id] = String(i + 1).padStart(2, "0");
    });
    return map;
  }, [activeSections]);
  const sn = (id: string) => sectionNumberById[id] ?? "";

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
                sectionNumber={sn("orchestrator")}
              />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("topics")) && (
            <div id="topics" ref={(el) => { sectionRefs.current["topics"] = el; }}>
              <TopicHubSection guide={guide} onNavigate={navigateTo} sectionNumber={sn("topics")} />
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
                    sectionNumber={sn(topic.sectionId)}
                    headerBlocks={topic.headerContent}
                    contentBlocks={topic.content}
                  />
                ) : (
                  <TopicSection
                    topic={topic}
                    sectionNumber={sn(topic.sectionId)}
                  />
                )}
              </div>
            );
          })}

          {(!activeSectionSet || activeSectionSet.has("platform-vision")) && (
            <div id="platform-vision" ref={(el) => { sectionRefs.current["platform-vision"] = el; }}>
              <PlatformVisionSection guide={guide} sectionNumber={sn("platform-vision")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("voice")) && (
            <div id="voice" ref={(el) => { sectionRefs.current["voice"] = el; }}>
              <VoiceSection guide={guide} sectionNumber={sn("voice")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("demo")) && (
            <div id="demo" ref={(el) => { sectionRefs.current["demo"] = el; }}>
              <DemoPreviewSection guide={guide} sectionNumber={sn("demo")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("impact")) && (
            <div id="impact" ref={(el) => { sectionRefs.current["impact"] = el; }}>
              <ImpactSection guide={guide} sectionNumber={sn("impact")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("trust-validation")) && (
            <div id="trust-validation" ref={(el) => { sectionRefs.current["trust-validation"] = el; }}>
              <TrustValidationSection guide={guide} sectionNumber={sn("trust-validation")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("case-studies")) && (
            <div id="case-studies" ref={(el) => { sectionRefs.current["case-studies"] = el; }}>
              <CaseStudiesSection guide={guide} sectionNumber={sn("case-studies")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("community")) && (
            <div id="community" ref={(el) => { sectionRefs.current["community"] = el; }}>
              <CommunitySection sectionNumber={sn("community")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("boost-camp")) && (
            <div id="boost-camp" ref={(el) => { sectionRefs.current["boost-camp"] = el; }}>
              <BoostCampSection sectionNumber={sn("boost-camp")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("commercial-offer")) && (
            <div id="commercial-offer" ref={(el) => { sectionRefs.current["commercial-offer"] = el; }}>
              <CommercialOfferSection guide={guide} sectionNumber={sn("commercial-offer")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("roi")) && (
            <div id="roi" ref={(el) => { sectionRefs.current["roi"] = el; }}>
              <ROISection guide={guide} sectionNumber={sn("roi")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("scope-of-work")) && (
            <div id="scope-of-work" ref={(el) => { sectionRefs.current["scope-of-work"] = el; }}>
              <ScopeOfWorkSection guide={guide} sectionNumber={sn("scope-of-work")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("next-steps")) && (
            <div id="next-steps" ref={(el) => { sectionRefs.current["next-steps"] = el; }}>
              <NextStepsSection guide={guide} sectionNumber={sn("next-steps")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("custom")) && guide.custom_section?.title && (
            <div id="custom" ref={(el) => { sectionRefs.current["custom"] = el; }}>
              <CustomSection guide={guide} sectionNumber={sn("custom")} />
            </div>
          )}

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

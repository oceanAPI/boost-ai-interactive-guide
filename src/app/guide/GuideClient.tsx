"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Customer, GuideData } from "@/lib/types";
import { getTopicSections, getTopicsForGuide } from "@/data/topics";
import { getAgentsForGuide } from "@/data/agents";
import { getDemoScript, getEscalatedDemoScript } from "@/data/demo-scripts";
import GuideNav from "@/components/GuideNav";
import HeroSection from "@/components/sections/HeroSection";
import AgendaSection from "@/components/sections/AgendaSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import PerformanceSection from "@/components/sections/PerformanceSection";
import BenchmarkingSection from "@/components/sections/BenchmarkingSection";
import AgenticBeforeAfterSection from "@/components/sections/AgenticBeforeAfterSection";
import AgentSwotSection from "@/components/sections/AgentSwotSection";
import UatStatusSection from "@/components/sections/UatStatusSection";
import SuccessPlanSection from "@/components/sections/SuccessPlanSection";
import TopRecommendationsSection from "@/components/sections/TopRecommendationsSection";
import GovernanceSection from "@/components/sections/GovernanceSection";
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
import { SectionReportPill } from "@/components/SectionReportPill";

const topicSections = getTopicSections();

/* Build the nav sections dynamically: fixed sections + topic sections */
const SECTIONS = [
  { id: "hero", label: "Overview", icon: "◆" },
  { id: "agenda", label: "Agenda", icon: "◷" },
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
  { id: "performance", label: "Performance Snapshot", icon: "⟳" },
  { id: "benchmarking", label: "Benchmarking", icon: "▤" },
  { id: "agentic-before-after", label: "Agentic Transformation", icon: "⇄" },
  { id: "agent-swot", label: "Agent SWOT", icon: "◇" },
  { id: "uat-status", label: "Rollout Status", icon: "●" },
  { id: "impact", label: "Business Impact", icon: "△" },
  { id: "trust-validation", label: "Platform Credibility", icon: "◎" },
  { id: "case-studies", label: "Case Studies", icon: "★" },
  { id: "community", label: "Boost.ai Community", icon: "◎" },
  { id: "boost-camp", label: "Boost Camp", icon: "▸" },
  { id: "commercial-offer", label: "Commercial Offer", icon: "◈" },
  { id: "roi", label: "ROI Calculator", icon: "◇" },
  { id: "scope-of-work", label: "Scope of Work", icon: "◫" },
  { id: "success-plan", label: "Success Plan", icon: "▰" },
  { id: "top-recommendations", label: "Top Recommendations", icon: "✦" },
  { id: "governance", label: "Governance", icon: "◉" },
  { id: "next-steps", label: "Next Steps", icon: "→" },
  { id: "custom", label: "Other", icon: "◌" },
];

export default function GuideClient({
  guide,
  customer,
  sectionIds,
}: {
  guide: GuideData;
  /** Full Customer record carrying optional CE/PS fields (br_context,
   *  performance, agent_swot, etc.). Passed alongside `guide` so new
   *  audience-specific sections can read the richer shape while
   *  existing Sales sections continue reading `guide`. Optional for
   *  backwards compatibility — sections that depend on it check for
   *  the field they need. */
  customer?: Customer;
  sectionIds?: string[];
}) {
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

        // Bottom-of-page edge case: when the browser can't scroll further
        // (scrollY + viewport >= document height), the last visible section
        // may never reach the trigger line. Fall back to "last rendered
        // section the user can actually see" in that case.
        const atBottom =
          window.scrollY + window.innerHeight >= document.body.scrollHeight - 4;

        if (atBottom) {
          // Walk the list from the END, pick the first one whose element is
          // rendered and at least partially visible.
          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const id = sectionIds[i];
            const el = sectionRefs.current[id];
            if (el && el.getBoundingClientRect().top < window.innerHeight) {
              bestId = id;
              break;
            }
          }
        } else {
          for (const id of sectionIds) {
            const el = sectionRefs.current[id];
            if (el) {
              const top = el.getBoundingClientRect().top;
              if (top <= triggerY) {
                bestId = id;
              }
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
              <SectionReportPill sectionId="hero" displayName="Overview" />
              <HeroSection guide={guide} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("agenda")) && (
            <div id="agenda" ref={(el) => { sectionRefs.current["agenda"] = el; }}>
              <SectionReportPill sectionId="agenda" displayName="Agenda" />
              <AgendaSection
                customer={customer}
                sectionNumber={sn("agenda")}
              />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("orchestrator")) && (
            <div id="orchestrator" ref={(el) => { sectionRefs.current["orchestrator"] = el; }}>
              <SectionReportPill sectionId="orchestrator" displayName="Agent Orchestrator" />
              <OrchestratorSection
                guide={guide}
                onRegisterOpenAgent={handleRegisterOpenAgent}
                sectionNumber={sn("orchestrator")}
              />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("topics")) && (
            <div id="topics" ref={(el) => { sectionRefs.current["topics"] = el; }}>
              <SectionReportPill sectionId="topics" displayName="Deep Dive" />
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
                <SectionReportPill sectionId={topic.sectionId} displayName={topic.name} />
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
              <SectionReportPill sectionId="platform-vision" displayName="Platform & Vision" />
              <PlatformVisionSection guide={guide} sectionNumber={sn("platform-vision")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("voice")) && (
            <div id="voice" ref={(el) => { sectionRefs.current["voice"] = el; }}>
              <SectionReportPill sectionId="voice" displayName="Voice" />
              <VoiceSection guide={guide} sectionNumber={sn("voice")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("demo")) && (
            <div id="demo" ref={(el) => { sectionRefs.current["demo"] = el; }}>
              <SectionReportPill sectionId="demo" displayName="Demo Preview" />
              <DemoPreviewSection guide={guide} sectionNumber={sn("demo")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("performance")) && (
            <div id="performance" ref={(el) => { sectionRefs.current["performance"] = el; }}>
              <SectionReportPill sectionId="performance" displayName="Performance Snapshot" />
              <PerformanceSection customer={customer} sectionNumber={sn("performance")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("benchmarking")) && (
            <div id="benchmarking" ref={(el) => { sectionRefs.current["benchmarking"] = el; }}>
              <SectionReportPill sectionId="benchmarking" displayName="Benchmarking" />
              <BenchmarkingSection customer={customer} sectionNumber={sn("benchmarking")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("agentic-before-after")) && (
            <div id="agentic-before-after" ref={(el) => { sectionRefs.current["agentic-before-after"] = el; }}>
              <SectionReportPill sectionId="agentic-before-after" displayName="Agentic Transformation" />
              <AgenticBeforeAfterSection customer={customer} sectionNumber={sn("agentic-before-after")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("agent-swot")) && (
            <div id="agent-swot" ref={(el) => { sectionRefs.current["agent-swot"] = el; }}>
              <SectionReportPill sectionId="agent-swot" displayName="Agent SWOT" />
              <AgentSwotSection customer={customer} sectionNumber={sn("agent-swot")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("uat-status")) && (
            <div id="uat-status" ref={(el) => { sectionRefs.current["uat-status"] = el; }}>
              <SectionReportPill sectionId="uat-status" displayName="Rollout Status" />
              <UatStatusSection customer={customer} sectionNumber={sn("uat-status")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("impact")) && (
            <div id="impact" ref={(el) => { sectionRefs.current["impact"] = el; }}>
              <SectionReportPill sectionId="impact" displayName="Impact" />
              <ImpactSection guide={guide} sectionNumber={sn("impact")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("trust-validation")) && (
            <div id="trust-validation" ref={(el) => { sectionRefs.current["trust-validation"] = el; }}>
              <SectionReportPill sectionId="trust-validation" displayName="Trust & Validation" />
              <TrustValidationSection guide={guide} sectionNumber={sn("trust-validation")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("case-studies")) && (
            <div id="case-studies" ref={(el) => { sectionRefs.current["case-studies"] = el; }}>
              <SectionReportPill sectionId="case-studies" displayName="Case Studies" />
              <CaseStudiesSection guide={guide} sectionNumber={sn("case-studies")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("community")) && (
            <div id="community" ref={(el) => { sectionRefs.current["community"] = el; }}>
              <SectionReportPill sectionId="community" displayName="Community" />
              <CommunitySection sectionNumber={sn("community")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("boost-camp")) && (
            <div id="boost-camp" ref={(el) => { sectionRefs.current["boost-camp"] = el; }}>
              <SectionReportPill sectionId="boost-camp" displayName="Boost Camp" />
              <BoostCampSection sectionNumber={sn("boost-camp")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("commercial-offer")) && (
            <div id="commercial-offer" ref={(el) => { sectionRefs.current["commercial-offer"] = el; }}>
              <SectionReportPill sectionId="commercial-offer" displayName="Commercial Offer" />
              <CommercialOfferSection guide={guide} sectionNumber={sn("commercial-offer")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("roi")) && (
            <div id="roi" ref={(el) => { sectionRefs.current["roi"] = el; }}>
              <SectionReportPill sectionId="roi" displayName="ROI" />
              <ROISection guide={guide} sectionNumber={sn("roi")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("scope-of-work")) && (
            <div id="scope-of-work" ref={(el) => { sectionRefs.current["scope-of-work"] = el; }}>
              <SectionReportPill sectionId="scope-of-work" displayName="Scope of Work" />
              <ScopeOfWorkSection guide={guide} sectionNumber={sn("scope-of-work")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("success-plan")) && (
            <div id="success-plan" ref={(el) => { sectionRefs.current["success-plan"] = el; }}>
              <SectionReportPill sectionId="success-plan" displayName="Success Plan" />
              <SuccessPlanSection customer={customer} sectionNumber={sn("success-plan")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("top-recommendations")) && (
            <div id="top-recommendations" ref={(el) => { sectionRefs.current["top-recommendations"] = el; }}>
              <SectionReportPill sectionId="top-recommendations" displayName="Top Recommendations" />
              <TopRecommendationsSection customer={customer} sectionNumber={sn("top-recommendations")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("governance")) && (
            <div id="governance" ref={(el) => { sectionRefs.current["governance"] = el; }}>
              <SectionReportPill sectionId="governance" displayName="Governance" />
              <GovernanceSection customer={customer} sectionNumber={sn("governance")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("next-steps")) && (
            <div id="next-steps" ref={(el) => { sectionRefs.current["next-steps"] = el; }}>
              <SectionReportPill sectionId="next-steps" displayName="Next Steps" />
              <NextStepsSection guide={guide} sectionNumber={sn("next-steps")} />
            </div>
          )}

          {(!activeSectionSet || activeSectionSet.has("custom")) && guide.custom_section?.title && (
            <div id="custom" ref={(el) => { sectionRefs.current["custom"] = el; }}>
              <SectionReportPill sectionId="custom" displayName="Custom Section" />
              <CustomSection guide={guide} sectionNumber={sn("custom")} />
            </div>
          )}

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { getTopicSections } from "@/data/topics";
import GuideNav from "@/components/GuideNav";
import HeroSection from "@/components/sections/HeroSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import TopicHubSection from "@/components/sections/TopicHubSection";
import TopicSection from "@/components/sections/topics/TopicSection";
import RoadmapSection from "@/components/sections/RoadmapSection";
import IntegrationArchSection from "@/components/sections/IntegrationArchSection";
import SecurityComplianceSection from "@/components/sections/SecurityComplianceSection";
import ROISection from "@/components/sections/ROISection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import DemoPreviewSection from "@/components/sections/DemoPreviewSection";
import TimelineSection from "@/components/sections/TimelineSection";
import NextStepsSection from "@/components/sections/NextStepsSection";

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
  { id: "roi", label: "ROI Calculator", icon: "◇" },
  { id: "architecture", label: "Architecture", icon: "⬡" },
  { id: "demo", label: "Live Demo", icon: "▶" },
  { id: "timeline", label: "Implementation Plan", icon: "◈" },
  { id: "next-steps", label: "Next Steps", icon: "→" },
];

export default function GuideClient({ guide }: { guide: GuideData }) {
  const [activeSection, setActiveSection] = useState("hero");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    /* On scroll, find the section whose top is closest to (but above) the
       trigger line — 30% from the top of the viewport. This is far more
       stable than IntersectionObserver which fires for every threshold cross. */
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
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={navigateTo}
        companyName={guide.company_name}
      />

      <main id="main-content">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-12 sm:space-y-16">
          <div id="hero" ref={(el) => { sectionRefs.current["hero"] = el; }}>
            <HeroSection guide={guide} />
          </div>

          <div id="orchestrator" ref={(el) => { sectionRefs.current["orchestrator"] = el; }}>
            <OrchestratorSection guide={guide} />
          </div>

          <div id="topics" ref={(el) => { sectionRefs.current["topics"] = el; }}>
            <TopicHubSection guide={guide} onNavigate={navigateTo} />
          </div>

          {/* Topic sections (04-07) — rendered from data */}
          {topicSections.map((topic, i) => (
            <div
              key={topic.key}
              id={topic.sectionId}
              ref={(el) => { sectionRefs.current[topic.sectionId] = el; }}
            >
              {topic.key === "implementation" ? (
                <RoadmapSection
                  startDate={guide.start_date}
                  sectionNumber={String(i + 4).padStart(2, "0")}
                  headerBlocks={topic.headerContent}
                  contentBlocks={topic.content}
                />
              ) : topic.key === "integrations" ? (
                <IntegrationArchSection
                  guide={guide}
                  sectionNumber={String(i + 4).padStart(2, "0")}
                  headerBlocks={topic.headerContent}
                  contentBlocks={topic.content}
                />
              ) : topic.key === "security-compliance" ? (
                <SecurityComplianceSection
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
          ))}

          <div id="roi" ref={(el) => { sectionRefs.current["roi"] = el; }}>
            <ROISection guide={guide} />
          </div>

          <div id="architecture" ref={(el) => { sectionRefs.current["architecture"] = el; }}>
            <ArchitectureSection guide={guide} />
          </div>

          <div id="demo" ref={(el) => { sectionRefs.current["demo"] = el; }}>
            <DemoPreviewSection guide={guide} />
          </div>

          <div id="timeline" ref={(el) => { sectionRefs.current["timeline"] = el; }}>
            <TimelineSection guide={guide} />
          </div>

          <div id="next-steps" ref={(el) => { sectionRefs.current["next-steps"] = el; }}>
            <NextStepsSection guide={guide} />
          </div>

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import GuideNav from "@/components/GuideNav";
import HeroSection from "@/components/sections/HeroSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import AgentDetailSection from "@/components/sections/AgentDetailSection";
import ROISection from "@/components/sections/ROISection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import SparkleDecoration from "@/components/SparkleDecoration";
import BoostLogo from "@/components/BoostLogo";

const SECTIONS = [
  { id: "hero", label: "Overview", icon: "◆" },
  { id: "orchestrator", label: "Agent Orchestrator", icon: "⬡" },
  { id: "agents", label: "Specialist Agents", icon: "◈" },
  { id: "roi", label: "ROI & Automation", icon: "◇" },
  { id: "comparison", label: "Why boost.ai", icon: "◆" },
  { id: "architecture", label: "System Architecture", icon: "⬡" },
  { id: "timeline", label: "Implementation", icon: "◈" },
];

export default function GuideClient({ guide }: { guide: GuideData }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const navigateTo = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDrillDown = (agentKey: string) => {
    setFocusedAgent(agentKey);
    setActiveSection("agents");
    sectionRefs.current["agents"]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Intersection observer for scroll-based section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-boost-bg">
      <GuideNav
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={navigateTo}
        companyName={guide.company_name}
      />

      <main className="flex-1 overflow-y-auto guide-scrollbar">
        <div className="max-w-5xl mx-auto px-8 py-6 space-y-16">
          <div id="hero" ref={(el) => { sectionRefs.current["hero"] = el; }}>
            <HeroSection guide={guide} />
          </div>

          <div id="orchestrator" ref={(el) => { sectionRefs.current["orchestrator"] = el; }}>
            <OrchestratorSection guide={guide} onDrillDown={handleDrillDown} />
          </div>

          <div id="agents" ref={(el) => { sectionRefs.current["agents"] = el; }}>
            <AgentDetailSection
              guide={guide}
              focusedAgent={focusedAgent}
              onBack={() => setFocusedAgent(null)}
            />
          </div>

          <div id="roi" ref={(el) => { sectionRefs.current["roi"] = el; }}>
            <ROISection guide={guide} />
          </div>

          <div id="comparison" ref={(el) => { sectionRefs.current["comparison"] = el; }}>
            <ComparisonSection />
          </div>

          <div id="architecture" ref={(el) => { sectionRefs.current["architecture"] = el; }}>
            <ArchitectureSection guide={guide} />
          </div>

          <div id="timeline" ref={(el) => { sectionRefs.current["timeline"] = el; }}>
            <TimelineSection guide={guide} />
          </div>

          {/* Closing */}
          <div className="relative rounded-2xl bg-gradient-to-br from-boost-purple-dark to-boost-purple-deeper p-16 text-center overflow-hidden">
            <SparkleDecoration />
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <BoostLogo height={36} color="#ececec" />
              </div>
              <p className="text-xl text-boost-lavender">Trust every conversation</p>
            </div>
          </div>

          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

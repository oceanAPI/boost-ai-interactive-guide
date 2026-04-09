"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import GuideNav from "@/components/GuideNav";
import HeroSection from "@/components/sections/HeroSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import AgentDetailSection from "@/components/sections/AgentDetailSection";
import ROISection from "@/components/sections/ROISection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import DemoPreviewSection from "@/components/sections/DemoPreviewSection";
import TimelineSection from "@/components/sections/TimelineSection";
import NextStepsSection from "@/components/sections/NextStepsSection";

const SECTIONS = [
  { id: "hero", label: "Overview", icon: "◆" },
  { id: "orchestrator", label: "Agent Orchestrator", icon: "⬡" },
  { id: "agents", label: "Specialist Agents", icon: "◈" },
  { id: "roi", label: "ROI Calculator", icon: "◇" },
  { id: "architecture", label: "Architecture", icon: "⬡" },
  { id: "demo", label: "Live Demo", icon: "▶" },
  { id: "timeline", label: "Implementation", icon: "◈" },
  { id: "next-steps", label: "Next Steps", icon: "→" },
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

  // Always start at top when guide loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-boost-bg">
      <GuideNav
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={navigateTo}
        companyName={guide.company_name}
      />

      <main>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-12 sm:space-y-16">
          <div id="hero" ref={(el) => { sectionRefs.current["hero"] = el; }}>
            <HeroSection guide={guide} />
          </div>

          <div id="orchestrator" ref={(el) => { sectionRefs.current["orchestrator"] = el; }}>
            <OrchestratorSection guide={guide} />
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

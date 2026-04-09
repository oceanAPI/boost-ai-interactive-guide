"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import type { StakeholderRole } from "@/data/roles";
import { getRoleDefinition } from "@/data/roles";
import GuideNav from "@/components/GuideNav";
import HeroSection from "@/components/sections/HeroSection";
import OrchestratorSection from "@/components/sections/OrchestratorSection";
import AgentDetailSection from "@/components/sections/AgentDetailSection";
import ROISection from "@/components/sections/ROISection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import DemoPreviewSection from "@/components/sections/DemoPreviewSection";
import NextStepsSection from "@/components/sections/NextStepsSection";

const ALL_SECTIONS = [
  { id: "hero", label: "Overview", icon: "◆" },
  { id: "orchestrator", label: "Agent Orchestrator", icon: "⬡" },
  { id: "agents", label: "Specialist Agents", icon: "◈" },
  { id: "roi", label: "ROI Calculator", icon: "◇" },
  { id: "case-studies", label: "Proven Results", icon: "★" },
  { id: "comparison", label: "Why boost.ai", icon: "◆" },
  { id: "architecture", label: "Architecture", icon: "⬡" },
  { id: "demo", label: "Live Demo", icon: "▶" },
  { id: "timeline", label: "Implementation", icon: "◈" },
  { id: "next-steps", label: "Next Steps", icon: "→" },
];

// Map section IDs to their render components
const SECTION_COMPONENTS: Record<string, string> = {};
ALL_SECTIONS.forEach((s) => { SECTION_COMPONENTS[s.id] = s.id; });

export default function GuideClient({ guide }: { guide: GuideData }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [focusedAgent, setFocusedAgent] = useState<string | null>(null);
  const [role, setRole] = useState<StakeholderRole>("general");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Read role from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/role=(\w+)/);
    if (match) setRole(match[1] as StakeholderRole);
  }, []);

  // Update URL hash when role changes
  const handleRoleChange = (newRole: StakeholderRole) => {
    setRole(newRole);
    window.location.hash = newRole === "general" ? "" : `role=${newRole}`;
  };

  // Get role-ordered sections
  const roleDef = getRoleDefinition(role);
  const orderedSections = roleDef.sectionOrder
    .map((id) => ALL_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as typeof ALL_SECTIONS;

  // Fallback: add any sections not in the role order
  ALL_SECTIONS.forEach((s) => {
    if (!orderedSections.find((os) => os.id === s.id)) {
      orderedSections.push(s);
    }
  });

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
      { rootMargin: "-20% 0px -60% 0px" },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [role]); // re-observe when role changes section order

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return <HeroSection guide={guide} role={role} />;
      case "orchestrator":
        return <OrchestratorSection guide={guide} role={role} onDrillDown={handleDrillDown} />;
      case "agents":
        return (
          <AgentDetailSection
            guide={guide}
            role={role}
            focusedAgent={focusedAgent}
            onBack={() => setFocusedAgent(null)}
          />
        );
      case "roi":
        return <ROISection guide={guide} role={role} />;
      case "case-studies":
        return <CaseStudiesSection guide={guide} />;
      case "comparison":
        return <ComparisonSection />;
      case "architecture":
        return <ArchitectureSection guide={guide} role={role} />;
      case "demo":
        return <DemoPreviewSection guide={guide} />;
      case "timeline":
        return <TimelineSection guide={guide} role={role} />;
      case "next-steps":
        return <NextStepsSection guide={guide} role={role} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-boost-bg">
      <GuideNav
        sections={orderedSections}
        activeSection={activeSection}
        onNavigate={navigateTo}
        companyName={guide.company_name}
        role={role}
        onRoleChange={handleRoleChange}
      />

      <main className="flex-1 overflow-y-auto guide-scrollbar">
        <div className="max-w-5xl mx-auto px-8 py-6 space-y-16">
          {orderedSections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el; }}
            >
              {renderSection(section.id)}
            </div>
          ))}
          <div className="h-8" />
        </div>
      </main>
    </div>
  );
}

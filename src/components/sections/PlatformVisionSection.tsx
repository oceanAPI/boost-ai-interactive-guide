"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { getContent, type CoreComponentsContent } from "@/data/content";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import TodayTab from "./platform-vision/TodayTab";
import RoadmapTab from "./platform-vision/RoadmapTab";
import VisionTab from "./platform-vision/VisionTab";

/* ─── Tab definitions ─── */
type TabId = "today" | "roadmap" | "vision";
const TABS: { id: TabId; label: string; sublabel: string }[] = [
  { id: "today", label: "Today", sublabel: "Shipping in production" },
  { id: "roadmap", label: "2026 Roadmap", sublabel: "Now · Soon · Later" },
  { id: "vision", label: "Vision", sublabel: "Where we're going — and why" },
];

/* ─── Tab button ─── */
function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start text-left px-4 sm:px-5 py-3 rounded-lg transition-all ${
        active
          ? "bg-boost-dark text-white shadow-sm"
          : "bg-white text-boost-muted hover:text-boost-dark border border-boost-border/60"
      }`}
      aria-pressed={active}
    >
      <span className="text-sm font-bold leading-tight">{tab.label}</span>
      <span
        className={`text-[10px] font-medium leading-tight mt-0.5 ${
          active ? "text-white/55" : "text-boost-muted/70"
        }`}
      >
        {tab.sublabel}
      </span>
    </button>
  );
}

/* ─── Main section ─── */
export default function PlatformVisionSection({ guide }: { guide: GuideData }) {
  const content = getContent(
    "platform-vision",
    guide.areas_of_interest,
    guide.company_name,
  ) as CoreComponentsContent;
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const { ref: sectionRef, isVisible } = useScrollReveal({ once: true });

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <SectionHeader
        title="Platform & Vision"
        subtitle="What boost ships today, what's shipping this year, and the story that earns the right to call it self-improving."
        number="Platform"
      />

      {/* Tab switcher */}
      <div
        className={`flex gap-2 sm:gap-3 mb-8 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "150ms" }}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab content — cross-fade */}
      <div className="relative">
        <div
          key={activeTab}
          className="transition-opacity duration-300"
          style={{ opacity: 1 }}
        >
          {activeTab === "today" && <TodayTab content={content} />}
          {activeTab === "roadmap" && <RoadmapTab visible={isVisible} />}
          {activeTab === "vision" && <VisionTab visible={isVisible} />}
        </div>
      </div>
    </section>
  );
}

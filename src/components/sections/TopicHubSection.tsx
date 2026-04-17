"use client";

import type { GuideData } from "@/lib/types";
import type { TopicEntry } from "@/data/topics";
import { getTopicsForGuide } from "@/data/topics";
import { SectionHeader } from "@/components/ui";
import BoostIcon from "@/components/BoostIcon";

function TopicCard({
  topic,
  index,
  onClick,
}: {
  topic: TopicEntry;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group text-left bg-white rounded-xl border-t-[3px] ${topic.color} border border-boost-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-boost-surface flex items-center justify-center flex-shrink-0">
          <BoostIcon name={topic.icon} variant="purple" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-boost-dark group-hover:text-boost-green transition-colors">
            {topic.name}
          </h3>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-boost-muted group-hover:text-boost-green transition-colors flex-shrink-0 mt-0.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <p className="text-xs text-boost-muted leading-relaxed">
        {topic.shortDescription}
      </p>
    </button>
  );
}

interface TopicHubSectionProps {
  guide: GuideData;
  onNavigate: (sectionId: string) => void;
  sectionNumber?: string;
}

export default function TopicHubSection({ guide, onNavigate, sectionNumber }: TopicHubSectionProps) {
  const topics = getTopicsForGuide();

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "03"}
        title="Deep Dive"
        subtitle="Explore the key areas that make boost.ai the right choice for your organization"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {topics.map((topic, i) => (
          <TopicCard
            key={topic.key}
            topic={topic}
            index={i}
            onClick={() => onNavigate(topic.sectionId)}
          />
        ))}
      </div>
    </section>
  );
}

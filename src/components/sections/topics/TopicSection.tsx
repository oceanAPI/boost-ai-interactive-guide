"use client";

import type { TopicEntry } from "@/data/topics/_types";
import { SectionHeader } from "@/components/ui";
import ContentBlockRenderer from "./ContentBlocks";

interface TopicSectionProps {
  topic: TopicEntry;
  sectionNumber: string;
}

export default function TopicSection({ topic, sectionNumber }: TopicSectionProps) {
  return (
    <section data-topic-id={topic.key}>
      <SectionHeader
        number={sectionNumber}
        title={topic.name}
        subtitle={topic.shortDescription}
      />
      <div className="mt-6 space-y-6">
        {topic.content.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} />
        ))}
      </div>
    </section>
  );
}

/**
 * Topic → Component registry
 *
 * Maps topic keys to their specialized section components.
 * When adding a new topic with a custom visualization:
 *   1. Create the component in src/components/sections/
 *   2. Register it here with its topic key
 *   3. Done — GuideClient will automatically use it
 *
 * Topics not registered here fall back to the generic TopicSection renderer.
 */

import type { ComponentType } from "react";
import type { GuideData } from "@/lib/types";
import type { TopicContentBlock } from "./_types";

/** Standard props that every topic section component receives */
export interface TopicSectionProps {
  guide: GuideData;
  sectionNumber: string;
  headerBlocks?: TopicContentBlock[];
  contentBlocks?: TopicContentBlock[];
}

import RoadmapSection from "@/components/sections/RoadmapSection";
import IntegrationArchSection from "@/components/sections/IntegrationArchSection";
import SecurityComplianceSection from "@/components/sections/SecurityComplianceSection";
import WaysOfWorkingSection from "@/components/sections/WaysOfWorkingSection";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Registry of topic keys → specialized section components.
 *
 * To add a new topic with a custom section:
 *   TOPIC_COMPONENTS["my-topic-key"] = MyTopicSection;
 */
export const TOPIC_COMPONENTS: Record<string, ComponentType<TopicSectionProps>> = {
  "implementation": RoadmapSection as any,
  "integrations": IntegrationArchSection as any,
  "security-compliance": SecurityComplianceSection as any,
  "ways-of-working": WaysOfWorkingSection as any,
};

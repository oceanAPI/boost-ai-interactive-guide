export type { TopicEntry, TopicContentBlock } from "./_types";
export { SECURITY_COMPLIANCE } from "./security-compliance";
export { INTEGRATIONS } from "./integrations";
export { WAYS_OF_WORKING } from "./ways-of-working";
export { IMPLEMENTATION } from "./implementation";

import { SECURITY_COMPLIANCE } from "./security-compliance";
import { INTEGRATIONS } from "./integrations";
import { WAYS_OF_WORKING } from "./ways-of-working";
import { IMPLEMENTATION } from "./implementation";
import type { TopicEntry } from "./_types";

/** All topics in hub display order (cards in section 03) */
export const ALL_TOPICS: TopicEntry[] = [
  SECURITY_COMPLIANCE,
  INTEGRATIONS,
  WAYS_OF_WORKING,
  IMPLEMENTATION,
];

/**
 * Topics in page section order (sections 04-07).
 * This defines the order they appear as full sections on the guide page.
 */
export const TOPIC_SECTIONS: TopicEntry[] = [
  IMPLEMENTATION,
  INTEGRATIONS,
  SECURITY_COMPLIANCE,
  WAYS_OF_WORKING,
];

/** Returns all topics for the hub grid */
export function getTopicsForGuide(): TopicEntry[] {
  return ALL_TOPICS;
}

/** Returns topics in page section order */
export function getTopicSections(): TopicEntry[] {
  return TOPIC_SECTIONS;
}

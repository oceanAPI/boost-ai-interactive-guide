/* ─────────────────────────────────────────────
 *  Agent data barrel — public API
 *
 *  Every import from "@/data/agents" resolves here.
 * ───────────────────────────────────────────── */

// Re-export all types and constants
export type {
  FlowNode,
  AgentFlow,
  AgentCapability,
  SpecialistAgent,
  TopicGroup,
  OrchestratorConfig,
  IndustryKey,
  IndustryVariant,
} from "./_types";

export {
  INDUSTRIES,
  SUPPORTING_DEPARTMENTS,
  INDUSTRY_VARIANTS,
  filterAgentsByVariants,
} from "./_types";

// Industry-specific imports
import { BANKING_AGENTS, BANKING_STANDALONE, BANKING_TOPIC_GROUPS } from "./banking";
import { INSURANCE_AGENTS, INSURANCE_TOPIC_GROUPS } from "./insurance";

import type { OrchestratorConfig, SpecialistAgent, TopicGroup } from "./_types";
import { filterAgentsByVariants } from "./_types";

// ─── Orchestrator Config Registry ───

export const ORCHESTRATOR_BY_INDUSTRY: Record<string, OrchestratorConfig> = {
  banking: {
    standaloneAgents: BANKING_STANDALONE,
    topicGroups: BANKING_TOPIC_GROUPS,
  },
  insurance: {
    standaloneAgents: [],
    topicGroups: INSURANCE_TOPIC_GROUPS,
  },
};

/**
 * Get the orchestrator config for given areas of interest.
 * Merges multiple industries if more than one selected.
 *
 * Variants (optional): filters agents by variant keys using OR logic.
 *   - Agent WITHOUT `variants` always shows
 *   - Agent WITH `variants` shows if any variant matches the selection
 *   - Empty/undefined selectedVariants = no filtering
 */
export function getOrchestratorConfig(
  areasOfInterest: string[],
  selectedVariants?: string[],
): OrchestratorConfig {
  const areas = areasOfInterest.length > 0
    ? areasOfInterest
    : Object.keys(ORCHESTRATOR_BY_INDUSTRY);

  const merged: OrchestratorConfig = { standaloneAgents: [], topicGroups: [] };
  const seenLabels = new Set<string>();

  for (const area of areas) {
    const config = ORCHESTRATOR_BY_INDUSTRY[area];
    if (!config) continue;
    merged.standaloneAgents.push(
      ...filterAgentsByVariants(config.standaloneAgents, selectedVariants),
    );
    for (const group of config.topicGroups) {
      // Dedup by label to avoid "Insurance" appearing from both banking and insurance configs
      if (!seenLabels.has(group.label)) {
        seenLabels.add(group.label);
        const filteredAgents = filterAgentsByVariants(group.agents, selectedVariants);
        // Skip empty groups after filtering
        if (filteredAgents.length > 0) {
          const filteredGroup: TopicGroup = { ...group, agents: filteredAgents };
          merged.topicGroups.push(filteredGroup);
        }
      }
    }
  }

  return merged;
}

// ─── Flat agent helpers (for other sections) ───

export function getAgentsForGuide(
  areasOfInterest: string[],
  selectedVariants?: string[],
): SpecialistAgent[] {
  const config = getOrchestratorConfig(areasOfInterest, selectedVariants);
  const all: SpecialistAgent[] = [...config.standaloneAgents];
  for (const group of config.topicGroups) {
    all.push(...group.agents);
  }
  // Dedup by key (an agent may appear as both standalone and in a group)
  const seen = new Set<string>();
  return all.filter((a) => {
    if (seen.has(a.key)) return false;
    seen.add(a.key);
    return true;
  });
}

export const SPECIALIST_AGENTS = [...INSURANCE_AGENTS, ...BANKING_AGENTS];

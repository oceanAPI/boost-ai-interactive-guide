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
} from "./_types";

export { INDUSTRIES, SUPPORTING_DEPARTMENTS } from "./_types";

// Industry-specific imports
import { BANKING_AGENTS, BANKING_STANDALONE, BANKING_TOPIC_GROUPS } from "./banking";
import { INSURANCE_AGENTS, INSURANCE_TOPIC_GROUPS } from "./insurance";

import type { OrchestratorConfig, SpecialistAgent } from "./_types";

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
 */
export function getOrchestratorConfig(areasOfInterest: string[]): OrchestratorConfig {
  const areas = areasOfInterest.length > 0
    ? areasOfInterest
    : Object.keys(ORCHESTRATOR_BY_INDUSTRY);

  const merged: OrchestratorConfig = { standaloneAgents: [], topicGroups: [] };
  const seenLabels = new Set<string>();

  for (const area of areas) {
    const config = ORCHESTRATOR_BY_INDUSTRY[area];
    if (!config) continue;
    merged.standaloneAgents.push(...config.standaloneAgents);
    for (const group of config.topicGroups) {
      // Dedup by label to avoid "Insurance" appearing from both banking and insurance configs
      if (!seenLabels.has(group.label)) {
        seenLabels.add(group.label);
        merged.topicGroups.push(group);
      }
    }
  }

  return merged;
}

// ─── Flat agent helpers (for other sections) ───

export function getAgentsForGuide(areasOfInterest: string[]): SpecialistAgent[] {
  const config = getOrchestratorConfig(areasOfInterest);
  const all: SpecialistAgent[] = [...config.standaloneAgents];
  for (const group of config.topicGroups) {
    all.push(...group.agents);
  }
  return all;
}

export const SPECIALIST_AGENTS = [...INSURANCE_AGENTS, ...BANKING_AGENTS];

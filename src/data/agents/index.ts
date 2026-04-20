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
  AgentTier,
} from "./_types";

export {
  INDUSTRIES,
  HIDDEN_INDUSTRIES,
  SUPPORTING_DEPARTMENTS,
  INDUSTRY_VARIANTS,
  filterAgentsByVariants,
} from "./_types";

// Industry-specific imports
import { BANKING_AGENTS, BANKING_STANDALONE, BANKING_TOPIC_GROUPS } from "./banking";
import { INSURANCE_AGENTS, INSURANCE_TOPIC_GROUPS } from "./insurance";
import { PENSION_AGENTS, PENSION_TOPIC_GROUPS } from "./pension";
import { WEALTH_MANAGEMENT_AGENTS, WEALTH_MANAGEMENT_TOPIC_GROUPS } from "./wealth_management";
import { FINTECH_AGENTS, FINTECH_TOPIC_GROUPS } from "./fintech";
import { CREDIT_UNION_AGENTS, CREDIT_UNION_TOPIC_GROUPS } from "./credit_union";
import { SECURITY_AGENTS, SECURITY_TOPIC_GROUPS } from "./security";

import type { AgentTier, OrchestratorConfig, SpecialistAgent, TopicGroup } from "./_types";
import { filterAgentsByVariants } from "./_types";

/* ─────────────────────────────────────────────
 *  Display cap + tier-priority sort
 *
 *  A customer never sees more than MAX_AGENTS_DISPLAYED agents across all
 *  selected industries. When the combined set would exceed the cap, we
 *  drop lowest-tier agents first (light → addon → primary never dropped
 *  unless primary alone exceeds the cap).
 *
 *  The sort prefers:
 *    1. Lower tier weight (primary before addon before light)
 *    2. Agents whose declared variants intersect the selection
 *       (relevance boost when the customer picks specific variants)
 *
 *  This keeps the cap predictable and forces us to keep the "primary" set
 *  tight: if one industry has 20+ primary agents, lower industries get
 *  zero coverage. That's a deliberate constraint.
 * ───────────────────────────────────────────── */

export const MAX_AGENTS_DISPLAYED = 20;

const TIER_WEIGHT: Record<AgentTier, number> = {
  primary: 0,
  addon: 1,
  light: 2,
};

function tierOf(agent: SpecialistAgent): AgentTier {
  return agent.tier ?? "primary";
}

/**
 * Score an agent for display ordering — lower score = higher priority.
 * Primary agents come first; within a tier, variant-matched agents rank above
 * universal ones. Stable enough to not reshuffle between renders.
 */
function agentDisplayScore(
  agent: SpecialistAgent,
  selectedVariants: string[] | undefined,
): number {
  const tierScore = TIER_WEIGHT[tierOf(agent)] * 10;
  const hasVariantMatch =
    selectedVariants && selectedVariants.length > 0 &&
    agent.variants?.some((v) => selectedVariants.includes(v));
  const variantBoost = hasVariantMatch ? 0 : 1; // matched = 0, unmatched = 1
  return tierScore + variantBoost;
}

/**
 * Given an OrchestratorConfig and the selection context, return the set of
 * agent keys allowed to render after applying the 20-agent cap. Lower-tier
 * agents drop first.
 */
function computeAllowedKeys(
  config: OrchestratorConfig,
  selectedVariants: string[] | undefined,
): Set<string> {
  const seen = new Set<string>();
  const flat: SpecialistAgent[] = [];
  for (const a of config.standaloneAgents) {
    if (!seen.has(a.key)) { seen.add(a.key); flat.push(a); }
  }
  for (const group of config.topicGroups) {
    for (const a of group.agents) {
      if (!seen.has(a.key)) { seen.add(a.key); flat.push(a); }
    }
  }
  flat.sort((a, b) => agentDisplayScore(a, selectedVariants) - agentDisplayScore(b, selectedVariants));
  return new Set(flat.slice(0, MAX_AGENTS_DISPLAYED).map((a) => a.key));
}

/**
 * Prune an OrchestratorConfig down to only the allowed agent keys, preserving
 * original topic-group structure. Groups that empty out are dropped.
 */
function pruneConfig(config: OrchestratorConfig, allowedKeys: Set<string>): OrchestratorConfig {
  const standaloneAgents = config.standaloneAgents.filter((a) => allowedKeys.has(a.key));
  const topicGroups: TopicGroup[] = config.topicGroups
    .map((g) => ({ ...g, agents: g.agents.filter((a) => allowedKeys.has(a.key)) }))
    .filter((g) => g.agents.length > 0);
  return { standaloneAgents, topicGroups };
}

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
  pension: {
    standaloneAgents: [],
    topicGroups: PENSION_TOPIC_GROUPS,
  },
  wealth_management: {
    standaloneAgents: [],
    topicGroups: WEALTH_MANAGEMENT_TOPIC_GROUPS,
  },
  fintech: {
    standaloneAgents: [],
    topicGroups: FINTECH_TOPIC_GROUPS,
  },
  credit_union: {
    standaloneAgents: [],
    topicGroups: CREDIT_UNION_TOPIC_GROUPS,
  },
  security: {
    standaloneAgents: [],
    topicGroups: SECURITY_TOPIC_GROUPS,
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

  // Apply tier-priority 20-agent cap so guide / slides / search / SOW
  // render a consistent set.
  const allowedKeys = computeAllowedKeys(merged, selectedVariants);
  return pruneConfig(merged, allowedKeys);
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

export const SPECIALIST_AGENTS = [...INSURANCE_AGENTS, ...BANKING_AGENTS, ...PENSION_AGENTS, ...WEALTH_MANAGEMENT_AGENTS, ...FINTECH_AGENTS, ...CREDIT_UNION_AGENTS, ...SECURITY_AGENTS];

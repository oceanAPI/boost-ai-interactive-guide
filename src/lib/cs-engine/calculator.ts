/**
 * CS Decision Engine — Priority Calculator (client-side port)
 *
 * Faithful port of the CSM Decision Engine's `src/engine/calculator.ts`.
 * Ranks initiatives for a customer given the per-issue severities produced by
 * `detectIssues`. The original read from a stateful `DataStore`; this port takes
 * plain arrays + a severity map so it runs unchanged client-side now and can be
 * lifted into a Supabase Edge Function later.
 *
 * Formula (unchanged from the engine): for each initiative,
 *   priority = effectiveSeverity × effortMultiplier × issueImportance × hierarchyMultiplier
 * Blocked (unmet prerequisites) or zero-severity initiatives get priority 0.
 */

import type { RawInitiative } from "@/data/cs-engine/initiatives";

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

export interface WeightConfig {
  typeMultipliers: Record<string, number>;
  impactBonuses: Record<string, number>;
  effortMultipliers: Record<string, number>;
  issueImportance: Record<number, number>; // Issue ID -> importance multiplier (0-2)
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  typeMultipliers: {
    Fix: 1.2,
    Optimize: 0.9,
    Expand: 0.8,
    Expansion: 0.8,
    Upselling: 0.8,
    "Risk mitigation": 1.0,
    "Model improvement": 1.1,
  },
  impactBonuses: {
    High: 0.3,
    Medium: 0.2,
    Low: 0.1,
    None: 0,
  },
  effortMultipliers: {
    Low: 1.2,
    Medium: 1.0,
    High: 0.7,
  },
  issueImportance: {}, // Empty = all issues at default importance (1.0)
};

export interface PriorityResult {
  initiative: RawInitiative;
  priority: number;
  rank: number;
  blocked: boolean;
  blockedBy: number[];

  // Breakdown for explainability
  calculation: {
    issueSeverity: number;
    effortMultiplier: number;
    hierarchyMultiplier: number;
    formula: string;
  };
}

// Hierarchy context for company/instance-level prioritization
export interface HierarchyContext {
  instanceCount: number; // Number of instances in this company
  companyARR?: number; // Company's total ARR
  companyPhase?: string; // Company lifecycle phase
}

// ----------------------------------------------------------------------------
// HIERARCHY-AWARE SCORING
// ----------------------------------------------------------------------------

const COMPANY_LEVEL_TYPES = ["Upselling", "Expand", "Risk mitigation"];

const COMPANY_LEVEL_KEYWORDS = [
  "contract",
  "renewal",
  "strategic",
  "stakeholder",
  "relationship",
  "company-wide",
  "enable llm",
  "voice",
  "human chat",
  "proactivity",
  "segment",
];

export function isCompanyLevelInitiative(initiative: RawInitiative): boolean {
  if (COMPANY_LEVEL_TYPES.includes(initiative.type)) return true;
  const nameLower = initiative.name.toLowerCase();
  return COMPANY_LEVEL_KEYWORDS.some((kw) => nameLower.includes(kw));
}

export function calculateHierarchyMultiplier(
  initiative: RawInitiative,
  context: HierarchyContext,
): number {
  let multiplier = 1.0;
  if (!isCompanyLevelInitiative(initiative)) return multiplier;

  // Scale by number of instances affected (cap at +0.5)
  multiplier += Math.min(context.instanceCount * 0.1, 0.5);

  // Boost for high-ARR companies (> 100k)
  if (context.companyARR && context.companyARR > 100000) multiplier += 0.2;

  // Boost for companies in onboarding phase (critical period)
  if (context.companyPhase === "onboarding") multiplier += 0.15;

  return multiplier;
}

// ----------------------------------------------------------------------------
// CALCULATION
// ----------------------------------------------------------------------------

export function getBlockingPrerequisites(
  initiative: RawInitiative,
  completedIds: Set<number>,
): number[] {
  return initiative.prerequisites.filter((id) => !completedIds.has(id));
}

export function calculateSinglePriority(
  initiative: RawInitiative,
  effectiveSeverity: number,
  completedIds: Set<number>,
  weights: WeightConfig,
  hierarchyContext?: HierarchyContext,
): PriorityResult {
  const blockedBy = getBlockingPrerequisites(initiative, completedIds);
  const blocked = blockedBy.length > 0;

  if (blocked || effectiveSeverity <= 0) {
    return {
      initiative,
      priority: 0,
      rank: 0,
      blocked,
      blockedBy,
      calculation: {
        issueSeverity: effectiveSeverity,
        effortMultiplier: 0,
        hierarchyMultiplier: 1.0,
        formula: blocked
          ? `BLOCKED by prerequisites: [${blockedBy.join(", ")}]`
          : "Issue not detected (severity = 0)",
      },
    };
  }

  const effortMultiplier = weights.effortMultipliers[initiative.effortLevel] ?? 1.0;
  const issueImportance = weights.issueImportance[initiative.relatedIssueId] ?? 1.0;
  const hierarchyMultiplier = hierarchyContext
    ? calculateHierarchyMultiplier(initiative, hierarchyContext)
    : 1.0;

  const priority = effectiveSeverity * effortMultiplier * issueImportance * hierarchyMultiplier;

  const hierarchyNote =
    hierarchyMultiplier !== 1.0 ? ` × ${hierarchyMultiplier.toFixed(2)} (company-level)` : "";
  const formula = `${effectiveSeverity.toFixed(3)} × ${effortMultiplier.toFixed(2)} (${initiative.effortLevel})${hierarchyNote} = ${priority.toFixed(4)}`;

  return {
    initiative,
    priority,
    rank: 0,
    blocked: false,
    blockedBy: [],
    calculation: { issueSeverity: effectiveSeverity, effortMultiplier, hierarchyMultiplier, formula },
  };
}

/**
 * Rank every initiative. `severityByIssueId` carries the detected severity per
 * issue (from `detectIssues`); issues absent from the map score 0.
 */
export function calculateAllPriorities(
  initiatives: RawInitiative[],
  severityByIssueId: Map<number, number>,
  completedIds: Set<number>,
  weights: WeightConfig = DEFAULT_WEIGHTS,
  hierarchyContext?: HierarchyContext,
): PriorityResult[] {
  const results = initiatives.map((initiative) =>
    calculateSinglePriority(
      initiative,
      severityByIssueId.get(initiative.relatedIssueId) ?? 0,
      completedIds,
      weights,
      hierarchyContext,
    ),
  );

  results.sort((a, b) => b.priority - a.priority);
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}

/** Top N actionable (non-blocked, non-zero) priorities. */
export function getTopPriorities(
  initiatives: RawInitiative[],
  severityByIssueId: Map<number, number>,
  completedIds: Set<number>,
  n = 10,
  weights: WeightConfig = DEFAULT_WEIGHTS,
  hierarchyContext?: HierarchyContext,
): PriorityResult[] {
  return calculateAllPriorities(initiatives, severityByIssueId, completedIds, weights, hierarchyContext)
    .filter((r) => !r.blocked && r.priority > 0)
    .slice(0, n);
}

/** What completing `initiativeId` would unblock. */
export function getUnlockedByCompletion(
  initiatives: RawInitiative[],
  completedIds: Set<number>,
  initiativeId: number,
): RawInitiative[] {
  const withNewCompleted = new Set(completedIds);
  withNewCompleted.add(initiativeId);

  return initiatives.filter((init) => {
    const currentlyBlocked = getBlockingPrerequisites(init, completedIds).length > 0;
    const wouldBeUnblocked = getBlockingPrerequisites(init, withNewCompleted).length === 0;
    return currentlyBlocked && wouldBeUnblocked;
  });
}

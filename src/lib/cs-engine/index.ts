/**
 * CS Decision Engine — public entry point (client-side port).
 *
 * Ties detection → ranking: feed a customer's metrics, get back the detected
 * issues and the prioritised initiatives. Pure + framework-agnostic — the same
 * `runEngine` runs in the browser today and can move into a Supabase Edge
 * Function unchanged later. The learning loop (weight tuning from CSM feedback)
 * lands in the backend phase; for now weights default to `DEFAULT_WEIGHTS`.
 */

import { initiatives, type RawInitiative } from "@/data/cs-engine/initiatives";
import { detectIssues, type CustomerMetrics, type DetectedIssue } from "./detection";
import {
  calculateAllPriorities,
  DEFAULT_WEIGHTS,
  type HierarchyContext,
  type PriorityResult,
  type WeightConfig,
} from "./calculator";

export type { CustomerMetrics, DetectedIssue } from "./detection";
export type { PriorityResult, HierarchyContext, WeightConfig } from "./calculator";
export { DEFAULT_WEIGHTS } from "./calculator";
export { getDefaultMetrics } from "./detection";
export { initiatives, type RawInitiative };

export interface RunEngineOptions {
  /** Which metric fields the user explicitly set — drives boolean-issue skipping. */
  metricsSet?: Record<string, boolean>;
  /** Initiative IDs already completed — their dependents become unblocked. */
  completedInitiativeIds?: Iterable<number>;
  /** Override the default scoring weights (the learning loop will supply these later). */
  weights?: WeightConfig;
  /** Company/instance context for the hierarchy boost. */
  hierarchy?: HierarchyContext;
}

export interface EngineResult {
  /** Every rule's verdict (detected + severity + reason), in rule order. */
  issues: DetectedIssue[];
  /** Just the detected issues, severity-descending — the headline list. */
  detectedIssues: DetectedIssue[];
  /** All initiatives ranked by priority (blocked + zero-severity sink to the bottom). */
  priorities: PriorityResult[];
  /** Actionable top slice: non-blocked, non-zero priority. */
  topPriorities: PriorityResult[];
}

export function runEngine(metrics: CustomerMetrics, options: RunEngineOptions = {}): EngineResult {
  const issues = detectIssues(metrics, { metricsSet: options.metricsSet });

  const severityByIssueId = new Map<number, number>();
  for (const issue of issues) {
    if (issue.detected && issue.severity > 0) severityByIssueId.set(issue.issueId, issue.severity);
  }

  const completedIds = new Set<number>(options.completedInitiativeIds ?? []);
  const weights = options.weights ?? DEFAULT_WEIGHTS;

  const priorities = calculateAllPriorities(
    initiatives,
    severityByIssueId,
    completedIds,
    weights,
    options.hierarchy,
  );

  const detectedIssues = issues
    .filter((i) => i.detected && i.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  const topPriorities = priorities.filter((r) => !r.blocked && r.priority > 0);

  return { issues, detectedIssues, priorities, topPriorities };
}

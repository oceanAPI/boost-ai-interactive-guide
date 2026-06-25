/**
 * CS Decision Engine — suggestion layer.
 *
 * Turns the engine's detected issues + the customer's industry into a
 * *ranked, reasoned* shortlist of success stories, story-spine chapters,
 * and agentic before/after outcomes. The CSM sees what we suggest and
 * *why*, then accepts or overrides — nothing is auto-applied.
 *
 * Pure + framework-agnostic, like the rest of cs-engine: feed a Customer,
 * get back ranked items with human-readable reasons. No I/O, no React.
 */

import type { Customer, AgenticOutcome, Recommendation } from "@/lib/types";
import {
  SUCCESS_STORIES,
  type SuccessStory,
  type StoryChapterTag,
} from "@/data/success-stories";
import { metricsFromCustomer } from "./metrics";
import { runEngine, type DetectedIssue } from "./index";

/* ─── Issue → theme map ──────────────────────────────────────────
 *  Each engine issue argues for one story-spine beat. Severity from the
 *  detector flows through, so a customer's worst problems pull the
 *  matching stories/chapters to the top. Issues not listed don't steer
 *  story selection (they still drive recommendations elsewhere). */
export const ISSUE_THEME: Record<number, StoryChapterTag> = {
  // Agentic adoption — automation / coverage / model quality
  4: "agentic-adoption", // LLM upsell
  8: "agentic-adoption", // automation rate
  9: "agentic-adoption", // unsolved rate
  34: "agentic-adoption", // unknown in top 5
  41: "agentic-adoption", // high unknown rate
  46: "agentic-adoption", // model improvements
  // Personalised CX — CSAT / trust / personalisation
  5: "personalised-cx", // human chat upsell
  10: "personalised-cx", // immediate escalations
  15: "personalised-cx", // authentication (personalisation)
  16: "personalised-cx", // API integrations
  17: "personalised-cx", // CSAT below target
  33: "personalised-cx", // "talk to human" top intent (trust)
  // Channels — volume / cost / reach
  2: "channels", // voice upsell
  3: "channels", // chat upsell
  6: "channels", // cost per conversation
  7: "channels", // cost other channels
  37: "channels", // adoption
  39: "channels", // volume potential
  40: "channels", // proactivity
};

/* Variant-prefix → success-story `industry` label. The Customer stores
 * industry as `selected_variants` keys like "banking:retail"; stories
 * are labelled "Banking", "Insurance", … so we bridge the two. */
const VARIANT_INDUSTRY: Record<string, string> = {
  banking: "Banking",
  insurance: "Insurance",
  pension: "Pension",
  wealth_management: "Wealth Management",
  fintech: "Fintech",
  credit_union: "Credit Union",
};

export const W_INDUSTRY = 3; // exact industry match — strongest signal
export const W_THEME = 4; // summed severity of issues for the story's chapter
export const W_GEO = 0.5; // shared geography (Nordic etc.)
export const BASE = 0.25; // every catalogue story stays eligible

export interface ScoredStory {
  story: SuccessStory;
  score: number;
  reasons: string[];
}

export interface ScoredChapter {
  chapter: StoryChapterTag;
  score: number;
  reasons: string[];
}

export interface ChapterMeta {
  tag: StoryChapterTag;
  label: string;
}
export const CHAPTER_LABELS: Record<StoryChapterTag, string> = {
  "agentic-adoption": "Agentic adoption",
  "personalised-cx": "Personalised CX",
  sales: "Sales & revenue",
  channels: "Channels",
};

/** Normalised industry labels this customer belongs to. */
export function customerIndustries(customer: Customer): Set<string> {
  const out = new Set<string>();
  for (const v of customer.selected_variants ?? []) {
    const prefix = v.split(":")[0]?.trim().toLowerCase();
    const label = prefix ? VARIANT_INDUSTRY[prefix] : undefined;
    if (label) out.add(label);
  }
  return out;
}

/** Customer geo tokens, lower-cased, for soft geo matching. Derived from
 *  the company name / url since there's no dedicated country field. */
function customerGeoTokens(customer: Customer): string[] {
  const raw = [customer.company_name, customer.company_url]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const nordic = ["norway", "sweden", "denmark", "finland", "nordic"];
  return nordic.filter((n) => raw.includes(n));
}

/** Severity summed per chapter theme from the engine's detected issues. */
export function themeWeights(
  detectedIssues: DetectedIssue[],
): Record<StoryChapterTag, number> {
  const weights: Record<StoryChapterTag, number> = {
    "agentic-adoption": 0,
    "personalised-cx": 0,
    sales: 0,
    channels: 0,
  };
  for (const issue of detectedIssues) {
    const theme = ISSUE_THEME[issue.issueId];
    if (theme) weights[theme] += issue.severity;
  }
  return weights;
}

/** Top issue reasons for a given chapter, highest severity first. */
function topReasonsForTheme(
  detectedIssues: DetectedIssue[],
  theme: StoryChapterTag,
  limit = 2,
): string[] {
  return detectedIssues
    .filter((i) => ISSUE_THEME[i.issueId] === theme)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, limit)
    .map((i) => i.reason)
    .filter(Boolean);
}

/** Run the engine for a customer and return its detected issues. */
function detectedFor(customer: Customer): DetectedIssue[] {
  const mapped = metricsFromCustomer(customer);
  if (Object.keys(mapped.metricsSet).length === 0) return [];
  return runEngine(mapped.metrics, {
    metricsSet: mapped.metricsSet,
    hierarchy: mapped.hierarchy,
  }).detectedIssues;
}

/** Ranked success stories with the reasons each is suggested. */
export function suggestStories(
  customer: Customer,
  opts: { limit?: number } = {},
): ScoredStory[] {
  const industries = customerIndustries(customer);
  const geo = customerGeoTokens(customer);
  const detected = detectedFor(customer);
  const themes = themeWeights(detected);

  const scored: ScoredStory[] = SUCCESS_STORIES.map((story) => {
    const reasons: string[] = [];
    let score = BASE;

    if (industries.has(story.industry)) {
      score += W_INDUSTRY;
      reasons.push(`${story.industry} peer`);
    }

    const themeWeight = themes[story.chapter] ?? 0;
    if (themeWeight > 0) {
      score += themeWeight * W_THEME;
      const why = topReasonsForTheme(detected, story.chapter, 1)[0];
      reasons.push(
        why
          ? `Speaks to: ${why}`
          : `Matches ${CHAPTER_LABELS[story.chapter]} focus`,
      );
    }

    if (geo.length && story.geo) {
      const g = story.geo.toLowerCase();
      if (geo.some((t) => g.includes(t))) {
        score += W_GEO;
        reasons.push("Same region");
      }
    }

    return { story, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  const limit = opts.limit ?? 6;
  return scored.slice(0, limit);
}

/** Story-spine chapters ranked by how much the customer's issues argue
 *  for each beat. Drives "which chapters to feature" suggestions. */
export function suggestChapters(customer: Customer): ScoredChapter[] {
  const detected = detectedFor(customer);
  const themes = themeWeights(detected);
  const order: StoryChapterTag[] = [
    "agentic-adoption",
    "personalised-cx",
    "sales",
    "channels",
  ];
  return order
    .map((tag) => ({
      chapter: tag,
      score: themes[tag] ?? 0,
      reasons: topReasonsForTheme(detected, tag, 2),
    }))
    .sort((a, b) => b.score - a.score);
}

/** Suggested agentic before/after outcomes, derived from the top
 *  industry/issue-matched stories that carry a WAS→NOW pair. The CSM
 *  accepts these into `agentic_outcomes`; each keeps a provenance note
 *  so the source story is auditable. */
export function suggestAgenticOutcomes(
  customer: Customer,
  opts: { limit?: number } = {},
): { outcome: AgenticOutcome; sourceStoryId: string; reasons: string[] }[] {
  const ranked = suggestStories(customer, { limit: 12 }).filter(
    (s) => s.story.before && s.story.after,
  );
  const limit = opts.limit ?? 4;
  return ranked.slice(0, limit).map(({ story, reasons }) => ({
    sourceStoryId: story.id,
    reasons: reasons.length ? reasons : [`${story.industry} reference`],
    outcome: {
      topic: story.subtitle || story.title,
      before: { label: "Before", value: story.before },
      after: { label: "After", value: story.after },
      narrative: `Reference pattern from ${story.name} (${story.industry}). ${story.outcome}`,
      evidence: story.keyMetrics,
    },
  }));
}

/* ─── Recommendations from the success engine ────────────────────
 *  The decision engine's top-ranked *initiatives* (priority =
 *  severity × effort × importance × hierarchy) mapped into the
 *  guide's `Recommendation` shape. The CSM accepts these into
 *  `recommendations` — each carries the engine rank + scoring
 *  formula as its rationale, so the grid is seeded from proven
 *  signal but stays fully editable (add / reorder / delete). */
const EFFORT_LEVEL_MAP: Record<string, NonNullable<Recommendation["effort"]>> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

export interface ScoredRecommendation {
  recommendation: Recommendation;
  sourceInitiativeId: number;
  priority: number;
  rank: number;
  reasons: string[];
}

export function suggestRecommendations(
  customer: Customer,
  opts: { limit?: number } = {},
): ScoredRecommendation[] {
  const mapped = metricsFromCustomer(customer);
  if (Object.keys(mapped.metricsSet).length === 0) return [];
  const { topPriorities } = runEngine(mapped.metrics, {
    metricsSet: mapped.metricsSet,
    hierarchy: mapped.hierarchy,
  });
  const limit = opts.limit ?? 6;
  return topPriorities.slice(0, limit).map((p) => {
    const init = p.initiative;
    const effort = EFFORT_LEVEL_MAP[init.effortLevel] ?? "medium";
    const severity = p.calculation.issueSeverity;
    const confidence: NonNullable<Recommendation["confidence"]> =
      severity >= 0.5 ? "high" : severity >= 0.2 ? "medium" : "low";
    const urgency: NonNullable<Recommendation["urgency"]> =
      init.timelineWeeks == null
        ? "this-quarter"
        : init.timelineWeeks <= 2
          ? "immediate"
          : init.timelineWeeks <= 6
            ? "this-quarter"
            : init.timelineWeeks <= 12
              ? "this-year"
              : "exploratory";
    return {
      sourceInitiativeId: init.id,
      priority: p.priority,
      rank: p.rank,
      reasons: [
        init.relatedIssueName,
        `Engine rank #${p.rank}`,
        `${init.effortLevel} effort`,
      ].filter(Boolean),
      recommendation: {
        title: init.name,
        rationale: `Detected issue: ${init.relatedIssueName}. ${p.calculation.formula}`,
        weight: Math.max(0, Math.min(1, p.priority)),
        effort,
        urgency,
        confidence,
        value_label: `${init.businessImpact} business impact`,
        tags: [init.type, init.relatedIssueName],
      },
    };
  });
}

/* ─────────────────────────────────────────────
 *  Content resolver — public API
 *
 *  Components call:
 *    const content = getContent("hero", areasOfInterest);
 *
 *  Today this reads from static imports.
 *  FUTURE (auth): swap the resolver internals to
 *  fetch from an API — components stay unchanged.
 * ───────────────────────────────────────────── */

import type { SectionContentMap, SectionId, IndustryContentOverrides } from "./_types";
import { DEFAULTS } from "./_defaults";

// Industry override registry
import { BANKING_OVERRIDES } from "./banking";
import { INSURANCE_OVERRIDES } from "./insurance";

const INDUSTRY_OVERRIDES: Record<string, IndustryContentOverrides> = {
  banking: BANKING_OVERRIDES,
  insurance: INSURANCE_OVERRIDES,
  // Add new industries here:
  // credit_union: CREDIT_UNION_OVERRIDES,
  // fintech: FINTECH_OVERRIDES,
  // wealth_management: WEALTH_MANAGEMENT_OVERRIDES,
  // pension: PENSION_OVERRIDES,
};

// ─── Deep merge helper (2 levels deep is enough for our shapes) ───

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const val = override[key];
    if (val === undefined) continue;
    // If both are plain objects (not arrays), merge one level deeper
    if (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = { ...(result[key] as Record<string, unknown>), ...(val as Record<string, unknown>) } as T[keyof T];
    } else {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

// ─── Resolver ───

/**
 * Get content for a section, with industry-specific overrides merged in.
 *
 * @param sectionId  — which section's content to retrieve
 * @param areasOfInterest — the selected industries (first match wins for overrides)
 * @param companyName — optional, replaces {{company_name}} placeholders
 *
 * FUTURE: This function signature stays the same when auth is added.
 * The internals will change from static imports to API fetch.
 */
export function getContent<K extends SectionId>(
  sectionId: K,
  areasOfInterest: string[] = [],
  companyName?: string,
): SectionContentMap[K] {
  // Start with defaults
  const base = DEFAULTS[sectionId];

  // Find first matching industry override
  let merged = base;
  for (const area of areasOfInterest) {
    const overrides = INDUSTRY_OVERRIDES[area];
    if (overrides && overrides[sectionId]) {
      merged = deepMerge(
        base as unknown as Record<string, unknown>,
        overrides[sectionId] as unknown as Partial<Record<string, unknown>>,
      ) as unknown as SectionContentMap[K];
      break; // first match wins
    }
  }

  // Replace {{company_name}} placeholders if company name provided
  if (companyName) {
    merged = JSON.parse(
      JSON.stringify(merged).replace(/\{\{company_name\}\}/g, companyName),
    ) as SectionContentMap[K];
  }

  return merged;
}

// ─── Convenience: get all content for a guide at once ───

export function getAllContent(
  areasOfInterest: string[] = [],
  companyName?: string,
): SectionContentMap {
  const sections = Object.keys(DEFAULTS) as SectionId[];
  const result: Record<string, unknown> = {};
  for (const id of sections) {
    result[id] = getContent(id, areasOfInterest, companyName);
  }
  return result as unknown as SectionContentMap;
}

// Re-export types for component use
export type { SectionContentMap, SectionId } from "./_types";
export type {
  HeroContent,
  CaseStudyContent,
  TrustValidationContent,
  VoiceContent,
  CoreComponentsContent,
  ImpactContent,
  ScopeOfWorkContent,
  AuthImpactsContent,
  BoostCampContent,
  CommercialOfferContent,
  CustomSectionContent,
  ROIContent,
  NextStepsContent,
} from "./_types";

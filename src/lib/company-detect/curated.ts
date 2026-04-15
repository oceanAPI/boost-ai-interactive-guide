/**
 * Tier 1 — curated library lookup.
 *
 * Wraps the existing `searchCompanies` pattern search into the public
 * DetectionResult shape. When operational tech replaces this tier (e.g.
 * swaps to a CRM-backed customer registry), only this file changes.
 */

import { searchCompanies, type CompanyPattern } from "@/data/company-patterns";
import type { DetectionResult } from "./types";

export function patternToResult(pattern: CompanyPattern): DetectionResult {
  return {
    source: "curated",
    confidence: "high",
    match: {
      name: pattern.name,
      domain: pattern.domain,
      country: pattern.country,
      category: pattern.category,
    },
    prefill: pattern.prefill,
    debug: {
      query: "",
      tier: "curated",
      reason: `Matched curated pattern "${pattern.key}"`,
    },
  };
}

export function detectFromCurated(query: string, limit = 5): DetectionResult[] {
  const patterns = searchCompanies(query, limit);
  return patterns.map(patternToResult);
}

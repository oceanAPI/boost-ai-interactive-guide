/**
 * Tier 1 — curated library lookup.
 *
 * Wraps the existing `searchCompanies` pattern search into the public
 * DetectionResult shape. When operational tech replaces this tier (e.g.
 * swaps to a CRM-backed customer registry), only this file changes.
 */

import { searchCompanies, type CompanyPattern } from "@/data/company-patterns";
import { getCustomerFixture } from "@/data/customer-fixtures";
import type { DetectionResult } from "./types";

export function patternToResult(pattern: CompanyPattern): DetectionResult {
  // Overlay the CE fixture (if one exists for this key) on top of the
  // Sales-oriented pattern prefill. Fixture fields win on conflict —
  // they are the richer, CE-specific source. Sales consumers continue
  // to read the overlaid prefill transparently because every fixture
  // field is additive-optional on Customer/GuideFormData.
  const fixture = getCustomerFixture(pattern.key);
  const prefill = fixture ? { ...pattern.prefill, ...fixture } : pattern.prefill;

  return {
    source: "curated",
    confidence: "high",
    match: {
      name: pattern.name,
      domain: pattern.domain,
      country: pattern.country,
      category: pattern.category,
      logoUrl: pattern.logoUrl,
    },
    prefill,
    debug: {
      query: "",
      tier: "curated",
      reason: fixture
        ? `Matched curated pattern "${pattern.key}" + CE fixture`
        : `Matched curated pattern "${pattern.key}"`,
    },
  };
}

export function detectFromCurated(query: string, limit = 5): DetectionResult[] {
  const patterns = searchCompanies(query, limit);
  return patterns.map(patternToResult);
}

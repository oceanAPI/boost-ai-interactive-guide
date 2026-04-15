/**
 * Company detection — stable public contract.
 *
 * The admin page only imports from this file + index.ts. When the underlying
 * implementation is replaced (e.g. by a real enrichment API, a CRM-driven
 * lookup, or a backend worker), keep this type stable and the UI keeps working.
 */

import type { GuideFormData } from "@/lib/types";

/** Where the detection answer came from. Drives UI treatment (badge, colour). */
export type DetectionSource = "curated" | "web" | "none";

/** How confident we are that this is a real, useful match. */
export type DetectionConfidence = "high" | "medium" | "low";

/** A single result. `prefill` is optional — web-tier results may only guess partial data. */
export interface DetectionResult {
  source: DetectionSource;
  confidence: DetectionConfidence;

  /** Display metadata shown in the UI before apply. */
  match?: {
    name: string;
    domain?: string;
    country?: string;
    category?: string;
    logoUrl?: string;
    /** Human-readable short description, if available. */
    summary?: string;
  };

  /** The actual form data to merge when the AE confirms. */
  prefill?: Partial<GuideFormData>;

  /** For debugging / dev — the raw source that produced the guess. Not displayed. */
  debug?: {
    query: string;
    tier: DetectionSource;
    reason?: string;
    keywordsMatched?: string[];
  };
}

/** Multiple results, ordered by relevance. */
export interface DetectionResultSet {
  query: string;
  results: DetectionResult[];
}

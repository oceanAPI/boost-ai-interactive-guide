/**
 * Company detection — the single public entry point.
 *
 * ════════════════════════════════════════════════════════════
 *  STABILITY CONTRACT
 *
 *  The admin page imports exactly this:
 *    import { detectCompany, type DetectionResult } from "@/lib/company-detect";
 *
 *  When operational tech takes over (proper CRM integration, a backend
 *  enrichment API, a Cloudflare Worker, anything), keep the shape of
 *  `detectCompany(query) → Promise<DetectionResult[]>` stable. Swap
 *  internals freely. UI never changes.
 * ════════════════════════════════════════════════════════════
 */

import { detectFromCurated } from "./curated";
import { detectFromWeb } from "./web";
import type { DetectionResult, DetectionResultSet } from "./types";

export type { DetectionResult, DetectionResultSet, DetectionSource, DetectionConfidence } from "./types";

/**
 * Synchronous first-pass — curated library only. Cheap and safe to call
 * on every keystroke for instant dropdown feedback.
 */
export function detectCompanyFast(query: string, limit = 5): DetectionResult[] {
  return detectFromCurated(query, limit);
}

/**
 * Full detection — curated first, web fallback if the curated tier
 * returns nothing. Use for debounced lookup (e.g. 600ms after typing
 * pause) to avoid hammering the web tier.
 *
 * Guarantees:
 *  - Never throws
 *  - Returns within ~5s (web tier has internal timeout)
 *  - Curated results always first, web results appended after
 */
export async function detectCompany(query: string, limit = 5): Promise<DetectionResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const curated = detectFromCurated(q, limit);
  if (curated.length > 0) return curated;

  // Curated came up empty — consult the web tier.
  const web = await detectFromWeb(q);
  return web.slice(0, limit);
}

/**
 * Convenience wrapper that returns the full result set including the
 * original query — handy when the caller needs to log or display the
 * search that produced the results.
 */
export async function detectCompanyResultSet(query: string, limit = 5): Promise<DetectionResultSet> {
  const results = await detectCompany(query, limit);
  return { query, results };
}

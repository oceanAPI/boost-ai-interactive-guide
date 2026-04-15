/**
 * Keyword → industry/variant classifier.
 *
 * Given a free-text blob (web summary, company description), returns a
 * best-guess set of areas_of_interest and selected_variants plus which
 * keywords drove the match. Deliberately small and deterministic — easy
 * to reason about and replace with an LLM call later without changing
 * callers.
 */

export interface ClassifierResult {
  /** Suggested areas_of_interest (industry keys). */
  areas: string[];
  /** Suggested variant keys (e.g. "insurance:mutual"). */
  variants: string[];
  /** Which keywords matched — useful for debug/explanation. */
  matchedKeywords: string[];
  /** 0..1 — rough confidence based on how many signals fired. */
  confidence: number;
}

interface KeywordRule {
  /** Lowercased keywords/phrases to look for in the summary. */
  keywords: string[];
  /** Area keys to add if any keyword matches. */
  areas?: string[];
  /** Variant keys to add if any keyword matches. */
  variants?: string[];
}

const RULES: KeywordRule[] = [
  /* ── Industries ── */
  { keywords: ["insurance", "insurer", "insure", "forsikring", "försäkring", "forsakring"], areas: ["insurance"] },
  { keywords: ["bank", "banking", "banque"], areas: ["banking"] },
  { keywords: ["fintech", "financial technology", "neobank", "buy now pay later", "bnpl", "payments"], areas: ["fintech"] },
  { keywords: ["pension", "retirement", "pensionsfond", "occupational pension", "itp"], areas: ["pension"] },
  { keywords: ["wealth management", "wealth manager", "private banking", "asset management", "investment manager"], areas: ["wealth_management"] },
  { keywords: ["credit union"], areas: ["credit_union"] },

  /* ── Insurance variants ── */
  { keywords: ["mutual", "member-owned", "cooperative", "ömsesidig", "gjensidig", "gjensidige"], variants: ["insurance:mutual"] },
  { keywords: ["direct-to-consumer", "direct to consumer", "d2c", "dtc", "app-first", "mobile-first", "app-native", "digital-first insurer", "digital insurer"], variants: ["insurance:dtc"] },
  { keywords: ["broker", "brokerage channel", "independent agent", "agency channel"], variants: ["insurance:broker"] },
  { keywords: ["bancassurance", "bank-owned insurance"], variants: ["insurance:bancassurance"] },

  /* ── Banking variants ── */
  { keywords: ["retail bank", "personal banking", "consumer banking"], variants: ["banking:retail"] },
  { keywords: ["corporate bank", "business banking", "commercial banking", "institutional"], variants: ["banking:corporate"] },
  { keywords: ["private bank", "wealth bank"], variants: ["banking:private"] },
  { keywords: ["neobank", "challenger bank", "digital-only bank", "digital bank"], variants: ["banking:neobank"] },
];

export function classify(summary: string): ClassifierResult {
  if (!summary) {
    return { areas: [], variants: [], matchedKeywords: [], confidence: 0 };
  }

  const haystack = summary.toLowerCase();
  const areas = new Set<string>();
  const variants = new Set<string>();
  const matched = new Set<string>();

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (haystack.includes(kw)) {
        matched.add(kw);
        rule.areas?.forEach((a) => areas.add(a));
        rule.variants?.forEach((v) => variants.add(v));
        break; // one keyword per rule is enough
      }
    }
  }

  // Rough confidence: one signal = 0.4, two = 0.7, three+ = 0.9
  const signals = matched.size;
  const confidence = signals === 0 ? 0 : signals === 1 ? 0.4 : signals === 2 ? 0.7 : 0.9;

  return {
    areas: [...areas],
    variants: [...variants],
    matchedKeywords: [...matched],
    confidence,
  };
}

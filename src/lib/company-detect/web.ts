/**
 * Tier 2 — web fallback enrichment.
 *
 * Fires ONLY when the curated tier comes up empty. Uses a two-source pipeline:
 *
 *  1. Clearbit Autocomplete — free, CORS-enabled, no API key. Returns up to 3
 *     real company candidates with `{name, domain, logo}`. This is the primary
 *     signal: Clearbit's corpus is well-curated for real businesses, so a hit
 *     is strong evidence the query refers to an actual company.
 *
 *  2. Wikipedia summary — free, CORS-enabled, no key. Fetched for the top
 *     Clearbit candidate and used only for classification signal (is this
 *     insurance / banking / fintech / etc). We never surface the Wikipedia
 *     URL itself.
 *
 * Quality gates (any failure → not returned):
 *   - Clearbit must return ≥1 candidate with a real domain
 *   - Candidate domain must not already be in the curated library (defensive)
 *   - Classifier must produce a confident area match (>=0.5)
 *
 * Fails silently on any error — returns []. Never throws.
 *
 * Stable public contract:
 *   - Swap internals freely (Worker, CRM lookup, LLM enrichment, etc.)
 *   - Callers only see DetectionResult[] with logoUrl populated where available.
 */

import { classify } from "./classifier";
import type { DetectionResult } from "./types";
import type { GuideFormData } from "@/lib/types";
import { COMPANY_PATTERNS } from "@/data/company-patterns";

interface ClearbitSuggestion {
  name: string;
  domain: string;
  /** Clearbit returns null for most entries post-HubSpot acquisition — we use the
   * separate Logo API instead (see `logoFromDomain`). Kept for future-proofing. */
  logo?: string | null;
}

/**
 * Build a logo URL. Uses DuckDuckGo's icon service — Clearbit's Logo API was
 * deprecated post-HubSpot acquisition. DDG returns real 404s for unknown
 * domains so the <img onError> handler can cleanly reveal the fallback glyph.
 */
function logoFromDomain(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

interface WikipediaSummary {
  title?: string;
  extract?: string;
  description?: string;
  type?: string; // "standard" | "disambiguation" | "no-extract" etc.
}

const CLEARBIT_TIMEOUT_MS = 4000;
const WIKIPEDIA_TIMEOUT_MS = 3500;

/**
 * Normalise a free-text query for Clearbit.
 *  - URL → brand segment of the domain (folksam.se → folksam)
 *  - trimmed, lowercased
 */
function normaliseForAutocomplete(raw: string): string {
  let q = raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");

  const domainMatch = q.match(
    /^([a-z0-9-]+)\.(se|no|dk|fi|com|co|io|org|net|eu|uk|de|fr|ch|us|biz|info|nl)(\.[a-z]{2})?$/,
  );
  if (domainMatch) q = domainMatch[1];

  return q.replace(/[-_]/g, " ").trim();
}

/** Block obvious garbage / test queries from burning enrichment calls. */
function isLikelyValidQuery(q: string): boolean {
  if (q.length < 2) return false;
  // Pure repeating chars or pure numeric — almost always garbage
  if (/^(.)\1+$/.test(q)) return false;
  if (/^\d+$/.test(q)) return false;
  // Obvious typing garbage (keyboard-walk)
  if (/^(asdf|qwer|zxcv|asdfgh|asdfghjkl|qwerty)+$/i.test(q)) return false;
  return true;
}

/** Is this domain already in our curated library? Used to skip redundant web hits. */
function isCuratedDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  return COMPANY_PATTERNS.some((p) => p.domain.toLowerCase() === d);
}

/** Country guess from domain TLD — best-effort; left blank when unclear. */
function guessCountryFromDomain(domain: string): string | undefined {
  const tld = domain.split(".").pop()?.toLowerCase();
  switch (tld) {
    case "se":
      return "SE";
    case "no":
      return "NO";
    case "dk":
      return "DK";
    case "fi":
      return "FI";
    case "nl":
      return "EU";
    case "de":
      return "EU";
    case "fr":
      return "EU";
    case "ch":
      return "EU";
    case "uk":
    case "co.uk":
      return "UK";
    case "us":
      return "US";
    default:
      return undefined;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timer);
    return res.ok ? res : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function clearbitSuggest(query: string): Promise<ClearbitSuggestion[]> {
  const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url, CLEARBIT_TIMEOUT_MS);
  if (!res) return [];
  try {
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((d): d is ClearbitSuggestion => !!d && typeof d.name === "string" && typeof d.domain === "string")
      .slice(0, 3);
  } catch {
    return [];
  }
}

async function wikipediaSummary(title: string): Promise<WikipediaSummary | null> {
  const slug = encodeURIComponent(title.replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;
  const res = await fetchWithTimeout(url, WIKIPEDIA_TIMEOUT_MS);
  if (!res) return null;
  try {
    const data: WikipediaSummary = await res.json();
    if (!data || typeof data !== "object") return null;
    // Disambiguation pages are useless for classification.
    if (data.type === "disambiguation") return null;
    return data;
  } catch {
    return null;
  }
}

export async function detectFromWeb(query: string): Promise<DetectionResult[]> {
  const cbQuery = normaliseForAutocomplete(query);
  if (!isLikelyValidQuery(cbQuery)) return [];

  const suggestions = await clearbitSuggest(cbQuery);
  if (suggestions.length === 0) return [];

  // Filter out anything already in the curated library — no point offering
  // a "web best-guess" for a company we already have a high-confidence
  // prefill for. In practice the curated tier already won in this case,
  // but belt-and-braces for edge cases (alias miss, domain mismatch, etc.).
  const fresh = suggestions.filter((s) => !isCuratedDomain(s.domain));
  if (fresh.length === 0) return [];

  // Enrich ALL candidates in parallel with Wikipedia summaries — Clearbit's
  // ranking doesn't always put the most relevant result first (e.g. "revolut"
  // returns RevolutionEHR ahead of Revolut itself). Running the summaries
  // concurrently keeps total latency close to a single fetch.
  const summaries = await Promise.all(fresh.map((s) => wikipediaSummary(s.name)));

  const results: DetectionResult[] = [];
  for (let i = 0; i < fresh.length; i++) {
    const s = fresh[i];
    const summary = summaries[i];
    const classifyText = [summary?.description, summary?.extract, s.name]
      .filter(Boolean)
      .join(" · ");
    const cls = classify(classifyText);
    // Stricter bar when we have a summary (plenty of text, should produce
    // a clear signal) than when we don't (name-only).
    const threshold = summary ? 0.5 : 0.4;
    if (cls.areas.length > 0 && cls.confidence >= threshold) {
      results.push(buildResult(query, s, summary?.extract, cls));
    }
  }

  return results;
}

function buildResult(
  query: string,
  suggestion: ClearbitSuggestion,
  summary: string | undefined,
  cls: ReturnType<typeof classify>,
): DetectionResult {
  const prefill: Partial<GuideFormData> = {
    company_name: suggestion.name,
    company_url: `https://${suggestion.domain}`,
    ...(cls.areas.length > 0 && { areas_of_interest: cls.areas }),
    ...(cls.variants.length > 0 && { selected_variants: cls.variants }),
  };

  return {
    source: "web",
    confidence: cls.confidence >= 0.7 ? "medium" : "low",
    match: {
      name: suggestion.name,
      domain: suggestion.domain,
      country: guessCountryFromDomain(suggestion.domain),
      category: cls.areas.length > 0 ? cls.areas.join(" + ") : "Financial services",
      logoUrl: suggestion.logo || logoFromDomain(suggestion.domain),
      summary: summary ? summary.slice(0, 240) : undefined,
    },
    prefill,
    debug: {
      query,
      tier: "web",
      reason: `Clearbit suggestion "${suggestion.domain}"${summary ? " + Wikipedia summary" : ""}`,
      keywordsMatched: cls.matchedKeywords,
    },
  };
}

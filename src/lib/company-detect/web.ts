/**
 * Tier 2 — web fallback via DuckDuckGo Instant Answer API.
 *
 * Free, CORS-enabled, no API key. Returns a summary paragraph for
 * well-known entities (large companies, brands, topics). We classify
 * that summary client-side and build a best-guess DetectionResult.
 *
 * Intentionally small and swappable. When operational tech replaces
 * this (e.g. Clearbit, a Cloudflare Worker, a CRM lookup), only this
 * file changes — the public contract is the DetectionResult type.
 *
 * Fails silently on any error: returns [] so curated tier result still
 * lands if present.
 */

import { classify } from "./classifier";
import type { DetectionResult } from "./types";
import type { GuideFormData } from "@/lib/types";

interface DDGResponse {
  Heading?: string;
  AbstractText?: string;
  AbstractSource?: string;
  AbstractURL?: string;
  Image?: string;
  RelatedTopics?: Array<{ Text?: string }>;
}

/**
 * Normalise a free-text query into something DDG can handle.
 * - URLs → extract the brand part of the domain
 * - Drop common TLDs so "folksam.se" becomes "folksam"
 * - Strip trailing ".com/.dk/etc" from bare domains
 */
function queryForDDG(raw: string): string {
  let q = raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");

  // If it looks like a domain, use the brand part
  const domainMatch = q.match(/^([a-z0-9-]+)\.(se|no|dk|fi|com|co|io|org|net|eu|uk|de|fr|ch|us|biz|info)(\.[a-z]{2})?$/);
  if (domainMatch) q = domainMatch[1];

  return q.replace(/[-_]/g, " ");
}

const DDG_TIMEOUT_MS = 4500;

export async function detectFromWeb(query: string): Promise<DetectionResult[]> {
  const ddgQuery = queryForDDG(query);
  if (ddgQuery.length < 2) return [];

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(ddgQuery)}&format=json&no_html=1&skip_disambig=1`;

    // AbortController gives us a timeout guard — DDG is occasionally slow.
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), DDG_TIMEOUT_MS);

    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timer);

    if (!res.ok) return [];
    const data: DDGResponse = await res.json();

    const summary = (data.AbstractText || "").trim();
    const heading = (data.Heading || "").trim();

    // DDG returned nothing useful — bail.
    if (!summary && !heading) return [];

    const cls = classify(summary || heading);

    // No industry signal at all → don't bother offering a guess
    if (cls.areas.length === 0 && cls.variants.length === 0) return [];

    const prefill: Partial<GuideFormData> = {
      company_name: heading || ddgQuery,
      company_url: data.AbstractURL || "",
      ...(cls.areas.length > 0 && { areas_of_interest: cls.areas }),
      ...(cls.variants.length > 0 && { selected_variants: cls.variants }),
    };

    const result: DetectionResult = {
      source: "web",
      confidence: cls.confidence >= 0.7 ? "medium" : "low",
      match: {
        name: heading || ddgQuery,
        summary: summary.slice(0, 240),
        category: cls.areas.join(" + ") || "Financial services (guessed)",
        logoUrl: data.Image || undefined,
      },
      prefill,
      debug: {
        query,
        tier: "web",
        reason: `DuckDuckGo summary from ${data.AbstractSource || "unknown"}`,
        keywordsMatched: cls.matchedKeywords,
      },
    };

    return [result];
  } catch {
    // Network error, CORS edge case, abort — all silently fall through.
    return [];
  }
}

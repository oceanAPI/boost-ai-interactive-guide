/* ─────────────────────────────────────────────
 *  Company pattern library
 *
 *  Curated well-known Nordic financial-services companies with
 *  best-guess prefill values. When an AE searches or pastes a URL,
 *  we match against this list and offer to prefill the admin form.
 *
 *  Volumes and requirements are plausible estimates based on public
 *  information — they are a starting point to edit, not ground truth.
 * ───────────────────────────────────────────── */

import type { GuideFormData } from "@/lib/types";

export interface CompanyPattern {
  /** Unique stable key */
  key: string;
  /** Display name, e.g. "Folksam" */
  name: string;
  /** Primary domain without protocol, e.g. "folksam.se" */
  domain: string;
  /** Extra search aliases (lowercased, no spaces) */
  aliases?: string[];
  /** ISO country code */
  country: "SE" | "NO" | "DK" | "FI" | "US" | "UK" | "EU" | "Global";
  /** One-line category for display in search results */
  category: string;
  /** Partial form data — merged on top of the current form when applied */
  prefill: Partial<GuideFormData>;
}

export const COMPANY_PATTERNS: CompanyPattern[] = [
  // ─── Sweden ──────────────────────────────────
  {
    key: "folksam",
    name: "Folksam",
    domain: "folksam.se",
    aliases: ["folksam-liv", "folksamgruppen"],
    country: "SE",
    category: "Mutual insurance · SE",
    prefill: {
      company_name: "Folksam",
      company_url: "https://www.folksam.se/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:mutual"],
      channel_volumes: { chat: 60000, voice: 140000, email: 30000, social: 5000 },
      conversation_cost: "~55 SEK",
      specific_requirements:
        "Swedish mutual insurer with 4M+ customers. Full composite offering: motor, home, villa, travel, accident, child, life, pet, plus pension och fondspar via Folksam Liv. BankID primary strong-auth. Full Swedish-language NLU required.",
    },
  },
  {
    key: "lansforsakringar",
    name: "Länsförsäkringar",
    domain: "lansforsakringar.se",
    aliases: ["lf", "lansforsakringar-ab"],
    country: "SE",
    category: "Mutual insurance + bank · SE",
    prefill: {
      company_name: "Länsförsäkringar",
      company_url: "https://www.lansforsakringar.se/",
      areas_of_interest: ["insurance", "banking"],
      selected_variants: ["insurance:mutual", "banking:retail"],
      channel_volumes: { chat: 75000, voice: 180000, email: 40000, social: 6000 },
      conversation_cost: "~60 SEK",
      specific_requirements:
        "Federation of 23 regional mutual companies serving 3.9M customers. Composite insurance + bank + real estate agency. Strong regional identity. Swedish NLU mandatory, BankID primary auth.",
    },
  },
  {
    key: "if-insurance",
    name: "If P&C Insurance",
    domain: "if.se",
    aliases: ["if", "if-skadeforsakring", "ifs"],
    country: "SE",
    category: "P&C Insurance · Nordic",
    prefill: {
      company_name: "If P&C Insurance",
      company_url: "https://www.if.se/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:broker"],
      channel_volumes: { chat: 90000, voice: 200000, email: 45000, social: 7000 },
      conversation_cost: "~50 SEK",
      specific_requirements:
        "Nordic P&C leader, ~3.7M customers across SE/NO/DK/FI/EE/LV/LT. Strong corporate + broker channel. Multi-language NLU (SE/NO/DK/FI/EN).",
    },
  },
  {
    key: "alecta",
    name: "Alecta",
    domain: "alecta.se",
    aliases: ["alecta-pension"],
    country: "SE",
    category: "Occupational pension · SE",
    prefill: {
      company_name: "Alecta",
      company_url: "https://www.alecta.se/",
      areas_of_interest: ["pension"],
      channel_volumes: { chat: 25000, voice: 80000, email: 20000, social: 2000 },
      conversation_cost: "~65 SEK",
      specific_requirements:
        "Occupational pension manager for ITP-plan. 2.8M private customers, 36K corporate customers. Heavy focus on pension balance queries, fund switches, retirement planning.",
    },
  },
  {
    key: "handelsbanken",
    name: "Handelsbanken",
    domain: "handelsbanken.se",
    aliases: ["shb", "svenska-handelsbanken"],
    country: "SE",
    category: "Retail + corporate bank · Nordic",
    prefill: {
      company_name: "Handelsbanken",
      company_url: "https://www.handelsbanken.se/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail", "banking:corporate"],
      channel_volumes: { chat: 85000, voice: 160000, email: 35000, social: 4000 },
      conversation_cost: "~45 SEK",
      specific_requirements:
        "Decentralised branch-oriented bank with strong corporate lending. Nordic + UK presence. Multi-language NLU, BankID primary auth.",
    },
  },
  {
    key: "seb",
    name: "SEB",
    domain: "seb.se",
    aliases: ["skandinaviska-enskilda-banken"],
    country: "SE",
    category: "Universal bank · Nordic",
    prefill: {
      company_name: "SEB",
      company_url: "https://www.seb.se/",
      areas_of_interest: ["banking", "wealth_management"],
      selected_variants: ["banking:retail", "banking:corporate", "banking:private"],
      channel_volumes: { chat: 100000, voice: 210000, email: 50000, social: 6000 },
      conversation_cost: "~50 SEK",
      specific_requirements:
        "Universal bank with strong wealth and investment banking. 4M private customers, 3K large corporate relationships. Nordic + Baltic markets.",
    },
  },

  // ─── Norway ──────────────────────────────────
  {
    key: "dnb",
    name: "DNB",
    domain: "dnb.no",
    aliases: ["dnb-bank", "den-norske-bank"],
    country: "NO",
    category: "Retail + corporate bank · NO",
    prefill: {
      company_name: "DNB",
      company_url: "https://www.dnb.no/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail", "banking:corporate"],
      channel_volumes: { chat: 110000, voice: 220000, email: 45000, social: 6000 },
      conversation_cost: "~55 NOK",
      specific_requirements:
        "Largest Norwegian bank, ~2.1M personal customers, 260K business customers. BankID primary auth. Norwegian-language NLU required.",
    },
  },
  {
    key: "gjensidige",
    name: "Gjensidige",
    domain: "gjensidige.no",
    aliases: ["gjensidige-forsikring"],
    country: "NO",
    category: "Mutual insurance · Nordic",
    prefill: {
      company_name: "Gjensidige",
      company_url: "https://www.gjensidige.no/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:mutual"],
      channel_volumes: { chat: 70000, voice: 150000, email: 30000, social: 4000 },
      conversation_cost: "~55 NOK",
      specific_requirements:
        "Nordic P&C insurer, mutual heritage. ~1.9M customers across NO/DK/SE/BAL. Strong digital first-notice-of-loss flow.",
    },
  },
  {
    key: "storebrand",
    name: "Storebrand",
    domain: "storebrand.no",
    country: "NO",
    category: "Pension + life + asset mgmt · NO",
    prefill: {
      company_name: "Storebrand",
      company_url: "https://www.storebrand.no/",
      areas_of_interest: ["pension", "insurance", "wealth_management"],
      selected_variants: ["insurance:mutual"],
      channel_volumes: { chat: 40000, voice: 90000, email: 25000, social: 2500 },
      conversation_cost: "~60 NOK",
      specific_requirements:
        "Nordic pension + life insurance + asset management. 2M customers. Heavy pension-balance and fund-switch volume.",
    },
  },

  // ─── Denmark ─────────────────────────────────
  {
    key: "danskebank",
    name: "Danske Bank",
    domain: "danskebank.dk",
    aliases: ["danske"],
    country: "DK",
    category: "Universal bank · Nordic",
    prefill: {
      company_name: "Danske Bank",
      company_url: "https://danskebank.dk/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail", "banking:corporate"],
      channel_volumes: { chat: 95000, voice: 200000, email: 45000, social: 5000 },
      conversation_cost: "~45 DKK",
      specific_requirements:
        "Nordic-Baltic universal bank, ~3.4M personal customers. MitID (DK) / BankID (SE/NO). Multi-language NLU required.",
    },
  },
  {
    key: "tryg",
    name: "Tryg",
    domain: "tryg.dk",
    aliases: ["tryg-forsikring"],
    country: "DK",
    category: "P&C insurance · Nordic",
    prefill: {
      company_name: "Tryg",
      company_url: "https://www.tryg.dk/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:mutual"],
      channel_volumes: { chat: 60000, voice: 130000, email: 28000, social: 4000 },
      conversation_cost: "~45 DKK",
      specific_requirements:
        "Largest Nordic P&C insurer after merger with Codan/RSA. 5M customers across DK/NO/SE.",
    },
  },

  // ─── Fintech / Digital-first ─────────────────
  {
    key: "klarna",
    name: "Klarna",
    domain: "klarna.com",
    country: "Global",
    category: "Fintech / BNPL · Global",
    prefill: {
      company_name: "Klarna",
      company_url: "https://www.klarna.com/",
      areas_of_interest: ["fintech", "banking"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 180000, voice: 50000, email: 80000, social: 12000 },
      conversation_cost: "~$3.50",
      specific_requirements:
        "Global BNPL + shopping app. 150M+ consumers, 500K+ merchants. Chat-first support, 30+ languages.",
    },
  },
  {
    key: "lemonade",
    name: "Lemonade",
    domain: "lemonade.com",
    country: "US",
    category: "DTC insurance · US/EU",
    prefill: {
      company_name: "Lemonade",
      company_url: "https://www.lemonade.com/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:dtc"],
      channel_volumes: { chat: 80000, voice: 8000, email: 15000, social: 6000 },
      conversation_cost: "~$4.00",
      specific_requirements:
        "Digital-first insurer, AI-native. 2M+ customers across US/EU. Mobile-first, minimal voice channel. Instant claims decisions are the USP.",
    },
  },
  {
    key: "hedvig",
    name: "Hedvig",
    domain: "hedvig.com",
    country: "SE",
    category: "DTC insurance · SE/NO/DK",
    prefill: {
      company_name: "Hedvig",
      company_url: "https://www.hedvig.com/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:dtc"],
      channel_volumes: { chat: 25000, voice: 3000, email: 5000, social: 2000 },
      conversation_cost: "~40 SEK",
      specific_requirements:
        "Nordic DTC insurer, app-first. ~150K customers in SE/NO/DK. Chat-primary, very low voice volume. Strong onboarding + claims speed focus.",
    },
  },
];

// ─── Helpers ─────────────────────────────────────

/** Normalise a URL or free-text entry to something comparable to `domain`. */
export function normaliseQuery(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "") // strip path
    .replace(/:\d+$/, ""); // strip port
}

/**
 * Search patterns by name, domain, or alias.
 * Returns up to `limit` patterns sorted by match quality.
 */
export function searchCompanies(query: string, limit = 5): CompanyPattern[] {
  const q = normaliseQuery(query);
  if (q.length < 2) return [];

  return COMPANY_PATTERNS.map((p) => {
    const name = p.name.toLowerCase();
    const domain = p.domain.toLowerCase();
    const aliases = p.aliases?.map((a) => a.toLowerCase()) || [];
    let score = 0;

    // Exact matches → highest score
    if (domain === q) score += 200;
    if (name === q) score += 180;

    // URL-style queries: heavy weight on domain match
    if (domain.startsWith(q)) score += 100;
    if (domain.includes(q)) score += 60;

    // Name partial matches
    if (name.startsWith(q)) score += 80;
    if (name.includes(q)) score += 40;

    // Alias matches
    if (aliases.some((a) => a === q)) score += 90;
    if (aliases.some((a) => a.startsWith(q))) score += 50;
    if (aliases.some((a) => a.includes(q))) score += 25;

    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

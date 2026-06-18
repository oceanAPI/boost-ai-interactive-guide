// EXTENSION-POINTER: Adding a new company pattern?
// Author one file per pattern under src/data/extensions/patterns/ first,
// then register in src/data/extensions/patterns/index.ts. This file
// picks them up via the EXTENSION_COMPANY_PATTERNS spread below.
// Recipe: src/data/extensions/integration-guide.md
// Verify: npx tsx src/data/extensions/_wiring-check.ts

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
import { EXTENSION_COMPANY_PATTERNS } from "./extensions/patterns";

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
  /** Optional curated logo URL. When set, takes precedence over
   *  the Brandfetch domain fallback in <CustomerDossierCard />.
   *  Leave unset to let Brandfetch resolve from `domain` — that
   *  works for most Nordic FS brands, so only add this when the
   *  Brandfetch miss is visually obvious. */
  logoUrl?: string;
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
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Claims", "Legal & Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Swedish mutual insurer with 4M+ customers. Full composite offering: motor, home, villa, travel, accident, child, life, pet, plus pension och fondspar via Folksam Liv. BankID primary strong-auth. Full Swedish-language NLU required.",
      custom_notes: "Member-owned; trust and transparency are non-negotiable in any AI deployment.",
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
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 3, ai_trainers: 5, technical_resources: 3, supporting_departments: ["Customer Service", "Claims", "Digital Banking"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Federation of 23 regional mutual companies serving 3.9M customers. Composite insurance + bank + real estate agency. Strong regional identity. Swedish NLU mandatory, BankID primary auth.",
      custom_notes: "Federated model — deployment may need to respect regional variations.",
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
      pricing_model: "fixed",
      deployment_markets: 7,
      resources: { stakeholder_owners: 3, ai_trainers: 6, technical_resources: 4, supporting_departments: ["Customer Service", "Claims", "Broker Channel", "IT"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["BankID"] },
      specific_requirements:
        "Nordic P&C leader, ~3.7M customers across SE/NO/DK/FI/EE/LV/LT. Strong corporate + broker channel. Multi-language NLU (SE/NO/DK/FI/EN).",
      custom_notes: "Owned by Sampo — part of a larger Nordic insurance group.",
    },
  },
  {
    key: "trygghansa",
    name: "Trygg-Hansa",
    domain: "trygghansa.se",
    aliases: ["tryggh"],
    country: "SE",
    category: "P&C insurance · SE",
    prefill: {
      company_name: "Trygg-Hansa",
      company_url: "https://www.trygghansa.se/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:broker"],
      channel_volumes: { chat: 50000, voice: 110000, email: 25000, social: 3000 },
      conversation_cost: "~55 SEK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Claims"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Part of Codan Tryg group. ~2M customers in SE. Strong motor and household insurance presence.",
      custom_notes: "Post-merger integration with Codan/Tryg group — channel strategy may be in flux.",
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
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Pension Administration", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Occupational pension manager for ITP-plan. 2.8M private customers, 36K corporate customers. Heavy focus on pension balance queries, fund switches, retirement planning.",
      custom_notes: "Highly regulated — SFSA oversight. Non-advice guardrails are critical.",
    },
  },
  {
    key: "amf",
    name: "AMF",
    domain: "amf.se",
    aliases: ["amf-pension"],
    country: "SE",
    category: "Occupational pension · SE",
    prefill: {
      company_name: "AMF",
      company_url: "https://www.amf.se/",
      areas_of_interest: ["pension"],
      channel_volumes: { chat: 20000, voice: 60000, email: 15000, social: 1500 },
      conversation_cost: "~65 SEK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Pension Administration", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Occupational pension manager, owned equally by LO and Svenskt Näringsliv. ~4M customers. Strong fund-focused pension offering.",
      custom_notes: "Joint union/employer ownership — customer trust is brand-critical.",
    },
  },
  {
    key: "kpa",
    name: "KPA Pension",
    domain: "kpa.se",
    aliases: ["kpa-pension"],
    country: "SE",
    category: "Public-sector pension · SE",
    prefill: {
      company_name: "KPA Pension",
      company_url: "https://www.kpa.se/",
      areas_of_interest: ["pension"],
      channel_volumes: { chat: 12000, voice: 45000, email: 10000, social: 800 },
      conversation_cost: "~65 SEK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 2, technical_resources: 2, supporting_departments: ["Customer Service", "Pension Administration"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Pension for municipal and regional employees in SE. ~2M customers. Focus on transparency and ethical investments.",
      custom_notes: "Owned by Folksam + SKL — strong ethical investment mandate.",
    },
  },
  {
    key: "skandia",
    name: "Skandia",
    domain: "skandia.se",
    country: "SE",
    category: "Pension + insurance + bank · SE",
    prefill: {
      company_name: "Skandia",
      company_url: "https://www.skandia.se/",
      areas_of_interest: ["pension", "insurance", "banking"],
      selected_variants: ["banking:retail", "insurance:mutual"],
      channel_volumes: { chat: 40000, voice: 95000, email: 20000, social: 2500 },
      conversation_cost: "~60 SEK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 3, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Pension", "Banking", "Insurance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Mutual life/pension + bank + insurance. ~2M customers. Customer-owned structure. Composite offering requires agent specialisation across bank/insurance/pension.",
      custom_notes: "Mutual structure — customers are owners. Similar positioning to Folksam.",
    },
  },
  {
    key: "spp",
    name: "SPP",
    domain: "spp.se",
    country: "SE",
    category: "Pension + asset mgmt · SE",
    prefill: {
      company_name: "SPP",
      company_url: "https://www.spp.se/",
      areas_of_interest: ["pension", "wealth_management"],
      channel_volumes: { chat: 15000, voice: 40000, email: 8000, social: 1000 },
      conversation_cost: "~65 SEK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 2, technical_resources: 2, supporting_departments: ["Customer Service", "Pension Administration"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Occupational pension + savings. ~500K customers in SE. Part of Storebrand group.",
      custom_notes: "Storebrand subsidiary — may share group platforms and vendor decisions.",
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
      pricing_model: "fixed",
      deployment_markets: 4,
      resources: { stakeholder_owners: 3, ai_trainers: 5, technical_resources: 4, supporting_departments: ["Customer Service", "Digital Banking", "Compliance", "Branch Network"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["BankID"] },
      specific_requirements:
        "Decentralised branch-oriented bank with strong corporate lending. Nordic + UK presence. Multi-language NLU, BankID primary auth.",
      custom_notes: "Branch-first culture — handover to local branch is a key pattern to respect.",
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
      pricing_model: "fixed",
      deployment_markets: 7,
      resources: { stakeholder_owners: 4, ai_trainers: 6, technical_resources: 5, supporting_departments: ["Customer Service", "Digital Banking", "Private Banking", "Compliance", "IT"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["BankID"] },
      specific_requirements:
        "Universal bank with strong wealth and investment banking. 4M private customers, 3K large corporate relationships. Nordic + Baltic markets.",
      custom_notes: "Strong corporate/wallet mgmt heritage — private banking CX is a differentiator.",
    },
  },
  {
    key: "swedbank",
    name: "Swedbank",
    domain: "swedbank.se",
    country: "SE",
    category: "Retail + corporate bank · Nordic-Baltic",
    prefill: {
      company_name: "Swedbank",
      company_url: "https://www.swedbank.se/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail", "banking:corporate"],
      channel_volumes: { chat: 95000, voice: 200000, email: 45000, social: 5500 },
      conversation_cost: "~45 SEK",
      pricing_model: "fixed",
      deployment_markets: 4,
      resources: { stakeholder_owners: 3, ai_trainers: 5, technical_resources: 4, supporting_departments: ["Customer Service", "Digital Banking", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["BankID"] },
      specific_requirements:
        "Largest retail bank in SE by customer count. ~7.5M customers across SE/Baltics. Swedish + Baltic-language NLU required.",
      custom_notes: "Strong in mass-market retail banking — volume-driven use case.",
    },
  },
  {
    key: "nordea",
    name: "Nordea",
    domain: "nordea.com",
    aliases: ["nordea-bank"],
    country: "SE",
    category: "Pan-Nordic universal bank",
    prefill: {
      company_name: "Nordea",
      company_url: "https://www.nordea.com/",
      areas_of_interest: ["banking", "wealth_management"],
      selected_variants: ["banking:retail", "banking:corporate", "banking:private"],
      channel_volumes: { chat: 150000, voice: 320000, email: 70000, social: 9000 },
      conversation_cost: "~50 SEK",
      pricing_model: "fixed",
      deployment_markets: 8,
      resources: { stakeholder_owners: 4, ai_trainers: 8, technical_resources: 6, supporting_departments: ["Customer Service", "Digital Banking", "Private Banking", "Compliance", "IT", "Data & Analytics"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["BankID", "MitID"] },
      specific_requirements:
        "Largest Nordic bank, ~11M personal customers across SE/NO/DK/FI. Multi-language NLU (SE/NO/DK/FI/EN), BankID + MitID. Wealth + corporate + retail lines.",
      custom_notes: "Consolidated pan-Nordic deployment — language + identity integration is non-trivial.",
    },
  },
  {
    key: "avanza",
    name: "Avanza",
    domain: "avanza.se",
    country: "SE",
    category: "Online broker · SE",
    prefill: {
      company_name: "Avanza",
      company_url: "https://www.avanza.se/",
      areas_of_interest: ["wealth_management", "fintech"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 55000, voice: 20000, email: 15000, social: 5000 },
      conversation_cost: "~40 SEK",
      pricing_model: "usage",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 3, supporting_departments: ["Customer Service", "Trading Support", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"], openid: ["BankID"] },
      specific_requirements:
        "Largest SE retail broker. ~2M customers. Chat-first, low voice volume. Strong trading, savings, pension focus. High peak volumes around market events.",
      custom_notes: "Chat-primary support — excellent fit for high automation rates.",
    },
  },
  {
    key: "nordnet",
    name: "Nordnet",
    domain: "nordnet.se",
    aliases: ["nordnet-bank"],
    country: "SE",
    category: "Online broker · Nordic",
    prefill: {
      company_name: "Nordnet",
      company_url: "https://www.nordnet.se/",
      areas_of_interest: ["wealth_management", "fintech"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 45000, voice: 18000, email: 12000, social: 4000 },
      conversation_cost: "~45 SEK",
      pricing_model: "usage",
      deployment_markets: 4,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 3, supporting_departments: ["Customer Service", "Trading Support", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"], openid: ["BankID"] },
      specific_requirements:
        "Pan-Nordic online broker. ~1.8M customers across SE/NO/DK/FI. Multi-language NLU required. Trading, savings, pension.",
      custom_notes: "Direct competitor to Avanza — similar operational profile across 4 Nordic markets.",
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
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 3, ai_trainers: 5, technical_resources: 4, supporting_departments: ["Customer Service", "Digital Banking", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Largest Norwegian bank, ~2.1M personal customers, 260K business customers. BankID primary auth. Norwegian-language NLU required.",
      custom_notes: "Existing boost.ai customer relationship — expansion/modernisation opportunity.",
    },
  },
  {
    key: "sparebank1",
    name: "SpareBank 1",
    domain: "sparebank1.no",
    aliases: ["sb1", "sparebank-1"],
    country: "NO",
    category: "Retail bank alliance · NO",
    prefill: {
      company_name: "SpareBank 1",
      company_url: "https://www.sparebank1.no/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail"],
      channel_volumes: { chat: 80000, voice: 170000, email: 35000, social: 4000 },
      conversation_cost: "~55 NOK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 3, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Digital Banking", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Alliance of ~14 regional Norwegian savings banks. ~1.2M retail + SME customers. Regional identity with shared platform.",
      custom_notes: "Alliance model — deployment decisions may involve multiple regional banks.",
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
      pricing_model: "fixed",
      deployment_markets: 4,
      resources: { stakeholder_owners: 3, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Claims", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Nordic P&C insurer, mutual heritage. ~1.9M customers across NO/DK/SE/Baltics. Strong digital first-notice-of-loss flow.",
      custom_notes: "Digital claims is the flagship use case — FNOL automation is strategic.",
    },
  },
  {
    key: "fremtind",
    name: "Fremtind",
    domain: "fremtind.no",
    country: "NO",
    category: "P&C insurance · NO",
    prefill: {
      company_name: "Fremtind",
      company_url: "https://www.fremtind.no/",
      areas_of_interest: ["insurance"],
      channel_volumes: { chat: 45000, voice: 95000, email: 22000, social: 2500 },
      conversation_cost: "~55 NOK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Claims"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Largest Norwegian P&C insurer. Joint venture of SpareBank 1 + DNB. ~1.5M customers.",
      custom_notes: "JV between two major banks — distribution via partner banks is critical.",
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
      pricing_model: "fixed",
      deployment_markets: 2,
      resources: { stakeholder_owners: 2, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Pension Administration", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Nordic pension + life insurance + asset management. 2M customers. Heavy pension-balance and fund-switch volume.",
      custom_notes: "Sustainability leadership — ESG-aware agent messaging matters.",
    },
  },
  {
    key: "klp",
    name: "KLP",
    domain: "klp.no",
    aliases: ["kommunal-landspensjonskasse"],
    country: "NO",
    category: "Mutual public-sector pension · NO",
    prefill: {
      company_name: "KLP",
      company_url: "https://www.klp.no/",
      areas_of_interest: ["pension", "insurance"],
      selected_variants: ["insurance:mutual"],
      channel_volumes: { chat: 22000, voice: 65000, email: 12000, social: 1500 },
      conversation_cost: "~60 NOK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Pension Administration", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["BankID"] },
      specific_requirements:
        "Mutual pension fund for Norwegian public-sector workers. ~900K members. Strong regulation + ethical investment profile.",
      custom_notes: "Mutual + public-sector — similar governance constraints to KPA in SE.",
    },
  },
  {
    key: "if-no",
    name: "If Skadeforsikring",
    domain: "if.no",
    aliases: ["if-no", "if-skadeforsikring-no"],
    country: "NO",
    category: "P&C insurance · NO",
    prefill: {
      company_name: "If Skadeforsikring",
      company_url: "https://www.if.no/",
      areas_of_interest: ["insurance"],
      selected_variants: ["insurance:broker"],
      channel_volumes: { chat: 55000, voice: 120000, email: 28000, social: 3500 },
      conversation_cost: "~55 NOK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Claims"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["BankID"] },
      specific_requirements:
        "Norwegian arm of If P&C. Shared group platform with If.se. Norwegian-language NLU.",
      custom_notes: "Part of If group — deployment likely coordinated across Nordic markets.",
    },
  },
  {
    key: "sector-alarm",
    name: "Sector Alarm",
    domain: "sectoralarm.no",
    aliases: ["sectoralarm", "sector-alarm", "sectoralarm-no"],
    country: "NO",
    category: "Home & SMB security · Nordics + EU",
    prefill: {
      company_name: "Sector Alarm",
      company_url: "https://www.sectoralarm.no/",
      areas_of_interest: ["security"],
      selected_variants: ["security:hybrid"],
      channel_volumes: { chat: 30000, voice: 120000, email: 20000, social: 4000 },
      conversation_cost: "~45 NOK",
      pricing_model: "fixed",
      deployment_markets: 7,
      resources: {
        stakeholder_owners: 2,
        ai_trainers: 3,
        technical_resources: 2,
        supporting_departments: ["Customer Service", "Operations", "IT / Engineering"],
        knowledge_management: true,
      },
      integrations: { openid: ["BankID"], channel: ["Custom Web Chat"] },
      specific_requirements:
        "Nordic home + SMB security subscription across 7 markets (NO, SE, FI, IE, ES, PT, FR). Heavy voice (alarm events + technician dispatch), moderate chat (billing + contract + device support), low social. Multi-language NLU required (NO / SE / FI + ES / PT / FR + EN). BankID for NO + SE auth, local strong-auth elsewhere. 24/7 monitoring-centre escalation is critical and must never be bypassed. False-alarm cost avoidance is a named business goal.",
      custom_notes:
        "Non-FS POC for the extensibility path. Validates industry expansion ahead of the CE / Professional Services content passes — if Sector Alarm renders cleanly, the same mechanics handle CE + PS non-FS customers.",
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
      pricing_model: "fixed",
      deployment_markets: 4,
      resources: { stakeholder_owners: 3, ai_trainers: 5, technical_resources: 4, supporting_departments: ["Customer Service", "Digital Banking", "Compliance", "IT"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"], openid: ["MitID", "BankID"] },
      specific_requirements:
        "Nordic-Baltic universal bank, ~3.4M personal customers. MitID (DK) / BankID (SE/NO). Multi-language NLU required.",
      custom_notes: "Recent compliance/reputation focus — guardrails and audit trail are essential.",
    },
  },
  {
    key: "jyskebank",
    name: "Jyske Bank",
    domain: "jyskebank.dk",
    country: "DK",
    category: "Retail + corporate bank · DK",
    prefill: {
      company_name: "Jyske Bank",
      company_url: "https://www.jyskebank.dk/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail", "banking:corporate"],
      channel_volumes: { chat: 40000, voice: 90000, email: 20000, social: 2000 },
      conversation_cost: "~45 DKK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Digital Banking"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["MitID"] },
      specific_requirements:
        "3rd-largest Danish bank. ~900K retail customers. MitID auth, Danish-language NLU.",
      custom_notes: "Differentiator on personal relationship — AI must handover gracefully, not replace.",
    },
  },
  {
    key: "nykredit",
    name: "Nykredit",
    domain: "nykredit.dk",
    country: "DK",
    category: "Mortgage + banking · DK",
    prefill: {
      company_name: "Nykredit",
      company_url: "https://www.nykredit.dk/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail"],
      channel_volumes: { chat: 35000, voice: 80000, email: 18000, social: 1500 },
      conversation_cost: "~45 DKK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Mortgage", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["MitID"] },
      specific_requirements:
        "Major Danish mortgage + banking group. Mortgage-led customer journey. ~1M customers.",
      custom_notes: "Mortgage focus — specialist agent for bolig/mortgage is strategically critical.",
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
      pricing_model: "fixed",
      deployment_markets: 3,
      resources: { stakeholder_owners: 3, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Claims", "IT"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["MitID", "BankID"] },
      specific_requirements:
        "Largest Nordic P&C insurer after merger with Codan/RSA. 5M customers across DK/NO/SE.",
      custom_notes: "Post-merger — operational consolidation still ongoing.",
    },
  },
  {
    key: "codan",
    name: "Codan",
    domain: "codan.dk",
    country: "DK",
    category: "P&C insurance · DK",
    prefill: {
      company_name: "Codan",
      company_url: "https://www.codan.dk/",
      areas_of_interest: ["insurance"],
      channel_volumes: { chat: 30000, voice: 65000, email: 15000, social: 2000 },
      conversation_cost: "~45 DKK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Claims"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["MitID"] },
      specific_requirements:
        "Danish P&C insurer, part of Tryg group. ~1M customers.",
      custom_notes: "Tryg subsidiary — may share group platform decisions.",
    },
  },
  {
    key: "pfa",
    name: "PFA",
    domain: "pfa.dk",
    country: "DK",
    category: "Pension fund · DK",
    prefill: {
      company_name: "PFA",
      company_url: "https://www.pfa.dk/",
      areas_of_interest: ["pension"],
      channel_volumes: { chat: 18000, voice: 55000, email: 12000, social: 1000 },
      conversation_cost: "~50 DKK",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Pension Administration"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel Chat"], openid: ["MitID"] },
      specific_requirements:
        "Largest Danish commercial pension company. ~1.3M customers. Occupational pension heavy.",
      custom_notes: "Customer-owned commercial pension — similar mutual-style positioning.",
    },
  },

  // ─── Finland ─────────────────────────────────
  {
    key: "op-financial",
    name: "OP Financial Group",
    domain: "op.fi",
    aliases: ["op-bank", "op-group"],
    country: "FI",
    category: "Cooperative bank + insurance · FI",
    prefill: {
      company_name: "OP Financial Group",
      company_url: "https://www.op.fi/",
      areas_of_interest: ["banking", "insurance"],
      selected_variants: ["banking:retail", "insurance:mutual"],
      channel_volumes: { chat: 70000, voice: 165000, email: 35000, social: 3500 },
      conversation_cost: "~4.50 EUR",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 3, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Digital Banking", "Claims", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"] },
      specific_requirements:
        "Finnish cooperative banking + insurance group. ~2.1M owner-customers. Finnish + Swedish NLU required.",
      custom_notes: "Cooperative ownership — customer trust is core brand equity.",
    },
  },
  {
    key: "nordea-fi",
    name: "Nordea Finland",
    domain: "nordea.fi",
    country: "FI",
    category: "Retail + corporate bank · FI",
    prefill: {
      company_name: "Nordea Finland",
      company_url: "https://www.nordea.fi/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail", "banking:corporate"],
      channel_volumes: { chat: 65000, voice: 140000, email: 30000, social: 3000 },
      conversation_cost: "~4.50 EUR",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 4, technical_resources: 3, supporting_departments: ["Customer Service", "Digital Banking", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"] },
      specific_requirements:
        "Finnish arm of Nordea. Part of pan-Nordic consolidation. Finnish + Swedish NLU.",
      custom_notes: "Deployment likely coordinated with Nordea group — cross-market alignment needed.",
    },
  },
  {
    key: "sampo",
    name: "Sampo Group",
    domain: "sampo.com",
    country: "FI",
    category: "Insurance holding · Nordic",
    prefill: {
      company_name: "Sampo Group",
      company_url: "https://www.sampo.com/",
      areas_of_interest: ["insurance"],
      channel_volumes: { chat: 30000, voice: 75000, email: 18000, social: 2000 },
      conversation_cost: "~5 EUR",
      pricing_model: "fixed",
      deployment_markets: 5,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Claims", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys Cloud"] },
      specific_requirements:
        "Insurance holding — parent of If P&C, owner of Topdanmark, Hastings (UK). Multi-market, English-primary at holding level.",
      custom_notes: "Holdco — deployment likely via operating subsidiaries (If, Topdanmark).",
    },
  },

  // ─── Global / Fintech / Digital-first ─────────
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
      pricing_model: "usage",
      deployment_markets: 20,
      resources: { stakeholder_owners: 4, ai_trainers: 8, technical_resources: 6, supporting_departments: ["Customer Service", "Merchant Support", "Trust & Safety", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"] },
      specific_requirements:
        "Global BNPL + shopping app. 150M+ consumers, 500K+ merchants. Chat-first support, 30+ languages.",
      custom_notes: "Chat-primary, high volume, multi-language — ideal high-automation profile.",
    },
  },
  {
    key: "revolut",
    name: "Revolut",
    domain: "revolut.com",
    country: "UK",
    category: "Neobank + crypto · Global",
    prefill: {
      company_name: "Revolut",
      company_url: "https://www.revolut.com/",
      areas_of_interest: ["fintech", "banking"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 220000, voice: 10000, email: 60000, social: 15000 },
      conversation_cost: "~$2.50",
      pricing_model: "usage",
      deployment_markets: 35,
      resources: { stakeholder_owners: 3, ai_trainers: 10, technical_resources: 8, supporting_departments: ["Customer Service", "Trust & Safety", "Compliance", "Product"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Custom Platform"] },
      specific_requirements:
        "Digital bank + crypto + investments. 45M+ customers across 35+ markets. Chat-first, near-zero voice. Very multilingual.",
      custom_notes: "App-only, chat-only — zero voice fallback. Fully-automated support is the target.",
    },
  },
  {
    key: "wise",
    name: "Wise",
    domain: "wise.com",
    aliases: ["transferwise"],
    country: "UK",
    category: "Cross-border payments · Global",
    prefill: {
      company_name: "Wise",
      company_url: "https://www.wise.com/",
      areas_of_interest: ["fintech"],
      channel_volumes: { chat: 120000, voice: 12000, email: 40000, social: 6000 },
      conversation_cost: "~$3.00",
      pricing_model: "usage",
      deployment_markets: 70,
      resources: { stakeholder_owners: 3, ai_trainers: 7, technical_resources: 5, supporting_departments: ["Customer Service", "Compliance", "Trust & Safety"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"] },
      specific_requirements:
        "Cross-border payments + multi-currency accounts. 16M+ customers. Strong focus on transparency and FX explanation.",
      custom_notes: "Transparency is the brand — AI explanations of fees/rates must be spot-on.",
    },
  },
  {
    key: "n26",
    name: "N26",
    domain: "n26.com",
    country: "EU",
    category: "Neobank · EU",
    prefill: {
      company_name: "N26",
      company_url: "https://www.n26.com/",
      areas_of_interest: ["fintech", "banking"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 90000, voice: 5000, email: 25000, social: 5000 },
      conversation_cost: "~€3.00",
      pricing_model: "usage",
      deployment_markets: 24,
      resources: { stakeholder_owners: 2, ai_trainers: 6, technical_resources: 4, supporting_departments: ["Customer Service", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"] },
      specific_requirements:
        "German-licensed neobank. 8M+ customers across 24 EU markets. Chat-first, app-only.",
      custom_notes: "Regulated banking licence adds compliance weight vs. pure-fintech peers.",
    },
  },
  {
    key: "monzo",
    name: "Monzo",
    domain: "monzo.com",
    country: "UK",
    category: "Neobank · UK",
    prefill: {
      company_name: "Monzo",
      company_url: "https://www.monzo.com/",
      areas_of_interest: ["fintech", "banking"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 85000, voice: 8000, email: 20000, social: 4000 },
      conversation_cost: "~£3.00",
      pricing_model: "usage",
      deployment_markets: 2,
      resources: { stakeholder_owners: 2, ai_trainers: 5, technical_resources: 3, supporting_departments: ["Customer Service", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Intercom"] },
      specific_requirements:
        "UK-licensed neobank. 10M+ customers. Known for excellent in-app chat support.",
      custom_notes: "Customer-service reputation is central brand equity — quality bar is very high.",
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
      pricing_model: "usage",
      deployment_markets: 6,
      resources: { stakeholder_owners: 2, ai_trainers: 5, technical_resources: 3, supporting_departments: ["Customer Service", "Claims", "Trust & Safety"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"] },
      specific_requirements:
        "Digital-first insurer, AI-native. 2M+ customers across US/EU. Mobile-first, minimal voice channel. Instant claims decisions are the USP.",
      custom_notes: "AI-native brand — the bar for AI quality is part of the product promise.",
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
      pricing_model: "usage",
      deployment_markets: 3,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Customer Service", "Claims"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"], openid: ["BankID"] },
      specific_requirements:
        "Nordic DTC insurer, app-first. ~150K customers in SE/NO/DK. Chat-primary, very low voice volume. Strong onboarding + claims speed focus.",
      custom_notes: "Brand voice is friendly/informal — tone alignment matters more than usual.",
    },
  },

  // ─── Nordic fintech ──────────────────────────
  {
    key: "vipps",
    name: "Vipps MobilePay",
    domain: "vipps.no",
    aliases: ["vipps", "mobilepay", "vippsmobilepay", "vipps.com"],
    country: "NO",
    category: "Mobile payments · Nordic",
    prefill: {
      company_name: "Vipps MobilePay",
      company_url: "https://www.vipps.no/",
      areas_of_interest: ["fintech"],
      channel_volumes: { chat: 120000, voice: 60000, email: 40000, social: 15000 },
      conversation_cost: "~40 NOK",
      pricing_model: "usage",
      deployment_markets: 3,
      resources: {
        stakeholder_owners: 3,
        ai_trainers: 5,
        technical_resources: 4,
        supporting_departments: ["Customer Service", "Fraud & Risk", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Zendesk"], openid: ["BankID"] },
      specific_requirements:
        "Nordic mobile payments platform. Vipps (NO) merged with MobilePay (DK/FI) in 2022 — 11M+ users across Norway, Denmark, and Finland. Owned by a consortium of Nordic banks (DNB + SpareBank 1 alliance). Chat-heavy, fraud-sensitive, with heavy volumes on payment disputes, merchant onboarding, and identity verification.",
      custom_notes: "Bank-owned consortium; any AI deployment must satisfy multiple bank shareholders' compliance standards. Multi-market launch, multi-language.",
    },
  },
  {
    key: "bulder",
    name: "Bulder Bank",
    domain: "bulder.no",
    aliases: ["bulder", "bulderbank"],
    country: "NO",
    category: "Digital bank (mortgage-led) · NO",
    prefill: {
      company_name: "Bulder Bank",
      company_url: "https://www.bulder.no/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 35000, voice: 15000, email: 8000, social: 1500 },
      conversation_cost: "~45 NOK",
      pricing_model: "usage",
      deployment_markets: 1,
      resources: {
        stakeholder_owners: 2,
        ai_trainers: 3,
        technical_resources: 3,
        supporting_departments: ["Customer Service", "Lending", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Intercom"], openid: ["BankID"] },
      specific_requirements:
        "Norwegian app-first digital bank launched 2019 by SpareBank 1 SR-Bank. Mortgage-focused retail bank with no branches — fully digital. App-native chat is the primary support channel. Mortgage application and rate-change flows dominate ticket volume.",
      custom_notes: "Neobank subsidiary of a larger parent — operational decisions move fast, but platform choices may route through SR-Bank group architecture.",
    },
  },

  // ─── Rest of Europe ──────────────────────────
  {
    key: "nn-group",
    name: "NN Group",
    domain: "nn-group.com",
    aliases: ["nn", "nngroup", "nnbank", "nn.nl", "nationale-nederlanden"],
    country: "EU",
    category: "Insurance + bank + pension · Netherlands",
    prefill: {
      company_name: "NN Group",
      company_url: "https://www.nn-group.com/",
      areas_of_interest: ["insurance", "banking", "pension"],
      channel_volumes: { chat: 90000, voice: 220000, email: 60000, social: 8000 },
      conversation_cost: "~€5",
      pricing_model: "fixed",
      deployment_markets: 11,
      resources: {
        stakeholder_owners: 4,
        ai_trainers: 6,
        technical_resources: 5,
        supporting_departments: ["Customer Service", "Claims", "Pension Administration", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys"], openid: ["DigiD"] },
      specific_requirements:
        "Dutch financial services group (insurance + NN Bank + largest Dutch pension provider). ~18M customers across 11 countries in Europe and Japan. Multi-language (NL/EN/Spanish/Czech/Polish/Turkish/Japanese). Each market has local regulatory requirements.",
      custom_notes: "Multi-country deployment is the norm — governance model must handle per-market compliance variations within a single agentic platform.",
    },
  },

  // ─── North America ───────────────────────────
  {
    key: "desert-financial",
    name: "Desert Financial Credit Union",
    domain: "desertfinancial.com",
    aliases: ["desert financial", "desertfinancial", "dfcu"],
    country: "US",
    category: "Credit union · Arizona",
    prefill: {
      company_name: "Desert Financial Credit Union",
      company_url: "https://www.desertfinancial.com/",
      areas_of_interest: ["credit_union", "banking"],
      channel_volumes: { chat: 55000, voice: 140000, email: 30000, social: 4000 },
      conversation_cost: "~$8",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: {
        stakeholder_owners: 3,
        ai_trainers: 4,
        technical_resources: 3,
        supporting_departments: ["Member Services", "Lending", "Digital Banking", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys"] },
      specific_requirements:
        "Arizona-based credit union with ~450K members across 50+ branches. Known boost.ai customer. Member-owned; deposits, loans, credit cards, mortgage, auto — full service. US regulatory environment (NCUA).",
      custom_notes: "Member-owned narrative is core to CU brand — trust and transparency language should mirror mutual insurance framing.",
    },
  },
  {
    key: "navy-federal",
    name: "Navy Federal Credit Union",
    domain: "navyfederal.org",
    aliases: ["navy federal", "navyfederal", "nfcu"],
    country: "US",
    category: "Credit union · US (largest)",
    prefill: {
      company_name: "Navy Federal Credit Union",
      company_url: "https://www.navyfederal.org/",
      areas_of_interest: ["credit_union", "banking"],
      channel_volumes: { chat: 400000, voice: 1200000, email: 180000, social: 25000 },
      conversation_cost: "~$9",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: {
        stakeholder_owners: 5,
        ai_trainers: 8,
        technical_resources: 6,
        supporting_departments: ["Member Services", "Lending", "Digital Banking", "Fraud & Security", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys"] },
      specific_requirements:
        "Largest US credit union — ~13M members serving Department of Defense affiliates and families. Huge voice volume, heavy identity verification burden. US regulatory environment (NCUA) plus DoD-adjacent compliance expectations.",
      custom_notes: "Scale rivals large retail banks; deployment complexity is more like BoA than a typical CU. Member eligibility verification is a distinct journey.",
    },
  },
  {
    key: "penfed",
    name: "PenFed Credit Union",
    domain: "penfed.org",
    aliases: ["penfed", "pentagon federal"],
    country: "US",
    category: "Credit union · US",
    prefill: {
      company_name: "PenFed Credit Union",
      company_url: "https://www.penfed.org/",
      areas_of_interest: ["credit_union", "banking"],
      channel_volumes: { chat: 120000, voice: 280000, email: 60000, social: 6000 },
      conversation_cost: "~$8",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: {
        stakeholder_owners: 3,
        ai_trainers: 5,
        technical_resources: 4,
        supporting_departments: ["Member Services", "Lending", "Digital Banking", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys"] },
      specific_requirements:
        "~2.8M members, originally Pentagon-federal, now open membership. Mortgage + auto loan heavy. US regulatory environment (NCUA).",
      custom_notes: "Strong mortgage and auto-loan brand; those flows dominate conversation volume.",
    },
  },
  {
    key: "alliant",
    name: "Alliant Credit Union",
    domain: "alliantcreditunion.org",
    aliases: ["alliant", "alliant cu", "alliantcu"],
    country: "US",
    category: "Digital-first credit union · US",
    prefill: {
      company_name: "Alliant Credit Union",
      company_url: "https://www.alliantcreditunion.org/",
      areas_of_interest: ["credit_union", "banking"],
      selected_variants: ["banking:neobank"],
      channel_volumes: { chat: 90000, voice: 120000, email: 40000, social: 3500 },
      conversation_cost: "~$7",
      pricing_model: "fixed",
      deployment_markets: 1,
      resources: {
        stakeholder_owners: 2,
        ai_trainers: 4,
        technical_resources: 3,
        supporting_departments: ["Member Services", "Lending", "Digital Banking", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Intercom"] },
      specific_requirements:
        "~800K members, digital-first credit union (one branch in Chicago, rest online). App and web primary. Credit-union values with neobank UX expectations. US regulatory environment (NCUA).",
      custom_notes: "Brand tension — credit-union trust messaging meets neobank speed. Any deployment has to balance both.",
    },
  },
  {
    key: "bank-of-america",
    name: "Bank of America",
    domain: "bankofamerica.com",
    aliases: ["boa", "bofa", "bankofamerica", "bank of america"],
    country: "US",
    category: "Universal bank · US",
    prefill: {
      company_name: "Bank of America",
      company_url: "https://www.bankofamerica.com/",
      areas_of_interest: ["banking", "wealth_management"],
      selected_variants: ["banking:retail", "banking:corporate", "banking:private"],
      channel_volumes: { chat: 800000, voice: 3500000, email: 500000, social: 80000 },
      conversation_cost: "~$9",
      pricing_model: "fixed",
      deployment_markets: 35,
      resources: {
        stakeholder_owners: 8,
        ai_trainers: 15,
        technical_resources: 12,
        supporting_departments: ["Customer Service", "Fraud & Security", "Digital Banking", "Wealth Management", "Compliance"],
        knowledge_management: true,
      },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Genesys"] },
      specific_requirements:
        "US money-center bank — ~67M retail and SMB clients, ~200K+ employees, ~35 markets. Existing large-scale AI assistant (Erica) handles ~1B+ interactions per year. Any boost engagement is augmentation or specialist-agent federation, not greenfield. Extreme scale + US regulatory rigor (OCC, FDIC, CFPB).",
      custom_notes: "Erica is the incumbent AI — position boost agents as specialist orchestrators that federate with, rather than replace, the existing stack.",
    },
  },

  /* ─── CE fixture customers ──────────────────────────
   * Live boost.ai customers from the CE delivery history (BR + inspiration
   * decks in customer_excellence_raw_data_pdfs/). Minimal Sales-prefill
   * here — the rich CE telemetry (performance, success plan, SWOT, UAT,
   * benchmarks, recommendations, BR context) lives in
   * `src/data/customer-fixtures.ts` and is overlaid via
   * `detectFromCurated()`. */
  {
    key: "hm",
    name: "H&M",
    domain: "hm.com",
    aliases: ["hennes-and-mauritz", "h-and-m", "handm"],
    country: "SE",
    category: "Retail · Global",
    prefill: {
      company_name: "H&M",
      company_url: "https://www.hm.com/",
      areas_of_interest: [],
      deployment_markets: 20,
      integrations: { channel: ["Custom Web Chat"] },
      specific_requirements: "Global fashion retailer. Multi-market CX automation across ordering, returns, membership, and store locator.",
    },
  },
  {
    key: "cbna",
    name: "CBNA",
    domain: "cbna.com",
    aliases: ["community-bank-na", "community-bank"],
    country: "US",
    category: "Community bank · US",
    prefill: {
      company_name: "CBNA",
      company_url: "https://www.cbna.com/",
      areas_of_interest: ["banking"],
      selected_variants: ["banking:retail"],
      deployment_markets: 1,
      integrations: { channel: ["Custom Web Chat"] },
      specific_requirements: "US community bank — retail banking, account support, branch locator, and card operations.",
    },
  },
  {
    key: "dna",
    name: "DNA",
    domain: "dna.fi",
    aliases: ["dna-oy", "dna-finland"],
    country: "FI",
    category: "Telecom · FI",
    prefill: {
      company_name: "DNA",
      company_url: "https://www.dna.fi/",
      areas_of_interest: [],
      deployment_markets: 1,
      integrations: { channel: ["Custom Web Chat"] },
      specific_requirements: "Finnish telecom operator — mobile, broadband, and TV. Consumer + SMB self-service automation.",
    },
  },
  {
    key: "juno",
    name: "JUNO",
    domain: "juno.fi",
    aliases: ["juno-bank", "juno-digital"],
    country: "FI",
    category: "Digital services · FI",
    prefill: {
      company_name: "JUNO",
      company_url: "https://www.juno.fi/",
      areas_of_interest: [],
      deployment_markets: 1,
      integrations: { channel: ["Custom Web Chat"] },
      specific_requirements: "Nordic digital services customer. Early boost deployment with agent-assist focus.",
    },
  },
  {
    key: "moi",
    name: "Moi",
    domain: "moi.fi",
    aliases: ["moi-mobiili", "moi-mobile"],
    country: "FI",
    category: "Mobile operator · FI",
    prefill: {
      company_name: "Moi",
      company_url: "https://www.moi.fi/",
      areas_of_interest: [],
      deployment_markets: 1,
      integrations: { channel: ["Custom Web Chat"] },
      specific_requirements: "Finnish MVNO — lean operator, digital-first CX.",
    },
  },
  {
    key: "sanoma",
    name: "Sanoma",
    domain: "sanoma.com",
    aliases: ["sanoma-media", "sanoma-group"],
    country: "FI",
    category: "Media · FI",
    prefill: {
      company_name: "Sanoma",
      company_url: "https://www.sanoma.com/",
      areas_of_interest: [],
      deployment_markets: 2,
      integrations: { channel: ["Custom Web Chat"] },
      specific_requirements: "Nordic media + learning group. Subscription support, publication access, and learning-platform customer service.",
    },
  },
  // ─── Extensions ──────────────────────────────────
  //
  //  Net-new patterns authored under `src/data/extensions/patterns/`.
  //  Spread-appended here so searchCompanies() + detectFromCurated()
  //  find them alongside the in-file curated entries above. Keeping
  //  the extension list in its own directory makes cherry-picking
  //  new additions (from unmatched search-log queries) trivial.
  ...EXTENSION_COMPANY_PATTERNS,
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

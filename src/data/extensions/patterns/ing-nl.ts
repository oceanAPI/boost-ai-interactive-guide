import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "ing-nl",
  name: "ING Netherlands",
  domain: "ing.nl",
  aliases: ["ing", "ingbank", "ing-bank", "ingnl", "ing-netherlands"],
  // NB: "NL" is not yet in CompanyPattern country union; merge step can widen it
  // to include "NL" — see extensions/integration-guide.md § 1 edge case.
  country: "EU",
  category: "Retail & commercial bank · NL",
  prefill: {
    company_name: "ING Netherlands",
    company_url: "https://www.ing.nl/",
    areas_of_interest: ["banking"],
    selected_variants: ["banking:retail", "banking:neobank"],
    channel_volumes: { chat: 380000, voice: 720000, email: 140000, social: 18000 },
    conversation_cost: "~€5",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 5,
      ai_trainers: 8,
      technical_resources: 6,
      supporting_departments: ["Customer Service", "Digital Banking", "Fraud", "Compliance", "IT / Engineering"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat", "WhatsApp Business"],
      human_handover: ["Genesys Cloud"],
      openid: ["DigiD"],
    },
    specific_requirements:
      "Largest bank in the Netherlands — 8.5M retail customers, large SME base, mobile-led. Dutch-language NLU mandatory, English required. DigiD + internal strong-auth. High PSD2 / AFM compliance bar. Very mobile-native clientele — app-first experience.",
    custom_notes:
      "Heavy mobile app volume; chat-in-app is the dominant channel. Fraud / scam enquiries spike during holiday shopping windows.",
  },
};

export default pattern;

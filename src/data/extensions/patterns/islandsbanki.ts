import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "islandsbanki",
  name: "Íslandsbanki",
  domain: "islandsbanki.is",
  aliases: ["islandsbanki", "islandsbankihf", "islands", "islan", "ibanki"],
  // NB: "IS" is not yet in CompanyPattern country union; merge step can widen it
  // to include "IS"/"NL" — see extensions/integration-guide.md § 1 edge case.
  country: "EU",
  category: "Retail & commercial bank · IS",
  prefill: {
    company_name: "Íslandsbanki",
    company_url: "https://www.islandsbanki.is/",
    areas_of_interest: ["banking"],
    selected_variants: ["banking:retail", "banking:corporate"],
    channel_volumes: { chat: 25000, voice: 65000, email: 15000, social: 2000 },
    conversation_cost: "~800 ISK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 2,
      technical_resources: 2,
      supporting_departments: ["Customer Service", "Digital Banking", "Corporate Banking"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Puzzel Chat"],
      openid: ["Íslykill"],
    },
    specific_requirements:
      "One of Iceland's three largest universal banks. Retail + commercial + markets. Icelandic-language NLU is mandatory — all Nordic-bank models need retraining on Icelandic morphology. Íslykill / rafræn skilríki for strong authentication.",
    custom_notes:
      "Small market (~370k customers) but high digital maturity — early BankID/PSD2 adopter. English content required for expat / tourist segment.",
  },
};

export default pattern;

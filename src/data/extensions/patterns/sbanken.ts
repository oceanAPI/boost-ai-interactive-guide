import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "sbanken",
  name: "Sbanken",
  domain: "sbanken.no",
  aliases: ["sbanken", "s-banken", "skandiabanken"],
  country: "NO",
  category: "Digital-first bank · NO",
  prefill: {
    company_name: "Sbanken",
    company_url: "https://sbanken.no/",
    areas_of_interest: ["banking"],
    selected_variants: ["banking:neobank", "banking:retail"],
    channel_volumes: { chat: 55000, voice: 80000, email: 18000, social: 3500 },
    conversation_cost: "~50 NOK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 3,
      technical_resources: 3,
      supporting_departments: ["Customer Service", "Digital Banking"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Puzzel Chat"],
      openid: ["BankID"],
    },
    specific_requirements:
      "Norway's pioneer digital-only bank, now part of DNB group. Retail focus — mortgages, everyday accounts, saving, investments. App-first. BankID strong-auth. Norwegian-language NLU mandatory.",
    custom_notes:
      "Brand heritage as the direct-bank challenger — tone should stay sharp and transparent. Mortgage conversion is the headline revenue journey.",
  },
};

export default pattern;

import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "ikano-bank",
  name: "Ikano Bank",
  domain: "ikanobank.se",
  aliases: ["ikano", "ikano bank", "ikano insurance"],
  country: "SE",
  category: "Bank + insurance · SE",
  prefill: {
    company_name: "Ikano Bank",
    company_url: "https://ikanobank.se/",
    areas_of_interest: ["banking", "insurance"],
    selected_variants: ["banking:retail", "insurance:dtc"],
    channel_volumes: { chat: 28000, voice: 18000, email: 7000, social: 800 },
    conversation_cost: "~52 SEK",
    pricing_model: "fixed",
    deployment_markets: 4,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 3,
      technical_resources: 2,
      supporting_departments: ["Customer Service", "Lending Ops", "Insurance Ops"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      openid: ["BankID"],
    },
    specific_requirements:
      "Cross-border bank-and-insurance group spanning SE / NO / DK / FI under one customer identity. Retail consumer lending, savings, partner cards (IKEA), and accident/illness insurance. Multi-language NLU mandatory across the four Nordic markets.",
    custom_notes:
      "Ikano runs split journeys per market with shared core. AI Agent should respect per-market policy + currency + tax differences while reusing the central intent model. Strong brand link to IKEA — tone is plain, friendly, no jargon.",
  },
};

export default pattern;

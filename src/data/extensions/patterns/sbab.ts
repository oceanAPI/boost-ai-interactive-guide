import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "sbab",
  name: "SBAB",
  domain: "sbab.se",
  aliases: ["sbab", "sbab bank", "sveriges bostadsfinansieringsaktiebolag"],
  country: "SE",
  category: "Mortgage bank · SE",
  prefill: {
    company_name: "SBAB",
    company_url: "https://sbab.se/",
    areas_of_interest: ["banking"],
    selected_variants: ["banking:retail"],
    channel_volumes: { chat: 35000, voice: 22000, email: 9000, social: 1200 },
    conversation_cost: "~55 SEK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 2,
      technical_resources: 2,
      supporting_departments: ["Mortgage Origination", "Customer Service"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      openid: ["BankID"],
    },
    specific_requirements:
      "Swedish state-owned mortgage specialist. Narrow product focus — mortgages + savings — with the highest customer-effort sensitivity in the SE banking sector. BankID strong-auth, mandatory Swedish-language NLU, regulatory framing follows Finansinspektionen.",
    custom_notes:
      "SBAB has historically led on rate transparency and self-service. Lean toward conversion-friendly automation on mortgage origination journeys (rate quotes, document upload status, application checks). Procurement runs through public-tender rules.",
  },
};

export default pattern;

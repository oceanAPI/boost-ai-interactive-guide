import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "sparebanken-vest",
  name: "Sparebanken Vest",
  domain: "spv.no",
  aliases: ["sparebankenvest", "spv", "spare-vest"],
  country: "NO",
  category: "Savings bank · NO",
  prefill: {
    company_name: "Sparebanken Vest",
    company_url: "https://www.spv.no/",
    areas_of_interest: ["banking"],
    selected_variants: ["banking:retail"],
    channel_volumes: { chat: 45000, voice: 110000, email: 20000, social: 3000 },
    conversation_cost: "~60 NOK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 3,
      technical_resources: 2,
      supporting_departments: ["Customer Service", "Digital Banking"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Puzzel Chat"],
      openid: ["BankID"],
    },
    specific_requirements:
      "Norway's third-largest savings bank, serving Western Norway with a strong regional identity. Retail-focused with mortgages, everyday accounts, savings, and investment products. Norwegian-language NLU (bokmål + nynorsk), BankID primary strong-auth.",
    custom_notes:
      "Community-rooted — tone of voice should feel regionally warm, not corporate. Bulk of volume is everyday banking + mortgage enquiries.",
  },
};

export default pattern;

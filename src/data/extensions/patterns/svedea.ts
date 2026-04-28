import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "svedea",
  name: "Svedea",
  domain: "svedea.se",
  aliases: ["svedea", "svedea forsakring", "svedea försäkring"],
  country: "SE",
  category: "P&C insurer · SE",
  prefill: {
    company_name: "Svedea",
    company_url: "https://svedea.se/",
    areas_of_interest: ["insurance"],
    selected_variants: ["insurance:dtc"],
    channel_volumes: { chat: 14000, voice: 11000, email: 6500, social: 600 },
    conversation_cost: "~62 SEK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 1,
      ai_trainers: 2,
      technical_resources: 1,
      supporting_departments: ["Claims", "Underwriting", "Customer Service"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      openid: ["BankID"],
    },
    specific_requirements:
      "Swedish DTC P&C specialist — pet, boat, motorcycle, snowmobile, MC. Niche coverage with strong claims-volume sensitivity (seasonality on boat + snowmobile, year-round on pet). Swedish-language NLU + BankID strong-auth on claim file submission.",
    custom_notes:
      "Svedea positions on niche expertise — \"insurance for the things you actually care about.\" AI Agent voice should keep the warm-but-precise Svedea tone. Strongest ROI usually on first-notification-of-loss (FNOL) automation for the high-frequency niches.",
  },
};

export default pattern;

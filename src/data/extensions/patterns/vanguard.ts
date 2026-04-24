import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "vanguard",
  name: "Vanguard",
  domain: "vanguard.com",
  aliases: ["vang", "vanguardgroup", "vanguard-group"],
  country: "US",
  category: "Asset management · US",
  prefill: {
    company_name: "Vanguard",
    company_url: "https://www.vanguard.com/",
    areas_of_interest: ["wealth_management"],
    selected_variants: ["wealth_management:mass_affluent", "wealth_management:institutional"],
    channel_volumes: { chat: 150000, voice: 420000, email: 90000, social: 8000 },
    conversation_cost: "~$6",
    pricing_model: "fixed",
    deployment_markets: 3,
    resources: {
      stakeholder_owners: 4,
      ai_trainers: 7,
      technical_resources: 5,
      supporting_departments: ["Customer Service", "Compliance", "Product", "IT / Engineering"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Genesys Cloud"],
      openid: ["Okta"],
    },
    specific_requirements:
      "Asset manager with ~$9T AUM. Mass-affluent retail + institutional retirement plan administration. High-compliance environment — every advisory-adjacent turn must stay clear of personalised investment advice. English-first; Spanish secondary.",
    custom_notes:
      "Retirement account servicing dominates volume (IRAs, 401(k) rollovers). Pain point: wait times during tax season and market volatility spikes.",
  },
};

export default pattern;

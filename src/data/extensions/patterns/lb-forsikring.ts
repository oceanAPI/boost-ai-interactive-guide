import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "lb-forsikring",
  name: "LB Forsikring",
  domain: "lbforsikring.dk",
  aliases: ["lb forsikring", "lb", "lærerstandens"],
  country: "DK",
  category: "Mutual P&C insurer · DK",
  prefill: {
    company_name: "LB Forsikring",
    company_url: "https://lbforsikring.dk/",
    areas_of_interest: ["insurance"],
    selected_variants: ["insurance:mutual"],
    channel_volumes: { chat: 18000, voice: 14000, email: 8000, social: 700 },
    conversation_cost: "~62 DKK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 1,
      ai_trainers: 2,
      technical_resources: 2,
      supporting_departments: ["Claims", "Member Services", "Underwriting"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      openid: ["MitID"],
    },
    specific_requirements:
      "Danish mutual insurer for professional groups (teachers, healthcare, lawyers, etc.). Member-owned, profit returned as bonus. Danish-language NLU + MitID strong-auth. Member-eligibility checks tied to professional-association membership.",
    custom_notes:
      "Mutual model means terminology shifts — \"member\" not \"customer\". AI Agent should reflect that. Claims handling is the headline workload; LB also runs a strong renewal-bonus narrative each year that the AI Agent should explain consistently.",
  },
};

export default pattern;

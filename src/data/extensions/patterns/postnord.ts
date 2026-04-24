import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "postnord",
  name: "PostNord",
  domain: "postnord.com",
  aliases: ["postnord", "post-nord", "posten"],
  country: "SE",
  category: "Postal & parcel logistics · SE/DK",
  prefill: {
    company_name: "PostNord",
    company_url: "https://www.postnord.com/",
    areas_of_interest: ["logistics"],
    selected_variants: ["logistics:parcel", "logistics:cross_border", "logistics:freight"],
    channel_volumes: { chat: 520000, voice: 310000, email: 85000, social: 28000 },
    conversation_cost: "~25 SEK",
    pricing_model: "fixed",
    deployment_markets: 4,
    resources: {
      stakeholder_owners: 4,
      ai_trainers: 7,
      technical_resources: 5,
      supporting_departments: ["Customer Service", "Operations", "Claims", "Cross-border"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Genesys Cloud"],
      openid: ["BankID", "MitID"],
    },
    specific_requirements:
      "Nordic postal + parcel operator, jointly owned by Sweden and Denmark. Extremely high volume — parcel tracking enquiries dominate, with seasonal peaks at Black Friday / Christmas. Multi-language NLU (SE/DK/NO/FI/EN). BankID + MitID strong auth for account-protected actions.",
    custom_notes:
      "Tracking + delivery rescheduling should be self-serve end-to-end. Claims (lost/damaged parcels) are the highest-friction journey — deserves a specialist agent with clear document-submission flow.",
  },
};

export default pattern;

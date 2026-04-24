import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "telenor-dk",
  name: "Telenor Denmark",
  domain: "telenor.dk",
  aliases: ["telenor", "telenordk", "telenor-denmark"],
  country: "DK",
  category: "Telecommunications · DK",
  prefill: {
    company_name: "Telenor Denmark",
    company_url: "https://www.telenor.dk/",
    areas_of_interest: ["telco"],
    selected_variants: ["telco:mobile", "telco:broadband", "telco:b2b"],
    channel_volumes: { chat: 220000, voice: 380000, email: 55000, social: 12000 },
    conversation_cost: "~35 DKK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 3,
      ai_trainers: 6,
      technical_resources: 4,
      supporting_departments: ["Customer Service", "Tech Support", "Billing", "Retention"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Genesys Cloud"],
      openid: ["MitID"],
    },
    specific_requirements:
      "Danish mobile + broadband + business-connectivity operator. Billing enquiries and device support dominate volume. High churn-risk context — retention needs to be visible in every upgrade journey. Danish-language NLU mandatory, English secondary. MitID for strong auth.",
    custom_notes:
      "Roaming, 5G rollout questions, and bundled TV/broadband deals are seasonal volume drivers. Self-service upgrades should be friction-free to reduce voice calls.",
  },
};

export default pattern;

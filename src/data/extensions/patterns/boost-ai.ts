import type { CompanyPattern } from "../../company-patterns";

/**
 * Easter-egg self-reference pattern — lets an AE type "boost.ai" into the
 * admin Company Search and get a playful prefill that skews the guide toward
 * a conversational-AI vendor scenario. Used for internal demos and live
 * prospect walkthroughs where the host wants to show the tool reacting to
 * their own brand.
 */
const pattern: CompanyPattern = {
  key: "boost-ai",
  name: "boost.ai",
  domain: "boost.ai",
  aliases: ["boostai", "boost-ai", "boost"],
  country: "Global",
  category: "Conversational AI · Global",
  prefill: {
    company_name: "boost.ai",
    company_url: "https://boost.ai/",
    areas_of_interest: ["fintech"],
    selected_variants: ["fintech:b2b"],
    channel_volumes: { chat: 12000, voice: 4000, email: 8000, social: 1500 },
    conversation_cost: "~$2",
    pricing_model: "usage",
    deployment_markets: 12,
    resources: {
      stakeholder_owners: 3,
      ai_trainers: 6,
      technical_resources: 8,
      supporting_departments: ["Customer Service", "Product", "IT / Engineering", "Data / Analytics"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Genesys Cloud"],
      openid: ["Okta"],
    },
    specific_requirements:
      "Conversational-AI platform vendor — internal use case of our own product to handle prospect + customer enquiries. Multi-language (EN/NO/SE/DK/FI/NL/DE/ES), B2B SaaS pricing questions, technical integration enquiries, developer-experience support.",
    custom_notes:
      "Easter egg — dogfood pattern. Great for live demos where the AE wants the tool to reflect the vendor's own context.",
  },
};

export default pattern;

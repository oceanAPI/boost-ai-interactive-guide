import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "lego",
  name: "LEGO Group",
  domain: "lego.com",
  aliases: ["lego", "lego group", "the lego group"],
  country: "DK",
  category: "Consumer goods · DK",
  prefill: {
    company_name: "LEGO Group",
    company_url: "https://lego.com/",
    /* No FS industry maps to LEGO; areas_of_interest left empty so
     * the AE sees the channel-aware shell without industry-specific
     * agent rosters. AE can opt-in to logistics if delivery/parcel
     * journeys dominate the deck for a given pitch. */
    areas_of_interest: [],
    channel_volumes: { chat: 90000, voice: 28000, email: 22000, social: 14000 },
    conversation_cost: "$5.40",
    currency: "USD",
    pricing_model: "fixed",
    deployment_markets: 6,
    resources: {
      stakeholder_owners: 3,
      ai_trainers: 5,
      technical_resources: 3,
      supporting_departments: ["Customer Service", "LEGO Insiders", "Replacement Parts"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat", "WhatsApp Business", "Apple Messages for Business"],
      utility: ["Salesforce"],
    },
    specific_requirements:
      "Global consumer-goods brand. Direct-to-consumer customer service across 100+ markets — order status, replacement-parts ordering, damaged-set replacement, LEGO Insiders loyalty, age-appropriate response handling for child users. Multi-language NLU mandatory across at least 12 primary markets. COPPA + GDPR-K (kids' data) compliance posture is non-negotiable.",
    custom_notes:
      "Non-FS prospect — drop the financial-service framing in pitch copy. Strongest workload is replacement-parts ordering (Bricks & Pieces) + damaged-set claims, both of which fit AI Agent automation cleanly. Brand-voice guardrails are tight: warm, never sarcastic, age-aware. AI Agent must never collect personal data from a user it suspects to be under 13.",
  },
};

export default pattern;

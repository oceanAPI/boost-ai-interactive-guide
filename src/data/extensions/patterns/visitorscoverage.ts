import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "visitorscoverage",
  name: "VisitorsCoverage",
  domain: "visitorscoverage.com",
  aliases: ["visitors coverage", "visitorscoverage", "visitor coverage"],
  country: "US",
  category: "Travel insurance · US",
  prefill: {
    company_name: "VisitorsCoverage",
    company_url: "https://visitorscoverage.com/",
    areas_of_interest: ["insurance"],
    selected_variants: ["insurance:broker"],
    channel_volumes: { chat: 22000, voice: 16000, email: 11000, social: 900 },
    conversation_cost: "$7.20",
    currency: "USD",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 2,
      technical_resources: 2,
      supporting_departments: ["Sales", "Customer Service", "Claims Liaison"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat", "WhatsApp Business"],
      utility: ["Salesforce"],
    },
    specific_requirements:
      "US-headquartered travel-insurance marketplace covering visitors to/from the US, students, and expats. Multi-carrier broker model — quotes pulled from 30+ underwriters. English-first with Spanish + Mandarin secondary. PII handling under GLBA + state-level visitor-insurance regs.",
    custom_notes:
      "High-velocity online quoting — automation pays back fastest on quote-comparison flows + policy-document retrieval + claim-status routing. AI Agent must explain coverage differences across carriers without recommending one (broker neutrality matters).",
  },
};

export default pattern;

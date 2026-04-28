import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "morrow-bank",
  name: "Morrow Bank",
  domain: "morrowbank.no",
  aliases: ["morrow", "morrow bank", "komplett bank"],
  country: "NO",
  category: "Digital-first bank · NO",
  prefill: {
    company_name: "Morrow Bank",
    company_url: "https://morrowbank.no/",
    areas_of_interest: ["banking"],
    selected_variants: ["banking:neobank", "banking:retail"],
    channel_volumes: { chat: 32000, voice: 14000, email: 6500, social: 900 },
    conversation_cost: "~48 NOK",
    pricing_model: "fixed",
    deployment_markets: 4,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 2,
      technical_resources: 2,
      supporting_departments: ["Customer Service", "Digital Banking", "Lending"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      openid: ["BankID"],
    },
    specific_requirements:
      "Nordic digital bank (rebrand from Komplett Bank) — credit cards, consumer loans, savings. Operates across NO / SE / FI / DK with shared platform but per-market regulatory framing. BankID + matching SE/FI/DK eIDs required.",
    custom_notes:
      "Morrow inherits Komplett Bank's high-velocity application volume — biggest ROI tends to be on credit-application status checks, payment-due reminders, and dispute initiation. App-first audience, low tolerance for IVR.",
  },
};

export default pattern;

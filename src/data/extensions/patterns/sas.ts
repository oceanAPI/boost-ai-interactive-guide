import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "sas",
  name: "SAS — Scandinavian Airlines",
  domain: "flysas.com",
  aliases: ["sas", "flysas", "scandinavianairlines", "sas-scandinavian"],
  country: "SE",
  category: "Airline · Scandinavia",
  prefill: {
    company_name: "SAS — Scandinavian Airlines",
    company_url: "https://www.flysas.com/",
    areas_of_interest: ["airline"],
    selected_variants: ["airline:scheduled"],
    channel_volumes: { chat: 340000, voice: 420000, email: 70000, social: 22000 },
    conversation_cost: "~50 SEK",
    pricing_model: "fixed",
    deployment_markets: 3,
    resources: {
      stakeholder_owners: 3,
      ai_trainers: 5,
      technical_resources: 4,
      supporting_departments: ["Customer Service", "Operations", "Loyalty (EuroBonus)", "Disruption Desk"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat", "WhatsApp Business"],
      human_handover: ["Genesys Cloud"],
      openid: ["BankID", "MitID"],
    },
    specific_requirements:
      "Flag carrier of Sweden, Norway, and Denmark. Scheduled network airline — SkyTeam member. Disruption-driven volume (delays, cancellations, weather, strikes) spikes unpredictably. Multi-language NLU (SE/NO/DK/EN). EuroBonus loyalty tier-aware service quality.",
    custom_notes:
      "Operational disruptions produce multi-day volume surges that break voice SLAs — automation must cover rebooking, vouchers, and compensation (EU261) end-to-end. Tier recognition (EuroBonus Gold/Diamond) matters to CSAT on handovers.",
  },
};

export default pattern;

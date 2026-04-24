import type { CompanyPattern } from "../../company-patterns";

const pattern: CompanyPattern = {
  key: "trygderetten",
  name: "Trygderetten",
  domain: "trygderetten.no",
  aliases: ["trygderetten", "trygderet", "socialsecuritytribunal-no"],
  country: "NO",
  category: "Social-security tribunal · NO",
  prefill: {
    company_name: "Trygderetten",
    company_url: "https://www.trygderetten.no/",
    areas_of_interest: ["public_sector"],
    selected_variants: ["public_sector:appeals", "public_sector:benefits"],
    channel_volumes: { chat: 8000, voice: 22000, email: 14000, social: 500 },
    conversation_cost: "~80 NOK",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: 2,
      ai_trainers: 2,
      technical_resources: 2,
      supporting_departments: ["Customer Service", "Legal / Compliance", "Case Management"],
      knowledge_management: true,
    },
    integrations: {
      channel: ["Custom Web Chat"],
      human_handover: ["Puzzel Chat"],
      openid: ["ID-porten"],
    },
    specific_requirements:
      "Norwegian Social Security Tribunal (Trygderetten) — independent appeals body for decisions made by NAV and other welfare agencies. Case-status lookup, appeals-process guidance, document submission help, hearing-date information. Must never give legal advice — route to qualified help. Norwegian-language NLU (bokmål + nynorsk), ID-porten strong-auth.",
    custom_notes:
      "High-trust public-sector context — tone must be clear, impartial, non-patronising. Citizens often arrive frustrated after a NAV decision; empathy in phrasing is load-bearing.",
  },
};

export default pattern;

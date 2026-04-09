import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_insurance_general",
  name: "Insurance",
  icon: "hand-protection",
  automationRate: 80,
  description: "General insurance inquiries and policy information.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_carloan",
  name: "Carloan",
  icon: "balance",
  automationRate: 76,
  description: "Car loan applications, rates, and management.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

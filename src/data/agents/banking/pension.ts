import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_pension",
  name: "Pension",
  icon: "users",
  automationRate: 75,
  description: "Pension products, contributions, and retirement planning.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_prices",
  name: "Prices",
  icon: "bar-chart",
  automationRate: 80,
  description: "Product pricing, fee schedules, and rate information.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

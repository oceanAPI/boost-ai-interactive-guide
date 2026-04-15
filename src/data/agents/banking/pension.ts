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
  // Retirement planning is central to private wealth and a standard retail product.
  variants: ["banking:private", "banking:retail"],
};

export default agent;

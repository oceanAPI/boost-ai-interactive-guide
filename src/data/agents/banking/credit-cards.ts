import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_credit_cards",
  name: "Credit cards",
  icon: "banknote",
  automationRate: 83,
  description: "Credit card applications, rewards, and management.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

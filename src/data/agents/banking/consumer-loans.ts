import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_consumer_loans",
  name: "Consumer loans",
  icon: "balance",
  automationRate: 79,
  description: "Personal and consumer loan inquiries.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

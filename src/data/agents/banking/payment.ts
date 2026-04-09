import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_payment",
  name: "Payment",
  icon: "banknote",
  automationRate: 85,
  description: "Payment processing, transfers, and payment issues.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

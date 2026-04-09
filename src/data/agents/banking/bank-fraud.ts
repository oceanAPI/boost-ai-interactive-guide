import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_fraud",
  name: "Bank fraud",
  icon: "lock-security",
  automationRate: 85,
  description: "Fraud detection, reporting, and prevention.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

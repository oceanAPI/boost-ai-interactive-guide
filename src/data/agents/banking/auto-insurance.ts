import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_auto_insurance",
  name: "Auto insurance",
  icon: "umbrella",
  automationRate: 78,
  description: "Auto insurance quotes, claims, and policy management.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

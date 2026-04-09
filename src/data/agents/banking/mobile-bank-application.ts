import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_mobile_app",
  name: "Mobile bank application",
  icon: "desktop-network",
  automationRate: 88,
  description: "Mobile banking app support and troubleshooting.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

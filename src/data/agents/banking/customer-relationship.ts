import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_customer_relationship",
  name: "Customer relationship",
  icon: "users",
  automationRate: 82,
  description: "Customer relationship management, retention, and satisfaction.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
  // Relationship banking is a corporate + private wealth concept; retail/neobank are self-serve.
  variants: ["banking:corporate", "banking:private"],
};

export default agent;

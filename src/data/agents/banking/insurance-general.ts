import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_insurance_general",
  name: "Insurance",
  icon: "hand-protection",
  automationRate: 80,
  description: "General insurance inquiries and policy information.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
  // Bundled / comprehensive insurance offered to retail customers and wealth clients.
  variants: ["banking:retail", "banking:private"],
};

export default agent;

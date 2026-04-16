import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_insurance_general",
  name: "Insurance",
  icon: "hand-protection",
  automationRate: 80,
  avgResolutionTime: "~1.5 min",
  topTopic: "What insurance do you offer?",
  description: "General-purpose insurance information for bank customers — browse bundled insurance products and route to the partner insurer.",
  capabilities: [
    { title: "Product browse", description: "Lists the insurance products the bank bundles (home, travel, life, accident)" },
    { title: "Partner handover", description: "Warm handover to the partner insurer for full quote, binding, and claims" },
  ],
  quickActions: ["Available products", "Talk to insurer", "Bundle benefits"],
  flow: {
    knowledgeSources: [
      { id: "big-kb-bundles", name: "Bundle Catalogue", type: "database", icon: "database-connection", description: "Insurance products offered as bank bundles and their partner insurers" },
    ],
    guardrails: [
      { id: "big-gr-no-advice", name: "No Insurance Advice", type: "compliance", icon: "shield-medal", description: "Blocks personalised insurance advice — routes to licensed partner insurer" },
    ],
    actionHooks: [
      { id: "big-ah-transfer-insurer", name: "Transfer to Insurer", type: "transfer", icon: "headset", description: "Warm handover to the partner insurer's licensed agent" },
    ],
    standardResponses: [
      { id: "big-sr-options-shared", name: "Options Shared", type: "confirmation", icon: "check-symbol-check", description: "Returns available bundle options with next steps" },
    ],
    processes: [],
  },
  tier: "light",
  // Bundled / comprehensive insurance offered to retail customers and wealth clients.
  variants: ["banking:retail", "banking:private"],
};

export default agent;

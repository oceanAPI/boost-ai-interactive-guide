import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_auto_insurance",
  name: "Auto insurance",
  icon: "umbrella",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "Bundle insurance with my car loan",
  description: "Auto-insurance cross-sell bundled at car-loan origination — indicative quote and warm handover to the partner insurer.",
  capabilities: [
    { title: "Bundle quote", description: "Generates an indicative auto-insurance quote attached to the car-loan application" },
    { title: "Insurer handover", description: "Warm handover to the partner insurer for full underwriting, binding, and claims" },
  ],
  quickActions: ["Bundled quote", "Talk to insurer", "Coverage options"],
  flow: {
    knowledgeSources: [
      { id: "bai-kb-bundle", name: "Auto Bundle Catalogue", type: "database", icon: "database-connection", description: "Available auto-insurance bundle offers and partner insurers" },
    ],
    guardrails: [
      { id: "bai-gr-no-advice", name: "No Insurance Advice", type: "compliance", icon: "shield-medal", description: "Blocks personalised insurance advice — routes to licensed partner insurer" },
    ],
    actionHooks: [
      { id: "bai-ah-transfer-insurer", name: "Transfer to Insurer", type: "transfer", icon: "headset", description: "Warm handover to the partner insurer's licensed agent" },
    ],
    standardResponses: [
      { id: "bai-sr-quoted", name: "Bundle Quote", type: "confirmation", icon: "check-symbol-check", description: "Returns indicative quote with handover link for full policy" },
    ],
    processes: [],
  },
  tier: "light",
  // Bundled consumer insurance is a retail-only play.
  variants: ["banking:retail"],
};

export default agent;

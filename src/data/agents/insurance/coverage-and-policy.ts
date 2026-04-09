import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "coverage",
  name: "Coverage & Policy",
  icon: "hand-protection",
  automationRate: 79,
  description: "Coverage explanations, policy documents, endorsement requests, renewals, recommendations.",
  capabilities: [
    { title: "Coverage explanations", description: "Break down policy coverage in plain language tailored to the customer" },
    { title: "Policy document delivery", description: "Instant access to ID cards, declarations pages, and policy documents" },
    { title: "Endorsement requests", description: "Process policy modifications and endorsement additions" },
    { title: "Renewal management", description: "Handle renewal quotes, comparisons, and acceptance workflows" },
    { title: "Coverage gap analysis", description: "Identify potential coverage gaps and recommend appropriate additions" },
    { title: "Policy cancellation", description: "Process cancellation requests with retention-aware workflows" },
  ],
  quickActions: ["What does my policy cover", "Get my ID card", "Add endorsement", "Cancel policy", "Renewal quote", "Coverage gaps"],
  flow: {
    knowledgeSources: [
      { id: "icp-kb-coverage-faq", name: "Coverage FAQ", type: "faq", icon: "books", description: "Policy coverage explanations and common questions" },
      { id: "icp-kb-policy-api", name: "Policy Management API", type: "api", icon: "computer-api", description: "Real-time policy details, documents, and endorsement processing" },
    ],
    guardrails: [
      { id: "icp-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate coverage or policy information" },
    ],
    actionHooks: [
      { id: "icp-ah-transfer", name: "Transfer to Agent", type: "transfer", icon: "headset", description: "Routes to a licensed agent for complex policy changes" },
    ],
    processes: [
      { id: "icp-pr-endorsement", name: "Endorsement Processing", type: "workflow", icon: "hierarchy", description: "Processes policy endorsements and modifications" },
      { id: "icp-pr-renewal", name: "Renewal Processing", type: "workflow", icon: "cogs", description: "Generates and processes policy renewal quotes" },
    ],
    standardResponses: [
      { id: "icp-sr-confirmed", name: "Change Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms policy change has been applied" },
    ],
  },
};

export default agent;

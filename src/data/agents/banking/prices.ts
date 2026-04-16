import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_prices",
  name: "Prices",
  icon: "bar-chart",
  automationRate: 80,
  avgResolutionTime: "~1.5 min",
  topTopic: "What are your mortgage rates?",
  description: "Product pricing, fee schedules, current rates, and tariff queries across the bank's retail and business products.",
  capabilities: [
    { title: "Current rates", description: "Up-to-date savings, lending, and card rates by product and tier" },
    { title: "Fee schedule lookup", description: "Detailed fee breakdown per product including transaction, service, and FX fees" },
    { title: "Comparison explainer", description: "Side-by-side pricing comparison between two of the bank's products" },
    { title: "Tariff change notifications", description: "Explains upcoming rate or fee changes and their effective dates" },
  ],
  quickActions: ["Savings rates", "Mortgage rates", "FX fees", "Card fees", "Compare products"],
  flow: {
    knowledgeSources: [
      { id: "bpr-kb-tariffs", name: "Tariff Catalogue", type: "database", icon: "database-connection", description: "Live product pricing and fee schedule" },
      { id: "bpr-kb-rate-engine", name: "Rate Engine", type: "api", icon: "computer-api", description: "Real-time rate quotes for savings, lending, FX" },
    ],
    guardrails: [
      { id: "bpr-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents invented rates or fees by grounding answers in the tariff catalogue" },
    ],
    actionHooks: [
      { id: "bpr-ah-send-tariff", name: "Email Tariff PDF", type: "email", icon: "phone", description: "Sends the customer the official tariff PDF for record-keeping" },
    ],
    processes: [
      { id: "bpr-pr-comparison", name: "Product Comparison", type: "workflow", icon: "cogs", description: "Builds a side-by-side pricing comparison from the tariff catalogue" },
    ],
    standardResponses: [
      { id: "bpr-sr-rate-given", name: "Rate Provided", type: "confirmation", icon: "check-symbol-check", description: "Returns current rate with validity window and any conditions" },
    ],
  },
  tier: "addon",
};

export default agent;

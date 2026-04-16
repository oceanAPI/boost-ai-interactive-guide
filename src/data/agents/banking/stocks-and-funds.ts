import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_stocks_funds",
  name: "Stocks and funds",
  icon: "bar-chart",
  automationRate: 77,
  avgResolutionTime: "~2.5 min",
  topTopic: "My portfolio performance",
  description: "Investment products offered alongside banking — portfolio overview, fund selection, basic trading, and advisor handover for complex needs.",
  capabilities: [
    { title: "Portfolio overview", description: "Positions, allocation, and performance across holdings in the bank's brokerage" },
    { title: "Fund selection guidance", description: "Information on available funds, categories, and fees (non-advice)" },
    { title: "Basic trading", description: "Place, modify, or cancel simple equity and fund orders" },
    { title: "Advisor handover", description: "Warm handover to a licensed investment advisor for complex or high-value needs" },
  ],
  quickActions: ["My portfolio", "Browse funds", "Place an order", "Fund fees", "Talk to advisor"],
  flow: {
    knowledgeSources: [
      { id: "bsf-kb-invest-faq", name: "Investments FAQ", type: "faq", icon: "books", description: "Product terms, fees, tax treatment, trading hours" },
      { id: "bsf-kb-brokerage-api", name: "Brokerage API", type: "api", icon: "computer-api", description: "Positions, orders, performance, corporate actions" },
    ],
    guardrails: [
      { id: "bsf-gr-no-advice", name: "No Investment Advice", type: "compliance", icon: "shield-medal", description: "Blocks personalised recommendations — routes to licensed advisor instead" },
      { id: "bsf-gr-suitability", name: "Suitability Check", type: "compliance", icon: "lock-security", description: "Enforces suitability flags before executing complex orders" },
    ],
    actionHooks: [
      { id: "bsf-ah-place-order", name: "Place Order", type: "webhook", icon: "target-selection", description: "Routes a validated order to the brokerage execution system" },
      { id: "bsf-ah-transfer-advisor", name: "Transfer to Advisor", type: "transfer", icon: "headset", description: "Warm handover to licensed investment advisor" },
    ],
    processes: [
      { id: "bsf-pr-order-validation", name: "Order Validation", type: "workflow", icon: "cogs", description: "Validates order against account balance, buying power, and suitability" },
    ],
    standardResponses: [
      { id: "bsf-sr-order-placed", name: "Order Placed", type: "confirmation", icon: "thumbs-up", description: "Confirms order with execution details or pending-status" },
    ],
  },
  tier: "addon",
  // Investment products — private wealth core; retail for mass-market investing.
  variants: ["banking:private", "banking:retail"],
};

export default agent;

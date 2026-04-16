import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_trading",
  name: "Trading & Equities",
  icon: "graph-bar",
  automationRate: 75,
  avgResolutionTime: "~2.5 min",
  topTopic: "Place an order",
  description: "Buy and sell equities, order status tracking, settlement timelines, corporate actions, and dividend information.",
  capabilities: [
    { title: "Order placement", description: "Market, limit, and stop orders for listed equities and ETFs" },
    { title: "Order status", description: "Real-time tracking of open, partially filled, and completed orders" },
    { title: "Settlement tracking", description: "T+1 / T+2 settlement dates, pending settlements, and failed trades" },
    { title: "Corporate actions", description: "Stock splits, mergers, tender offers, and rights issues affecting holdings" },
    { title: "Dividend information", description: "Upcoming ex-dates, payment dates, yield, and reinvestment options" },
    { title: "Trade confirmations", description: "Downloadable confirmations and execution reports for completed trades" },
  ],
  quickActions: ["Place an order", "Order status", "Settlement dates", "Corporate actions", "Dividends", "Trade confirmations"],
  flow: {
    knowledgeSources: [
      { id: "te-kb-trading-faq", name: "Trading FAQ", type: "faq", icon: "books", description: "Order types, settlement rules, trading hours, and fee schedules" },
      { id: "te-kb-oms-api", name: "Order Management API", type: "api", icon: "computer-api", description: "Real-time order routing, status, and execution data" },
      { id: "te-kb-corp-actions", name: "Corporate Actions Feed", type: "database", icon: "database-connection", description: "Upcoming and historical corporate actions for held securities" },
    ],
    guardrails: [
      { id: "te-gr-suitability", name: "Suitability Check", type: "compliance", icon: "shield-medal", description: "Validates order against client risk profile and suitability rules" },
      { id: "te-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised buy/sell recommendations — routes to advisor" },
    ],
    actionHooks: [
      { id: "te-ah-confirmation", name: "Send Trade Confirmation", type: "email", icon: "phone", description: "Emails trade confirmation PDF after execution" },
      { id: "te-ah-advisor", name: "Transfer to Trading Desk", type: "transfer", icon: "headset", description: "Warm handover to trading desk for complex or large orders" },
    ],
    processes: [
      { id: "te-pr-order-flow", name: "Order Execution Workflow", type: "workflow", icon: "hierarchy", description: "Routes order through compliance, best-execution, and settlement" },
      { id: "te-pr-dividend-reinvest", name: "Dividend Reinvestment", type: "workflow", icon: "cogs", description: "Automates DRIP enrolment and reinvestment of cash dividends" },
    ],
    standardResponses: [
      { id: "te-sr-order-status", name: "Order Status Update", type: "confirmation", icon: "thumbs-up", description: "Returns current state of an order with fill details" },
      { id: "te-sr-settlement", name: "Settlement Timeline", type: "confirmation", icon: "check-symbol-check", description: "Confirms expected settlement date and any outstanding requirements" },
    ],
  },
  tier: "primary",
};

export default agent;

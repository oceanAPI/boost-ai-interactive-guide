import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_investments",
  name: "Investments & Crypto",
  icon: "graph-bar",
  automationRate: 80,
  avgResolutionTime: "~2 min",
  topTopic: "Buy a stock",
  description: "Fractional stocks, ETFs, and crypto trading — portfolio overview, buy/sell flows, order status, and market information with strict no-advice guardrails.",
  capabilities: [
    { title: "Fractional stocks", description: "Buy and sell fractional shares of listed equities from the app" },
    { title: "ETF investing", description: "Browse, compare, and invest in exchange-traded funds" },
    { title: "Crypto buy & sell", description: "Purchase and sell supported cryptocurrencies with real-time pricing" },
    { title: "Portfolio overview", description: "Aggregated view of holdings, performance, and allocation breakdown" },
    { title: "Order management", description: "Pending, executed, and cancelled order history with status tracking" },
    { title: "Market information", description: "Live prices, charts, and basic instrument details for supported assets" },
  ],
  quickActions: ["Buy a stock", "Sell holdings", "Portfolio view", "Crypto prices", "Order status", "ETF explorer"],
  flow: {
    knowledgeSources: [
      { id: "ft-inv-kb-faq", name: "Investments FAQ", type: "faq", icon: "books", description: "Supported instruments, trading hours, fees, tax wrappers" },
      { id: "ft-inv-kb-market-api", name: "Market Data API", type: "api", icon: "computer-api", description: "Live prices, historical charts, instrument metadata" },
      { id: "ft-inv-kb-portfolio-db", name: "Portfolio Database", type: "database", icon: "database-connection", description: "User holdings, cost basis, realised/unrealised P&L" },
    ],
    guardrails: [
      { id: "ft-inv-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated prices, returns, or portfolio values" },
      { id: "ft-inv-gr-suitability", name: "Suitability Guardrail", type: "compliance", icon: "shield-medal", description: "Ensures appropriateness checks before high-risk instrument trades" },
      { id: "ft-inv-gr-no-advice", name: "No-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks buy/sell recommendations — provides factual data only, never investment advice" },
    ],
    actionHooks: [
      { id: "ft-inv-ah-buy", name: "Place Buy Order", type: "webhook", icon: "target-selection", description: "Submits a market or limit buy order for the selected instrument" },
      { id: "ft-inv-ah-sell", name: "Place Sell Order", type: "webhook", icon: "target-selection", description: "Submits a sell order for an existing holding" },
      { id: "ft-inv-ah-escalate", name: "Transfer to Investment Support", type: "transfer", icon: "headset", description: "Handover for corporate actions, failed orders, or complex queries" },
    ],
    processes: [
      { id: "ft-inv-pr-trade-flow", name: "Trade Execution Flow", type: "workflow", icon: "hierarchy", description: "Orchestrates suitability check, order validation, execution, and confirmation" },
      { id: "ft-inv-pr-rebalance", name: "Portfolio Summary", type: "workflow", icon: "cogs", description: "Aggregates holdings across stocks, ETFs, and crypto into a single view" },
    ],
    standardResponses: [
      { id: "ft-inv-sr-order-placed", name: "Order Confirmation", type: "confirmation", icon: "thumbs-up", description: "Confirms order submitted with instrument, quantity, price, and estimated settlement" },
      { id: "ft-inv-sr-portfolio", name: "Portfolio Summary", type: "confirmation", icon: "check-symbol-check", description: "Returns holdings breakdown with current values and overall performance" },
    ],
  },
  tier: "primary",
};

export default agent;

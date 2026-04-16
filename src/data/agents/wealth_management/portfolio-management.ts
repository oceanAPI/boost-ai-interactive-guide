import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_portfolio",
  name: "Portfolio Management",
  icon: "graph-bar",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "My portfolio performance",
  description: "Holdings overview, asset allocation, performance tracking, rebalancing alerts, and drift analysis against target allocation.",
  capabilities: [
    { title: "Holdings overview", description: "Full list of current positions with real-time valuations" },
    { title: "Asset allocation", description: "Breakdown by asset class, geography, and sector with target vs actual" },
    { title: "Performance tracking", description: "Time-weighted and money-weighted returns across configurable periods" },
    { title: "Drift analysis", description: "Detects when allocation drifts beyond tolerance bands vs target model" },
    { title: "Rebalancing proposals", description: "Generates trade suggestions to bring portfolio back to target weights" },
    { title: "Benchmark comparison", description: "Compares portfolio returns against selected benchmark indices" },
  ],
  quickActions: ["My holdings", "Asset allocation", "Performance YTD", "Drift alert", "Rebalance now", "Compare to benchmark"],
  flow: {
    knowledgeSources: [
      { id: "pm-kb-portfolio-faq", name: "Portfolio FAQ", type: "faq", icon: "books", description: "Common questions on allocation, drift, and rebalancing rules" },
      { id: "pm-kb-holdings-api", name: "Holdings API", type: "api", icon: "computer-api", description: "Real-time positions, valuations, and P&L from custody system" },
      { id: "pm-kb-benchmark-db", name: "Benchmark Database", type: "database", icon: "database-connection", description: "Index returns and benchmark composition for comparison" },
    ],
    guardrails: [
      { id: "pm-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated portfolio values or performance figures" },
      { id: "pm-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised investment advice — routes to licensed advisor" },
    ],
    actionHooks: [
      { id: "pm-ah-report", name: "Send Portfolio Report", type: "email", icon: "phone", description: "Emails a portfolio summary PDF to the client" },
      { id: "pm-ah-advisor", name: "Transfer to Portfolio Advisor", type: "transfer", icon: "headset", description: "Warm handover to portfolio manager for rebalancing discussion" },
    ],
    processes: [
      { id: "pm-pr-rebalance", name: "Rebalancing Workflow", type: "workflow", icon: "hierarchy", description: "Orchestrates proposed rebalancing trades through compliance and execution" },
      { id: "pm-pr-drift-monitor", name: "Drift Monitoring", type: "workflow", icon: "cogs", description: "Continuous monitoring of allocation drift with automated alerts" },
    ],
    standardResponses: [
      { id: "pm-sr-summary", name: "Portfolio Summary", type: "confirmation", icon: "thumbs-up", description: "Returns current portfolio value, top holdings, and daily change" },
      { id: "pm-sr-allocation", name: "Allocation Breakdown", type: "confirmation", icon: "check-symbol-check", description: "Presents target vs actual allocation with drift percentage" },
    ],
  },
  tier: "primary",
};

export default agent;

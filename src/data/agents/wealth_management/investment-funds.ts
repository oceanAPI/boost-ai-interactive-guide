import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_funds",
  name: "Investment Funds",
  icon: "bar-chart",
  automationRate: 79,
  avgResolutionTime: "~3 min",
  topTopic: "Switch my fund allocation",
  description: "Mutual funds, ETFs, fund switches, risk profiling, fund factsheets, and performance comparison across fund families.",
  capabilities: [
    { title: "Fund overview", description: "Holdings, NAV, expense ratio, and factsheet for any available fund" },
    { title: "Fund switches", description: "Switch between funds within the same wrapper, with cost and tax impact preview" },
    { title: "Risk profiling", description: "Questionnaire-driven risk assessment mapped to suitable fund ranges" },
    { title: "Performance comparison", description: "Side-by-side fund returns, volatility, and Sharpe ratio comparison" },
    { title: "ETF & index tracking", description: "Tracking error, premium/discount, and liquidity metrics for ETFs" },
    { title: "Income & distributions", description: "Distribution history, yield, and reinvestment or cash-out preferences" },
  ],
  quickActions: ["Switch funds", "Fund factsheet", "Risk profile", "Compare funds", "ETF details", "Distributions"],
  flow: {
    knowledgeSources: [
      { id: "if-kb-fund-faq", name: "Fund FAQ", type: "faq", icon: "books", description: "Fund types, switching rules, fees, and tax implications" },
      { id: "if-kb-fund-api", name: "Fund Data API", type: "api", icon: "computer-api", description: "Real-time NAV, holdings, performance, and factsheet data" },
      { id: "if-kb-risk-engine", name: "Risk Profile Engine", type: "database", icon: "database-connection", description: "Client risk scores mapped to suitable fund ranges and asset mixes" },
    ],
    guardrails: [
      { id: "if-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated fund returns or NAV figures" },
      { id: "if-gr-cooling-off", name: "Cooling-off Period", type: "compliance", icon: "shield-medal", description: "Enforces mandatory cooling-off period before fund switch execution" },
    ],
    actionHooks: [
      { id: "if-ah-switch", name: "Execute Fund Switch", type: "webhook", icon: "target-selection", description: "Submits fund switch instruction to the transfer agent" },
      { id: "if-ah-advisor", name: "Transfer to Fund Specialist", type: "transfer", icon: "headset", description: "Warm handover to fund specialist for complex allocation changes" },
    ],
    processes: [
      { id: "if-pr-switch-flow", name: "Fund Switch Workflow", type: "workflow", icon: "hierarchy", description: "Orchestrates switch from risk check through execution and confirmation" },
      { id: "if-pr-risk-assessment", name: "Risk Assessment Flow", type: "workflow", icon: "cogs", description: "Guides client through risk questionnaire and maps to fund recommendations" },
    ],
    standardResponses: [
      { id: "if-sr-factsheet", name: "Fund Factsheet Summary", type: "confirmation", icon: "thumbs-up", description: "Returns key fund metrics including NAV, expense ratio, and top holdings" },
      { id: "if-sr-switch-confirm", name: "Switch Confirmation", type: "confirmation", icon: "check-symbol-check", description: "Confirms fund switch details, effective date, and any applicable fees" },
    ],
  },
  tier: "primary",
};

export default agent;

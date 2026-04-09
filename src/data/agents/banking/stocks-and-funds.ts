import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_stocks_funds",
  name: "Stocks and funds",
  icon: "bar-chart",
  automationRate: 77,
  description: "Investment products, stock trading, and fund management.",
  capabilities: [],
  quickActions: [],
  flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
};

export default agent;

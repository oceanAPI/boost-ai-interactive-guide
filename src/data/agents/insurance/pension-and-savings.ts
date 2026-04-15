import type { SpecialistAgent } from "../_types";

/**
 * Covers the life/pension/savings side of a composite insurer (e.g. Folksam Liv).
 * Sits in "self-service channels" with strong guardrails around financial advice.
 */
const agent: SpecialistAgent = {
  key: "pension_savings",
  name: "Pension & Savings",
  icon: "chart-growth",
  automationRate: 68,
  avgResolutionTime: "~3 min",
  topTopic: "My pension balance",
  description: "Occupational & private pension, fund savings, capital insurance, beneficiary changes, retirement planning entry-point.",
  capabilities: [
    { title: "Pension balance & forecast", description: "Shows current balance, contributions, and retirement forecast" },
    { title: "Fund switches", description: "Guides customers through changing fund allocation inside their plan" },
    { title: "Beneficiary management", description: "Handles beneficiary additions, removals, and percentage changes with identity verification" },
    { title: "Contribution changes", description: "Processes one-off top-ups and recurring contribution adjustments" },
    { title: "Retirement planning triage", description: "Identifies customers approaching retirement and routes to licensed advisor" },
    { title: "Tax & withdrawal info", description: "Explains tax treatment and withdrawal rules without giving advice" },
  ],
  quickActions: ["My pension balance", "Change funds", "Update beneficiary", "Add contribution", "Retirement planning", "Tax questions"],
  flow: {
    knowledgeSources: [
      { id: "ips-kb-pension-faq", name: "Pension FAQ", type: "faq", icon: "books", description: "Plan types, contribution rules, tax treatment, withdrawal conditions" },
      { id: "ips-kb-pension-api", name: "Pension Administration API", type: "api", icon: "computer-api", description: "Real-time balance, fund positions, and contribution history" },
      { id: "ips-kb-fund-catalog", name: "Fund Catalog", type: "database", icon: "database-connection", description: "Available funds, fees, performance, risk profile" },
    ],
    guardrails: [
      { id: "ips-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated balances, returns, or tax figures" },
      { id: "ips-gr-advice-guard", name: "Investment-Advice Guard", type: "compliance", icon: "lock-security", description: "Blocks any personalised investment advice and routes to licensed advisor" },
      { id: "ips-gr-identity", name: "Strong Identity Verification", type: "compliance", icon: "lock-security", description: "Requires BankID/strong-auth before revealing balances or making changes" },
    ],
    actionHooks: [
      { id: "ips-ah-advisor-booking", name: "Book Advisor Meeting", type: "webhook", icon: "headset", description: "Schedules a meeting with a licensed pension advisor" },
      { id: "ips-ah-fund-switch", name: "Execute Fund Switch", type: "webhook", icon: "target-selection", description: "Submits fund allocation change into admin platform" },
      { id: "ips-ah-transfer-advisor", name: "Transfer to Advisor", type: "transfer", icon: "headset", description: "Warm handover to licensed retirement advisor" },
    ],
    processes: [
      { id: "ips-pr-beneficiary", name: "Beneficiary Change", type: "workflow", icon: "hierarchy", description: "Multi-step identity-verified beneficiary update" },
      { id: "ips-pr-fund-switch", name: "Fund Switch", type: "workflow", icon: "cogs", description: "Validates and executes fund reallocation within plan rules" },
    ],
    standardResponses: [
      { id: "ips-sr-change-confirmed", name: "Change Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms pension change with reference and effective date" },
      { id: "ips-sr-needs-advisor", name: "Needs Licensed Advisor", type: "request", icon: "route", description: "Explains why the query requires a licensed human advisor" },
    ],
  },
};

export default agent;

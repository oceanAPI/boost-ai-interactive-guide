import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_accounts",
  name: "Accounts & Deposits",
  icon: "wallet",
  automationRate: 87,
  avgResolutionTime: "~1.5 min",
  topTopic: "My account balance",
  description: "Checking and savings accounts, certificates of deposit (CDs), IRAs, money market accounts — balances, rates, and account management.",
  capabilities: [
    { title: "Balance & transactions", description: "Real-time balance, recent transactions, and statement history" },
    { title: "Savings & money market", description: "Share savings rates, money market tiers, and dividend information" },
    { title: "Certificates of deposit", description: "CD terms, rates, maturity dates, early-withdrawal penalties, and renewal options" },
    { title: "IRA accounts", description: "Traditional and Roth IRA balances, contribution limits, and required distributions" },
    { title: "Account opening", description: "Open new checking, savings, CD, or money market accounts online" },
    { title: "Direct deposit & ACH", description: "Set up direct deposit, recurring transfers, and ACH routing information" },
  ],
  quickActions: ["My balance", "Savings rates", "Open CD", "IRA details", "New account", "Direct deposit"],
  flow: {
    knowledgeSources: [
      { id: "cu-ad-kb-faq", name: "Accounts FAQ", type: "faq", icon: "books", description: "Account types, rate tiers, fees, and deposit insurance coverage" },
      { id: "cu-ad-kb-balance-api", name: "Account Balance API", type: "api", icon: "computer-api", description: "Real-time balances, transaction history, and pending items" },
      { id: "cu-ad-kb-rates", name: "Rate & Product DB", type: "database", icon: "database-connection", description: "Current dividend rates, CD terms, and money market tier thresholds" },
    ],
    guardrails: [
      { id: "cu-ad-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated balance or rate figures" },
      { id: "cu-ad-gr-compliance", name: "Reg D & Disclosure", type: "compliance", icon: "shield-medal", description: "Ensures savings transaction limits and required disclosures" },
    ],
    actionHooks: [
      { id: "cu-ad-ah-statement", name: "Send eStatement", type: "email", icon: "phone", description: "Emails a PDF statement for the selected account and period" },
      { id: "cu-ad-ah-open", name: "Open New Account", type: "webhook", icon: "target-selection", description: "Initiates the online account-opening workflow" },
      { id: "cu-ad-ah-transfer", name: "Transfer to Account Specialist", type: "transfer", icon: "headset", description: "Warm handover for complex account questions" },
    ],
    processes: [
      { id: "cu-ad-pr-cd-renewal", name: "CD Maturity & Renewal", type: "workflow", icon: "hierarchy", description: "Notifies members of upcoming CD maturities and handles renewal or payout" },
      { id: "cu-ad-pr-aggregation", name: "Multi-Account Overview", type: "workflow", icon: "cogs", description: "Aggregates balances across all member accounts into a single view" },
    ],
    standardResponses: [
      { id: "cu-ad-sr-balance", name: "Balance Confirmation", type: "confirmation", icon: "thumbs-up", description: "Returns current balance with available and pending amounts" },
      { id: "cu-ad-sr-rates", name: "Rate Summary", type: "confirmation", icon: "check-symbol-check", description: "Presents current rates for savings, CDs, and money market products" },
    ],
  },
  tier: "primary",
};

export default agent;

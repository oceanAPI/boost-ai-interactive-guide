import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_credit_cards",
  name: "Credit cards",
  icon: "banknote",
  automationRate: 83,
  avgResolutionTime: "~2 min",
  topTopic: "What's my available credit?",
  description: "Credit card applications, balance and credit-limit management, rewards redemption, interest queries, and balance transfers.",
  capabilities: [
    { title: "Card application", description: "Guides customers through new-card applications with instant credit decisions" },
    { title: "Credit limit management", description: "Processes credit-limit increase or decrease requests with risk checks" },
    { title: "Rewards & points", description: "Balance, redemption options, and statement-credit redemptions" },
    { title: "Balance transfers", description: "Initiates and tracks 0% balance-transfer offers" },
    { title: "Interest & fees explainer", description: "Breaks down APR, cash-advance fees, foreign-transaction fees" },
    { title: "Minimum payment & statements", description: "Statement retrieval, minimum-payment calculation, autopay setup" },
  ],
  quickActions: ["Apply for card", "Credit limit", "Rewards balance", "Balance transfer", "Explain APR", "My statement"],
  flow: {
    knowledgeSources: [
      { id: "bcc-kb-cc-faq", name: "Credit Card FAQ", type: "faq", icon: "books", description: "Product terms, rewards rules, fee schedule, eligibility" },
      { id: "bcc-kb-cc-api", name: "Card API", type: "api", icon: "computer-api", description: "Balance, available credit, transactions, rewards balance" },
      { id: "bcc-kb-rewards", name: "Rewards Catalogue", type: "database", icon: "database-connection", description: "Available rewards and redemption partner catalogue" },
    ],
    guardrails: [
      { id: "bcc-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect APR, fee, or rewards-rate claims" },
      { id: "bcc-gr-credit-policy", name: "Credit Policy", type: "compliance", icon: "lock-security", description: "Enforces affordability and responsible-lending rules on limit changes" },
    ],
    actionHooks: [
      { id: "bcc-ah-limit-change", name: "Submit Limit Change", type: "webhook", icon: "target-selection", description: "Routes credit-limit change request through risk decisioning" },
      { id: "bcc-ah-balance-transfer", name: "Initiate Balance Transfer", type: "webhook", icon: "cogs", description: "Starts balance-transfer workflow with destination account details" },
      { id: "bcc-ah-redeem", name: "Redeem Rewards", type: "webhook", icon: "thumbs-up", description: "Executes rewards redemption (statement credit, gift card, travel)" },
    ],
    processes: [
      { id: "bcc-pr-application", name: "Card Application", type: "workflow", icon: "hierarchy", description: "Orchestrates KYC, credit check, instant decisioning" },
      { id: "bcc-pr-limit-review", name: "Limit Review", type: "workflow", icon: "cogs", description: "Applies risk models to credit-limit change requests" },
    ],
    standardResponses: [
      { id: "bcc-sr-approved", name: "Approved", type: "confirmation", icon: "thumbs-up", description: "Confirms approval with limit, APR, and card-shipping details" },
      { id: "bcc-sr-redeemed", name: "Rewards Redeemed", type: "confirmation", icon: "check-symbol-check", description: "Confirms redemption with fulfilment timeline" },
    ],
  },
  tier: "primary",
  // Consumer product — corporate banking typically uses commercial/purchasing cards instead.
  variants: ["banking:retail", "banking:private", "banking:neobank"],
};

export default agent;

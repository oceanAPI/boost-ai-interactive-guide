import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_bnpl",
  name: "BNPL & Credit",
  icon: "calendar-clock",
  automationRate: 83,
  avgResolutionTime: "~2 min",
  topTopic: "My instalment plan",
  description: "Buy-now-pay-later splits, instalment plans, missed payment resolution, credit limit decisions, and repayment schedule management.",
  capabilities: [
    { title: "Instalment plans", description: "View active pay-later splits with amounts, dates, and remaining instalments" },
    { title: "Payment schedule", description: "Upcoming due dates, auto-pay status, and early repayment options" },
    { title: "Missed payments", description: "Late payment investigation, fee explanation, and repayment arrangement" },
    { title: "Credit decisions", description: "Eligibility checks, approval status, and declined-application reasons" },
    { title: "Spending power", description: "Available credit limit, utilisation, and limit-increase requests" },
    { title: "Merchant disputes", description: "Return and refund handling for BNPL-funded purchases" },
  ],
  quickActions: ["My instalment plan", "Payment schedule", "Missed payment", "Credit limit", "Early repayment", "Dispute a charge"],
  flow: {
    knowledgeSources: [
      { id: "ft-bnpl-kb-faq", name: "BNPL & Credit FAQ", type: "faq", icon: "books", description: "Plan types, fee structures, eligibility criteria, late-payment policies" },
      { id: "ft-bnpl-kb-plan-api", name: "Instalment Plan API", type: "api", icon: "computer-api", description: "Active plans, payment history, next due dates, outstanding balances" },
      { id: "ft-bnpl-kb-credit-db", name: "Credit Decision Database", type: "database", icon: "database-connection", description: "Approval records, decline reasons, credit-limit history" },
    ],
    guardrails: [
      { id: "ft-bnpl-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated balances, due dates, or credit decisions" },
      { id: "ft-bnpl-gr-vulnerability", name: "Vulnerability Detection", type: "compliance", icon: "shield-medal", description: "Identifies signs of financial difficulty and routes to hardship support" },
    ],
    actionHooks: [
      { id: "ft-bnpl-ah-early-repay", name: "Early Repayment", type: "webhook", icon: "target-selection", description: "Processes early settlement of remaining instalments" },
      { id: "ft-bnpl-ah-arrangement", name: "Set Up Payment Arrangement", type: "webhook", icon: "target-selection", description: "Creates a revised payment schedule for customers in difficulty" },
      { id: "ft-bnpl-ah-escalate", name: "Transfer to Credit Team", type: "transfer", icon: "headset", description: "Handover for complex disputes, hardship cases, or declined appeals" },
    ],
    processes: [
      { id: "ft-bnpl-pr-missed-pay", name: "Missed Payment Resolution", type: "workflow", icon: "hierarchy", description: "Orchestrates late-fee review, notification, and repayment-plan creation" },
      { id: "ft-bnpl-pr-dispute", name: "Merchant Dispute Flow", type: "workflow", icon: "cogs", description: "Handles return/refund claims for BNPL-funded purchases with merchant" },
    ],
    standardResponses: [
      { id: "ft-bnpl-sr-plan-summary", name: "Instalment Plan Summary", type: "confirmation", icon: "thumbs-up", description: "Returns active plan details with remaining amount and next payment date" },
      { id: "ft-bnpl-sr-decision", name: "Credit Decision Explained", type: "confirmation", icon: "check-symbol-check", description: "Explains approval or decline with contributing factors and next steps" },
    ],
  },
  tier: "primary",
};

export default agent;

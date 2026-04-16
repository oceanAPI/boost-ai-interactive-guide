import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_consumer_loans",
  name: "Consumer loans",
  icon: "balance",
  automationRate: 79,
  avgResolutionTime: "~3 min",
  topTopic: "Can I borrow for a home renovation?",
  description: "Unsecured personal loans, debt consolidation, line-of-credit products, eligibility checks, and payment management.",
  capabilities: [
    { title: "Loan eligibility check", description: "Indicative eligibility based on stated income, employment, and credit tier" },
    { title: "Rate & term quotes", description: "Indicative APR and repayment schedule across common amounts and terms" },
    { title: "Debt consolidation", description: "Models consolidation of multiple existing debts into one affordable monthly payment" },
    { title: "Application status", description: "Real-time application tracking from submission through disbursement" },
    { title: "Payment schedule changes", description: "Handles payment-date shifts, hardship deferrals, and early-settlement quotes" },
    { title: "Responsible-lending triage", description: "Identifies vulnerable customers and routes to human affordability specialist" },
  ],
  quickActions: ["Check eligibility", "Personal loan quote", "Consolidate debt", "My loan status", "Change payment", "Settle early"],
  flow: {
    knowledgeSources: [
      { id: "bcn-kb-loan-faq", name: "Loan FAQ", type: "faq", icon: "books", description: "Product terms, eligibility, affordability criteria" },
      { id: "bcn-kb-rate-engine", name: "Rate Engine", type: "api", icon: "computer-api", description: "Indicative APR by amount, term, and credit tier" },
      { id: "bcn-kb-loan-api", name: "Loan API", type: "api", icon: "computer-api", description: "Application status, balance, schedule" },
    ],
    guardrails: [
      { id: "bcn-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents invented rates, approvals, or debt advice" },
      { id: "bcn-gr-responsible", name: "Responsible Lending", type: "compliance", icon: "lock-security", description: "Enforces affordability checks and vulnerable-customer routing" },
      { id: "bcn-gr-no-advice", name: "No Financial Advice", type: "compliance", icon: "shield-medal", description: "Blocks any recommendation — provides only product information and quotes" },
    ],
    actionHooks: [
      { id: "bcn-ah-soft-pull", name: "Soft Credit Pull", type: "webhook", icon: "target-selection", description: "Runs soft credit check for indicative quote" },
      { id: "bcn-ah-transfer-specialist", name: "Transfer to Loan Specialist", type: "transfer", icon: "headset", description: "Warm handover for complex cases or formal application" },
      { id: "bcn-ah-send-quote", name: "Send Quote", type: "email", icon: "phone", description: "Emails quote summary with terms and next steps" },
    ],
    processes: [
      { id: "bcn-pr-affordability", name: "Affordability Check", type: "workflow", icon: "hierarchy", description: "Computes disposable income and debt-to-income ratio" },
      { id: "bcn-pr-consolidation", name: "Consolidation Modelling", type: "workflow", icon: "cogs", description: "Builds a consolidation plan with before/after totals" },
    ],
    standardResponses: [
      { id: "bcn-sr-eligible", name: "Eligible", type: "confirmation", icon: "thumbs-up", description: "Confirms indicative eligibility with quote and next steps" },
      { id: "bcn-sr-referred", name: "Referred to Specialist", type: "request", icon: "route", description: "Explains why a human affordability review is required" },
    ],
  },
  tier: "primary",
  // Personal unsecured loans — retail and neobank bread-and-butter.
  variants: ["banking:retail", "banking:neobank"],
};

export default agent;

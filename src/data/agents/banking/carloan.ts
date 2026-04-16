import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_carloan",
  name: "Carloan",
  icon: "balance",
  automationRate: 76,
  avgResolutionTime: "~3 min",
  topTopic: "What's my car-loan rate?",
  description: "Car-loan origination, rate quotes, pre-approvals, payment modifications, and early payoff for new and used vehicles.",
  capabilities: [
    { title: "Rate quotes", description: "Provides indicative interest rates based on vehicle type, term, and credit tier" },
    { title: "Pre-approval", description: "Runs soft credit check and issues a pre-approval letter for dealer negotiations" },
    { title: "Application status", description: "Real-time status lookups — under review, approved, funded, disbursed" },
    { title: "Payment modifications", description: "Handles payment deferrals, term extensions, and payment-date changes" },
    { title: "Early payoff quotes", description: "Calculates payoff amount including any prepayment penalties" },
    { title: "Refinancing inquiries", description: "Compares current loan to a refinance scenario with potential savings" },
  ],
  quickActions: ["Get a rate", "Pre-approval", "Application status", "Change payment", "Early payoff", "Refinance check"],
  flow: {
    knowledgeSources: [
      { id: "bcl-kb-loan-faq", name: "Car Loan FAQ", type: "faq", icon: "books", description: "Loan terms, eligibility, documentation requirements" },
      { id: "bcl-kb-rate-engine", name: "Rate Engine", type: "api", icon: "computer-api", description: "Real-time indicative rate calculation by vehicle, term, and tier" },
      { id: "bcl-kb-loan-api", name: "Loan Administration API", type: "api", icon: "computer-api", description: "Application status, balance, schedule, and payoff quotes" },
    ],
    guardrails: [
      { id: "bcl-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Blocks fabricated rates, amounts, or approval claims" },
      { id: "bcl-gr-credit-policy", name: "Credit Policy Compliance", type: "compliance", icon: "lock-security", description: "Enforces responsible-lending rules and affordability checks" },
    ],
    actionHooks: [
      { id: "bcl-ah-soft-pull", name: "Soft Credit Pull", type: "webhook", icon: "target-selection", description: "Triggers a soft credit check for pre-approval flow" },
      { id: "bcl-ah-transfer-specialist", name: "Transfer to Loan Specialist", type: "transfer", icon: "headset", description: "Warm handover for complex affordability or refinance cases" },
      { id: "bcl-ah-send-docs", name: "Send Documentation", type: "email", icon: "phone", description: "Emails pre-approval letter or payoff quote to the customer" },
    ],
    processes: [
      { id: "bcl-pr-app-orchestration", name: "Application Orchestration", type: "workflow", icon: "hierarchy", description: "Coordinates KYC, credit check, document collection, and decisioning" },
      { id: "bcl-pr-payoff-calc", name: "Payoff Calculation", type: "workflow", icon: "cogs", description: "Computes current payoff with accrued interest and any penalties" },
    ],
    standardResponses: [
      { id: "bcl-sr-preapproved", name: "Pre-approved", type: "confirmation", icon: "thumbs-up", description: "Confirms pre-approval with amount, rate, and validity window" },
      { id: "bcl-sr-status-update", name: "Application Status", type: "confirmation", icon: "check-symbol-check", description: "Returns current stage with next-step guidance" },
    ],
  },
  tier: "primary",
  // Retail consumer product.
  variants: ["banking:retail"],
};

export default agent;

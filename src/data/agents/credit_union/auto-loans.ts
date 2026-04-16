import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_auto_loans",
  name: "Auto Loans",
  icon: "car",
  automationRate: 78,
  avgResolutionTime: "~3 min",
  topTopic: "Car loan rate",
  description: "Vehicle financing for new and used cars — pre-approval, rate quotes, payment calculators, refinancing, and loan payoff.",
  capabilities: [
    { title: "Rate quotes", description: "Current auto loan rates by term, vehicle age, and credit tier" },
    { title: "Pre-approval", description: "Get pre-approved online before visiting the dealership" },
    { title: "Payment calculator", description: "Estimate monthly payments based on loan amount, term, and rate" },
    { title: "Refinance", description: "Refinance an existing auto loan from another lender for a lower rate" },
    { title: "Loan payoff", description: "Request payoff amount, early-payoff options, and title release details" },
    { title: "GAP & protection", description: "GAP insurance, mechanical breakdown protection, and extended warranty options" },
  ],
  quickActions: ["Auto rates", "Pre-approval", "Payment calculator", "Refinance", "Payoff amount", "GAP coverage"],
  flow: {
    knowledgeSources: [
      { id: "cu-al-kb-faq", name: "Auto Loan FAQ", type: "faq", icon: "books", description: "Rates, terms, eligibility, documentation requirements" },
      { id: "cu-al-kb-rate-api", name: "Rate Engine API", type: "api", icon: "computer-api", description: "Real-time rate quotes based on credit, term, and vehicle details" },
      { id: "cu-al-kb-loan-db", name: "Loan Servicing DB", type: "database", icon: "database-connection", description: "Existing loan balances, payment history, and payoff figures" },
    ],
    guardrails: [
      { id: "cu-al-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated rate or payoff figures" },
      { id: "cu-al-gr-lending", name: "Fair Lending Compliance", type: "compliance", icon: "shield-medal", description: "Ensures ECOA and fair-lending disclosures are provided" },
    ],
    actionHooks: [
      { id: "cu-al-ah-apply", name: "Start Loan Application", type: "webhook", icon: "target-selection", description: "Launches the online auto loan application" },
      { id: "cu-al-ah-transfer", name: "Transfer to Loan Officer", type: "transfer", icon: "headset", description: "Warm handover to a lending specialist for complex scenarios" },
      { id: "cu-al-ah-payoff-letter", name: "Send Payoff Letter", type: "email", icon: "phone", description: "Emails an official payoff statement with good-through date" },
    ],
    processes: [
      { id: "cu-al-pr-preapproval", name: "Pre-Approval Workflow", type: "workflow", icon: "hierarchy", description: "Orchestrates credit pull, rate determination, and pre-approval letter generation" },
      { id: "cu-al-pr-refi", name: "Refinance Processing", type: "workflow", icon: "cogs", description: "Handles refinance from external lender — payoff, title, and new loan booking" },
    ],
    standardResponses: [
      { id: "cu-al-sr-rate", name: "Rate Quote", type: "confirmation", icon: "thumbs-up", description: "Returns personalised rate, term options, and estimated monthly payment" },
      { id: "cu-al-sr-payoff", name: "Payoff Confirmation", type: "confirmation", icon: "check-symbol-check", description: "Provides current payoff amount with per-diem interest and good-through date" },
    ],
  },
  tier: "primary",
};

export default agent;

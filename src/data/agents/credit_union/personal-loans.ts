import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_personal_loans",
  name: "Personal Loans",
  icon: "money",
  automationRate: 79,
  avgResolutionTime: "~3 min",
  topTopic: "Can I get a personal loan?",
  description: "Unsecured personal loans, debt consolidation, and signature loans — rates, eligibility, application, and repayment options.",
  capabilities: [
    { title: "Loan eligibility", description: "Check qualification based on credit, income, and membership history" },
    { title: "Rate & payment estimate", description: "Personalised rate quote with monthly payment by term length" },
    { title: "Debt consolidation", description: "Consolidate high-interest debt into a single lower-rate credit union loan" },
    { title: "Application guidance", description: "Step-by-step walkthrough of the personal loan application process" },
    { title: "Loan payoff & early pay", description: "Current payoff amount, no-penalty early payoff, and extra-payment impact" },
    { title: "Hardship options", description: "Payment deferral, skip-a-pay, and financial hardship programs" },
  ],
  quickActions: ["Am I eligible?", "Loan rates", "Debt consolidation", "Apply now", "Payoff amount", "Hardship help"],
  flow: {
    knowledgeSources: [
      { id: "cu-pl-kb-faq", name: "Personal Loan FAQ", type: "faq", icon: "books", description: "Eligibility, rates, terms, and required documentation" },
      { id: "cu-pl-kb-rate-api", name: "Rate Engine API", type: "api", icon: "computer-api", description: "Real-time personal loan rate quotes by credit tier and term" },
      { id: "cu-pl-kb-loan-db", name: "Loan Servicing DB", type: "database", icon: "database-connection", description: "Existing loan balances, payment history, and payoff figures" },
    ],
    guardrails: [
      { id: "cu-pl-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated rate or eligibility information" },
      { id: "cu-pl-gr-lending", name: "Fair Lending Compliance", type: "compliance", icon: "shield-medal", description: "Ensures ECOA compliance and adverse-action notice requirements" },
    ],
    actionHooks: [
      { id: "cu-pl-ah-apply", name: "Start Loan Application", type: "webhook", icon: "target-selection", description: "Launches the online personal loan application" },
      { id: "cu-pl-ah-transfer", name: "Transfer to Loan Officer", type: "transfer", icon: "headset", description: "Warm handover to a lending specialist" },
      { id: "cu-pl-ah-payoff-letter", name: "Send Payoff Statement", type: "email", icon: "phone", description: "Emails an official payoff statement" },
    ],
    processes: [
      { id: "cu-pl-pr-consolidation", name: "Debt Consolidation Workflow", type: "workflow", icon: "hierarchy", description: "Calculates savings, initiates new loan, and pays off existing debts" },
      { id: "cu-pl-pr-hardship", name: "Hardship Review", type: "workflow", icon: "cogs", description: "Evaluates hardship request and offers deferral or modified payment plan" },
    ],
    standardResponses: [
      { id: "cu-pl-sr-quote", name: "Rate Quote", type: "confirmation", icon: "thumbs-up", description: "Returns personalised rate, term, and monthly payment estimate" },
      { id: "cu-pl-sr-payoff", name: "Payoff Confirmation", type: "confirmation", icon: "check-symbol-check", description: "Provides current payoff balance and per-diem interest" },
    ],
  },
  tier: "primary",
};

export default agent;

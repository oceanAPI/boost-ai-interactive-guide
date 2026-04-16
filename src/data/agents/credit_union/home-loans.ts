import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_home_loans",
  name: "Home Loans",
  icon: "home",
  automationRate: 72,
  avgResolutionTime: "~4 min",
  topTopic: "Mortgage pre-qualification",
  description: "Mortgage origination, refinancing, home equity loans, and HELOCs — rates, pre-qualification, application status, and payment management.",
  capabilities: [
    { title: "Mortgage pre-qualification", description: "Estimate how much home you can afford based on income and debts" },
    { title: "Rate & product comparison", description: "Compare fixed, adjustable, FHA, VA, and jumbo mortgage options" },
    { title: "Application status", description: "Track mortgage application progress from submission through closing" },
    { title: "Refinance analysis", description: "Break-even analysis and savings estimate for refinancing an existing mortgage" },
    { title: "Home equity & HELOC", description: "Home equity loan amounts, HELOC draw periods, and repayment terms" },
    { title: "Payment & escrow", description: "Monthly payment breakdown, escrow analysis, and extra-payment scenarios" },
  ],
  quickActions: ["Pre-qualify", "Mortgage rates", "Application status", "Refinance", "HELOC info", "Payment details"],
  flow: {
    knowledgeSources: [
      { id: "cu-hl-kb-faq", name: "Home Loan FAQ", type: "faq", icon: "books", description: "Mortgage types, documentation, closing process, and escrow" },
      { id: "cu-hl-kb-rate-api", name: "Mortgage Rate API", type: "api", icon: "computer-api", description: "Real-time mortgage rates by product type, term, and credit profile" },
      { id: "cu-hl-kb-loan-db", name: "Mortgage Servicing DB", type: "database", icon: "database-connection", description: "Existing loan balances, escrow details, and payment history" },
    ],
    guardrails: [
      { id: "cu-hl-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated rate or loan balance figures" },
      { id: "cu-hl-gr-tila", name: "TILA / RESPA Compliance", type: "compliance", icon: "shield-medal", description: "Ensures Truth-in-Lending and RESPA disclosures are provided" },
    ],
    actionHooks: [
      { id: "cu-hl-ah-apply", name: "Start Mortgage Application", type: "webhook", icon: "target-selection", description: "Launches the digital mortgage application" },
      { id: "cu-hl-ah-transfer", name: "Transfer to Mortgage Officer", type: "transfer", icon: "headset", description: "Warm handover to a licensed mortgage loan officer" },
      { id: "cu-hl-ah-prequal-letter", name: "Send Pre-Qual Letter", type: "email", icon: "phone", description: "Emails a pre-qualification letter for house shopping" },
    ],
    processes: [
      { id: "cu-hl-pr-prequal", name: "Pre-Qualification Workflow", type: "workflow", icon: "hierarchy", description: "Collects income, debt, and credit data to generate a pre-qualification estimate" },
      { id: "cu-hl-pr-refi", name: "Refinance Analysis", type: "workflow", icon: "cogs", description: "Runs break-even calculation and generates a side-by-side comparison" },
    ],
    standardResponses: [
      { id: "cu-hl-sr-rates", name: "Rate Summary", type: "confirmation", icon: "thumbs-up", description: "Presents current mortgage rates with APR, points, and estimated payment" },
      { id: "cu-hl-sr-status", name: "Application Status Update", type: "confirmation", icon: "check-symbol-check", description: "Reports current stage of the mortgage application with next steps" },
    ],
  },
  tier: "primary",
};

export default agent;

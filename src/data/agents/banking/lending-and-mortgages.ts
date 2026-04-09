import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_lending",
  name: "Lending & Mortgages",
  icon: "balance",
  automationRate: 76,
  avgResolutionTime: "~3 min",
  topTopic: "Loan Status",
  description: "Personal loans, mortgages, refinancing, loan applications, and payment management.",
  capabilities: [
    { title: "Loan application status", description: "Track progress of pending loan and mortgage applications" },
    { title: "Mortgage inquiries", description: "Answer questions about rates, terms, and mortgage products" },
    { title: "Refinancing guidance", description: "Help customers evaluate refinancing options and initiate applications" },
    { title: "Loan payment management", description: "Process payments, set up autopay, and handle deferral requests" },
    { title: "Pre-qualification", description: "Run soft credit checks for pre-qualification estimates" },
    { title: "Document collection", description: "Guide customers through required documentation for loan processing" },
  ],
  quickActions: ["Loan status", "Mortgage rates", "Refinance options", "Make payment", "Pre-qualify", "Upload documents"],
  flow: {
    knowledgeSources: [
      { id: "bl-kb-lending-faq", name: "Lending FAQ", type: "faq", icon: "books", description: "Product information for personal loans, mortgages, and lines of credit" },
      { id: "bl-kb-rates-api", name: "Rate Engine API", type: "api", icon: "computer-api", description: "Live interest rates and personalized rate quotes" },
      { id: "bl-kb-compliance", name: "Lending Compliance", type: "document", icon: "hierarchy-document", description: "TILA, RESPA, and fair lending compliance documentation" },
    ],
    guardrails: [
      { id: "bl-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate rate quotes or loan term information" },
      { id: "bl-gr-fair-lending", name: "Fair Lending Compliance", type: "compliance", icon: "hand-protection", description: "Ensures all lending interactions comply with fair lending regulations" },
    ],
    actionHooks: [
      { id: "bl-ah-transfer-lo", name: "Transfer to Loan Officer", type: "transfer", icon: "headset", description: "Connects customer with a loan officer for complex lending decisions" },
      { id: "bl-ah-email-docs", name: "Email Document Checklist", type: "email", icon: "speech", description: "Sends personalized document checklist based on loan type" },
    ],
    processes: [
      { id: "bl-pr-prequalify", name: "Pre-Qualification", type: "workflow", icon: "hierarchy", description: "Runs soft credit pull and returns pre-qualification estimate" },
      { id: "bl-pr-doc-classify", name: "Document Classification", type: "workflow", icon: "cogs", description: "Classifies and validates uploaded loan documents" },
    ],
    standardResponses: [
      { id: "bl-sr-prequalify", name: "Pre-Qualification Result", type: "confirmation", icon: "thumbs-up", description: "Presents pre-qualification results with next steps" },
      { id: "bl-sr-missing-docs", name: "Missing Documents", type: "request", icon: "route", description: "Lists outstanding required documents for the application" },
    ],
  },
};

export default agent;

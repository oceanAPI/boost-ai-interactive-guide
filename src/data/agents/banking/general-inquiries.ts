import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_general",
  name: "General Inquiries",
  icon: "speech",
  automationRate: 80,
  avgResolutionTime: "~1.5 min",
  topTopic: "Branch Hours",
  description: "Branch info, hours, ATM locations, general questions, complaints, and feedback.",
  capabilities: [
    { title: "Branch & ATM locator", description: "Find nearest branches and ATMs with hours and services" },
    { title: "General FAQ", description: "Answer common questions about bank products and services" },
    { title: "Complaint handling", description: "Log and route customer complaints to appropriate departments" },
    { title: "Fee inquiries", description: "Explain fees, waiver eligibility, and fee reversal requests" },
    { title: "Rate inquiries", description: "Provide current savings, CD, and deposit rates" },
    { title: "Feedback collection", description: "Collect and route customer feedback and suggestions" },
  ],
  quickActions: ["Find a branch", "ATM near me", "File complaint", "Fee question", "Current rates", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "bg-kb-general-faq", name: "General FAQ", type: "faq", icon: "books", description: "Bank-wide FAQ covering products, policies, and common questions" },
      { id: "bg-kb-branch-api", name: "Branch Locator API", type: "api", icon: "globe", description: "Branch and ATM location data with hours and services" },
      { id: "bg-kb-rate-sheet", name: "Rate Sheet", type: "document", icon: "hierarchy-document", description: "Current interest rates for all deposit and lending products" },
    ],
    guardrails: [
      { id: "bg-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about bank policies or rates" },
      { id: "bg-gr-tone", name: "Tone & Empathy", type: "tone", icon: "heart", description: "Ensures appropriate empathetic tone especially for complaints" },
    ],
    actionHooks: [
      { id: "bg-ah-transfer-cs", name: "Transfer to Customer Service", type: "transfer", icon: "headset", description: "Transfers to a live agent for unresolved inquiries" },
      { id: "bg-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a formal complaint record in the CRM system" },
    ],
    processes: [
      { id: "bg-pr-fee-reversal", name: "Fee Reversal", type: "workflow", icon: "hierarchy", description: "Evaluates eligibility and processes fee reversal requests" },
    ],
    standardResponses: [
      { id: "bg-sr-branch-info", name: "Branch Information", type: "informational", icon: "thumbs-up", description: "Provides branch details with map link" },
      { id: "bg-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint has been recorded with reference number" },
    ],
  },
};

export default agent;

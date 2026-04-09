import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_account_services",
  name: "Account Services",
  icon: "bank",
  automationRate: 85,
  avgResolutionTime: "~1.5 min",
  topTopic: "Account Balance",
  description: "Account inquiries, balance checks, transaction history, account opening, and account maintenance.",
  capabilities: [
    { title: "Balance & transaction inquiries", description: "Real-time account balance and recent transaction lookups" },
    { title: "Account opening", description: "Guide customers through opening checking, savings, and deposit accounts" },
    { title: "Account maintenance", description: "Handle address changes, statement preferences, and account settings" },
    { title: "Direct deposit setup", description: "Assist with setting up or modifying direct deposit instructions" },
    { title: "Account closure", description: "Process account closure requests with retention-aware workflows" },
    { title: "Joint account management", description: "Add or remove authorized signers and joint account holders" },
  ],
  quickActions: ["Check balance", "Recent transactions", "Open account", "Update address", "Direct deposit", "Close account"],
  flow: {
    knowledgeSources: [
      { id: "bs-kb-account-faq", name: "Account FAQ", type: "faq", icon: "books", description: "Frequently asked questions about checking, savings, and deposit accounts" },
      { id: "bs-kb-core-banking", name: "Core Banking API", type: "api", icon: "computer-api", description: "Real-time connection to core banking system for balance and transaction data" },
      { id: "bs-kb-product-docs", name: "Product Documentation", type: "document", icon: "hierarchy-document", description: "Account terms, fee schedules, and product comparison materials" },
    ],
    guardrails: [
      { id: "bs-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents the agent from generating inaccurate account information" },
      { id: "bs-gr-pii", name: "PII Protection", type: "pii", icon: "lock-security", description: "Ensures personal identifiable information is handled securely" },
    ],
    actionHooks: [
      { id: "bs-ah-transfer-human", name: "Transfer to Banker", type: "transfer", icon: "headset", description: "Transfers the conversation to a live banker for complex requests" },
      { id: "bs-ah-send-sms", name: "Send SMS Confirmation", type: "sms", icon: "phone", description: "Sends SMS confirmation for account changes or verification codes" },
    ],
    processes: [
      { id: "bs-pr-kyc", name: "KYC Verification", type: "verification", icon: "check-symbol-check", description: "Triggers know-your-customer identity verification workflow" },
      { id: "bs-pr-account-open", name: "Account Opening", type: "workflow", icon: "hierarchy", description: "Orchestrates the multi-step account opening process" },
    ],
    standardResponses: [
      { id: "bs-sr-confirm", name: "Change Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms successful account changes to the customer" },
      { id: "bs-sr-fallback", name: "Unable to Assist", type: "fallback", icon: "route", description: "Graceful fallback when the request cannot be automated" },
    ],
  },
};

export default agent;

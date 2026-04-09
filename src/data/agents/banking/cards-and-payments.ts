import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_cards",
  name: "Cards & Payments",
  icon: "banknote",
  automationRate: 83,
  avgResolutionTime: "~2 min",
  topTopic: "Card Block/Replace",
  description: "Credit and debit card management, fraud disputes, payment issues, and card applications.",
  capabilities: [
    { title: "Card blocking & replacement", description: "Instantly block lost/stolen cards and order replacements" },
    { title: "Fraud dispute handling", description: "File and track unauthorized transaction disputes" },
    { title: "PIN management", description: "Reset or change card PIN through secure verification" },
    { title: "Credit limit requests", description: "Process credit limit increase or decrease requests" },
    { title: "Payment issues", description: "Resolve declined transactions, holds, and payment failures" },
    { title: "Card application", description: "Guide customers through credit card applications with instant decisions" },
  ],
  quickActions: ["Block my card", "Report fraud", "Reset PIN", "Credit limit", "Why declined", "Apply for card"],
  flow: {
    knowledgeSources: [
      { id: "bc-kb-card-faq", name: "Card FAQ", type: "faq", icon: "books", description: "Card product FAQs including rewards, fees, and usage policies" },
      { id: "bc-kb-card-api", name: "Card Management API", type: "api", icon: "computer-api", description: "Real-time card status, transactions, and management operations" },
      { id: "bc-kb-fraud-rules", name: "Fraud Detection Rules", type: "document", icon: "hierarchy-document", description: "Internal fraud screening criteria and dispute resolution procedures" },
    ],
    guardrails: [
      { id: "bc-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about card terms or transactions" },
      { id: "bc-gr-auth", name: "Authentication Required", type: "compliance", icon: "lock-security", description: "Enforces strong customer authentication before card operations" },
    ],
    actionHooks: [
      { id: "bc-ah-block-card", name: "Block Card Immediately", type: "webhook", icon: "target-selection", description: "Triggers immediate card blocking through the card management system" },
      { id: "bc-ah-transfer-fraud", name: "Transfer to Fraud Team", type: "transfer", icon: "headset", description: "Escalates suspected fraud cases to the specialist fraud team" },
      { id: "bc-ah-send-sms", name: "Send Replacement SMS", type: "sms", icon: "phone", description: "Sends SMS with replacement card tracking and delivery details" },
    ],
    processes: [
      { id: "bc-pr-dispute", name: "Dispute Filing", type: "workflow", icon: "hierarchy", description: "Orchestrates the chargeback and dispute resolution workflow" },
      { id: "bc-pr-card-order", name: "Card Ordering", type: "workflow", icon: "cogs", description: "Processes new card orders and replacement card requests" },
    ],
    standardResponses: [
      { id: "bc-sr-blocked", name: "Card Blocked", type: "confirmation", icon: "thumbs-up", description: "Confirms card has been successfully blocked and next steps" },
      { id: "bc-sr-dispute-filed", name: "Dispute Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms dispute has been filed with estimated resolution time" },
    ],
  },
};

export default agent;

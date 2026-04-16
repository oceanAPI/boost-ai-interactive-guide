import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_cards",
  name: "Credit & Debit Cards",
  icon: "credit-card",
  automationRate: 84,
  avgResolutionTime: "~2 min",
  topTopic: "Block my card",
  description: "Credit and debit card issuance, limits, rewards, transaction disputes, lost or stolen cards, and fraud alerts.",
  capabilities: [
    { title: "Lost / stolen card", description: "Immediately block a compromised card and order a replacement" },
    { title: "Transaction disputes", description: "File a dispute for unauthorised or incorrect charges" },
    { title: "Rewards & cashback", description: "Check rewards balance, redemption options, and cashback earnings" },
    { title: "Credit limit management", description: "Request a credit limit increase or temporary limit adjustment" },
    { title: "Card controls", description: "Freeze/unfreeze card, set travel notices, and manage spending alerts" },
    { title: "New card application", description: "Apply for a new credit or debit card with instant-issue options" },
  ],
  quickActions: ["Block my card", "Dispute charge", "Rewards balance", "Credit limit", "Freeze card", "Apply for card"],
  flow: {
    knowledgeSources: [
      { id: "cu-cc-kb-faq", name: "Card FAQ", type: "faq", icon: "books", description: "Card types, fees, rewards programs, and dispute procedures" },
      { id: "cu-cc-kb-card-api", name: "Card Management API", type: "api", icon: "computer-api", description: "Real-time card status, transactions, rewards balance, and controls" },
      { id: "cu-cc-kb-fraud-db", name: "Fraud & Disputes DB", type: "database", icon: "database-connection", description: "Dispute case history, fraud alerts, and chargeback status" },
    ],
    guardrails: [
      { id: "cu-cc-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated transaction or reward balance data" },
      { id: "cu-cc-gr-pci", name: "PCI DSS Compliance", type: "compliance", icon: "shield-medal", description: "Masks full card numbers and enforces PCI data-handling rules" },
    ],
    actionHooks: [
      { id: "cu-cc-ah-block", name: "Block Card Instantly", type: "webhook", icon: "target-selection", description: "Immediately disables the card and triggers replacement issuance" },
      { id: "cu-cc-ah-dispute", name: "File Dispute", type: "webhook", icon: "target-selection", description: "Opens a formal transaction dispute case" },
      { id: "cu-cc-ah-transfer", name: "Transfer to Card Services", type: "transfer", icon: "headset", description: "Warm handover to a card services specialist" },
    ],
    processes: [
      { id: "cu-cc-pr-lost-stolen", name: "Lost/Stolen Card Flow", type: "workflow", icon: "hierarchy", description: "Blocks card, reviews recent transactions for fraud, and issues replacement" },
      { id: "cu-cc-pr-dispute", name: "Dispute Resolution", type: "workflow", icon: "cogs", description: "Manages dispute lifecycle from filing through provisional credit and resolution" },
    ],
    standardResponses: [
      { id: "cu-cc-sr-blocked", name: "Card Blocked Confirmation", type: "confirmation", icon: "thumbs-up", description: "Confirms the card is blocked and replacement is on the way" },
      { id: "cu-cc-sr-rewards", name: "Rewards Summary", type: "confirmation", icon: "check-symbol-check", description: "Presents current rewards balance, recent earnings, and redemption options" },
    ],
  },
  tier: "primary",
};

export default agent;

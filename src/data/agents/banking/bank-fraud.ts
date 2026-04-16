import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_fraud",
  name: "Bank fraud",
  icon: "lock-security",
  automationRate: 85,
  avgResolutionTime: "~2 min",
  topTopic: "I don't recognise this transaction",
  description: "Unauthorised-transaction reporting, card blocking, scam and phishing triage, account lockdowns, and recovery workflows.",
  capabilities: [
    { title: "Unauthorised transaction reporting", description: "Captures fraud claims with structured data and immediately opens a dispute case" },
    { title: "Instant card blocking", description: "Blocks debit or credit cards in real-time before further transactions post" },
    { title: "Scam & phishing triage", description: "Educates on active scam patterns (APP fraud, CEO impersonation) and collects evidence" },
    { title: "Account lockdown", description: "Temporarily freezes digital banking access pending investigation" },
    { title: "Recovery tracking", description: "Tracks chargeback progress, provisional credit status, and final resolution" },
    { title: "Fraud prevention tips", description: "Delivers personalised guidance on 2FA, device hygiene, and suspicious-message patterns" },
  ],
  quickActions: ["Report fraud", "Block card now", "Freeze account", "Scam check", "Dispute status", "Protect my account"],
  flow: {
    knowledgeSources: [
      { id: "bf-kb-fraud-faq", name: "Fraud FAQ", type: "faq", icon: "books", description: "Common fraud patterns, dispute rules, liability framework" },
      { id: "bf-kb-transaction-api", name: "Transaction API", type: "api", icon: "computer-api", description: "Real-time transaction history, merchant metadata, and status" },
      { id: "bf-kb-fraud-rules", name: "Fraud Ruleset", type: "database", icon: "database-connection", description: "Internal risk-scoring rules and active scam intelligence feed" },
    ],
    guardrails: [
      { id: "bf-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect claims about liability, refund timing, or dispute outcomes" },
      { id: "bf-gr-identity", name: "Strong Identity Verification", type: "compliance", icon: "lock-security", description: "Requires re-authentication before any account lockdown or transaction reversal" },
      { id: "bf-gr-vishing", name: "Social Engineering Guardrail", type: "compliance", icon: "shield-medal", description: "Detects and blocks conversations where the customer appears to be coached by a scammer" },
    ],
    actionHooks: [
      { id: "bf-ah-block-card", name: "Block Card Immediately", type: "webhook", icon: "target-selection", description: "Triggers real-time card block in the card-management system" },
      { id: "bf-ah-freeze-account", name: "Freeze Digital Access", type: "webhook", icon: "lock-security", description: "Locks down digital banking access pending manual review" },
      { id: "bf-ah-transfer-fraud", name: "Transfer to Fraud Investigator", type: "transfer", icon: "headset", description: "Warm handover to the human fraud team with full context" },
    ],
    processes: [
      { id: "bf-pr-dispute", name: "Dispute Filing", type: "workflow", icon: "hierarchy", description: "Orchestrates chargeback filing with evidence collection and merchant notification" },
      { id: "bf-pr-recovery", name: "Recovery Workflow", type: "workflow", icon: "cogs", description: "Manages provisional credit, investigation milestones, and final resolution" },
    ],
    standardResponses: [
      { id: "bf-sr-blocked", name: "Card Blocked", type: "confirmation", icon: "thumbs-up", description: "Confirms block with timestamp and replacement options" },
      { id: "bf-sr-dispute-open", name: "Dispute Opened", type: "confirmation", icon: "check-symbol-check", description: "Confirms dispute with case reference and expected timeline" },
    ],
  },
  tier: "primary",
};

export default agent;

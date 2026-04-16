import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_digital",
  name: "Digital Banking",
  icon: "mobile",
  automationRate: 89,
  avgResolutionTime: "~1 min",
  topTopic: "Mobile deposit",
  description: "Mobile and online banking, peer-to-peer transfers, remote check deposit, bill pay, and digital wallet setup.",
  capabilities: [
    { title: "Mobile deposit", description: "Deposit checks remotely using the mobile app camera — limits, holds, and troubleshooting" },
    { title: "P2P transfers", description: "Send money to other members or external accounts via Zelle, Venmo, or internal P2P" },
    { title: "Bill pay", description: "Schedule one-time or recurring bill payments through online banking" },
    { title: "Digital wallet", description: "Add cards to Apple Pay, Google Pay, or Samsung Pay" },
    { title: "Online banking access", description: "Password resets, MFA setup, login troubleshooting, and device management" },
    { title: "Account alerts", description: "Configure balance, transaction, and security notifications via push, email, or SMS" },
  ],
  quickActions: ["Mobile deposit", "Send money", "Pay a bill", "Digital wallet", "Reset password", "Set alerts"],
  flow: {
    knowledgeSources: [
      { id: "cu-db-kb-faq", name: "Digital Banking FAQ", type: "faq", icon: "books", description: "Mobile deposit limits, P2P setup, bill pay, and troubleshooting guides" },
      { id: "cu-db-kb-channel-api", name: "Channel Status API", type: "api", icon: "computer-api", description: "Real-time mobile and online banking service status and feature flags" },
      { id: "cu-db-kb-user-db", name: "User Profile DB", type: "database", icon: "database-connection", description: "Device registrations, MFA settings, and alert preferences" },
    ],
    guardrails: [
      { id: "cu-db-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated feature availability or deposit limit figures" },
      { id: "cu-db-gr-auth", name: "Authentication Guardrail", type: "compliance", icon: "shield-medal", description: "Verifies member identity before allowing account access changes" },
    ],
    actionHooks: [
      { id: "cu-db-ah-reset", name: "Password Reset", type: "webhook", icon: "target-selection", description: "Initiates a secure password reset via email or SMS" },
      { id: "cu-db-ah-wallet", name: "Provision Digital Wallet", type: "webhook", icon: "target-selection", description: "Pushes card credentials to Apple Pay, Google Pay, or Samsung Pay" },
      { id: "cu-db-ah-transfer", name: "Transfer to Tech Support", type: "transfer", icon: "headset", description: "Warm handover to digital banking technical support" },
    ],
    processes: [
      { id: "cu-db-pr-deposit", name: "Mobile Deposit Workflow", type: "workflow", icon: "hierarchy", description: "Guides member through check capture, validates image, and confirms deposit" },
      { id: "cu-db-pr-enrollment", name: "Digital Enrollment", type: "workflow", icon: "cogs", description: "Registers member for online banking, mobile app, and MFA setup" },
    ],
    standardResponses: [
      { id: "cu-db-sr-deposit", name: "Deposit Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms mobile deposit received with hold period and availability date" },
      { id: "cu-db-sr-access", name: "Access Restored", type: "confirmation", icon: "check-symbol-check", description: "Confirms password reset or MFA update was successful" },
    ],
  },
  tier: "primary",
};

export default agent;

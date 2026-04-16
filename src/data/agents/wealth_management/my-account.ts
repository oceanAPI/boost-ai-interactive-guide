import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_account",
  name: "My Account",
  icon: "user",
  automationRate: 86,
  avgResolutionTime: "~1.5 min",
  topTopic: "Download my statement",
  description: "Account statements, login and security, document centre, and profile management for wealth management clients.",
  capabilities: [
    { title: "Statements & documents", description: "Download monthly statements, annual summaries, and trade confirmations" },
    { title: "Login & security", description: "Password reset, MFA setup, session management, and security alerts" },
    { title: "Profile management", description: "Update contact details, mailing address, and communication preferences" },
    { title: "Document centre", description: "Centralised access to all account correspondence, forms, and regulatory notices" },
  ],
  quickActions: ["Download statement", "Reset password", "Update profile", "Document centre", "Security settings"],
  flow: {
    knowledgeSources: [
      { id: "ma-kb-account-faq", name: "Account FAQ", type: "faq", icon: "books", description: "Statement availability, login issues, and profile update procedures" },
      { id: "ma-kb-document-api", name: "Document API", type: "api", icon: "computer-api", description: "Real-time access to statements, confirmations, and regulatory documents" },
    ],
    guardrails: [
      { id: "ma-gr-identity", name: "Identity Verification", type: "compliance", icon: "shield-medal", description: "Verifies client identity before granting access to sensitive account actions" },
    ],
    actionHooks: [
      { id: "ma-ah-statement", name: "Send Statement PDF", type: "email", icon: "phone", description: "Emails the requested account statement to the client" },
      { id: "ma-ah-support", name: "Transfer to Account Support", type: "transfer", icon: "headset", description: "Warm handover to account support for complex access issues" },
    ],
    processes: [
      { id: "ma-pr-profile-update", name: "Profile Update Workflow", type: "workflow", icon: "cogs", description: "Validates and applies contact detail or preference changes" },
    ],
    standardResponses: [
      { id: "ma-sr-statement-ready", name: "Statement Ready", type: "confirmation", icon: "thumbs-up", description: "Confirms statement is available with download link and date range" },
    ],
  },
  tier: "addon",
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_my_account",
  name: "My Account",
  icon: "user-circle",
  automationRate: 85,
  avgResolutionTime: "~2 min",
  topTopic: "Update my beneficiaries",
  description: "Member portal essentials — personal details, beneficiaries, documents, login support, and communication preferences across all pension products.",
  capabilities: [
    { title: "Login & identity help", description: "Authentication support, password reset, identity verification" },
    { title: "Beneficiaries", description: "View, add, remove, and update with strong auth and legal consent" },
    { title: "Personal details", description: "Name, address, email, phone, and tax-residency changes" },
    { title: "Statements & documents", description: "Download annual statements, tax certificates, and benefit summaries" },
    { title: "Communication preferences", description: "Post vs digital delivery, marketing opt-in/out" },
    { title: "Data rights", description: "GDPR access, data portability, and deletion requests" },
  ],
  quickActions: ["Update beneficiaries", "Change address", "My statements", "Login help", "Communication settings", "Data rights"],
  flow: {
    knowledgeSources: [
      { id: "pa-kb-member-faq", name: "Member FAQ", type: "faq", icon: "books", description: "Account settings, beneficiary rules, document types" },
      { id: "pa-kb-member-api", name: "Member Registry", type: "api", icon: "computer-api", description: "Personal details, beneficiaries, preferences" },
      { id: "pa-kb-document-api", name: "Document Service", type: "api", icon: "computer-api", description: "Statement and certificate generation and retrieval" },
    ],
    guardrails: [
      { id: "pa-gr-auth", name: "Strong Auth Required", type: "compliance", icon: "lock-security", description: "Requires strong auth before beneficiary changes or personal-data disclosure" },
      { id: "pa-gr-legal-consent", name: "Legal Consent", type: "compliance", icon: "shield-medal", description: "Captures legal consent for beneficiary designations and data-portability requests" },
    ],
    actionHooks: [
      { id: "pa-ah-update-member", name: "Update Member Record", type: "webhook", icon: "target-selection", description: "Commits profile or beneficiary change to the member registry" },
      { id: "pa-ah-send-statement", name: "Send Statement", type: "email", icon: "phone", description: "Emails or posts a requested statement or tax certificate" },
    ],
    processes: [
      { id: "pa-pr-beneficiary", name: "Beneficiary Change", type: "workflow", icon: "hierarchy", description: "Multi-step identity-verified beneficiary update with legal consent" },
      { id: "pa-pr-document-delivery", name: "Document Delivery", type: "workflow", icon: "cogs", description: "Generates and delivers the requested document via preferred channel" },
    ],
    standardResponses: [
      { id: "pa-sr-updated", name: "Profile Updated", type: "confirmation", icon: "thumbs-up", description: "Confirms update with effective date and change summary" },
      { id: "pa-sr-sent", name: "Document Sent", type: "confirmation", icon: "check-symbol-check", description: "Confirms document delivery via preferred channel" },
    ],
  },
  tier: "addon",
};

export default agent;

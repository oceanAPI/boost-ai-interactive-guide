import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_onboarding",
  name: "Account & Onboarding",
  icon: "user-profile",
  automationRate: 90,
  avgResolutionTime: "~1.5 min",
  topTopic: "Verify my identity",
  description: "In-app account creation and KYC — document capture, identity verification, waitlist management, and onboarding status tracking.",
  capabilities: [
    { title: "Identity verification", description: "Selfie + ID document matching via automated KYC pipeline" },
    { title: "Document capture", description: "Passport, driving licence, or national ID upload and validation" },
    { title: "Address verification", description: "Proof-of-address document review and utility bill matching" },
    { title: "Onboarding status", description: "Real-time progress tracker for multi-step sign-up flow" },
    { title: "Waitlist management", description: "Position updates, early-access invitations, and referral boosts" },
    { title: "Account activation", description: "Final activation steps including first deposit and card order" },
  ],
  quickActions: ["Verify my identity", "Upload document", "Address check", "Onboarding status", "Waitlist position", "Activate account"],
  flow: {
    knowledgeSources: [
      { id: "ft-onb-kb-kyc-faq", name: "KYC & Onboarding FAQ", type: "faq", icon: "books", description: "Accepted documents, photo requirements, common rejection reasons" },
      { id: "ft-onb-kb-kyc-api", name: "KYC Verification API", type: "api", icon: "computer-api", description: "Real-time ID verification status, liveness check results" },
      { id: "ft-onb-kb-waitlist-db", name: "Waitlist Database", type: "database", icon: "database-connection", description: "Queue position, referral credits, early-access eligibility" },
    ],
    guardrails: [
      { id: "ft-onb-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated verification statuses or queue positions" },
      { id: "ft-onb-gr-pii", name: "PII Protection", type: "compliance", icon: "shield-medal", description: "Blocks display of full ID numbers or sensitive personal data in chat" },
    ],
    actionHooks: [
      { id: "ft-onb-ah-retry-kyc", name: "Retry KYC Check", type: "webhook", icon: "target-selection", description: "Re-triggers identity verification after document re-upload" },
      { id: "ft-onb-ah-escalate", name: "Escalate to Manual Review", type: "transfer", icon: "headset", description: "Routes failed KYC to human compliance reviewer" },
      { id: "ft-onb-ah-welcome-email", name: "Send Welcome Email", type: "email", icon: "phone", description: "Sends activation confirmation and getting-started guide" },
    ],
    processes: [
      { id: "ft-onb-pr-kyc-flow", name: "KYC Orchestration", type: "workflow", icon: "hierarchy", description: "Multi-step identity verification: document upload, liveness, PEP/sanctions" },
      { id: "ft-onb-pr-activation", name: "Account Activation", type: "workflow", icon: "cogs", description: "Post-KYC steps: set PIN, order card, enable notifications" },
    ],
    standardResponses: [
      { id: "ft-onb-sr-verified", name: "Verification Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms identity verified and account is ready to use" },
      { id: "ft-onb-sr-doc-rejected", name: "Document Rejection Reason", type: "confirmation", icon: "check-symbol-check", description: "Explains why a document was rejected with re-upload guidance" },
    ],
  },
  tier: "primary",
};

export default agent;

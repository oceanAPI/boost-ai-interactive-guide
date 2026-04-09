import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_digital",
  name: "Digital Banking",
  icon: "desktop-network",
  automationRate: 88,
  avgResolutionTime: "~1 min",
  topTopic: "Login Issues",
  description: "Online banking, mobile app support, password resets, transfers, and digital enrollment.",
  capabilities: [
    { title: "Password & login issues", description: "Reset passwords, unlock accounts, and resolve MFA issues" },
    { title: "Money transfers", description: "Assist with internal transfers, wire transfers, and Zelle/P2P payments" },
    { title: "Mobile app support", description: "Troubleshoot app issues, push notifications, and mobile deposit" },
    { title: "Digital enrollment", description: "Enroll customers in online and mobile banking services" },
    { title: "Alert management", description: "Set up and manage account alerts and notifications" },
    { title: "Bill pay setup", description: "Help customers configure online bill pay and scheduled payments" },
  ],
  quickActions: ["Reset password", "Transfer money", "App not working", "Enroll online", "Set alerts", "Bill pay"],
  flow: {
    knowledgeSources: [
      { id: "bd-kb-digital-faq", name: "Digital Banking FAQ", type: "faq", icon: "books", description: "Troubleshooting guides for online and mobile banking platforms" },
      { id: "bd-kb-auth-api", name: "Authentication API", type: "api", icon: "computer-api", description: "User authentication, password reset, and MFA management" },
    ],
    guardrails: [
      { id: "bd-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect technical guidance" },
      { id: "bd-gr-auth", name: "Identity Verification", type: "compliance", icon: "lock-security", description: "Verifies customer identity before account access changes" },
    ],
    actionHooks: [
      { id: "bd-ah-reset-password", name: "Trigger Password Reset", type: "webhook", icon: "target-selection", description: "Sends password reset link to registered email or phone" },
      { id: "bd-ah-transfer-tech", name: "Transfer to Tech Support", type: "transfer", icon: "headset", description: "Escalates complex technical issues to specialized support" },
    ],
    processes: [
      { id: "bd-pr-unlock", name: "Account Unlock", type: "workflow", icon: "hierarchy", description: "Automated account unlock after identity verification" },
      { id: "bd-pr-enrollment", name: "Digital Enrollment", type: "workflow", icon: "cogs", description: "End-to-end digital banking enrollment and activation" },
    ],
    standardResponses: [
      { id: "bd-sr-reset-sent", name: "Reset Link Sent", type: "confirmation", icon: "thumbs-up", description: "Confirms password reset link has been sent" },
      { id: "bd-sr-enrolled", name: "Enrollment Complete", type: "confirmation", icon: "check-symbol-check", description: "Confirms successful digital banking enrollment" },
    ],
  },
};

export default agent;

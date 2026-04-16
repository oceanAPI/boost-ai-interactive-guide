import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_mobile_app",
  name: "Mobile bank application",
  icon: "desktop-network",
  automationRate: 88,
  avgResolutionTime: "~1 min",
  topTopic: "I can't log into the app",
  description: "Mobile-app onboarding, troubleshooting, device-specific help, and in-app feature guidance.",
  capabilities: [
    { title: "App login troubleshooting", description: "Diagnoses biometric, PIN, and version-related login issues" },
    { title: "Device switching", description: "Walks through re-registration when the customer gets a new phone" },
    { title: "Feature guidance", description: "In-context help for deposits, transfers, card controls, and notifications" },
    { title: "Compatibility & updates", description: "Confirms OS version support and guides through app updates" },
  ],
  quickActions: ["Can't log in", "New phone setup", "Update app", "Biometrics help", "Notifications"],
  flow: {
    knowledgeSources: [
      { id: "bma-kb-app-faq", name: "Mobile App FAQ", type: "faq", icon: "books", description: "App features, compatibility, release notes" },
      { id: "bma-kb-device-api", name: "Device Registry API", type: "api", icon: "computer-api", description: "Registered devices, push-notification tokens, biometric bindings" },
    ],
    guardrails: [
      { id: "bma-gr-auth", name: "Device Re-registration Guard", type: "compliance", icon: "lock-security", description: "Requires strong auth before registering a new device" },
    ],
    actionHooks: [
      { id: "bma-ah-reset-device", name: "Reset Device Registration", type: "webhook", icon: "target-selection", description: "Clears device binding so the customer can re-register" },
      { id: "bma-ah-transfer-tech", name: "Transfer to Tech Support", type: "transfer", icon: "headset", description: "Escalates persistent technical issues to human support" },
    ],
    processes: [
      { id: "bma-pr-reonboard", name: "Re-onboarding", type: "workflow", icon: "cogs", description: "Guides the customer through re-registration flow end-to-end" },
    ],
    standardResponses: [
      { id: "bma-sr-fixed", name: "Issue Resolved", type: "confirmation", icon: "thumbs-up", description: "Confirms resolution with a quick check that login works" },
    ],
  },
  tier: "addon",
};

export default agent;

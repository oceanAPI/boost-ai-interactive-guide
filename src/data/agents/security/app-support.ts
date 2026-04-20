import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_app_support",
  name: "App support",
  icon: "phone",
  automationRate: 82,
  avgResolutionTime: "~1.5 min",
  topTopic: "Can't log in",
  description: "Sector Alarm mobile + web app: login trouble, push-notification setup, multi-user access, feature walkthroughs. Merges the App and App error topics.",
  capabilities: [
    { title: "Login & password reset", description: "Help the customer regain access without emailing a password out-of-channel" },
    { title: "Push-notification setup", description: "Diagnose why events aren't reaching the phone and guide through OS permissions" },
    { title: "Multi-user access", description: "Invite, revoke and set permissions for additional family or employee users" },
    { title: "Feature walkthrough", description: "Short guided tours for event log, camera snapshots, quick-arm tiles" },
    { title: "App errors", description: "Common app crash and error-message fixes, including version and OS compatibility" },
  ],
  quickActions: ["I can't log in", "Notifications aren't working", "Add my partner", "App keeps crashing", "Reset my password"],
  flow: {
    knowledgeSources: [
      { id: "sec-as-kb-app-faq", name: "App FAQ & known issues", type: "faq", icon: "books", description: "Current known issues per app version plus the canonical how-to library" },
      { id: "sec-as-kb-perms", name: "Permissions model", type: "document", icon: "hierarchy-document", description: "What each user role can see and do inside the app" },
    ],
    guardrails: [
      { id: "sec-as-gr-auth", name: "Out-of-channel auth", type: "auth", icon: "lock-security", description: "Password resets go through the app / email flow — never revealed in chat" },
      { id: "sec-as-gr-pii", name: "PII scrub", type: "pii", icon: "hand-protection", description: "Strips emails, phone numbers and addresses from the event log before echoing back" },
    ],
    actionHooks: [
      { id: "sec-as-ah-reset-email", name: "Trigger password reset", type: "webhook", icon: "refresh-idea", description: "Sends the standard password-reset email to the verified inbox" },
      { id: "sec-as-ah-invite-user", name: "Send user invite", type: "webhook", icon: "human-interaction", description: "Creates the invite for an additional app user with the chosen role" },
    ],
    processes: [
      { id: "sec-as-pr-push-fix", name: "Push-notification diagnostic", type: "workflow", icon: "hierarchy", description: "Checks OS-level permissions, do-not-disturb and app-level toggles in order" },
    ],
    standardResponses: [
      { id: "sec-as-sr-reset-sent", name: "Reset email sent", type: "confirmation", icon: "check-symbol-check", description: "Tells the customer to check their inbox and next steps" },
      { id: "sec-as-sr-invite-sent", name: "Invite sent", type: "confirmation", icon: "check-symbol-check", description: "Confirms the invite email with role and expiry" },
    ],
  },
};

export default agent;

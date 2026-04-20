import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_subscription",
  name: "Subscription",
  icon: "clock-pass",
  automationRate: 84,
  avgResolutionTime: "~1.5 min",
  topTopic: "Upgrade plan",
  description: "Subscription lifecycle — plan upgrade / downgrade, add-on devices, pause, resume, auto-renew state, holiday mode. Covers both residential and commercial plans.",
  capabilities: [
    { title: "Plan change", description: "Upgrade, downgrade or switch between residential and commercial tiers" },
    { title: "Add-on devices", description: "Add extra sensors, cameras or smart plugs mid-contract with pro-rated billing" },
    { title: "Pause / resume", description: "Pause the monitoring component (e.g. during a renovation) and resume later" },
    { title: "Auto-renew & notice", description: "Manage auto-renew state and notice-period reminders" },
    { title: "Holiday mode", description: "Temporary heightened monitoring for annual leave" },
  ],
  quickActions: ["Upgrade my plan", "Add a camera", "Pause monitoring", "When does it renew?", "Enable holiday mode"],
  flow: {
    knowledgeSources: [
      { id: "sec-su-kb-plans", name: "Plan catalogue", type: "document", icon: "books", description: "Every published plan + add-on with price, term and eligibility" },
      { id: "sec-su-kb-subscription", name: "Active subscription", type: "api", icon: "database-connection", description: "The customer's current plan, add-ons, billing state and renewal date" },
    ],
    guardrails: [
      { id: "sec-su-gr-auth", name: "Owner-only changes", type: "auth", icon: "lock-security", description: "Plan changes require the account owner's verified login" },
      { id: "sec-su-gr-safety", name: "Monitoring-gap notice", type: "policy", icon: "shield-medal", description: "Pause flow explicitly warns about the monitoring gap before confirming" },
    ],
    actionHooks: [
      { id: "sec-su-ah-change", name: "Apply plan change", type: "webhook", icon: "refresh-idea", description: "Applies a new plan + add-ons, with pro-rated invoice preview before commit" },
      { id: "sec-su-ah-holiday", name: "Enable holiday mode", type: "webhook", icon: "airplane", description: "Applies the holiday-mode profile for the requested dates" },
    ],
    processes: [
      { id: "sec-su-pr-preview", name: "Change-preview", type: "workflow", icon: "hierarchy", description: "Shows the full before / after price and term before asking to confirm" },
    ],
    standardResponses: [
      { id: "sec-su-sr-applied", name: "Change applied", type: "confirmation", icon: "check-symbol-check", description: "Confirms the new plan, first full invoice date and the pro-rated charge" },
      { id: "sec-su-sr-paused", name: "Paused", type: "confirmation", icon: "check-symbol-check", description: "Confirms the pause window and the monitoring-gap reminder" },
    ],
  },
};

export default agent;

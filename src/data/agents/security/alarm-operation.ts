import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_alarm_operation",
  name: "Alarm operation",
  icon: "shield-medal",
  automationRate: 86,
  avgResolutionTime: "~50s",
  topTopic: "Disarm / home mode",
  description: "Day-to-day alarm use — arming, disarming, switching between home / away / night modes, scheduled arming, temporary codes for guests and cleaners.",
  capabilities: [
    { title: "Arm / disarm walkthrough", description: "Step-by-step arming and disarming for each mode, for app, keypad, keyfob and voice" },
    { title: "Mode explainers", description: "What home / away / night mode actually arms — which sensors are on, which bypassed" },
    { title: "Scheduled arming", description: "Set, edit and remove recurring arming schedules per site" },
    { title: "Temporary user codes", description: "Issue, rotate and revoke guest, cleaner and tradesperson codes with expiry" },
    { title: "Bypass a sensor", description: "Temporarily exclude a faulty or in-repair sensor from the armed set" },
    { title: "Multi-site arming", description: "Hybrid customers arming several sites (home + cabin, office + warehouse) from one view" },
  ],
  quickActions: ["Disarm my alarm", "Arm to night mode", "Set a guest code", "What does away mode arm?", "Bypass a sensor", "Schedule arming"],
  flow: {
    knowledgeSources: [
      { id: "sec-ao-kb-modes", name: "Mode catalogue", type: "faq", icon: "books", description: "What each mode arms and disarms, per product line" },
      { id: "sec-ao-kb-codes-policy", name: "User-code policy", type: "document", icon: "hierarchy-document", description: "Code length, rotation, expiry, audit-log retention" },
      { id: "sec-ao-kb-account", name: "Account & site state", type: "api", icon: "database-connection", description: "Live arming state and user-code list for the signed-in subscription" },
    ],
    guardrails: [
      { id: "sec-ao-gr-auth", name: "Auth required", type: "auth", icon: "lock-security", description: "Disarm or code changes require verified account login" },
      { id: "sec-ao-gr-hallucination", name: "Hallucination detection", type: "hallucination", icon: "shield-medal", description: "Never invent mode behaviour not on the product-model spec" },
    ],
    actionHooks: [
      { id: "sec-ao-ah-disarm", name: "Disarm site", type: "webhook", icon: "target-selection", description: "Sends a disarm command after step-up auth confirmation" },
      { id: "sec-ao-ah-issue-code", name: "Issue user code", type: "webhook", icon: "lock-security", description: "Creates a temporary user code with the requested expiry" },
    ],
    processes: [
      { id: "sec-ao-pr-schedule", name: "Schedule builder", type: "workflow", icon: "clock-pass", description: "Guided flow to build a recurring arming schedule" },
    ],
    standardResponses: [
      { id: "sec-ao-sr-disarmed", name: "Disarm confirmed", type: "confirmation", icon: "check-symbol-check", description: "Confirms the site is now disarmed with timestamp" },
      { id: "sec-ao-sr-code-issued", name: "Code issued", type: "confirmation", icon: "check-symbol-check", description: "Delivers the new code plus expiry and usage reminder" },
    ],
  },
};

export default agent;

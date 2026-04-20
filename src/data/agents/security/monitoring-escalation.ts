import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_monitoring_escalation",
  name: "Monitoring escalation",
  icon: "24-hours",
  automationRate: 55,
  avgResolutionTime: "~2 min",
  topTopic: "Reach the monitoring centre",
  description: "24/7 monitoring-centre interface. Customer wants status of a live event, to update contact list, challenge a dispatch decision or reach the centre operator directly.",
  capabilities: [
    { title: "Live event status", description: "What the monitoring centre sees right now for this site, with dispatch state" },
    { title: "Contact list management", description: "Update the call-down list and duress codes the centre uses on a trigger" },
    { title: "Priority challenge", description: "Challenge or change the priority / dispatch rules for specific event types" },
    { title: "Direct-to-operator", description: "Live hand-off to the on-shift monitoring-centre operator for urgent issues" },
    { title: "Event history", description: "Read-back of past handled events for this site within policy" },
  ],
  quickActions: ["What does the centre see?", "Update my contact list", "Change dispatch rules", "Talk to the centre", "Event history"],
  flow: {
    knowledgeSources: [
      { id: "sec-me-kb-procedures", name: "Monitoring procedures", type: "document", icon: "hierarchy-document", description: "Per-market procedures for handled events, priorities and dispatch" },
      { id: "sec-me-kb-status", name: "Monitoring event feed", type: "api", icon: "database-connection", description: "Live event state for this site, visible to the centre" },
    ],
    guardrails: [
      { id: "sec-me-gr-authority", name: "Authority boundary", type: "policy", icon: "shield-medal", description: "Does not attempt to override the centre operator's judgement on an active event" },
      { id: "sec-me-gr-duress", name: "Duress protection", type: "policy", icon: "shield-medal", description: "Duress codes are never displayed back; changes require out-of-band verification" },
    ],
    actionHooks: [
      { id: "sec-me-ah-contact", name: "Update contact list", type: "webhook", icon: "users", description: "Applies the updated call-down list after verification" },
      { id: "sec-me-ah-live", name: "Live hand-off", type: "transfer", icon: "headset", description: "Hands the session to the on-shift operator with full context" },
    ],
    processes: [
      { id: "sec-me-pr-priority", name: "Priority change review", type: "workflow", icon: "hierarchy", description: "Captures the reason and routes it for centre approval before taking effect" },
    ],
    standardResponses: [
      { id: "sec-me-sr-status", name: "Centre status", type: "informational", icon: "24-hours", description: "Shares the current centre-visible state of the active event" },
      { id: "sec-me-sr-routed", name: "Live operator", type: "informational", icon: "headset", description: "Confirms the hand-off to the on-shift operator with wait time" },
    ],
  },
};

export default agent;

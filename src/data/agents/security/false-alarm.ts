import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_false_alarm",
  name: "False alarm handling",
  icon: "target-selection",
  automationRate: 78,
  avgResolutionTime: "~1.5 min",
  topTopic: "Cancel after trigger",
  description: "Post-trigger support. Cancel a false alarm before guard / police dispatch, log context for the monitoring centre, avoid false-alarm fees and prevent recurrence.",
  capabilities: [
    { title: "Cancel the response", description: "Step-up identity check, cancel guard or police dispatch, confirm with the monitoring centre" },
    { title: "False-alarm fee avoidance", description: "Explain local false-alarm fines and the grace-period rules per market" },
    { title: "Root-cause capture", description: "Capture what actually triggered the alarm so the monitoring team can close the event" },
    { title: "Recurrence prevention", description: "Hand-off to Intrusion sensors or Alarm troubleshooting when the same site keeps false-triggering" },
    { title: "Witness & access log", description: "Record who was on site at the time for the monitoring centre log" },
  ],
  quickActions: ["It was a false alarm", "Cancel the guard", "Will I be fined?", "Why did my alarm trigger?", "Stop this happening again"],
  flow: {
    knowledgeSources: [
      { id: "sec-fa-kb-policy", name: "False-alarm policy", type: "document", icon: "hierarchy-document", description: "Grace periods, fees and dispatch-cancellation rules per market" },
      { id: "sec-fa-kb-event", name: "Active event API", type: "api", icon: "database-connection", description: "Current open alarm events for this site with dispatch state" },
    ],
    guardrails: [
      { id: "sec-fa-gr-stepup", name: "Step-up auth", type: "auth", icon: "lock-security", description: "Cancelling a live response requires account password + alarm-cancel codeword" },
      { id: "sec-fa-gr-safety", name: "Hostage protection", type: "policy", icon: "shield-medal", description: "Duress codes still dispatch — never cancel if duress signal is present" },
    ],
    actionHooks: [
      { id: "sec-fa-ah-cancel", name: "Cancel response", type: "webhook", icon: "close-symbol", description: "Cancels guard / police dispatch after the step-up check" },
      { id: "sec-fa-ah-log", name: "Log cause", type: "webhook", icon: "hierarchy", description: "Attaches customer-reported cause to the event for the monitoring centre" },
    ],
    processes: [
      { id: "sec-fa-pr-prevention", name: "Prevention hand-off", type: "workflow", icon: "route", description: "Routes the conversation into Intrusion sensors / Alarm troubleshooting with the event context" },
    ],
    standardResponses: [
      { id: "sec-fa-sr-cancelled", name: "Response cancelled", type: "confirmation", icon: "check-symbol-check", description: "Confirms the dispatch is cancelled and whether a fee applies" },
      { id: "sec-fa-sr-handed-off", name: "Routed to prevention", type: "informational", icon: "route", description: "Moves the customer into the prevention agent with full context" },
    ],
  },
};

export default agent;

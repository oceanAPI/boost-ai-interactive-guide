import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_alarm_troubleshooting",
  name: "Alarm troubleshooting",
  icon: "refresh-idea",
  automationRate: 72,
  avgResolutionTime: "~2.5 min",
  topTopic: "Low battery warning",
  description: "Diagnose and fix alarm errors, component faults, low-battery warnings, repeated false triggers and failed arming attempts. Merges Sector Alarm's Alarm error, Alarm components and Battery topics.",
  capabilities: [
    { title: "Error-code lookup", description: "Translate alarm system error codes into plain language and a fix path" },
    { title: "Battery diagnostics", description: "Identify which device is flagging low battery and walk through replacement" },
    { title: "Failed-arm diagnosis", description: "Explain why arming failed — open door, tamper, low signal — and how to clear it" },
    { title: "Component self-test", description: "Guide through manual test for each supported device class" },
    { title: "Signal & tamper warnings", description: "Diagnose tamper, signal-loss and supervision-loss alerts per device" },
    { title: "Escalate to technician", description: "When remote fix fails, hand off to Service dispatch with the diagnostics captured" },
  ],
  quickActions: ["Low battery warning", "Why won't it arm?", "Error code E04", "Test a sensor", "Tamper alert", "Book a technician"],
  flow: {
    knowledgeSources: [
      { id: "sec-at-kb-errors", name: "Error-code dictionary", type: "document", icon: "hierarchy-document", description: "Every published error code with likely cause and first-line fix" },
      { id: "sec-at-kb-battery", name: "Battery replacement guide", type: "document", icon: "books", description: "Battery type, lifespan and replacement steps per device model" },
      { id: "sec-at-kb-device", name: "Device health state", type: "api", icon: "database-connection", description: "Real-time battery, signal and supervision state per installed device" },
    ],
    guardrails: [
      { id: "sec-at-gr-safety", name: "Safety-critical block", type: "policy", icon: "shield-medal", description: "Never advise disabling smoke, gas or water sensors as a troubleshooting step" },
      { id: "sec-at-gr-hallucination", name: "Hallucination detection", type: "hallucination", icon: "shield-medal", description: "Fixes must come from the error-code dictionary or the device health API" },
    ],
    actionHooks: [
      { id: "sec-at-ah-self-test", name: "Run self-test", type: "webhook", icon: "target-selection", description: "Triggers a device self-test and reads the result back to the customer" },
      { id: "sec-at-ah-open-ticket", name: "Open service ticket", type: "webhook", icon: "hierarchy", description: "Logs a technician-visit ticket with diagnostic context attached" },
    ],
    processes: [
      { id: "sec-at-pr-battery", name: "Battery replacement flow", type: "workflow", icon: "hierarchy", description: "Identify device → order battery if needed → walk through safe replacement" },
    ],
    standardResponses: [
      { id: "sec-at-sr-resolved", name: "Fix confirmed", type: "confirmation", icon: "check-symbol-check", description: "Confirms the device is reporting healthy again after the fix" },
      { id: "sec-at-sr-tech-booked", name: "Technician booked", type: "confirmation", icon: "check-symbol-check", description: "Confirms the technician visit slot and what to do before arrival" },
    ],
  },
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_intrusion_sensors",
  name: "Intrusion sensors",
  icon: "target-selection",
  automationRate: 74,
  avgResolutionTime: "~2.5 min",
  topTopic: "Motion detector false trigger",
  description: "Motion detectors, glass-break sensors and door / window contact sensors. Placement advice, pet-immune configuration, false-trigger tuning and supervision-loss fixes.",
  capabilities: [
    { title: "Sensor placement advice", description: "Coverage geometry for motion and glass-break sensors, common pitfalls, room-by-room tips" },
    { title: "Pet immunity", description: "Tune sensitivity and ceiling zones so pets below a given weight don't trigger events" },
    { title: "False-trigger triage", description: "Diagnose repeated false triggers — draught, spiders, sunlight, reflections — and fix at source" },
    { title: "Door / window magnet realignment", description: "Walk through gap tolerance and re-seating magnetic contacts" },
    { title: "Supervision-loss fix", description: "Restore sensors that stopped reporting to the hub" },
  ],
  quickActions: ["Motion sensor keeps triggering", "Make it pet-friendly", "Door sensor shows open", "Glass-break false trigger", "Sensor went offline"],
  flow: {
    knowledgeSources: [
      { id: "sec-is-kb-placement", name: "Placement guide", type: "document", icon: "hierarchy-document", description: "Model-specific coverage diagrams and installation best practices" },
      { id: "sec-is-kb-events", name: "Recent trigger log", type: "api", icon: "database-connection", description: "Last 30 days of triggers per sensor with time-of-day pattern" },
    ],
    guardrails: [
      { id: "sec-is-gr-safety", name: "No disarm suggestion", type: "policy", icon: "shield-medal", description: "Never recommend disabling an intrusion sensor as a workaround without a technician-verified cause" },
      { id: "sec-is-gr-hallucination", name: "Hallucination detection", type: "hallucination", icon: "shield-medal", description: "Placement advice must come from the published guide, not improvisation" },
    ],
    actionHooks: [
      { id: "sec-is-ah-sensitivity", name: "Adjust sensitivity", type: "webhook", icon: "design-setting", description: "Applies a sensitivity / pet-immune profile to the named sensor" },
      { id: "sec-is-ah-tech", name: "Escalate to technician", type: "webhook", icon: "route", description: "Hand-off to Service dispatch with trigger-log context" },
    ],
    processes: [
      { id: "sec-is-pr-pattern", name: "Pattern analysis", type: "workflow", icon: "hierarchy", description: "Cross-references trigger timestamps with weather, HVAC and light events to guess root cause" },
    ],
    standardResponses: [
      { id: "sec-is-sr-tuned", name: "Sensor re-tuned", type: "confirmation", icon: "check-symbol-check", description: "Confirms the new profile is active and asks the customer to re-test" },
    ],
  },
};

export default agent;

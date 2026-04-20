import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_emergency_response",
  name: "Emergency response",
  icon: "hand-protection",
  automationRate: 45,
  avgResolutionTime: "~3 min",
  topTopic: "Active break-in",
  description: "Active emergency flows — police / ambulance / fire dispatch paths, safe-room guidance, live-event witness protocol. Always errs toward a human and a dispatched response.",
  capabilities: [
    { title: "Active-event triage", description: "Confirm if there is an active threat and route to the right emergency service" },
    { title: "Safe-room guidance", description: "Short scripted guidance for customers sheltering in place while dispatch is inbound" },
    { title: "Police dispatch explainer", description: "What the customer can expect from the local police response per market" },
    { title: "Ambulance & fire routing", description: "Correct-service routing when the event is medical or fire rather than intrusion" },
    { title: "Witness protocol", description: "What to capture (photos, times, descriptions) for the police report without interfering with the scene" },
  ],
  quickActions: ["There's a break-in now", "I need an ambulance", "Smoke in the building", "I'm sheltering — what now?", "What will the police do?"],
  flow: {
    knowledgeSources: [
      { id: "sec-er-kb-scripts", name: "Emergency scripts", type: "document", icon: "hierarchy-document", description: "Per-market scripted guidance for active intrusion, fire and medical events" },
      { id: "sec-er-kb-services", name: "Emergency services directory", type: "document", icon: "headset", description: "Canonical emergency numbers and Sector Alarm response rules per market" },
    ],
    guardrails: [
      { id: "sec-er-gr-safety-first", name: "Safety-first routing", type: "policy", icon: "shield-medal", description: "Any ambiguous active threat dispatches both live operator and emergency services in parallel" },
      { id: "sec-er-gr-no-advice", name: "No tactical advice", type: "policy", icon: "shield-medal", description: "Does not offer tactical advice beyond the vetted scripted guidance" },
    ],
    actionHooks: [
      { id: "sec-er-ah-dispatch", name: "Flag emergency", type: "webhook", icon: "target-selection", description: "Escalates the event as an active emergency to the centre for immediate dispatch" },
      { id: "sec-er-ah-live", name: "Live operator", type: "transfer", icon: "headset", description: "Bridges the customer to a live operator without wait queue" },
    ],
    processes: [
      { id: "sec-er-pr-shelter", name: "Shelter-in-place flow", type: "workflow", icon: "hierarchy", description: "Short scripted flow: confirm safe spot, silence phone alerts, stay on line" },
    ],
    standardResponses: [
      { id: "sec-er-sr-dispatched", name: "Help is on the way", type: "confirmation", icon: "check-symbol-check", description: "Confirms dispatch with what to do while the response is inbound" },
      { id: "sec-er-sr-human-now", name: "Operator connecting", type: "informational", icon: "headset", description: "Tells the customer a live operator is joining immediately" },
    ],
  },
};

export default agent;

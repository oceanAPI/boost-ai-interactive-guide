import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_flight_status",
  name: "Flight Status & Disruptions",
  icon: "airplane",
  automationRate: 90,
  avgResolutionTime: "~1 min",
  topTopic: "Is my flight on time?",
  description:
    "The universal entry point for any passenger during a trip. Real-time flight status, gate and terminal info, proactive disruption messaging, and rebooking options when things go wrong.",
  capabilities: [
    { title: "Live flight status",         description: "On-time / delayed / cancelled state with gate, terminal, and time details" },
    { title: "Disruption & rebooking",     description: "Present automatic rebooking options when a flight is delayed or cancelled" },
    { title: "EU261 compensation eligibility",description: "Screen passengers for compensation eligibility under EU261 when conditions apply" },
    { title: "Connection risk check",      description: "Assess onward-connection risk when an inbound flight slips" },
    { title: "Aircraft swap / equipment change",description: "Explain and manage downstream impact when an aircraft type changes" },
    { title: "Proactive status subscription",description: "Sign passenger up for SMS / app-push updates on their PNR" },
  ],
  quickActions: ["Flight status", "My flight is delayed", "Rebook me", "EU261 claim", "Connection at risk", "Subscribe to updates"],
  flow: {
    knowledgeSources: [
      { id: "al-fs-kb-ops-api",      name: "Operations Status API",   type: "api",      icon: "computer-api",       description: "Real-time connection to operations data for flight movements and aircraft state" },
      { id: "al-fs-kb-eu261",        name: "EU261 Compensation Rules",type: "document", icon: "hierarchy-document", description: "Regulatory rules for passenger compensation under EU261 including exceptions" },
      { id: "al-fs-kb-reroute",      name: "Rebooking Matrix",         type: "api",      icon: "route",              description: "Live availability across the network for rebooking disrupted passengers" },
    ],
    guardrails: [
      { id: "al-fs-gr-no-overpromise",name: "No Compensation Overpromise",type: "guardrail",icon: "shield-medal", description: "Never commits to EU261 compensation figures above the policy-defined output" },
      { id: "al-fs-gr-pii",          name: "PII Protection",           type: "pii",      icon: "lock-security",      description: "PNR and passenger data protected; lookups require authenticated identity or PNR-plus-surname" },
    ],
    actionHooks: [
      { id: "al-fs-ah-rebook",       name: "Rebook Disrupted Passenger",type: "api",     icon: "refresh-idea",       description: "Executes a rebooking on the best-available alternative within the passenger's fare conditions" },
      { id: "al-fs-ah-subscribe",    name: "Subscribe to Updates",      type: "api",     icon: "finger-tap",         description: "Registers the passenger for proactive push/SMS status updates on their flight" },
    ],
    processes: [
      { id: "al-fs-pr-disruption",   name: "Disruption Handling Flow",  type: "workflow", icon: "hierarchy",          description: "Structured flow that classifies disruption type and routes to the right resolution path" },
      { id: "al-fs-pr-escalate",     name: "Escalate to Duty Manager",  type: "transfer", icon: "headset",            description: "Hand-off to airport duty manager when the disruption exceeds automated rebooking" },
    ],
    standardResponses: [
      { id: "al-fs-sr-on-time",      name: "On Schedule",                type: "standard",icon: "thumbs-up",           description: "Canned confirmation that the flight is on schedule with gate and boarding time" },
      { id: "al-fs-sr-disrupted",    name: "Disruption Acknowledged",    type: "standard",icon: "clock-pass",          description: "Empathetic acknowledgement of disruption with next-step options and compensation path" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

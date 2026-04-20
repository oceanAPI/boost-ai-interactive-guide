import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_ripara_casa",
  name: "Ripara Casa Express",
  icon: "route",
  automationRate: 72,
  avgResolutionTime: "~2 min",
  topTopic: "Book repair (IT)",
  description: "Sector Alarm's Italian home-repair add-on service. Book, track and manage non-security home repairs (plumbing, electrical, small fixes) bundled into the subscription.",
  capabilities: [
    { title: "Eligibility check", description: "Confirm whether the customer's plan includes Ripara Casa Express coverage" },
    { title: "Book a repair", description: "Raise a plumbing / electrical / general-repair job with a verified partner" },
    { title: "Job tracking", description: "Live status of the repair job with technician ETA and contact" },
    { title: "Coverage scope", description: "Explain what is covered vs chargeable vs out of scope, with clear pricing" },
    { title: "Partner complaint", description: "Log a complaint about a partner technician or a completed job" },
  ],
  quickActions: ["Book a plumber", "Is this covered?", "Track my repair", "What does it cost?", "The repair wasn't good"],
  variants: ["security:hybrid"],
  flow: {
    knowledgeSources: [
      { id: "sec-rc-kb-scope", name: "Ripara Casa scope", type: "document", icon: "hierarchy-document", description: "Covered jobs, partner network, pricing and limits per plan" },
      { id: "sec-rc-kb-jobs", name: "Job tracking", type: "api", icon: "database-connection", description: "Open and recent repair jobs for this subscription" },
    ],
    guardrails: [
      { id: "sec-rc-gr-scope", name: "Scope honesty", type: "policy", icon: "shield-medal", description: "Always states whether the job will be chargeable before booking" },
      { id: "sec-rc-gr-market", name: "IT-only guard", type: "policy", icon: "globe", description: "Redirects non-Italian customers to local service offerings" },
    ],
    actionHooks: [
      { id: "sec-rc-ah-book", name: "Book repair job", type: "webhook", icon: "route", description: "Raises the job with the partner network with slot + address" },
      { id: "sec-rc-ah-complaint", name: "Log partner complaint", type: "webhook", icon: "hierarchy", description: "Creates a formal complaint record routed to the partner team" },
    ],
    processes: [
      { id: "sec-rc-pr-triage", name: "Repair triage", type: "workflow", icon: "hierarchy", description: "Short triage flow to classify repair type and route to the best partner" },
    ],
    standardResponses: [
      { id: "sec-rc-sr-booked", name: "Repair booked", type: "confirmation", icon: "check-symbol-check", description: "Confirms slot, technician and any chargeable portion" },
    ],
  },
};

export default agent;

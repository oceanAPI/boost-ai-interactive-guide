import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_service",
  name: "Service",
  icon: "handshake",
  automationRate: 74,
  avgResolutionTime: "~2.5 min",
  topTopic: "Book a technician",
  description: "Technician dispatch — book, reschedule or cancel a visit, track the technician's ETA, install / de-install flows, post-visit follow-up and rating.",
  capabilities: [
    { title: "Book a visit", description: "Find the next available slot for the customer's postal area and reason code" },
    { title: "Reschedule / cancel", description: "Move or cancel an upcoming visit with full no-show fee rules surfaced" },
    { title: "ETA tracking", description: "Live technician ETA on the day of visit with pre-arrival prep reminder" },
    { title: "Install / de-install", description: "Coordinate equipment drop-off, pickup and meter-point requirements" },
    { title: "Post-visit follow-up", description: "Confirm the job was completed to standard and trigger a rating" },
  ],
  quickActions: ["Book a technician", "Where's my technician?", "Reschedule the visit", "Cancel the visit", "Rate the technician"],
  flow: {
    knowledgeSources: [
      { id: "sec-sv-kb-sla", name: "Service SLAs", type: "document", icon: "hierarchy-document", description: "Response-time targets, geo coverage and visit-fee policy per market" },
      { id: "sec-sv-kb-slots", name: "Dispatch scheduler", type: "api", icon: "database-connection", description: "Available slots by postal area, skill group and reason code" },
    ],
    guardrails: [
      { id: "sec-sv-gr-scope", name: "Scope boundary", type: "policy", icon: "shield-medal", description: "Does not commit to SLAs outside the published visit matrix" },
      { id: "sec-sv-gr-access", name: "Access reminder", type: "policy", icon: "lock-security", description: "Reminds the customer about on-site access, pets and parking for the technician" },
    ],
    actionHooks: [
      { id: "sec-sv-ah-book", name: "Book visit", type: "webhook", icon: "route", description: "Creates the visit with reason code, slot and visibility to the technician" },
      { id: "sec-sv-ah-eta", name: "ETA snapshot", type: "webhook", icon: "target-selection", description: "Returns a live ETA once the technician is en-route" },
    ],
    processes: [
      { id: "sec-sv-pr-resched", name: "Reschedule flow", type: "workflow", icon: "hierarchy", description: "Validates rescheduling window, surfaces fees and moves the slot" },
    ],
    standardResponses: [
      { id: "sec-sv-sr-booked", name: "Visit booked", type: "confirmation", icon: "check-symbol-check", description: "Confirms slot, technician name and prep checklist" },
      { id: "sec-sv-sr-en-route", name: "Technician en-route", type: "informational", icon: "route", description: "Shares ETA and a one-tap reschedule option if the window is bad" },
    ],
  },
};

export default agent;

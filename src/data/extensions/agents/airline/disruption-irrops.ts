import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_disruption_irrops",
  name: "Disruption & IRROPS",
  icon: "shield-medal",
  automationRate: 78,
  avgResolutionTime: "~3 min",
  topTopic: "My flight is cancelled",
  description:
    "End-to-end handling of irregular operations — cancellations, long delays, missed connections, weather diversions — including EU261 / DOT eligibility, rebooking, hotel and meal vouchers, and proactive outbound on disruption events.",
  capabilities: [
    { title: "Disruption status & root cause",      description: "Explain why a flight is cancelled or delayed and what the operations team is doing about it" },
    { title: "Eligibility check (EU261 / DOT)",      description: "Determine compensation and care eligibility under the applicable regulation given the cause and duration" },
    { title: "Rebooking on disrupted itinerary",     description: "Offer next available flights, partner-carrier options, and ground-transport alternatives where allowed" },
    { title: "Care vouchers (hotel / meal / transport)",description: "Issue care vouchers per the customer's eligibility and partner-network availability" },
    { title: "Compensation submission",              description: "File a compensation claim with the right evidence and a realistic turnaround expectation" },
    { title: "Proactive disruption outbound",        description: "Push proactive notifications to disrupted passengers with a one-tap rebooking surface" },
  ],
  quickActions: ["Why is my flight delayed?", "Am I owed compensation?", "Rebook me", "Hotel voucher", "Meal voucher", "File a claim"],
  flow: {
    knowledgeSources: [
      { id: "al-di-kb-ops",     name: "Operations Status API",     type: "api",      icon: "computer-api",       description: "Live operations status — cancellations, delays, root cause, rebooking inventory" },
      { id: "al-di-kb-eu261",   name: "EU261 / DOT Rules",         type: "document", icon: "hierarchy-document", description: "Regulatory rule-set for compensation eligibility, care obligations, and exceptions" },
      { id: "al-di-kb-care",    name: "Care-network Inventory",     type: "api",      icon: "computer-api",       description: "Live hotel / meal / transport partner inventory at each affected station" },
    ],
    guardrails: [
      { id: "al-di-gr-no-overpromise",name: "No Compensation Overpromise",type: "guardrail",icon: "shield-medal",description: "Never commits to compensation amounts above the regulator's policy-aligned calculation" },
      { id: "al-di-gr-pii",            name: "Passenger Data Protection",type: "pii",   icon: "lock-security",   description: "Booking and contact data scoped to the authenticated PNR; no cross-PNR leakage" },
    ],
    actionHooks: [
      { id: "al-di-ah-rebook",         name: "Rebook Disrupted PNR",     type: "api",   icon: "refresh-idea",     description: "Posts the rebooking against the customer's PNR and confirms new segments" },
      { id: "al-di-ah-voucher",        name: "Issue Care Voucher",       type: "api",   icon: "money",            description: "Issues a hotel / meal / transport voucher into the partner network with QR delivery" },
    ],
    processes: [
      { id: "al-di-pr-verify",         name: "PNR Verification",         type: "verification",icon: "check-symbol-check",description: "PNR + family-name auth before any rebooking or voucher action" },
      { id: "al-di-pr-escalate",       name: "Duty Manager Escalation",  type: "transfer",icon: "headset",        description: "Priority handoff to the duty manager when the passenger is high-priority or the situation is non-standard" },
    ],
    standardResponses: [
      { id: "al-di-sr-rebooked",       name: "Rebooked",                 type: "standard",icon: "thumbs-up",       description: "Confirms the new itinerary with care-voucher status and next-step checklist" },
      { id: "al-di-sr-fallback",       name: "Specialist Required",      type: "fallback",icon: "route",           description: "Fallback when the disruption needs manual handling outside the policy calculator" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_check_in_boarding",
  name: "Check-in & Boarding",
  icon: "finger-tap",
  automationRate: 93,
  avgResolutionTime: "~1 min",
  topTopic: "Check me in",
  description:
    "Drives online check-in adoption and handles boarding-pass issues. Visa and advance-passenger-information checks, seat confirmation, and gate-change notifications.",
  capabilities: [
    { title: "Online check-in",            description: "Complete check-in within the allowed window and deliver the mobile boarding pass" },
    { title: "Seat confirmation / change",  description: "Confirm or change seat during check-in subject to availability" },
    { title: "Travel-document verification",description: "Collect and verify passport, visa, and APIS data required for the route" },
    { title: "Boarding pass re-issue",      description: "Re-send mobile boarding pass via email, app push, or Apple/Google Wallet" },
    { title: "Gate change & time updates",  description: "Surface gate changes or boarding-time updates the moment they're known" },
    { title: "Late-arrival risk flag",       description: "Warn passenger if they're at risk of missing boarding based on airport location" },
  ],
  quickActions: ["Check in", "My seat", "Travel docs", "Resend boarding pass", "Gate info", "Late?"],
  flow: {
    knowledgeSources: [
      { id: "al-cb-kb-dcs-api",   name: "Departure Control API", type: "api",      icon: "computer-api",       description: "Live DCS connection for check-in actions, boarding-pass generation, and seat assignment" },
      { id: "al-cb-kb-timatic",   name: "Travel Document Rules", type: "api",      icon: "globe",              description: "Timatic / IATA travel-document requirements per passport and destination" },
      { id: "al-cb-kb-wayfind",   name: "Airport Wayfinding",    type: "document", icon: "hierarchy-document", description: "Airport-specific gate maps and transit times to support late-arrival assessments" },
    ],
    guardrails: [
      { id: "al-cb-gr-doc-required",name: "Travel Doc Required",  type: "guardrail",icon: "shield-medal",      description: "Blocks check-in when required travel documents fail validation; explains next steps" },
      { id: "al-cb-gr-pii",         name: "PII Protection",       type: "pii",      icon: "lock-security",     description: "Passport numbers and personal data isolated per data-protection regulation" },
    ],
    actionHooks: [
      { id: "al-cb-ah-check-in",  name: "Perform Check-in",       type: "api",      icon: "finger-tap",        description: "Posts the check-in to the DCS and returns the mobile boarding pass" },
      { id: "al-cb-ah-resend-bp", name: "Resend Boarding Pass",    type: "api",      icon: "phone",             description: "Resends the boarding pass via the passenger's preferred channel" },
    ],
    processes: [
      { id: "al-cb-pr-doc-capture",name: "Doc Data Capture",      type: "workflow", icon: "hierarchy",         description: "Guided passport / visa data capture for regulated routes" },
      { id: "al-cb-pr-escalate",   name: "Escalate to Airport",   type: "transfer", icon: "headset",           description: "Hand-off to airport counter when document issues block check-in" },
    ],
    standardResponses: [
      { id: "al-cb-sr-checked-in",name: "Checked In",              type: "standard", icon: "thumbs-up",         description: "Confirms check-in with seat, gate, boarding time, and mobile-BP delivery" },
      { id: "al-cb-sr-fallback",  name: "Check-in Blocked",        type: "fallback", icon: "route",             description: "Graceful fallback when regulatory or operational constraints block self-serve check-in" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

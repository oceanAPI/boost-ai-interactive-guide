import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_groups_corporate",
  name: "Groups & Corporate",
  icon: "users",
  automationRate: 72,
  avgResolutionTime: "~4 min",
  topTopic: "Book for a group of 10+",
  description:
    "Group bookings (10+ passengers), corporate-deal travellers, and meetings / incentives / conferences / events (MICE). Routes corporate IDs and group enquiries into the right specialist or self-serve flow.",
  capabilities: [
    { title: "Group quote request",          description: "Capture group details (size, dates, origin/destination) and route to the groups desk with a structured handover" },
    { title: "Corporate-fare lookup",         description: "Apply a corporate ID to a booking and verify the right negotiated fare is in use" },
    { title: "MICE event routing",            description: "Triage a meetings / events enquiry to the right specialist with the right SLA" },
    { title: "Group-PNR servicing",            description: "Service an existing group PNR — name list, ticketing deadlines, payment terms" },
    { title: "Corporate-self-service portal", description: "Sign-post the corporate self-service portal for travel managers and bookers" },
  ],
  quickActions: ["Group quote", "Corporate fare", "MICE event", "Service group PNR", "Corporate portal"],
  flow: {
    knowledgeSources: [
      { id: "al-gc-kb-groups-api",name: "Groups Quoting API",    type: "api",      icon: "computer-api",       description: "Groups platform for quote-creation, name-list management, and ticketing-deadline tracking" },
      { id: "al-gc-kb-corp",      name: "Corporate Deal Library",type: "document", icon: "hierarchy-document", description: "Corporate-deal directory with fare-discount levels and policy details per account" },
    ],
    guardrails: [
      { id: "al-gc-gr-corp-only", name: "Corporate-ID Verification",type: "guardrail",icon: "shield-medal",      description: "Corporate fares only quoted with verified corporate-ID + traveller eligibility match" },
    ],
    actionHooks: [
      { id: "al-gc-ah-quote",     name: "Submit Group Quote",    type: "api",      icon: "finger-tap",         description: "Submits a structured group quote into the groups queue with reference and SLA" },
      { id: "al-gc-ah-route",     name: "Specialist Handoff",    type: "transfer", icon: "headset",            description: "Routes to the right specialist (groups / corporate / MICE) based on enquiry shape" },
    ],
    processes: [
      { id: "al-gc-pr-verify",    name: "Corporate ID Verification",type: "verification",icon: "check-symbol-check",description: "Verifies corporate-ID and traveller-eligibility before applying corporate-fare quotes" },
    ],
    standardResponses: [
      { id: "al-gc-sr-routed",    name: "Quote Routed",          type: "standard",icon: "thumbs-up",           description: "Confirms the quote is routed with reference number and expected response time" },
      { id: "al-gc-sr-fallback",  name: "Manual Assistance",     type: "fallback",icon: "route",               description: "Fallback to manual handling for non-standard group / corporate cases" },
    ],
  },
  variants: ["airline:scheduled"],
  tier: "primary",
};

export default agent;

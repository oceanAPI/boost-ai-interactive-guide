import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_baggage",
  name: "Baggage",
  icon: "hand-to-hand",
  automationRate: 81,
  avgResolutionTime: "~2.5 min",
  topTopic: "My bag is missing",
  description:
    "Allowances, pre-purchases, and the full mishandled-bag journey. Handles declarations, tracking via world-tracer, compensation, and damage claims.",
  capabilities: [
    { title: "Allowance lookup",            description: "Show free allowance, dimensions, and weight limits for the fare and route" },
    { title: "Pre-purchase extra bags",     description: "Buy extra checked-bag allowance online (cheaper than airport)" },
    { title: "Mishandled-bag report",       description: "File a delayed / lost / damaged bag report with reference and tracking" },
    { title: "World-tracer status",          description: "Check the live WorldTracer status for a reported bag" },
    { title: "Compensation & delivery",     description: "Process interim-expense compensation and bag-delivery arrangements" },
    { title: "Damage claim submission",     description: "Submit a damage claim with evidence collection and policy-compliant compensation" },
  ],
  quickActions: ["Allowance", "Buy extra bag", "Report missing bag", "Bag status", "Compensation", "Damage claim"],
  flow: {
    knowledgeSources: [
      { id: "al-bg-kb-allowance", name: "Allowance Rules",       type: "document", icon: "hierarchy-document", description: "Fare-specific and route-specific baggage allowance rules" },
      { id: "al-bg-kb-wtracer",   name: "WorldTracer Status",     type: "api",      icon: "computer-api",       description: "Live WorldTracer connection for mishandled-bag state and location" },
      { id: "al-bg-kb-comp",      name: "Compensation Policy",    type: "document", icon: "hierarchy-document", description: "Interim-expense and compensation rules per jurisdiction and bag state" },
    ],
    guardrails: [
      { id: "al-bg-gr-no-overpromise",name: "No Compensation Overpromise",type: "guardrail",icon: "shield-medal", description: "Compensation figures never exceed policy outputs; high-value claims escalated" },
      { id: "al-bg-gr-pii",       name: "PII Protection",          type: "pii",     icon: "lock-security",        description: "Address and flight data scoped to the authenticated passenger" },
    ],
    actionHooks: [
      { id: "al-bg-ah-file-pir",  name: "File PIR Report",         type: "api",     icon: "finger-tap",           description: "Creates a Property Irregularity Report and returns a reference number" },
      { id: "al-bg-ah-pre-buy",   name: "Buy Extra Bag",            type: "api",     icon: "money",                description: "Posts an ancillary purchase for extra baggage allowance" },
    ],
    processes: [
      { id: "al-bg-pr-evidence",  name: "Evidence Collection",      type: "workflow",icon: "hierarchy-document",   description: "Structured evidence collection for damaged or missing-content claims" },
      { id: "al-bg-pr-escalate",  name: "Escalate to Baggage Office",type: "transfer",icon: "headset",              description: "Hand-off to airport baggage office for complex cases" },
    ],
    standardResponses: [
      { id: "al-bg-sr-filed",     name: "Report Filed",             type: "standard",icon: "thumbs-up",            description: "Formatted confirmation of the PIR with reference number and next-step timing" },
      { id: "al-bg-sr-fallback",  name: "Escalation Needed",        type: "fallback",icon: "route",                description: "Graceful fallback when the case exceeds automated handling" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

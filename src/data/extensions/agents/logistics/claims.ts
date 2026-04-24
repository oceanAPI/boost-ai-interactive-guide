import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "lg_claims",
  name: "Claims & Missing Parcels",
  icon: "hand-protection",
  automationRate: 72,
  avgResolutionTime: "~4 min",
  topTopic: "My parcel is missing",
  description:
    "The highest-friction logistics journey. Handles missing, damaged, and wrong-delivery claims with structured evidence collection, compensation rules, and tight SLA tracking.",
  capabilities: [
    { title: "Eligibility screen",          description: "Check whether the parcel state qualifies for a claim and which claim type fits" },
    { title: "Evidence collection",         description: "Guide the claimant through photo, receipt, and description uploads with format rules" },
    { title: "Compensation calculator",     description: "Estimate compensation based on declared value, service type, and policy rules" },
    { title: "Claim-status lookup",          description: "Return the current state of an open claim with expected next step" },
    { title: "Cross-border claim handling",  description: "Coordinate claim handoffs when the parcel crossed operator borders" },
    { title: "Lost-parcel investigation kick-off",description: "Initiate the internal search-and-trace process with depot notifications" },
  ],
  quickActions: ["File a claim", "Upload evidence", "Claim status", "Expected compensation", "Cross-border claim", "Escalate"],
  flow: {
    knowledgeSources: [
      { id: "lg-cl-kb-policy",      name: "Claims Policy Docs",      type: "document", icon: "hierarchy-document", description: "Authoritative claim eligibility, evidence, and compensation rules by service and geography" },
      { id: "lg-cl-kb-claim-api",   name: "Claims System API",       type: "api",      icon: "computer-api",       description: "Live connection to the internal claims platform for submission, status, and updates" },
      { id: "lg-cl-kb-parcel-state",name: "Parcel State Service",    type: "api",      icon: "computer-api",       description: "Cross-reference against the Tracking agent for corroborating state data" },
    ],
    guardrails: [
      { id: "lg-cl-gr-no-overpromise", name: "No Compensation Overpromise", type: "guardrail",icon: "shield-medal", description: "Never commits to a compensation figure above the policy-defined calculator output" },
      { id: "lg-cl-gr-pii",         name: "PII Protection",          type: "pii",      icon: "lock-security",      description: "Personal data on claimant and sender isolated per regulation" },
    ],
    actionHooks: [
      { id: "lg-cl-ah-submit",      name: "Submit Claim",            type: "api",      icon: "finger-tap",         description: "Posts the fully-populated claim into the claims platform with reference number returned" },
      { id: "lg-cl-ah-evidence",    name: "Attach Evidence",          type: "form",     icon: "hierarchy-document",description: "Uploads photos, receipts, and supporting documents to an open claim" },
    ],
    processes: [
      { id: "lg-cl-pr-search",      name: "Search-and-Trace Kick-off",type: "workflow", icon: "route",              description: "Triggers the depot investigation process when a parcel is flagged missing" },
      { id: "lg-cl-pr-escalate",    name: "Specialist Escalation",    type: "transfer", icon: "headset",            description: "Routes complex / high-value claims to a specialist handler" },
    ],
    standardResponses: [
      { id: "lg-cl-sr-claim-filed", name: "Claim Filed",              type: "standard", icon: "thumbs-up",          description: "Formatted claim-acknowledgement with reference, next step, and expected turnaround" },
      { id: "lg-cl-sr-fallback",    name: "Specialist Review Needed", type: "fallback", icon: "route",              description: "Graceful fallback when the claim exceeds automated handling boundaries" },
    ],
  },
  tier: "primary",
};

export default agent;

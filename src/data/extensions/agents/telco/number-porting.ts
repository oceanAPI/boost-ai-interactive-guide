import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_number_porting",
  name: "Number Porting",
  icon: "transfer",
  automationRate: 82,
  avgResolutionTime: "~2.5 min",
  topTopic: "Keep my number",
  description:
    "Manages mobile-number portability both directions — porting in from another operator or porting out. Covers eligibility, expected cutover windows, and status lookups.",
  capabilities: [
    { title: "Port-in eligibility check",  description: "Verify whether a number from a donor operator can be ported, and what's needed" },
    { title: "Port-in initiation",         description: "Kick off the port-in with the required authorisations and document collection" },
    { title: "Port status lookup",         description: "Return the real-time state of an active port and the expected cutover time" },
  ],
  quickActions: ["Port my number in", "Port status", "Porting out", "Eligibility check"],
  flow: {
    knowledgeSources: [
      { id: "tc-np-kb-port-api",  name: "Porting API",          type: "api",      icon: "computer-api",       description: "Live portability-clearinghouse API used to submit and track port requests" },
      { id: "tc-np-kb-rules",     name: "Porting Rulebook",     type: "document", icon: "hierarchy-document", description: "Country-specific regulatory rules and operator-donor constraints" },
    ],
    guardrails: [
      { id: "tc-np-gr-consent",   name: "Explicit Consent Gate",type: "guardrail", icon: "shield-medal",      description: "Requires captured consent before initiating any port — audit-trail logged" },
    ],
    actionHooks: [
      { id: "tc-np-ah-initiate",  name: "Initiate Port",        type: "api",       icon: "finger-tap",        description: "Submits the port request to the clearinghouse with all required fields" },
    ],
    processes: [
      { id: "tc-np-pr-verify",    name: "Identity & Ownership Verification",type: "verification",icon: "check-symbol-check",description: "Strong-auth of the current number owner before initiating a port" },
    ],
    standardResponses: [
      { id: "tc-np-sr-initiated", name: "Port Initiated",       type: "standard",  icon: "thumbs-up",         description: "Confirms the port request is submitted with expected cutover window" },
      { id: "tc-np-sr-fallback",  name: "Manual Specialist Handoff",type: "fallback",icon: "headset",         description: "Graceful fallback when the donor-operator flow requires manual handling" },
    ],
  },
  tier: "addon",
};

export default agent;

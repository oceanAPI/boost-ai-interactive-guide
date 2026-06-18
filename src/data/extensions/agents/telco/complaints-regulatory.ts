import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_complaints_regulatory",
  name: "Complaints & Regulatory",
  icon: "balance",
  automationRate: 70,
  avgResolutionTime: "~3 min",
  topTopic: "I want to complain",
  description:
    "Structured complaint handling and regulatory escalation — internal complaint file, SLA-breach compensation per policy, and clear signposting to the national telecom ombudsman (e.g. Teleankenævnet in DK) when internal resolution is exhausted.",
  capabilities: [
    { title: "File a structured complaint", description: "Capture and submit a formal complaint into the internal tracking system with category and reference" },
    { title: "SLA-breach compensation",     description: "Calculate and pay out policy-defined compensation for SLA breaches" },
    { title: "Ombudsman signposting",        description: "Point to the national telecom ombudsman with eligibility explained once internal steps are exhausted" },
    { title: "Complaint status lookup",       description: "Return the current state of an open complaint with expected next step" },
  ],
  quickActions: ["File complaint", "SLA compensation", "Ombudsman info", "Complaint status"],
  flow: {
    knowledgeSources: [
      { id: "tc-cr-kb-complaints-api",name: "Complaints System API",type: "api",      icon: "computer-api",       description: "Live connection to the internal complaints platform for filing, tracking, and closure" },
      { id: "tc-cr-kb-regulatory",    name: "Regulatory Guide",     type: "document", icon: "hierarchy-document", description: "National regulator and ombudsman process map, including timelines and cost" },
    ],
    guardrails: [
      { id: "tc-cr-gr-no-overpromise", name: "No Compensation Overpromise",type: "guardrail",icon: "shield-medal",description: "Never commits to compensation figures above the policy-defined calculator output" },
    ],
    actionHooks: [
      { id: "tc-cr-ah-file",           name: "Submit Complaint",    type: "api",      icon: "finger-tap",         description: "Files the structured complaint and returns a reference number with expected turnaround" },
    ],
    processes: [
      { id: "tc-cr-pr-specialist",     name: "Specialist Escalation",type: "transfer", icon: "headset",            description: "Routes to a specialist handler for complex or high-value complaints beyond automated handling" },
    ],
    standardResponses: [
      { id: "tc-cr-sr-received",       name: "Complaint Received",   type: "standard",icon: "thumbs-up",           description: "Acknowledges receipt with reference, expected turnaround, and escalation path" },
      { id: "tc-cr-sr-fallback",       name: "Manual Review Needed", type: "fallback",icon: "route",               description: "Fallback routing when the complaint needs manual investigation" },
    ],
  },
  tier: "addon",
};

export default agent;

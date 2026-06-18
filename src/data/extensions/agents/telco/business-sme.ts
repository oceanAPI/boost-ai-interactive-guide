import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_business_sme",
  name: "Business & SME",
  icon: "building-institution",
  automationRate: 76,
  avgResolutionTime: "~3 min",
  topTopic: "Business account help",
  description:
    "Dedicated surface for SME and business accounts — multi-line admin, corporate billing portal, employee line management, and contract-level queries that don't fit consumer flows.",
  capabilities: [
    { title: "Multi-line admin",          description: "Provision, suspend, or reassign subscriptions across a company's employee lines" },
    { title: "Corporate billing portal",  description: "Support invoicing, VAT, reference-based billing, and month-end reconciliation" },
    { title: "Contract-level queries",     description: "Answer questions on framework contracts, SLAs, and renewal timing" },
    { title: "Business tech support routing",description: "Route technical issues to the business support queue with priority SLA tracking" },
  ],
  quickActions: ["Add an employee line", "Business invoice question", "SLA status", "Contract renewal", "Business tech support"],
  flow: {
    knowledgeSources: [
      { id: "tc-bs-kb-b2b-admin",name: "B2B Admin API",           type: "api",      icon: "computer-api",       description: "Corporate-admin API for multi-line operations, policy sets, and employee provisioning" },
      { id: "tc-bs-kb-contract", name: "Contract Library",        type: "document", icon: "hierarchy-document", description: "Framework-contract summaries per customer — SLA tiers, renewal dates, custom pricing" },
    ],
    guardrails: [
      { id: "tc-bs-gr-admin-only",name: "Admin-only Actions",     type: "guardrail",icon: "shield-medal",      description: "Mutations gated to verified admin users on the corporate account; employee-level calls are read-only" },
    ],
    actionHooks: [
      { id: "tc-bs-ah-provision", name: "Provision Employee Line",type: "api",      icon: "user-plus",          description: "Provisions a new employee subscription against the company's policy and billing set" },
      { id: "tc-bs-ah-escalate",  name: "Priority Business Escalation",type: "transfer",icon: "headset",        description: "Priority transfer to the business service desk with SLA context attached" },
    ],
    processes: [
      { id: "tc-bs-pr-verify-admin",name: "Admin-role Verification",type: "verification",icon: "check-symbol-check",description: "Confirms the caller holds admin role on the corporate account before any mutation" },
    ],
    standardResponses: [
      { id: "tc-bs-sr-confirm",   name: "Change Confirmed",        type: "standard",icon: "thumbs-up",           description: "Confirms the multi-line change with policy context and next billing-cycle impact" },
      { id: "tc-bs-sr-fallback",  name: "Account-manager Handoff", type: "fallback",icon: "route",               description: "Fallback routing to the named account manager when the query is contract-strategic" },
    ],
  },
  variants: ["telco:b2b"],
  tier: "addon",
};

export default agent;

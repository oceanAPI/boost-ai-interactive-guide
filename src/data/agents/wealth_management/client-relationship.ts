import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_client_relationship",
  name: "Client relationship",
  icon: "users",
  automationRate: 72,
  avgResolutionTime: "~2 min",
  topTopic: "Speak to my wealth manager",
  description: "Private-banker and wealth-manager routing, portfolio-level oversight, scheduled reviews, and sensitive-case escalation for HNWI and mass-affluent clients.",
  capabilities: [
    { title: "Wealth manager routing", description: "Identifies the client's assigned wealth manager and initiates warm-handover with conversation context" },
    { title: "Review & planning cadence", description: "Books quarterly portfolio reviews, annual planning sessions, and ad-hoc strategy calls against the WM's calendar" },
    { title: "Household-level overview", description: "Summarises positions across every account, trust, and legal entity within the household relationship" },
    { title: "Discreet escalation", description: "Routes sensitive matters (divorce, succession, liquidity event, bereavement) to family-office specialists or trust counsel" },
    { title: "Contact & discretion preferences", description: "Captures preferred channel, language, family-office contacts, and strict confidentiality rules" },
    { title: "Service-tier entitlements", description: "Enforces tier-based service levels (Private, Ultra-HNW, Family Office) with SLA tracking" },
  ],
  quickActions: ["Call my WM", "Book review", "Household view", "Escalate matter", "Change contact", "Tier entitlements"],
  flow: {
    knowledgeSources: [
      { id: "wcr-kb-relationship", name: "Household Registry", type: "database", icon: "database-connection", description: "WM assignments, client tiers, household composition across entities" },
      { id: "wcr-kb-calendar", name: "WM Calendar API", type: "api", icon: "computer-api", description: "Real-time availability and booking slots across the wealth-management desk" },
      { id: "wcr-kb-policies", name: "Service Tier Policies", type: "document", icon: "hierarchy-document", description: "Private / UHNW / Family Office tier definitions, SLA commitments, escalation matrix" },
    ],
    guardrails: [
      { id: "wcr-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Verifies signatory authority against household signing matrix before disclosing positions" },
      { id: "wcr-gr-segregation", name: "Information Walls", type: "compliance", icon: "shield-medal", description: "Enforces information barriers between advisory and brokerage / M&A desk data" },
    ],
    actionHooks: [
      { id: "wcr-ah-warm-handover", name: "Warm Handover to WM", type: "transfer", icon: "headset", description: "Connects the client to their wealth manager with context pre-loaded" },
      { id: "wcr-ah-book-meeting", name: "Book Review", type: "webhook", icon: "target-selection", description: "Creates a calendar invite on the WM's calendar with household-level agenda" },
      { id: "wcr-ah-escalate", name: "Escalate to Specialist", type: "transfer", icon: "route", description: "Routes to trust counsel, tax specialist, estate planner, or family-office lead" },
    ],
    processes: [
      { id: "wcr-pr-review-prep", name: "Review Preparation", type: "workflow", icon: "cogs", description: "Assembles positions, performance, allocation drift, and talking points ahead of a review" },
      { id: "wcr-pr-escalation", name: "Escalation Routing", type: "workflow", icon: "hierarchy", description: "Applies escalation matrix based on matter sensitivity and household tier" },
    ],
    standardResponses: [
      { id: "wcr-sr-booked", name: "Review Booked", type: "confirmation", icon: "thumbs-up", description: "Confirms review booking with time, participants, and agenda" },
      { id: "wcr-sr-escalated", name: "Matter Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms escalation with reference and specialist assignment" },
    ],
  },
  tier: "primary",
};

export default agent;

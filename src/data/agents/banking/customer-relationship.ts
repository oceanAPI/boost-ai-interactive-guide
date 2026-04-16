import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_customer_relationship",
  name: "Customer relationship",
  icon: "users",
  automationRate: 82,
  avgResolutionTime: "~2 min",
  topTopic: "Speak to my relationship manager",
  description: "Relationship-manager routing, account oversight, scheduled reviews, and escalations for corporate and private banking clients.",
  capabilities: [
    { title: "Relationship manager routing", description: "Identifies the correct RM and routes warm-handover conversations with full context" },
    { title: "Account review booking", description: "Schedules quarterly and annual account reviews against the RM's calendar" },
    { title: "Portfolio-level oversight", description: "Summarises all accounts and facilities across the relationship for quick status" },
    { title: "Escalation handling", description: "Routes complex or sensitive issues to RM, credit committee, or specialist teams" },
    { title: "Contact preferences", description: "Captures and honours preferred channel, language, and out-of-office rules per client" },
    { title: "Service level commitments", description: "Tracks SLA adherence against contractual response times and flags at-risk items" },
  ],
  quickActions: ["Call my RM", "Book review", "Account overview", "Escalate issue", "Change contact", "SLA status"],
  flow: {
    knowledgeSources: [
      { id: "bcr-kb-relationship", name: "Relationship Registry", type: "database", icon: "database-connection", description: "RM assignments, client tiers, portfolio composition" },
      { id: "bcr-kb-calendar", name: "RM Calendar API", type: "api", icon: "computer-api", description: "Real-time availability and booking slots for relationship managers" },
      { id: "bcr-kb-policies", name: "Service Policies", type: "document", icon: "hierarchy-document", description: "Service tier definitions, SLA commitments, escalation paths" },
    ],
    guardrails: [
      { id: "bcr-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Verifies corporate signatory authority before disclosing portfolio data" },
      { id: "bcr-gr-segregation", name: "Information Segregation", type: "compliance", icon: "shield-medal", description: "Enforces Chinese walls between corporate and investment-banking data" },
    ],
    actionHooks: [
      { id: "bcr-ah-warm-handover", name: "Warm Handover to RM", type: "transfer", icon: "headset", description: "Connects the client to their RM with conversation context pre-loaded" },
      { id: "bcr-ah-book-meeting", name: "Book Meeting", type: "webhook", icon: "target-selection", description: "Creates a calendar invite on the RM's calendar with agenda" },
      { id: "bcr-ah-escalate", name: "Escalate to Specialist", type: "transfer", icon: "route", description: "Routes to credit committee, trade finance, or FX specialists" },
    ],
    processes: [
      { id: "bcr-pr-review-prep", name: "Review Preparation", type: "workflow", icon: "cogs", description: "Assembles account summary, recent activity, and talking points ahead of a review" },
      { id: "bcr-pr-escalation", name: "Escalation Routing", type: "workflow", icon: "hierarchy", description: "Applies escalation matrix based on issue type and client tier" },
    ],
    standardResponses: [
      { id: "bcr-sr-booked", name: "Review Booked", type: "confirmation", icon: "thumbs-up", description: "Confirms review booking with time, participants, and agenda" },
      { id: "bcr-sr-escalated", name: "Escalation Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms escalation with ticket reference and expected response time" },
    ],
  },
  tier: "primary",
  // Relationship banking is a corporate + private wealth concept; retail/neobank are self-serve.
  variants: ["banking:corporate", "banking:private"],
};

export default agent;

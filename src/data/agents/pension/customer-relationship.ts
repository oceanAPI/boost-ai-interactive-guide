import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_customer_relationship",
  name: "Customer relationship",
  icon: "users",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "Speak to my pensions advisor",
  description: "Advisor routing, scheme oversight, scheduled reviews, and escalation paths for members across workplace, personal, and occupational pensions.",
  capabilities: [
    { title: "Advisor routing", description: "Identifies the member's assigned pensions advisor and routes warm-handover conversations with full context" },
    { title: "Annual review booking", description: "Schedules annual pension reviews against the advisor's calendar with scheme summary pre-loaded" },
    { title: "Scheme-level oversight", description: "Summarises all pension pots across the member relationship for quick status and projected retirement income" },
    { title: "Escalation handling", description: "Routes complex cases (divorce, bereavement, ill-health early retirement) to specialist advisors or the scheme trustee" },
    { title: "Contact preferences", description: "Captures preferred channel, language, and quiet-hours rules per member" },
    { title: "SLA commitments", description: "Tracks regulatory response-time commitments (transfers, statements, complaints) and flags at-risk items" },
  ],
  quickActions: ["Call my advisor", "Book review", "Scheme overview", "Escalate case", "Change contact", "SLA status"],
  flow: {
    knowledgeSources: [
      { id: "pcr-kb-relationship", name: "Advisor Registry", type: "database", icon: "database-connection", description: "Advisor assignments, member tiers, scheme composition" },
      { id: "pcr-kb-calendar", name: "Advisor Calendar API", type: "api", icon: "computer-api", description: "Real-time availability and booking slots for pensions advisors" },
      { id: "pcr-kb-policies", name: "Service Policies", type: "document", icon: "hierarchy-document", description: "Service tier definitions, SLA commitments, escalation paths" },
    ],
    guardrails: [
      { id: "pcr-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Verifies member identity before disclosing scheme or contribution data" },
      { id: "pcr-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised pension advice from the agent — routes to licensed advisor" },
    ],
    actionHooks: [
      { id: "pcr-ah-warm-handover", name: "Warm Handover to Advisor", type: "transfer", icon: "headset", description: "Connects the member to their advisor with conversation context pre-loaded" },
      { id: "pcr-ah-book-meeting", name: "Book Meeting", type: "webhook", icon: "target-selection", description: "Creates a calendar invite on the advisor's calendar with scheme agenda" },
      { id: "pcr-ah-escalate", name: "Escalate to Specialist", type: "transfer", icon: "route", description: "Routes to bereavement, divorce, or ill-health specialists" },
    ],
    processes: [
      { id: "pcr-pr-review-prep", name: "Review Preparation", type: "workflow", icon: "cogs", description: "Assembles scheme summary, projection, and talking points ahead of a review" },
      { id: "pcr-pr-escalation", name: "Escalation Routing", type: "workflow", icon: "hierarchy", description: "Applies escalation matrix based on case type and member tier" },
    ],
    standardResponses: [
      { id: "pcr-sr-booked", name: "Review Booked", type: "confirmation", icon: "thumbs-up", description: "Confirms review booking with time, participants, and agenda" },
      { id: "pcr-sr-escalated", name: "Escalation Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms escalation with case reference and expected response time" },
    ],
  },
  tier: "primary",
};

export default agent;

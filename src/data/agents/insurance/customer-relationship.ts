import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "insurance_customer_relationship",
  name: "Customer relationship",
  icon: "users",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "Speak to my broker",
  description: "Broker and dedicated-advisor routing, policy-portfolio oversight, scheduled renewals, and warm escalation for multi-policy households and SME clients.",
  capabilities: [
    { title: "Broker / advisor routing", description: "Identifies the customer's assigned broker or dedicated advisor and routes warm-handover with policy context" },
    { title: "Renewal & review cadence", description: "Schedules policy renewals, annual reviews, and life-event check-ins against the advisor's calendar" },
    { title: "Portfolio-level overview", description: "Summarises every policy across the household or business in one view — coverage gaps, renewal dates, claims history" },
    { title: "Life-event escalation", description: "Routes major life events (new home, new baby, starting a business, divorce) to advisor for coverage re-planning" },
    { title: "Contact preferences", description: "Captures preferred channel, language, and out-of-office rules per customer" },
    { title: "SLA commitments", description: "Tracks regulatory response-time commitments (quote, claim ack, renewal notice) and flags at-risk items" },
  ],
  quickActions: ["Call my broker", "Book renewal", "Portfolio view", "Life event", "Change contact", "SLA status"],
  flow: {
    knowledgeSources: [
      { id: "icr-kb-relationship", name: "Advisor Registry", type: "database", icon: "database-connection", description: "Broker / advisor assignments, customer tiers, household composition" },
      { id: "icr-kb-calendar", name: "Advisor Calendar API", type: "api", icon: "computer-api", description: "Real-time availability and booking slots for brokers and dedicated advisors" },
      { id: "icr-kb-policies", name: "Policy Registry", type: "api", icon: "computer-api", description: "Every policy across the household or business with renewal dates and claims history" },
    ],
    guardrails: [
      { id: "icr-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Verifies policyholder identity before disclosing portfolio data" },
      { id: "icr-gr-consent", name: "Data-sharing Consent", type: "compliance", icon: "shield-medal", description: "Enforces named-insured vs broker data-sharing consent before full portfolio disclosure" },
    ],
    actionHooks: [
      { id: "icr-ah-warm-handover", name: "Warm Handover to Advisor", type: "transfer", icon: "headset", description: "Connects the customer to their broker or advisor with policy context pre-loaded" },
      { id: "icr-ah-book-meeting", name: "Book Review", type: "webhook", icon: "target-selection", description: "Creates a calendar invite on the advisor's calendar with renewal agenda" },
      { id: "icr-ah-escalate", name: "Escalate to Specialist", type: "transfer", icon: "route", description: "Routes to underwriting, claims, or retention specialists for complex cases" },
    ],
    processes: [
      { id: "icr-pr-review-prep", name: "Review Preparation", type: "workflow", icon: "cogs", description: "Assembles policy summary, coverage gaps, and talking points ahead of a review" },
      { id: "icr-pr-life-event", name: "Life-event Routing", type: "workflow", icon: "hierarchy", description: "Applies routing matrix based on life-event type and household composition" },
    ],
    standardResponses: [
      { id: "icr-sr-booked", name: "Review Booked", type: "confirmation", icon: "thumbs-up", description: "Confirms review booking with time, participants, and agenda" },
      { id: "icr-sr-escalated", name: "Escalation Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms escalation with reference and specialist assignment" },
    ],
  },
  tier: "primary",
};

export default agent;

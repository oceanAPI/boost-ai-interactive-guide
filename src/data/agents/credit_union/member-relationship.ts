import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_member_relationship",
  name: "Member relationship",
  icon: "users",
  automationRate: 80,
  avgResolutionTime: "~2 min",
  topTopic: "Who is my local branch manager?",
  description: "Local-branch and loan-officer routing, household-level overview, scheduled check-ins, and warm escalation — the relationship muscle that makes a credit union feel different from a bank.",
  capabilities: [
    { title: "Branch & officer routing", description: "Identifies the member's home branch and assigned loan officer and routes warm-handover conversations" },
    { title: "Annual check-in booking", description: "Schedules the annual member check-in against branch staff calendars with product-usage summary pre-loaded" },
    { title: "Household overview", description: "Summarises all products across the household's shared membership (joint accounts, co-signed loans, custodial)" },
    { title: "Financial counselling routing", description: "Routes members in hardship to certified credit-counsellors or the financial-wellness team" },
    { title: "Contact & language preferences", description: "Captures preferred channel, language, and accessibility needs per member" },
    { title: "Member-advocate escalation", description: "Surfaces member-advocate / ombudsman contact for unresolved service matters" },
  ],
  quickActions: ["Call my officer", "Book check-in", "Household view", "Counselling help", "Change contact", "Member advocate"],
  flow: {
    knowledgeSources: [
      { id: "cmr-kb-relationship", name: "Member Registry", type: "database", icon: "database-connection", description: "Branch assignment, household composition, product holdings, and tenure" },
      { id: "cmr-kb-calendar", name: "Branch Calendar API", type: "api", icon: "computer-api", description: "Real-time availability and booking slots across branches and loan officers" },
      { id: "cmr-kb-counselling", name: "Counselling Partner Directory", type: "document", icon: "hierarchy-document", description: "Certified credit-counsellor contacts, financial-wellness partners, and hardship pathways" },
    ],
    guardrails: [
      { id: "cmr-gr-auth", name: "Member Authentication", type: "compliance", icon: "lock-security", description: "Verifies member identity before disclosing household or product detail" },
      { id: "cmr-gr-hardship-tone", name: "Hardship Tone", type: "tone", icon: "heart", description: "Flags hardship cases and softens language; defaults to warm-handover over self-serve" },
    ],
    actionHooks: [
      { id: "cmr-ah-warm-handover", name: "Warm Handover to Officer", type: "transfer", icon: "headset", description: "Connects the member to their loan officer or branch manager with context pre-loaded" },
      { id: "cmr-ah-book-checkin", name: "Book Check-in", type: "webhook", icon: "target-selection", description: "Creates a calendar invite on the staff member's calendar with member agenda" },
      { id: "cmr-ah-counselling", name: "Route to Counsellor", type: "transfer", icon: "route", description: "Warm handover to certified credit-counsellor partner" },
    ],
    processes: [
      { id: "cmr-pr-checkin-prep", name: "Check-in Preparation", type: "workflow", icon: "cogs", description: "Assembles household view, recent activity, and relevant offers ahead of a check-in" },
      { id: "cmr-pr-hardship-routing", name: "Hardship Routing", type: "workflow", icon: "hierarchy", description: "Applies hardship pathways and counsellor routing based on severity signals" },
    ],
    standardResponses: [
      { id: "cmr-sr-booked", name: "Check-in Booked", type: "confirmation", icon: "thumbs-up", description: "Confirms check-in booking with branch, time, and agenda" },
      { id: "cmr-sr-handover", name: "Connected to Officer", type: "confirmation", icon: "check-symbol-check", description: "Confirms warm handover with officer's name and direct line" },
    ],
  },
  tier: "primary",
};

export default agent;

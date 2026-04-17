import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_advisory",
  name: "Advisory & Planning",
  icon: "bar-chart",
  automationRate: 62,
  avgResolutionTime: "~5 min",
  topTopic: "Talk to my advisor",
  description: "Financial goal setting, scenario modelling, robo-advisor configuration, and warm handover to a dedicated human advisor.",
  capabilities: [
    { title: "Goal setting", description: "Define and track financial goals — retirement, education, home purchase, legacy" },
    { title: "Scenario modelling", description: "What-if projections for contribution changes, market scenarios, and life events" },
    { title: "Robo-advisor configuration", description: "Set up or adjust automated investment strategy based on risk profile and goals" },
    { title: "Human advisor handover", description: "Schedule a call or warm-transfer to a dedicated financial advisor" },
    { title: "Financial health check", description: "Holistic review of assets, liabilities, cash flow, and insurance coverage" },
    { title: "Plan progress tracking", description: "Dashboard showing goal completion probability and recommended actions" },
  ],
  quickActions: ["Talk to my advisor", "Set a goal", "Run scenario", "Robo-advisor settings", "Financial health check", "Plan progress"],
  flow: {
    knowledgeSources: [
      { id: "ap-kb-planning-faq", name: "Planning FAQ", type: "faq", icon: "books", description: "Goal-based planning, robo-advisor features, and advisor availability" },
      { id: "ap-kb-scenario-api", name: "Scenario Engine API", type: "api", icon: "computer-api", description: "Monte Carlo and deterministic projection engine for goal modelling" },
      { id: "ap-kb-advisor-db", name: "Advisor Directory", type: "database", icon: "database-connection", description: "Advisor profiles, specialisations, availability, and booking calendar" },
    ],
    guardrails: [
      { id: "ap-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated projection figures or advisor availability" },
      { id: "ap-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised financial advice — routes to licensed advisor" },
    ],
    actionHooks: [
      { id: "ap-ah-advisor-handover", name: "Advisor Handover", type: "transfer", icon: "headset", description: "Warm handover to dedicated human advisor with conversation context" },
      { id: "ap-ah-book-call", name: "Book Advisor Call", type: "webhook", icon: "target-selection", description: "Schedules a call with the client's assigned advisor" },
    ],
    processes: [
      { id: "ap-pr-goal-onboarding", name: "Goal Onboarding", type: "workflow", icon: "hierarchy", description: "Guides client through goal definition, timeline, and funding strategy" },
      { id: "ap-pr-health-check", name: "Financial Health Check", type: "workflow", icon: "cogs", description: "Collects data across accounts, insurance, and liabilities for holistic review" },
    ],
    standardResponses: [
      { id: "ap-sr-goal-summary", name: "Goal Progress Summary", type: "confirmation", icon: "thumbs-up", description: "Returns goal completion probability with recommended adjustments" },
      { id: "ap-sr-advisor-booked", name: "Advisor Booking Confirmation", type: "confirmation", icon: "check-symbol-check", description: "Confirms scheduled advisor call with date, time, and meeting link" },
    ],
  },
  tier: "primary",
};

export default agent;

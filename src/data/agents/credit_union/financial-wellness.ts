import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_wellness",
  name: "Financial Wellness",
  icon: "heart",
  automationRate: 80,
  avgResolutionTime: "~2 min",
  topTopic: "Build my credit score",
  description: "Financial education, credit-building tools, budgeting assistance, and community outreach programs.",
  capabilities: [
    { title: "Credit score insights", description: "Free credit score access, score factors, and personalised improvement tips" },
    { title: "Budgeting tools", description: "Spending categorisation, budget templates, and savings-goal tracking" },
    { title: "Financial education", description: "Articles, webinars, and interactive modules on money management" },
    { title: "Community programs", description: "Financial literacy workshops, youth programs, and community grants" },
  ],
  quickActions: ["My credit score", "Budget help", "Learning centre", "Community events", "Savings goals"],
  flow: {
    knowledgeSources: [
      { id: "cu-fw-kb-faq", name: "Wellness FAQ", type: "faq", icon: "books", description: "Credit-building strategies, budgeting tips, and program details" },
      { id: "cu-fw-kb-score-api", name: "Credit Score API", type: "api", icon: "computer-api", description: "Member credit score, score factors, and trend data" },
    ],
    guardrails: [
      { id: "cu-fw-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated credit score or financial data" },
      { id: "cu-fw-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised financial advice — provides education only" },
    ],
    actionHooks: [
      { id: "cu-fw-ah-resources", name: "Send Learning Resources", type: "email", icon: "phone", description: "Emails curated financial education materials" },
      { id: "cu-fw-ah-transfer", name: "Transfer to Financial Coach", type: "transfer", icon: "headset", description: "Warm handover to a certified financial counsellor" },
    ],
    processes: [
      { id: "cu-fw-pr-credit-builder", name: "Credit Builder Program", type: "workflow", icon: "hierarchy", description: "Enrols member in credit-builder loan or secured card program" },
    ],
    standardResponses: [
      { id: "cu-fw-sr-score", name: "Credit Score Summary", type: "confirmation", icon: "thumbs-up", description: "Presents current score, key factors, and month-over-month trend" },
      { id: "cu-fw-sr-resources", name: "Resources Sent", type: "confirmation", icon: "check-symbol-check", description: "Confirms educational materials were emailed to the member" },
    ],
  },
  tier: "addon",
};

export default agent;

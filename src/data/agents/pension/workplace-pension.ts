import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_workplace",
  name: "Workplace Pension",
  icon: "building-institution",
  automationRate: 88,
  avgResolutionTime: "~1.5 min",
  topTopic: "My workplace pension balance",
  description: "Employer-sponsored pension plans — balance across current and former employers, contribution match, vesting rules, auto-enrolment, and plan-type details.",
  capabilities: [
    { title: "Balance & statements", description: "Current pot value across current and previous employers" },
    { title: "Employer contributions", description: "Match rate, contribution history, and vesting schedule" },
    { title: "Plan type details", description: "Defined-benefit vs defined-contribution, collective vs individual choice" },
    { title: "Previous employers", description: "Locating and viewing old workplace pensions from past jobs" },
    { title: "Contribution limits", description: "Annual allowance, employer contribution caps, tax-relief ceiling" },
    { title: "Auto-enrolment", description: "Opt-in / opt-out rules and impact on benefits and take-home pay" },
  ],
  quickActions: ["My balance", "Employer contributions", "Plan details", "Previous jobs", "Annual allowance", "Auto-enrolment"],
  flow: {
    knowledgeSources: [
      { id: "pw-kb-pension-faq", name: "Workplace Pension FAQ", type: "faq", icon: "books", description: "Plan types, contribution rules, vesting, auto-enrolment" },
      { id: "pw-kb-balance-api", name: "Pension Balance API", type: "api", icon: "computer-api", description: "Real-time balance, employer contribution history, fund allocation" },
      { id: "pw-kb-scheme-rules", name: "Workplace Scheme Rules", type: "database", icon: "database-connection", description: "Plan-specific rules per employer scheme" },
    ],
    guardrails: [
      { id: "pw-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated balance or contribution figures" },
      { id: "pw-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised pension advice — routes to licensed advisor" },
    ],
    actionHooks: [
      { id: "pw-ah-statement", name: "Send Statement PDF", type: "email", icon: "phone", description: "Emails a pension statement PDF to the member" },
      { id: "pw-ah-transfer-advisor", name: "Transfer to Pension Advisor", type: "transfer", icon: "headset", description: "Warm handover to licensed pension advisor" },
      { id: "pw-ah-consolidation", name: "Start Consolidation", type: "webhook", icon: "target-selection", description: "Initiates transfer-in of a pension from a previous employer" },
    ],
    processes: [
      { id: "pw-pr-consolidation", name: "Multi-employer Consolidation", type: "workflow", icon: "hierarchy", description: "Orchestrates pot consolidation across former-employer schemes" },
      { id: "pw-pr-balance-aggregation", name: "Balance Aggregation", type: "workflow", icon: "cogs", description: "Aggregates balances from multiple workplace schemes into a single view" },
    ],
    standardResponses: [
      { id: "pw-sr-balance", name: "Balance Confirmation", type: "confirmation", icon: "thumbs-up", description: "Returns current balance with employer and member contribution breakdown" },
      { id: "pw-sr-scheme-explained", name: "Scheme Explained", type: "confirmation", icon: "check-symbol-check", description: "Explains plan type, contribution schedule, and key benefits" },
    ],
  },
  tier: "primary",
};

export default agent;

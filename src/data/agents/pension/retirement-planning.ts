import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_retirement_planning",
  name: "Retirement Planning",
  icon: "route",
  automationRate: 65,
  avgResolutionTime: "~5 min",
  topTopic: "When can I retire?",
  description: "Calculators, scenario modelling, payout-method comparison, phased retirement, and warm advisor handover for the long-horizon planning journey.",
  capabilities: [
    { title: "Retirement readiness", description: "Projection using current savings, contributions, and lifestyle target" },
    { title: "Payout options", description: "Lump sum vs annuity vs drawdown comparison with tax and longevity trade-offs" },
    { title: "Phased retirement", description: "Partial retirement and reduced-hours scenario modelling" },
    { title: "Spousal impact", description: "How different options affect spouse and dependant income" },
    { title: "Tax optimisation", description: "Withdrawal timing, marginal rate modelling, and sequencing strategies" },
    { title: "Advisor handover", description: "Warm transfer to certified pension advisor with full planning context" },
  ],
  quickActions: ["When can I retire", "Payout options", "Phased retirement", "Tax impact", "Spousal benefits", "Talk to advisor"],
  flow: {
    knowledgeSources: [
      { id: "rp-kb-planning-faq", name: "Planning FAQ", type: "faq", icon: "books", description: "Retirement age rules, payout methods, tax treatment" },
      { id: "rp-kb-planning-engine", name: "Retirement Planning Engine", type: "api", icon: "computer-api", description: "Projection models, scenario comparison, tax-adjusted outcomes" },
      { id: "rp-kb-actuarial", name: "Actuarial Tables", type: "database", icon: "database-connection", description: "Life-expectancy and annuity-rate reference data" },
    ],
    guardrails: [
      { id: "rp-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised retirement advice — routes to licensed advisor" },
      { id: "rp-gr-suitability", name: "Suitability Screening", type: "compliance", icon: "lock-security", description: "Detects at-risk withdrawal patterns and flags for human review" },
    ],
    actionHooks: [
      { id: "rp-ah-advisor", name: "Transfer to Advisor", type: "transfer", icon: "headset", description: "Warm handover to certified pension advisor with planning context" },
      { id: "rp-ah-book", name: "Book Consultation", type: "webhook", icon: "target-selection", description: "Schedules an advisor consultation with pre-populated agenda" },
    ],
    processes: [
      { id: "rp-pr-modelling", name: "Retirement Modelling", type: "workflow", icon: "hierarchy", description: "Runs multi-scenario projection with sensitivity analysis" },
      { id: "rp-pr-tax-optimisation", name: "Tax Optimisation", type: "workflow", icon: "cogs", description: "Models withdrawal sequencing for tax-efficient decumulation" },
    ],
    standardResponses: [
      { id: "rp-sr-projection", name: "Planning Summary", type: "confirmation", icon: "thumbs-up", description: "Returns projection summary with key scenarios and recommendations" },
      { id: "rp-sr-advisor-booked", name: "Advisor Booked", type: "confirmation", icon: "check-symbol-check", description: "Confirms advisor consultation booking with time and agenda" },
    ],
  },
  tier: "primary",
};

export default agent;

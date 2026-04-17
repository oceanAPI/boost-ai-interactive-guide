import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_retirement",
  name: "Retirement Planning",
  icon: "bar-chart",
  automationRate: 68,
  avgResolutionTime: "~4 min",
  topTopic: "Roll over my 401k",
  description: "IRA management, 401k rollovers, retirement income modelling, contribution limits, and required minimum distributions.",
  capabilities: [
    { title: "401k rollover", description: "Step-by-step rollover from employer 401k to IRA with tax impact preview" },
    { title: "IRA management", description: "Traditional and Roth IRA balances, contributions, and conversion options" },
    { title: "Retirement modelling", description: "Monte Carlo projections based on current savings, contributions, and target age" },
    { title: "Contribution limits", description: "Current year limits for IRA, 401k, and catch-up contributions by age" },
    { title: "Required minimum distributions", description: "RMD calculations, schedules, and deadline reminders for qualifying accounts" },
    { title: "Income planning", description: "Withdrawal strategies balancing tax efficiency and longevity risk" },
  ],
  quickActions: ["Roll over 401k", "IRA balance", "Retirement projection", "Contribution limits", "RMD calculator", "Income plan"],
  flow: {
    knowledgeSources: [
      { id: "rp-kb-retirement-faq", name: "Retirement FAQ", type: "faq", icon: "books", description: "Rollover rules, contribution limits, RMD schedules, and Roth conversions" },
      { id: "rp-kb-account-api", name: "Retirement Account API", type: "api", icon: "computer-api", description: "Real-time IRA and 401k balances, contribution history, and RMD status" },
      { id: "rp-kb-actuarial", name: "Actuarial Tables", type: "database", icon: "database-connection", description: "Life expectancy and mortality tables for RMD and income planning" },
    ],
    guardrails: [
      { id: "rp-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated account balances or projection figures" },
      { id: "rp-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised retirement advice — routes to fiduciary advisor" },
    ],
    actionHooks: [
      { id: "rp-ah-rollover", name: "Initiate Rollover", type: "webhook", icon: "target-selection", description: "Submits 401k-to-IRA rollover request to custodian" },
      { id: "rp-ah-advisor", name: "Transfer to Retirement Advisor", type: "transfer", icon: "headset", description: "Warm handover to licensed retirement planning advisor" },
    ],
    processes: [
      { id: "rp-pr-rollover-flow", name: "Rollover Workflow", type: "workflow", icon: "hierarchy", description: "Orchestrates rollover from employer plan through custodian transfer" },
      { id: "rp-pr-projection", name: "Retirement Projection", type: "workflow", icon: "cogs", description: "Runs Monte Carlo simulation with configurable assumptions and scenarios" },
    ],
    standardResponses: [
      { id: "rp-sr-balance", name: "Account Balance Summary", type: "confirmation", icon: "thumbs-up", description: "Returns IRA and 401k balances with contribution and growth breakdown" },
      { id: "rp-sr-rmd", name: "RMD Schedule", type: "confirmation", icon: "check-symbol-check", description: "Presents upcoming RMD amounts, deadlines, and withholding options" },
    ],
  },
  tier: "primary",
};

export default agent;

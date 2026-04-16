import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_savings",
  name: "Savings & Vaults",
  icon: "lock",
  automationRate: 88,
  avgResolutionTime: "~1 min",
  topTopic: "Create a savings vault",
  description: "Savings pots and vaults — round-ups, savings goals, interest rate information, and automated saving rules.",
  capabilities: [
    { title: "Vault creation", description: "Create named savings vaults with custom goals and target dates" },
    { title: "Round-ups", description: "Automatically round up card purchases and save the spare change" },
    { title: "Savings goals", description: "Set target amounts with progress tracking and milestone notifications" },
    { title: "Interest rates", description: "Current rates, rate change history, and comparisons across vault types" },
    { title: "Automated rules", description: "Salary-day sweeps, if-this-then-save rules, and recurring deposits" },
    { title: "Withdrawals", description: "Instant or scheduled withdrawals back to the main account" },
  ],
  quickActions: ["Create a savings vault", "Enable round-ups", "Set savings goal", "Interest rates", "Saving rules", "Withdraw funds"],
  flow: {
    knowledgeSources: [
      { id: "ft-sav-kb-faq", name: "Savings FAQ", type: "faq", icon: "books", description: "Vault types, interest tiers, round-up mechanics, withdrawal rules" },
      { id: "ft-sav-kb-vault-api", name: "Vault Management API", type: "api", icon: "computer-api", description: "Real-time vault balances, goal progress, interest accrued" },
      { id: "ft-sav-kb-rates-db", name: "Interest Rate Database", type: "database", icon: "database-connection", description: "Current and historical rates by vault type and tier" },
    ],
    guardrails: [
      { id: "ft-sav-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated interest rates or vault balances" },
      { id: "ft-sav-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised savings advice — provides information only" },
    ],
    actionHooks: [
      { id: "ft-sav-ah-create", name: "Create Vault", type: "webhook", icon: "target-selection", description: "Creates a new savings vault with specified name and goal" },
      { id: "ft-sav-ah-roundup", name: "Toggle Round-ups", type: "webhook", icon: "target-selection", description: "Enables or disables round-up saving on card transactions" },
      { id: "ft-sav-ah-escalate", name: "Transfer to Savings Team", type: "transfer", icon: "headset", description: "Handover for rate disputes or complex vault configurations" },
    ],
    processes: [
      { id: "ft-sav-pr-goal-tracker", name: "Goal Tracking", type: "workflow", icon: "hierarchy", description: "Monitors vault progress and triggers milestone notifications" },
      { id: "ft-sav-pr-auto-save", name: "Automated Saving Rules", type: "workflow", icon: "cogs", description: "Orchestrates salary-day sweeps, round-ups, and conditional saving triggers" },
    ],
    standardResponses: [
      { id: "ft-sav-sr-created", name: "Vault Created", type: "confirmation", icon: "thumbs-up", description: "Confirms new vault with name, goal amount, and target date" },
      { id: "ft-sav-sr-balance", name: "Vault Balance Summary", type: "confirmation", icon: "check-symbol-check", description: "Returns current balance, interest earned, and goal progress percentage" },
    ],
  },
  tier: "primary",
};

export default agent;

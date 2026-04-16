import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_payouts",
  name: "Payouts & Withdrawals",
  icon: "calendar-day",
  automationRate: 72,
  avgResolutionTime: "~4 min",
  topTopic: "Start taking my pension",
  description: "Starting pension drawdown, comparing annuity vs flexible income, managing payment schedules, and handling early-withdrawal rules.",
  capabilities: [
    { title: "Start my pension", description: "Initiate payouts with eligibility and age verification" },
    { title: "Annuity vs drawdown", description: "Comparison of lump sum, annuity, and flexi-access drawdown options" },
    { title: "Tax-free lump sum", description: "Calculates the tax-free portion and explains take-up options" },
    { title: "Payment schedule", description: "Frequency, first-payment date, bank account setup" },
    { title: "Early withdrawal", description: "Rules, penalties, and tax implications before normal retirement age" },
    { title: "Change payments", description: "Modify frequency, amount, or destination bank account" },
  ],
  quickActions: ["Start pension", "Lump sum", "Annuity options", "Change payment", "Early withdrawal", "Direct deposit"],
  flow: {
    knowledgeSources: [
      { id: "po-kb-payout-faq", name: "Payout FAQ", type: "faq", icon: "books", description: "Payout methods, tax-free rules, early-withdrawal penalties" },
      { id: "po-kb-payout-engine", name: "Payout Engine", type: "api", icon: "computer-api", description: "Payout initiation, tax withholding, schedule management" },
      { id: "po-kb-bank-validation", name: "Bank Account Validation", type: "api", icon: "computer-api", description: "Validates destination bank account for payouts" },
    ],
    guardrails: [
      { id: "po-gr-eligibility", name: "Eligibility Verification", type: "compliance", icon: "lock-security", description: "Confirms age and scheme eligibility before payout initiation" },
      { id: "po-gr-tax-disclosure", name: "Tax Impact Disclosure", type: "compliance", icon: "shield-medal", description: "Mandatory tax-impact disclosure before confirming drawdown" },
      { id: "po-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks advice on payout choice — routes to licensed advisor" },
    ],
    actionHooks: [
      { id: "po-ah-initiate", name: "Initiate Payout", type: "webhook", icon: "target-selection", description: "Starts the payout workflow with regulatory disclosures" },
      { id: "po-ah-schedule", name: "Schedule First Payment", type: "webhook", icon: "cogs", description: "Schedules the first recurring pension payment" },
    ],
    processes: [
      { id: "po-pr-payout-validation", name: "Payout Validation", type: "workflow", icon: "hierarchy", description: "Validates eligibility, calculates tax-free portion, confirms options" },
      { id: "po-pr-tax-withholding", name: "Tax Withholding", type: "workflow", icon: "cogs", description: "Computes and applies tax withholding per jurisdiction" },
    ],
    standardResponses: [
      { id: "po-sr-confirmed", name: "Payout Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms payout with first-payment date, frequency, and amount" },
      { id: "po-sr-schedule", name: "Schedule Summary", type: "confirmation", icon: "check-symbol-check", description: "Returns current payment schedule with next-payment details" },
    ],
  },
  tier: "primary",
};

export default agent;

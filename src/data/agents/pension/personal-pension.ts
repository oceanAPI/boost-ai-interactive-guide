import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_personal",
  name: "Personal Pension",
  icon: "wallet",
  automationRate: 80,
  avgResolutionTime: "~3 min",
  topTopic: "Transfer an old pension in",
  description: "Individual tax-advantaged pension — opening, contributing, consolidating old pensions from other providers, and tax-relief tracking.",
  capabilities: [
    { title: "Open a personal pension", description: "KYC, identity verification, tax residency, and initial deposit flow" },
    { title: "Make contributions", description: "One-time and recurring contributions with tax-relief limit tracking" },
    { title: "Tax benefit calculator", description: "Models annual tax relief vs expected future marginal rate" },
    { title: "Combine pensions", description: "Find and transfer in pensions from other providers into one pot" },
    { title: "Transfer status", description: "Track in-progress transfers, paperwork, and receiving-scheme confirmations" },
    { title: "Change contribution", description: "Start, stop, or adjust recurring contribution amount and schedule" },
  ],
  quickActions: ["Open pension", "Transfer in", "Make contribution", "Tax relief", "Combine pensions", "Transfer status"],
  flow: {
    knowledgeSources: [
      { id: "pp-kb-personal-faq", name: "Personal Pension FAQ", type: "faq", icon: "books", description: "Product terms, tax relief, contribution limits, transfer rules" },
      { id: "pp-kb-pension-api", name: "Personal Pension API", type: "api", icon: "computer-api", description: "Balance, contributions, transfer status, tax-year data" },
      { id: "pp-kb-transfer-broker", name: "Transfer Broker API", type: "api", icon: "computer-api", description: "Automated pension-finder and transfer orchestration" },
    ],
    guardrails: [
      { id: "pp-gr-tax-limit", name: "Tax-limit Compliance", type: "compliance", icon: "lock-security", description: "Enforces annual pension-allowance ceiling before contribution" },
      { id: "pp-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks advice — provides product information and tools only" },
      { id: "pp-gr-auth", name: "Strong Auth for Transfers", type: "compliance", icon: "lock-security", description: "Requires strong auth before initiating inter-provider transfers" },
    ],
    actionHooks: [
      { id: "pp-ah-open", name: "Open Pension", type: "webhook", icon: "target-selection", description: "Initiates account-opening workflow with KYC and initial deposit" },
      { id: "pp-ah-transfer", name: "Initiate Transfer", type: "webhook", icon: "cogs", description: "Starts inter-provider transfer via automated transfer broker" },
      { id: "pp-ah-contribution", name: "Process Contribution", type: "webhook", icon: "target-selection", description: "Takes a one-time or updates a recurring contribution" },
    ],
    processes: [
      { id: "pp-pr-transfer-orchestration", name: "Transfer Orchestration", type: "workflow", icon: "hierarchy", description: "Coordinates finder, old-provider discharge, and receiving-scheme confirmation" },
      { id: "pp-pr-tax-attribution", name: "Tax-year Attribution", type: "workflow", icon: "cogs", description: "Attributes contributions to the correct tax year for relief purposes" },
    ],
    standardResponses: [
      { id: "pp-sr-opened", name: "Pension Opened", type: "confirmation", icon: "thumbs-up", description: "Confirms new pension with account reference and next steps" },
      { id: "pp-sr-transfer-started", name: "Transfer Started", type: "confirmation", icon: "check-symbol-check", description: "Confirms transfer initiation with expected timeline" },
    ],
  },
  tier: "primary",
};

export default agent;

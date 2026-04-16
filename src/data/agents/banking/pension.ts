import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_pension",
  name: "Pension",
  icon: "users",
  automationRate: 75,
  avgResolutionTime: "~2.5 min",
  topTopic: "My pension pot balance",
  description: "Pension products cross-sold by the bank — balance lookup, contribution adjustment, and handover to pension specialists for deeper planning.",
  capabilities: [
    { title: "Pension balance", description: "Shows current pension pot value alongside other bank accounts" },
    { title: "Contribution changes", description: "Start, stop, or adjust recurring pension contributions" },
    { title: "Product information", description: "Explains pension products offered by the bank (personal pension, workplace integration)" },
    { title: "Specialist handover", description: "Warm handover to a licensed pension advisor for planning and complex cases" },
  ],
  quickActions: ["My pension balance", "Change contribution", "Pension products", "Talk to specialist", "Tax benefits"],
  flow: {
    knowledgeSources: [
      { id: "bpn-kb-pension-faq", name: "Pension FAQ", type: "faq", icon: "books", description: "Bank's pension product terms, tax treatment, contribution rules" },
      { id: "bpn-kb-pension-api", name: "Pension API", type: "api", icon: "computer-api", description: "Balance, contributions, and basic fund view" },
    ],
    guardrails: [
      { id: "bpn-gr-no-advice", name: "No Pension Advice", type: "compliance", icon: "shield-medal", description: "Blocks personalised pension advice — routes to licensed specialist" },
      { id: "bpn-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Requires strong auth before contribution changes" },
    ],
    actionHooks: [
      { id: "bpn-ah-contribution", name: "Update Contribution", type: "webhook", icon: "target-selection", description: "Adjusts recurring contribution amount via the pension admin system" },
      { id: "bpn-ah-transfer-specialist", name: "Transfer to Pension Specialist", type: "transfer", icon: "headset", description: "Warm handover to licensed pension advisor" },
    ],
    processes: [
      { id: "bpn-pr-contribution-update", name: "Contribution Update", type: "workflow", icon: "cogs", description: "Validates and applies contribution change with tax-limit checks" },
    ],
    standardResponses: [
      { id: "bpn-sr-updated", name: "Contribution Updated", type: "confirmation", icon: "thumbs-up", description: "Confirms change with effective date and impact on take-home pay" },
    ],
  },
  tier: "addon",
  // Retirement planning is central to private wealth and a standard retail product.
  variants: ["banking:private", "banking:retail"],
};

export default agent;

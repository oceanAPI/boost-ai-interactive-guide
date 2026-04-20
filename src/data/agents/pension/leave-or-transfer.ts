import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_leave_transfer",
  name: "Leave or transfer",
  icon: "logout",
  automationRate: 68,
  avgResolutionTime: "~5 min",
  topTopic: "Transfer my pension to another provider",
  description: "Offboarding and portability — transferring a pension to another provider, handling workplace leavers, pausing contributions, and navigating the regulated 30-day transfer-out checks.",
  capabilities: [
    { title: "Transfer-out quote", description: "Produces a regulated transfer-value quotation with guaranteed minimum pension and safeguarded-benefits flags" },
    { title: "Receiving scheme checks", description: "Validates FCA / TPR registration of the destination scheme and screens for transfer-scam indicators" },
    { title: "Workplace leaver handling", description: "Handles the change-of-employer flow — paid-up status, deferred pot, or transfer-in to new employer's scheme" },
    { title: "Pause contributions", description: "Temporarily stops employee contributions while preserving the pot and employer match where applicable" },
    { title: "Cooling-off & cancel", description: "Processes in-period cancellation refunds with accurate fee and contribution rebates" },
    { title: "Regulatory 30-day clock", description: "Manages the MoneyHelper scam-check referral and the 30-day trustee notification requirement" },
  ],
  quickActions: ["Transfer quote", "Check receiving scheme", "Left my employer", "Pause contributions", "Cancel in period", "30-day clock"],
  flow: {
    knowledgeSources: [
      { id: "plt-kb-transfer-rules", name: "Transfer Rules", type: "document", icon: "hierarchy-document", description: "Statutory transfer procedures, safeguarded-benefit rules, and scam-flag checklist" },
      { id: "plt-kb-scheme-registry", name: "Regulated Scheme Registry", type: "api", icon: "computer-api", description: "FCA / TPR scheme registration lookup and transfer-in / transfer-out capability" },
      { id: "plt-kb-fund-api", name: "Fund Pricing API", type: "api", icon: "computer-api", description: "Live unit prices and bid-offer spread to calculate transfer values" },
    ],
    guardrails: [
      { id: "plt-gr-scam-check", name: "Scam Detection", type: "compliance", icon: "shield-medal", description: "Runs the seven-step pension-scam checklist and routes high-risk cases to a MoneyHelper Safeguarding specialist" },
      { id: "plt-gr-clock", name: "30-day Notice", type: "compliance", icon: "lock-security", description: "Enforces the statutory 30-day notice to trustees before completing a transfer-out" },
    ],
    actionHooks: [
      { id: "plt-ah-transfer-quote", name: "Issue Transfer Quote", type: "webhook", icon: "target-selection", description: "Generates the binding transfer-value quotation document with expiry date" },
      { id: "plt-ah-pause", name: "Pause Contributions", type: "webhook", icon: "banknote", description: "Stops employee contributions at next payroll run and preserves the pot" },
      { id: "plt-ah-escalate-scam", name: "Escalate to Safeguarding", type: "transfer", icon: "route", description: "Warm-hands a suspected scam case to the safeguarding specialist team" },
    ],
    processes: [
      { id: "plt-pr-transfer-out", name: "Transfer-out Workflow", type: "workflow", icon: "hierarchy", description: "Quote → receiving-scheme check → scam screen → 30-day clock → settlement instruction" },
      { id: "plt-pr-leaver", name: "Leaver Handling", type: "workflow", icon: "cogs", description: "Handles employer-change flow: paid-up, transfer-in to new scheme, or defer" },
    ],
    standardResponses: [
      { id: "plt-sr-quote", name: "Transfer Quote", type: "confirmation", icon: "thumbs-up", description: "Returns the transfer quotation with value, expiry, and receiving-scheme instructions" },
      { id: "plt-sr-paused", name: "Contributions Paused", type: "confirmation", icon: "check-symbol-check", description: "Confirms contribution pause with effective date and resume-options reminder" },
    ],
  },
  tier: "primary",
};

export default agent;

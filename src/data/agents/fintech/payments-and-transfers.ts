import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_payments",
  name: "Payments & Transfers",
  icon: "transfer",
  automationRate: 86,
  avgResolutionTime: "~2 min",
  topTopic: "Send money abroad",
  description: "Peer-to-peer payments, international transfers, FX rate lookups, remittance tracking, and payment troubleshooting.",
  capabilities: [
    { title: "P2P payments", description: "Instant send and request between app users via phone number or tag" },
    { title: "International transfers", description: "Cross-border payments with live FX rates and fee transparency" },
    { title: "FX rate lookup", description: "Real-time and historical exchange rates with rate-lock options" },
    { title: "Remittance tracking", description: "End-to-end status tracking for international money transfers" },
    { title: "Payment troubleshooting", description: "Failed, pending, or reversed payment investigation and resolution" },
    { title: "Scheduled payments", description: "Recurring transfers, standing orders, and payment reminders" },
  ],
  quickActions: ["Send money abroad", "Track transfer", "FX rates", "Fix failed payment", "P2P payment", "Scheduled payments"],
  flow: {
    knowledgeSources: [
      { id: "ft-pay-kb-faq", name: "Payments FAQ", type: "faq", icon: "books", description: "Transfer limits, supported corridors, cut-off times, fee schedules" },
      { id: "ft-pay-kb-fx-api", name: "FX Rate Engine", type: "api", icon: "computer-api", description: "Live mid-market rates, markup calculation, rate-lock status" },
      { id: "ft-pay-kb-txn-db", name: "Transaction Database", type: "database", icon: "database-connection", description: "Payment history, status updates, beneficiary details" },
    ],
    guardrails: [
      { id: "ft-pay-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated transaction statuses or FX rates" },
      { id: "ft-pay-gr-sanctions", name: "Sanctions Screening", type: "compliance", icon: "shield-medal", description: "Blocks transfers to sanctioned countries, entities, or individuals" },
    ],
    actionHooks: [
      { id: "ft-pay-ah-initiate", name: "Initiate Transfer", type: "webhook", icon: "target-selection", description: "Triggers a new domestic or international payment" },
      { id: "ft-pay-ah-cancel", name: "Cancel Pending Transfer", type: "webhook", icon: "target-selection", description: "Attempts cancellation of an in-progress transfer" },
      { id: "ft-pay-ah-escalate", name: "Transfer to Payments Team", type: "transfer", icon: "headset", description: "Warm handover for stuck or disputed payments" },
    ],
    processes: [
      { id: "ft-pay-pr-intl-flow", name: "International Transfer Flow", type: "workflow", icon: "hierarchy", description: "Orchestrates beneficiary validation, FX conversion, compliance checks, and settlement" },
      { id: "ft-pay-pr-dispute", name: "Payment Dispute", type: "workflow", icon: "cogs", description: "Investigation workflow for failed, duplicate, or unauthorised payments" },
    ],
    standardResponses: [
      { id: "ft-pay-sr-sent", name: "Transfer Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms payment initiated with amount, FX rate, and ETA" },
      { id: "ft-pay-sr-status", name: "Transfer Status Update", type: "confirmation", icon: "check-symbol-check", description: "Returns current status with expected completion timeline" },
    ],
  },
  tier: "primary",
};

export default agent;

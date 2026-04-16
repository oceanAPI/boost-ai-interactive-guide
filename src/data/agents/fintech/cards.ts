import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_cards",
  name: "Cards",
  icon: "credit-card",
  automationRate: 85,
  avgResolutionTime: "~1 min",
  topTopic: "Freeze my card",
  description: "Virtual and physical card management — spending limits, instant freeze/unfreeze, PIN resets, subscription controls, and replacement orders.",
  capabilities: [
    { title: "Freeze & unfreeze", description: "Instant card lock and unlock from the app with one tap" },
    { title: "Spending limits", description: "Per-transaction, daily, and monthly spend caps with real-time alerts" },
    { title: "Virtual cards", description: "Generate disposable or recurring virtual cards for online purchases" },
    { title: "Physical card orders", description: "Order, track, and activate physical debit or prepaid cards" },
    { title: "PIN management", description: "Set, reset, or view PIN securely within the app" },
    { title: "Subscription controls", description: "Identify, pause, or block recurring merchant charges" },
  ],
  quickActions: ["Freeze my card", "Set spending limit", "New virtual card", "Order card", "Reset PIN", "Manage subscriptions"],
  flow: {
    knowledgeSources: [
      { id: "ft-crd-kb-faq", name: "Card FAQ", type: "faq", icon: "books", description: "Card types, activation steps, limits, contactless ceilings" },
      { id: "ft-crd-kb-card-api", name: "Card Management API", type: "api", icon: "computer-api", description: "Real-time card status, freeze state, spending limits, virtual card details" },
      { id: "ft-crd-kb-merchant-db", name: "Merchant & Subscription DB", type: "database", icon: "database-connection", description: "Recurring charge identification and merchant category data" },
    ],
    guardrails: [
      { id: "ft-crd-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated card numbers, limits, or statuses" },
      { id: "ft-crd-gr-auth", name: "Strong Authentication", type: "compliance", icon: "shield-medal", description: "Requires step-up auth before sensitive card actions like PIN reveal" },
    ],
    actionHooks: [
      { id: "ft-crd-ah-freeze", name: "Freeze / Unfreeze Card", type: "webhook", icon: "target-selection", description: "Toggles card freeze status instantly" },
      { id: "ft-crd-ah-virtual", name: "Generate Virtual Card", type: "webhook", icon: "target-selection", description: "Creates a new virtual card with specified limits" },
      { id: "ft-crd-ah-escalate", name: "Transfer to Card Support", type: "transfer", icon: "headset", description: "Handover for disputes, fraud, or delivery issues" },
    ],
    processes: [
      { id: "ft-crd-pr-replacement", name: "Card Replacement Flow", type: "workflow", icon: "hierarchy", description: "Orchestrates lost/stolen card blocking, replacement order, and activation" },
      { id: "ft-crd-pr-sub-review", name: "Subscription Review", type: "workflow", icon: "cogs", description: "Scans transactions to surface active subscriptions and cancel options" },
    ],
    standardResponses: [
      { id: "ft-crd-sr-frozen", name: "Card Frozen Confirmation", type: "confirmation", icon: "thumbs-up", description: "Confirms card is frozen and explains how to unfreeze" },
      { id: "ft-crd-sr-virtual", name: "Virtual Card Created", type: "confirmation", icon: "check-symbol-check", description: "Returns new virtual card details with spending limits applied" },
    ],
  },
  tier: "primary",
};

export default agent;

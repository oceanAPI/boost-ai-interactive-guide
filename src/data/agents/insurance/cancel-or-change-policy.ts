import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "insurance_cancel_change",
  name: "Cancel or change policy",
  icon: "logout",
  automationRate: 70,
  avgResolutionTime: "~4 min",
  topTopic: "How do I cancel my policy?",
  description: "Mid-term policy changes and cancellations — endorsements, address and risk-detail updates, cooling-off cancellations, pro-rata refunds, and retention conversations.",
  capabilities: [
    { title: "Mid-term endorsements", description: "Add drivers, change cover levels, update address, or adjust sum insured with automatic premium adjustment" },
    { title: "Cooling-off cancel", description: "14- or 30-day cooling-off cancellation with full-premium refund and registration of cancel reason" },
    { title: "Mid-policy cancel", description: "Post-cooling-off cancellation with pro-rata refund calculation and short-period retention check" },
    { title: "Retention offer", description: "Presents personalised retention offers (loyalty discount, coverage adjustment, payment-plan switch) before confirming cancel" },
    { title: "Risk-detail update", description: "Change occupation, mileage, home occupancy, or business-use status with underwriting re-rate if required" },
    { title: "Cancel reason capture", description: "Captures reason-for-cancel (price, service, moving provider, no longer needed) for product and retention analytics" },
  ],
  quickActions: ["Cancel policy", "Change address", "Add driver", "Adjust cover", "See offer", "Why I'm leaving"],
  flow: {
    knowledgeSources: [
      { id: "icc-kb-policy-rules", name: "Cancellation Rules", type: "document", icon: "hierarchy-document", description: "Cooling-off rights, pro-rata calculation method, and cancel-window rules per product" },
      { id: "icc-kb-rate-engine", name: "Rating Engine API", type: "api", icon: "computer-api", description: "Re-rates premium in real time after endorsement or risk-detail change" },
      { id: "icc-kb-retention", name: "Retention Playbook", type: "document", icon: "hierarchy-document", description: "Segment-based retention offers by product, tenure, and cancel reason" },
    ],
    guardrails: [
      { id: "icc-gr-auth", name: "Named-insured Auth", type: "compliance", icon: "lock-security", description: "Requires named-insured authentication before any cancel or material endorsement" },
      { id: "icc-gr-underwriting", name: "Underwriting Re-rate", type: "compliance", icon: "shield-medal", description: "Routes risk-detail changes that require underwriter review before binding" },
    ],
    actionHooks: [
      { id: "icc-ah-endorse", name: "Endorse Policy", type: "webhook", icon: "target-selection", description: "Writes the endorsement to the policy with new-premium confirmation" },
      { id: "icc-ah-cancel", name: "Cancel Policy", type: "webhook", icon: "banknote", description: "Cancels the policy and triggers pro-rata refund calculation and payment" },
      { id: "icc-ah-retention", name: "Route to Retention", type: "transfer", icon: "headset", description: "Warm handover to retention specialist with offer context pre-loaded" },
    ],
    processes: [
      { id: "icc-pr-cancel", name: "Cancel Workflow", type: "workflow", icon: "hierarchy", description: "Auth → retention offer → reason capture → refund calculation → ledger close" },
      { id: "icc-pr-endorsement", name: "Endorsement Workflow", type: "workflow", icon: "cogs", description: "Change capture → underwriting re-rate → premium adjustment → policy write" },
    ],
    standardResponses: [
      { id: "icc-sr-cancelled", name: "Policy Cancelled", type: "confirmation", icon: "thumbs-up", description: "Confirms cancellation effective date, refund amount, and ledger close" },
      { id: "icc-sr-endorsed", name: "Policy Updated", type: "confirmation", icon: "check-symbol-check", description: "Confirms endorsement with new cover, new premium, and effective date" },
    ],
  },
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_refunds_changes",
  name: "Refunds, Vouchers & Schedule Changes",
  icon: "refresh-idea",
  automationRate: 80,
  avgResolutionTime: "~3 min",
  topTopic: "Refund my ticket",
  description:
    "Voluntary refund requests, schedule-change protection (involuntary refunds and free changes), travel voucher management, and tax / fee refunds for unflown segments. Routes the right customer down the right policy lane.",
  capabilities: [
    { title: "Voluntary refund eligibility",  description: "Check refundability per fare rules and quote the refundable amount net of penalties" },
    { title: "Schedule-change protection",     description: "When the airline changes the schedule, walk the passenger through their free-change / refund rights" },
    { title: "Travel-voucher issue & redeem",  description: "Issue a travel voucher in lieu of cash refund where eligible, and redeem voucher balances on a new booking" },
    { title: "Tax & fee refund on unflown",    description: "Refund taxes and statutory fees on unflown segments where airline policy and law require" },
    { title: "Refund status lookup",            description: "Show the live status of an open refund with expected payment date" },
    { title: "Goodwill gesture (rare)",         description: "Offer policy-bounded goodwill gestures within the customer-care framework" },
  ],
  quickActions: ["Am I refundable?", "Schedule changed", "Issue a voucher", "Redeem voucher", "Refund status", "Tax refund"],
  flow: {
    knowledgeSources: [
      { id: "al-rc-kb-fares",      name: "Fare-rules Engine",        type: "api",      icon: "computer-api",       description: "Live fare-rules engine for refundability, change penalties, and waivers" },
      { id: "al-rc-kb-voucher",    name: "Voucher Platform API",     type: "api",      icon: "computer-api",       description: "Live voucher platform — issuance, balance, redemption, expiry" },
      { id: "al-rc-kb-policy",     name: "Customer-care Policy",     type: "document", icon: "hierarchy-document", description: "Goodwill thresholds, schedule-change protection rules, tax-refund obligations" },
    ],
    guardrails: [
      { id: "al-rc-gr-no-over-refund",name: "No Over-refund",        type: "guardrail",icon: "shield-medal",      description: "Never quotes a refund higher than fare rules + applicable waivers permit" },
      { id: "al-rc-gr-pii",           name: "Payment Data Protection",type: "pii",     icon: "lock-security",     description: "Original-form-of-payment data handled in a contained sub-flow" },
    ],
    actionHooks: [
      { id: "al-rc-ah-refund",        name: "Issue Refund",          type: "api",      icon: "money",              description: "Submits the refund to the original form of payment, returns reference and ETA" },
      { id: "al-rc-ah-voucher",       name: "Issue Voucher",         type: "api",      icon: "finger-tap",         description: "Issues a travel voucher with delivery and redemption tracking" },
    ],
    processes: [
      { id: "al-rc-pr-verify",        name: "PNR + Payment Verification",type: "verification",icon: "check-symbol-check",description: "PNR + family-name auth, plus original-form-of-payment match before any refund" },
      { id: "al-rc-pr-escalate",      name: "Customer-care Escalation",type: "transfer",icon: "headset",           description: "Hands off to customer-care for goodwill cases beyond automated thresholds" },
    ],
    standardResponses: [
      { id: "al-rc-sr-refund-issued", name: "Refund Issued",         type: "standard",icon: "thumbs-up",           description: "Confirms the refund with reference number and expected payment date by payment method" },
      { id: "al-rc-sr-fallback",      name: "Manual Review",         type: "fallback",icon: "route",               description: "Fallback when the refund or change needs manual intervention" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_payment",
  name: "Payment",
  icon: "banknote",
  automationRate: 85,
  avgResolutionTime: "~1 min",
  topTopic: "Invoice copy",
  description: "Billing and payment topics — invoice copies, failed direct debits, payment method change, installment plans, late fee waivers. Multi-market (NOK, SEK, DKK, EUR).",
  capabilities: [
    { title: "Send invoice copy", description: "Resend the latest or a historical invoice to the verified email on file" },
    { title: "Update payment method", description: "Change card-on-file, direct debit mandate or switch to invoice billing" },
    { title: "Failed-payment triage", description: "Explain the reason code, retry schedule and manual-pay options" },
    { title: "Installment plans", description: "Offer approved installment plans on equipment charges per market" },
    { title: "Late-fee waiver", description: "Apply a first-time goodwill fee waiver within policy" },
  ],
  quickActions: ["Send me my last invoice", "Update my card", "Why did my payment fail?", "Split this charge", "Waive the late fee"],
  flow: {
    knowledgeSources: [
      { id: "sec-py-kb-billing", name: "Billing policy", type: "document", icon: "hierarchy-document", description: "Payment methods, dunning schedule, fee and waiver policy per market" },
      { id: "sec-py-kb-invoices", name: "Invoice + payment API", type: "api", icon: "database-connection", description: "Issued invoices, payment state and next-retry timestamp per account" },
    ],
    guardrails: [
      { id: "sec-py-gr-pci", name: "PCI boundary", type: "compliance", icon: "shield-medal", description: "Card details never enter chat — all updates happen in the hosted payment UI" },
      { id: "sec-py-gr-pii", name: "PII scrub", type: "pii", icon: "hand-protection", description: "Masks card and account numbers in any echoed-back content" },
    ],
    actionHooks: [
      { id: "sec-py-ah-invoice", name: "Send invoice", type: "webhook", icon: "hierarchy-document", description: "Emails the requested invoice PDF to the verified inbox" },
      { id: "sec-py-ah-waiver", name: "Apply fee waiver", type: "webhook", icon: "hand-to-hand", description: "Applies a goodwill waiver within the approved policy window" },
      { id: "sec-py-ah-pay-link", name: "Send pay link", type: "webhook", icon: "finger-tap", description: "Creates a one-shot pay link for an overdue invoice" },
    ],
    processes: [
      { id: "sec-py-pr-dunning", name: "Dunning walkthrough", type: "workflow", icon: "hierarchy", description: "Explains the retry schedule and options to avoid service pause" },
    ],
    standardResponses: [
      { id: "sec-py-sr-sent", name: "Invoice sent", type: "confirmation", icon: "check-symbol-check", description: "Confirms email delivery with invoice number" },
      { id: "sec-py-sr-waived", name: "Fee waived", type: "confirmation", icon: "check-symbol-check", description: "Confirms the waiver, new balance and one-time-only note" },
    ],
  },
};

export default agent;

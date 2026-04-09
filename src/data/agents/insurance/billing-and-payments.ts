import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "billing",
  name: "Billing & Payments",
  icon: "banknote",
  automationRate: 84,
  description: "Premium queries, payment deferrals, eFaktura, billing errors, payment method changes.",
  capabilities: [
    { title: "Premium inquiries", description: "Instant answers on premium amounts, due dates, and payment history" },
    { title: "Payment deferrals", description: "Process deferral requests with policy-compliant grace period handling" },
    { title: "Billing error resolution", description: "Identify and resolve common billing discrepancies automatically" },
    { title: "Payment method changes", description: "Update credit card, bank account, or autopay settings securely" },
    { title: "eFaktura setup", description: "Guide customers through digital invoicing enrollment" },
    { title: "Autopay management", description: "Enable, modify, or cancel automatic payment arrangements" },
  ],
  quickActions: ["Pay my bill", "Payment deferral", "Billing error", "Change payment method", "Autopay setup", "Premium increase"],
  flow: {
    knowledgeSources: [
      { id: "ib-kb-billing-faq", name: "Billing FAQ", type: "faq", icon: "books", description: "Common billing questions, payment methods, and due date info" },
      { id: "ib-kb-payment-api", name: "Payment Gateway API", type: "api", icon: "computer-api", description: "Real-time payment processing and history" },
    ],
    guardrails: [
      { id: "ib-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect billing amounts or payment information" },
      { id: "ib-gr-pci", name: "PCI Compliance", type: "compliance", icon: "lock-security", description: "Ensures payment card data is handled per PCI DSS standards" },
    ],
    actionHooks: [
      { id: "ib-ah-transfer", name: "Transfer to Billing Team", type: "transfer", icon: "headset", description: "Escalates complex billing disputes to the billing team" },
    ],
    processes: [
      { id: "ib-pr-deferral", name: "Payment Deferral", type: "workflow", icon: "hierarchy", description: "Processes payment deferral requests within policy guidelines" },
      { id: "ib-pr-method-change", name: "Payment Method Update", type: "workflow", icon: "cogs", description: "Securely updates stored payment methods" },
    ],
    standardResponses: [
      { id: "ib-sr-confirmed", name: "Payment Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms successful payment or billing change" },
    ],
  },
};

export default agent;

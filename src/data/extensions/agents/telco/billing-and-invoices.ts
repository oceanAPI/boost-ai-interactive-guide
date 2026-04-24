import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_billing_invoices",
  name: "Billing & Invoices",
  icon: "banknote",
  automationRate: 88,
  avgResolutionTime: "~1.5 min",
  topTopic: "Why is my bill so high?",
  description:
    "The single heaviest-volume journey for a telco. Explains invoice line-items, helps resolve unexpected charges, manages payment methods and payment plans, and handles direct-debit issues.",
  capabilities: [
    { title: "Invoice breakdown",          description: "Explain every line on the latest invoice — subscription, usage, add-ons, one-offs, proration" },
    { title: "Unexpected-charge resolution",description: "Diagnose why a bill is higher than expected (data overage, roaming, premium SMS, third-party)" },
    { title: "Payment method management",   description: "Update card, direct-debit, or invoice delivery method" },
    { title: "Payment plan request",        description: "Offer a structured payment plan when the customer reports hardship" },
    { title: "Direct-debit failure recovery",description: "Guide recovery when a scheduled payment fails — re-try, new card, or delay" },
    { title: "Duplicate-charge investigation",description: "Investigate and escalate duplicate or mistaken charges with automated refund where eligible" },
  ],
  quickActions: ["Explain my bill", "Unexpected charge", "Change card", "Payment plan", "Failed payment", "Refund"],
  flow: {
    knowledgeSources: [
      { id: "tc-bi-kb-billing-api",  name: "Billing Platform API",     type: "api",      icon: "computer-api",       description: "Live connection to the billing platform for invoice, payment, and refund data" },
      { id: "tc-bi-kb-charge-codes", name: "Charge Code Dictionary",   type: "document", icon: "hierarchy-document", description: "Citizen-friendly explanations of every internal charge code that can appear on an invoice" },
      { id: "tc-bi-kb-faq",          name: "Billing FAQ",              type: "faq",      icon: "books",              description: "Top 200 billing questions with vetted answers" },
    ],
    guardrails: [
      { id: "tc-bi-gr-refund-limit", name: "Refund Authority Cap",     type: "guardrail",    icon: "shield-medal",  description: "Limits self-serve automated refunds to a policy-defined ceiling; above that, mandatory agent review" },
      { id: "tc-bi-gr-pii",          name: "PII Protection",           type: "pii",          icon: "lock-security", description: "Card numbers and bank details never echoed; redaction enforced in every transcript" },
    ],
    actionHooks: [
      { id: "tc-bi-ah-refund",       name: "Issue Refund",             type: "api",          icon: "money",         description: "Posts a refund through the billing platform when the customer qualifies under the authority cap" },
      { id: "tc-bi-ah-plan-setup",   name: "Create Payment Plan",      type: "api",          icon: "calendar-clock",description: "Creates a structured payment plan with agreed instalments through the billing platform" },
    ],
    processes: [
      { id: "tc-bi-pr-verify-id",    name: "Identity Verification",    type: "verification", icon: "check-symbol-check", description: "Light strong-auth for account-sensitive actions like refund or payment-method change" },
      { id: "tc-bi-pr-escalate",     name: "Escalate to Billing Specialist",type: "transfer",icon: "headset",       description: "Transfers disputed or high-value cases to a billing specialist with full context" },
    ],
    standardResponses: [
      { id: "tc-bi-sr-confirm-change",name: "Payment Change Confirmed",type: "standard",     icon: "thumbs-up",     description: "Confirms successful update to the payment method or plan" },
      { id: "tc-bi-sr-fallback",     name: "Specialist Review Needed", type: "fallback",     icon: "route",         description: "Graceful fallback when automation can't resolve the charge dispute" },
    ],
  },
  tier: "primary",
};

export default agent;

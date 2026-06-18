import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_new_customer",
  name: "New Customer Onboarding",
  icon: "user-plus",
  automationRate: 81,
  avgResolutionTime: "~3 min",
  topTopic: "Sign me up",
  description:
    "The full sign-up and activation journey for a new subscriber — plan selection, identity capture, credit check coordination, order tracking, welcome, and first-bill expectation-setting.",
  capabilities: [
    { title: "Plan recommender",              description: "Guide a prospect to the right plan based on usage signals, household size, and device choice" },
    { title: "Sign-up form handling",         description: "Collect identity and address data with MitID / BankID pre-fill, validate, and submit" },
    { title: "Credit decision coordination",  description: "Trigger the credit-check flow, explain outcomes, offer alternative terms on decline" },
    { title: "Order status & delivery tracking", description: "Show delivery status for devices, SIMs, and fibre installation appointments" },
    { title: "First-bill expectation setting", description: "Explain proration, one-off setup charges, and what will land on the first invoice" },
    { title: "Welcome & adoption nudges",      description: "Surface app install, eSIM activation, and the one-time things to do in week one" },
  ],
  quickActions: ["Find the right plan", "Sign me up", "Order status", "Why was I declined?", "First-bill preview", "Getting started"],
  flow: {
    knowledgeSources: [
      { id: "tc-nc-kb-catalog",    name: "Product Catalogue",        type: "api",      icon: "computer-api",       description: "Live product catalogue — plans, bundles, devices, trade-in offers, campaign codes" },
      { id: "tc-nc-kb-onboard",    name: "Onboarding Playbook",      type: "document", icon: "hierarchy-document", description: "Step-by-step onboarding playbook per plan family including key first-week nudges" },
      { id: "tc-nc-kb-order-api",  name: "Order Management API",     type: "api",      icon: "computer-api",       description: "Live order status, delivery estimates, installation scheduling windows" },
    ],
    guardrails: [
      { id: "tc-nc-gr-no-mis-sell", name: "No Mis-selling",          type: "guardrail",icon: "shield-medal",      description: "Never steer a prospect into a higher plan than their declared usage justifies — policy-aligned recommender" },
      { id: "tc-nc-gr-pii",         name: "PII Protection",          type: "pii",      icon: "lock-security",     description: "Identity and credit data handled per data-protection regulation, with minimal persistence" },
    ],
    actionHooks: [
      { id: "tc-nc-ah-submit",      name: "Submit Sign-up",          type: "api",      icon: "finger-tap",         description: "Submits the completed sign-up into the order system and returns an order reference" },
      { id: "tc-nc-ah-schedule",    name: "Book Installation Slot",  type: "api",      icon: "calendar-day",       description: "Reserves an installation time window for fibre or in-home device delivery" },
    ],
    processes: [
      { id: "tc-nc-pr-credit",      name: "Credit Decision Flow",    type: "workflow", icon: "hierarchy",          description: "Structured credit-check orchestration with outcome-specific alternatives" },
      { id: "tc-nc-pr-handoff",     name: "Sales-specialist Handoff",type: "transfer", icon: "headset",            description: "Hands to a sales specialist for complex configurations (multi-line, business, large bundles)" },
    ],
    standardResponses: [
      { id: "tc-nc-sr-welcome",     name: "Welcome & Order Confirmation",type: "standard",icon: "thumbs-up",       description: "Confirms the order with next-step checklist and expected service-live date" },
      { id: "tc-nc-sr-fallback",    name: "Specialist Review",       type: "fallback", icon: "route",              description: "Fallback to a human specialist for edge cases beyond automated sign-up" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband", "telco:b2b"],
  tier: "primary",
};

export default agent;

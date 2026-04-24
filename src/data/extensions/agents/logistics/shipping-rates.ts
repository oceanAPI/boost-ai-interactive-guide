import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "lg_shipping_rates",
  name: "Shipping Rates & Services",
  icon: "balance",
  automationRate: 90,
  avgResolutionTime: "~1.5 min",
  topTopic: "How much does it cost?",
  description:
    "Rate discovery for senders — shows price, expected transit time, and service levels for any origin-destination-weight combination.",
  capabilities: [
    { title: "Instant rate quote",          description: "Return pricing for a specific parcel given origin, destination, weight, and dimensions" },
    { title: "Service-level comparison",    description: "Compare express, standard, and economy service tiers with trade-offs explained" },
    { title: "Customs & duties estimator",  description: "Estimate customs and duty charges for cross-border shipments" },
  ],
  quickActions: ["Get a quote", "Compare services", "Customs estimate", "Weight limits"],
  flow: {
    knowledgeSources: [
      { id: "lg-sr-kb-rates-api", name: "Rating Engine API",     type: "api",      icon: "computer-api",       description: "Live rating engine for all shipping services" },
      { id: "lg-sr-kb-customs",   name: "Customs Rules",          type: "document", icon: "hierarchy-document", description: "Country-specific import/export rules and duty tables" },
    ],
    guardrails: [
      { id: "lg-sr-gr-estimate",  name: "Estimate-Only Disclaimer",type: "guardrail",icon: "shield-medal",     description: "Frames cross-border duty estimates as indicative; final charges depend on customs inspection" },
    ],
    actionHooks: [
      { id: "lg-sr-ah-save-quote",name: "Save Quote",             type: "api",      icon: "finger-tap",         description: "Saves a quote into the sender's account for later conversion to a booking" },
    ],
    processes: [
      { id: "lg-sr-pr-lookup",    name: "Rate Lookup",            type: "workflow", icon: "route",              description: "Structured interview capturing origin, destination, weight, and dimensions" },
    ],
    standardResponses: [
      { id: "lg-sr-sr-quoted",    name: "Quote Returned",          type: "standard", icon: "thumbs-up",          description: "Formatted quote with price, service tier, and expected transit time" },
    ],
  },
  variants: ["logistics:parcel", "logistics:freight", "logistics:cross_border"],
  tier: "addon",
};

export default agent;

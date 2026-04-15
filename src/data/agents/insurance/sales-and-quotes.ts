import type { SpecialistAgent } from "../_types";

/**
 * Sits at the top of the "self-service channels" funnel stage.
 * Converts web/app traffic into quoted business without agent involvement.
 */
const agent: SpecialistAgent = {
  key: "sales_quotes",
  name: "Sales & Quotes",
  icon: "target-selection",
  automationRate: 71,
  avgResolutionTime: "~4 min",
  topTopic: "Price a new policy",
  description: "New-business guidance: product discovery, quote generation, bundling recommendations, conversion hand-off to sales.",
  capabilities: [
    { title: "Product discovery", description: "Helps prospects figure out which policies they need based on life situation" },
    { title: "Instant quotes", description: "Generates indicative premiums from postcode, vehicle, or property basics" },
    { title: "Bundling & discounts", description: "Surfaces multi-policy discounts and member-owner benefits automatically" },
    { title: "Quote retrieval", description: "Retrieves saved quotes by reference, BankID identity, or email" },
    { title: "Policy purchase hand-off", description: "Completes sale in-channel or routes to licensed sales for complex needs" },
    { title: "Comparison guidance", description: "Explains how coverage levels differ without making unlicensed recommendations" },
  ],
  quickActions: ["Price home insurance", "Price car insurance", "Add pet to policy", "Get saved quote", "Compare coverage", "Talk to sales"],
  flow: {
    knowledgeSources: [
      { id: "isq-kb-products", name: "Product Catalog", type: "faq", icon: "books", description: "All insurance products, coverages, exclusions and eligibility rules" },
      { id: "isq-kb-rating-api", name: "Rating & Quote API", type: "api", icon: "computer-api", description: "Real-time premium calculation based on risk profile" },
      { id: "isq-kb-bundling", name: "Bundling Rules", type: "database", icon: "database-connection", description: "Multi-policy discount eligibility and promotional campaigns" },
    ],
    guardrails: [
      { id: "isq-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated premiums, coverage limits, or eligibility claims" },
      { id: "isq-gr-licensed-advice", name: "Licensed-Advice Guard", type: "compliance", icon: "lock-security", description: "Blocks unlicensed product recommendations and routes to licensed sales" },
    ],
    actionHooks: [
      { id: "isq-ah-save-quote", name: "Save Quote", type: "webhook", icon: "target-selection", description: "Persists quote with reference number for later retrieval" },
      { id: "isq-ah-sales-handover", name: "Hand Over to Sales", type: "transfer", icon: "headset", description: "Routes to manned digital chat or licensed sales agent" },
      { id: "isq-ah-send-quote", name: "Send Quote by Email/SMS", type: "webhook", icon: "phone", description: "Delivers quote summary to the customer's preferred channel" },
    ],
    processes: [
      { id: "isq-pr-quote-flow", name: "Quote Generation", type: "workflow", icon: "hierarchy", description: "Orchestrates multi-step quote collection and premium calculation" },
      { id: "isq-pr-purchase", name: "Policy Binding", type: "workflow", icon: "cogs", description: "Binds quote to active policy, issues documents, triggers welcome flow" },
    ],
    standardResponses: [
      { id: "isq-sr-quote-ready", name: "Quote Ready", type: "confirmation", icon: "thumbs-up", description: "Presents indicative premium with next-step options" },
      { id: "isq-sr-need-licensed", name: "Needs Licensed Advice", type: "request", icon: "route", description: "Politely explains why the query needs a licensed human sales agent" },
    ],
  },
};

export default agent;

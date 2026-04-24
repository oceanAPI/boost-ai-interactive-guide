import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "lg_sustainability",
  name: "Sustainability & Emissions",
  icon: "light",
  automationRate: 80,
  avgResolutionTime: "~1 min",
  topTopic: "My carbon footprint",
  description:
    "Answers sustainability questions — parcel emissions estimates, carbon-neutral shipping options, and green-delivery preferences.",
  capabilities: [
    { title: "Per-parcel CO₂ estimate", description: "Give an estimated CO₂-equivalent figure for a specific parcel's journey" },
    { title: "Green shipping options",  description: "Surface carbon-neutral or low-emission shipping options when available" },
  ],
  quickActions: ["Parcel emissions", "Green options", "Sustainability goals"],
  flow: {
    knowledgeSources: [
      { id: "lg-su-kb-emissions", name: "Emissions Model", type: "api", icon: "computer-api", description: "CO₂-estimation model that accounts for route, mode, and load factor" },
      { id: "lg-su-kb-policy",    name: "Sustainability Policy", type: "document", icon: "hierarchy-document", description: "Corporate-sustainability policy and reporting standards" },
    ],
    guardrails: [
      { id: "lg-su-gr-no-greenwash", name: "No Greenwash", type: "guardrail", icon: "shield-medal", description: "Refuses to make unverifiable green claims; sticks to certified figures only" },
    ],
    actionHooks: [
      { id: "lg-su-ah-report", name: "Email Emissions Report", type: "email", icon: "phone", description: "Sends a formatted emissions summary to the account holder" },
    ],
    processes: [
      { id: "lg-su-pr-lookup", name: "Emissions Lookup", type: "workflow", icon: "route", description: "Retrieves and formats the emissions estimate for the requested parcel" },
    ],
    standardResponses: [
      { id: "lg-su-sr-figure", name: "Emissions Figure", type: "standard", icon: "thumbs-up", description: "Formatted emissions estimate with comparable context" },
    ],
  },
  tier: "light",
};

export default agent;

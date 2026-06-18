import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_travel_documents",
  name: "Travel Documents & Entry Requirements",
  icon: "document",
  automationRate: 84,
  avgResolutionTime: "~2 min",
  topTopic: "Do I need a visa?",
  description:
    "Passport / visa / ETIAS / health-entry requirements per route. Surfaces what the passenger needs to fly and what they need to enter the destination. Defers final responsibility to the passenger and the consulate.",
  capabilities: [
    { title: "Document requirement lookup",     description: "Per nationality + destination, list passport validity, visa, ETIAS / ESTA, transit-visa, and health-entry requirements" },
    { title: "Passport-validity check",          description: "Flag if the passport doesn't meet the destination's minimum-validity-on-entry rule for the planned travel dates" },
    { title: "Health-entry requirements",        description: "Surface vaccination / test requirements for the destination from the authoritative source" },
    { title: "ETIAS / ESTA / waiver pre-check",  description: "Sign-post the right authorisation flow with link to the official portal" },
  ],
  quickActions: ["Do I need a visa?", "Check my passport", "Health requirements", "ETIAS / ESTA"],
  flow: {
    knowledgeSources: [
      { id: "al-td-kb-timatic", name: "Timatic / IATA Travel Centre",type: "api",      icon: "computer-api",       description: "Authoritative document-requirement service for nationality + destination + transit combinations" },
      { id: "al-td-kb-disclaimers",name: "Customer Disclaimer Library",type: "document",icon: "hierarchy-document",description: "Pre-approved passenger-responsibility disclaimers for document and entry advice" },
    ],
    guardrails: [
      { id: "al-td-gr-disclaimer",name: "Authoritative Disclaimer",type: "guardrail",icon: "shield-medal",         description: "Always defers final responsibility to the passenger and the consulate; never claims authority over admission" },
    ],
    actionHooks: [
      { id: "al-td-ah-portal",  name: "Open Official Portal",     type: "link",     icon: "computer-api",          description: "One-tap link out to the official ETIAS / ESTA / e-visa portal where applicable" },
    ],
    processes: [
      { id: "al-td-pr-pnr",     name: "PNR-aware Lookup",         type: "workflow", icon: "hierarchy",             description: "Pulls itinerary from the PNR (where authenticated) so the lookup is automatic per leg and traveller nationality" },
    ],
    standardResponses: [
      { id: "al-td-sr-summary", name: "Requirements Summary",     type: "standard",icon: "thumbs-up",              description: "Returns a structured summary with passport, visa, health, and disclaimer all in one block" },
      { id: "al-td-sr-fallback",name: "Consulate Referral",       type: "fallback",icon: "route",                  description: "Fallback to consulate or embassy referral when the case is non-standard or risk-bearing" },
    ],
  },
  tier: "addon",
};

export default agent;

import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_cargo_freight",
  name: "Cargo & Freight",
  icon: "package",
  automationRate: 70,
  avgResolutionTime: "~3 min",
  topTopic: "Ship cargo",
  description:
    "Air-cargo enquiries for forwarders and direct shippers — capacity quotes, AWB tracking, special-cargo requirements (dangerous goods, temperature-controlled, live animals), and customs / documentation routing.",
  capabilities: [
    { title: "Capacity & rate quote",          description: "Quote available capacity and applicable rate for an origin / destination / weight / dimensions enquiry" },
    { title: "AWB tracking",                    description: "Track an air waybill with current status and ETA" },
    { title: "Special-cargo routing",           description: "Triage dangerous-goods / temperature / live-animal enquiries to the right specialist with required-documents checklist" },
    { title: "Customs & documentation",          description: "Sign-post the customs and documentation requirements for the lane and commodity" },
  ],
  quickActions: ["Get a quote", "Track AWB", "Special cargo", "Customs requirements"],
  flow: {
    knowledgeSources: [
      { id: "al-cf-kb-cargo-api",name: "Cargo Booking API",   type: "api",      icon: "computer-api",       description: "Live cargo platform for capacity, rates, and AWB status" },
      { id: "al-cf-kb-special",  name: "Special-cargo Manual",type: "document", icon: "hierarchy-document", description: "Special-cargo handling manual — dangerous goods (IATA DGR), temperature-controlled, live animals" },
    ],
    guardrails: [
      { id: "al-cf-gr-special",  name: "Specialist for Special-cargo",type: "guardrail",icon: "shield-medal",description: "Always routes special-cargo enquiries to a human specialist; never auto-confirms DGR / temp-controlled bookings" },
    ],
    actionHooks: [
      { id: "al-cf-ah-quote",    name: "Issue Quote",         type: "api",      icon: "finger-tap",         description: "Issues a structured rate-quote with reference number and acceptance window" },
    ],
    processes: [
      { id: "al-cf-pr-route",    name: "Cargo-desk Handoff",  type: "transfer", icon: "headset",            description: "Routes to the cargo desk for booking-commit on standard cargo and all special-cargo cases" },
    ],
    standardResponses: [
      { id: "al-cf-sr-quoted",   name: "Quote Issued",        type: "standard",icon: "thumbs-up",           description: "Confirms the quote with reference number, validity, and the contact path to commit the booking" },
    ],
  },
  variants: ["airline:scheduled"],
  tier: "addon",
};

export default agent;

import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_special_assistance",
  name: "Special Assistance",
  icon: "heart_hand",
  automationRate: 70,
  avgResolutionTime: "~3 min",
  topTopic: "I need assistance",
  description:
    "Accessibility and special-service requests — mobility assistance, medical clearance, unaccompanied minors, and dietary needs. Conservative automation with rapid human hand-off when needed.",
  capabilities: [
    { title: "Wheelchair & mobility service",description: "Request wheelchair or mobility assistance at departure, transit, and arrival airports" },
    { title: "Medical clearance submission", description: "Submit medical information for fit-to-fly clearance where required" },
    { title: "Unaccompanied minor booking",  description: "Arrange unaccompanied minor service with the required documentation" },
  ],
  quickActions: ["Wheelchair", "Medical clearance", "Unaccompanied minor", "Dietary needs"],
  flow: {
    knowledgeSources: [
      { id: "al-sa-kb-sr-codes", name: "Special Service Codes",  type: "document", icon: "hierarchy-document", description: "IATA special-service request codes and their operational meaning" },
      { id: "al-sa-kb-policy",   name: "Accessibility Policy",   type: "document", icon: "hierarchy-document", description: "Airline accessibility policy, including aircraft capability matrix" },
    ],
    guardrails: [
      { id: "al-sa-gr-empathy",  name: "Empathy-first Tone",     type: "guardrail",icon: "shield-medal", description: "Non-negotiable empathy-first tone; never dismissive or procedural-only" },
      { id: "al-sa-gr-pii",      name: "PII Protection",          type: "pii",      icon: "lock-security",description: "Medical and accessibility data handled under heightened privacy protections" },
    ],
    actionHooks: [
      { id: "al-sa-ah-ssr",      name: "Add Special Service Request",type: "api",  icon: "finger-tap",   description: "Posts the SSR to the booking with the correct IATA code and any supporting data" },
    ],
    processes: [
      { id: "al-sa-pr-escalate", name: "Rapid Human Hand-off",    type: "transfer", icon: "headset",      description: "Shortens automation and hands off to a trained specialist on any uncertain case" },
    ],
    standardResponses: [
      { id: "al-sa-sr-confirmed",name: "Assistance Arranged",      type: "standard",icon: "thumbs-up",    description: "Confirms special-service arrangement with clear airport-level instructions" },
    ],
  },
  tier: "light",
};

export default agent;

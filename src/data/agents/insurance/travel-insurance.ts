import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for travel insurance. Single-trip and annual
 * multi-trip policies, medical emergencies abroad, trip cancellation,
 * baggage and delay claims.
 */
const agent: SpecialistAgent = {
  key: "travel_insurance",
  name: "Travel Insurance",
  icon: "route",
  automationRate: 80,
  avgResolutionTime: "~2 min",
  topTopic: "Medical emergency abroad",
  description: "Travel policies — trip cover, medical assistance abroad, cancellation, baggage and delay claims, pre-existing conditions.",
  capabilities: [
    { title: "Medical emergency abroad", description: "Connects to 24/7 medical assistance provider with policy reference" },
    { title: "Trip cancellation", description: "Initiates cancellation claim with required evidence checklist" },
    { title: "Baggage & delay", description: "Files lost-baggage or flight-delay claims with receipts and flight details" },
    { title: "Pre-existing conditions", description: "Explains medical declaration rules and screening requirements" },
  ],
  quickActions: ["Medical help abroad", "Cancel my trip", "Lost baggage", "Flight delay", "Declare medical"],
  flow: {
    knowledgeSources: [
      { id: "ti-kb-travel-faq", name: "Travel FAQ", type: "faq", icon: "books", description: "Cover limits, exclusions, destinations, medical screening" },
      { id: "ti-kb-policy-api", name: "Travel Policy API", type: "api", icon: "computer-api", description: "Policy status, trip dates, covered travellers" },
      { id: "ti-kb-assistance", name: "Medical Assistance Partner", type: "api", icon: "computer-api", description: "24/7 medical assistance provider for emergencies abroad" },
    ],
    guardrails: [
      { id: "ti-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect cover or limit claims" },
      { id: "ti-gr-emergency-priority", name: "Emergency Priority", type: "compliance", icon: "shield-medal", description: "Detects medical emergency keywords and prioritises handover" },
    ],
    actionHooks: [
      { id: "ti-ah-medical-connect", name: "Connect Medical Assistance", type: "transfer", icon: "headset", description: "Hot-transfer to medical assistance partner with policy pre-loaded" },
      { id: "ti-ah-file-claim", name: "File Claim", type: "webhook", icon: "target-selection", description: "Opens cancellation / baggage / delay claim with intake data" },
    ],
    processes: [
      { id: "ti-pr-claim-intake", name: "Claim Intake", type: "workflow", icon: "cogs", description: "Structured intake with evidence checklist per claim type" },
    ],
    standardResponses: [
      { id: "ti-sr-connected", name: "Medical Connected", type: "confirmation", icon: "thumbs-up", description: "Confirms connection to medical assistance with reference number" },
      { id: "ti-sr-claim-opened", name: "Claim Opened", type: "confirmation", icon: "check-symbol-check", description: "Confirms claim opened with next-step evidence requirements" },
    ],
  },
  tier: "addon",
  // Travel insurance is a significant line for composite mutuals and broker-driven insurers, less so for DTC digital challengers.
  variants: ["insurance:mutual", "insurance:broker"],
};

export default agent;

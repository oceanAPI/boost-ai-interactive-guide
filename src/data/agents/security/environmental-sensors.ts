import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_environmental_sensors",
  name: "Environmental sensors",
  icon: "light",
  automationRate: 80,
  avgResolutionTime: "~1.5 min",
  topTopic: "Smoke sensor silencing",
  description: "Smoke detectors and water-leak sensors. Silencing false fire alarms, leak-alert handling, safe placement, battery life and insurance-discount reporting.",
  capabilities: [
    { title: "Silence a smoke alarm", description: "Safely silence a triggered smoke detector and confirm no real fire" },
    { title: "Water-leak response", description: "First-response guidance — shut-off advice, photos for claim, contact plumber" },
    { title: "Placement & coverage", description: "Rooms to cover, heights, distance from vents and showers" },
    { title: "Battery life", description: "Expected lifespan and replacement cadence per model" },
    { title: "Insurance-discount letter", description: "Generate proof-of-installation documentation accepted by Nordic insurers" },
  ],
  quickActions: ["Silence smoke alarm", "Water leak detected", "Where should I put it?", "When do I change the battery?", "Send insurance proof"],
  flow: {
    knowledgeSources: [
      { id: "sec-es-kb-fire", name: "Fire & leak SOP", type: "document", icon: "hierarchy-document", description: "Scripted safe-first response for smoke and water events" },
      { id: "sec-es-kb-models", name: "Sensor spec library", type: "document", icon: "books", description: "Each sensor model's range, expected lifespan and certifications" },
    ],
    guardrails: [
      { id: "sec-es-gr-safety", name: "Safety-first routing", type: "policy", icon: "shield-medal", description: "Any active fire or flooding event escalates to live human + emergency guidance before any self-service" },
      { id: "sec-es-gr-hallucination", name: "Hallucination detection", type: "hallucination", icon: "shield-medal", description: "Never invent sensor specs or certifications not in the library" },
    ],
    actionHooks: [
      { id: "sec-es-ah-silence", name: "Silence alarm", type: "webhook", icon: "close-symbol", description: "Sends a silence-test command after the no-real-fire check" },
      { id: "sec-es-ah-proof", name: "Send insurance letter", type: "webhook", icon: "hierarchy-document", description: "Generates a signed proof-of-installation PDF addressed to the customer's insurer" },
    ],
    processes: [
      { id: "sec-es-pr-leak", name: "Leak first-response", type: "workflow", icon: "hierarchy", description: "Scripted triage — is it contained? shut-off? photo? plumber referral?" },
    ],
    standardResponses: [
      { id: "sec-es-sr-escalated", name: "Escalated to live agent", type: "informational", icon: "headset", description: "Active fire / flood → routes immediately with the event context" },
      { id: "sec-es-sr-letter", name: "Insurance letter sent", type: "confirmation", icon: "check-symbol-check", description: "Letter delivered to the account email, with filename + reference" },
    ],
  },
};

export default agent;

import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for health / private medical insurance.
 * Appointment booking, network provider lookup, pre-authorisation,
 * claim submission for out-of-network providers.
 */
const agent: SpecialistAgent = {
  key: "health_insurance",
  name: "Health Insurance",
  icon: "hand-protection",
  automationRate: 76,
  avgResolutionTime: "~3 min",
  topTopic: "Find a specialist in my network",
  description: "Private medical cover — find a network provider, book an appointment, pre-authorisation, explanation of benefits, and reimbursement claims.",
  capabilities: [
    { title: "Network provider lookup", description: "Finds in-network specialists, hospitals, and primary-care by location and specialty" },
    { title: "Appointment booking", description: "Books consultations with network providers via partner booking API" },
    { title: "Pre-authorisation", description: "Initiates and tracks pre-auth requests for procedures and treatments" },
    { title: "Explanation of benefits", description: "Explains claim adjudication, co-pays, deductibles, and out-of-pocket maximums" },
    { title: "Reimbursement claims", description: "Handles out-of-network claim submission with receipt OCR" },
  ],
  quickActions: ["Find a specialist", "Book appointment", "Pre-authorisation", "Explain my claim", "Submit receipt"],
  flow: {
    knowledgeSources: [
      { id: "hli-kb-health-faq", name: "Health FAQ", type: "faq", icon: "books", description: "Cover terms, network rules, pre-auth criteria" },
      { id: "hli-kb-policy-api", name: "Health Policy API", type: "api", icon: "computer-api", description: "Cover, deductibles, out-of-pocket maximums, claim history" },
      { id: "hli-kb-provider-directory", name: "Provider Directory", type: "database", icon: "database-connection", description: "In-network providers, specialties, locations, capacity" },
    ],
    guardrails: [
      { id: "hli-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents medical-information errors or cover misrepresentations" },
      { id: "hli-gr-phi", name: "PHI Protection", type: "compliance", icon: "lock-security", description: "Enforces strict PHI handling and authentication for health-record access" },
    ],
    actionHooks: [
      { id: "hli-ah-book-appt", name: "Book Appointment", type: "webhook", icon: "target-selection", description: "Books the slot via provider booking API with confirmation" },
      { id: "hli-ah-submit-preauth", name: "Submit Pre-auth", type: "webhook", icon: "cogs", description: "Routes pre-authorisation request through medical-review workflow" },
    ],
    processes: [
      { id: "hli-pr-preauth-flow", name: "Pre-auth Flow", type: "workflow", icon: "hierarchy", description: "Clinical intake, medical review, decision delivery" },
      { id: "hli-pr-claim-adjudication", name: "Claim Adjudication", type: "workflow", icon: "cogs", description: "Applies cover rules and reimbursement calculation" },
    ],
    standardResponses: [
      { id: "hli-sr-booked", name: "Appointment Booked", type: "confirmation", icon: "thumbs-up", description: "Confirms appointment with provider, time, and prep instructions" },
      { id: "hli-sr-preauth", name: "Pre-auth Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms pre-auth submission with review timeline" },
    ],
  },
  tier: "addon",
  // Private health insurance is most relevant in mutual composites and broker-driven markets; DTC challengers rarely carry it.
  variants: ["insurance:mutual", "insurance:broker"],
};

export default agent;

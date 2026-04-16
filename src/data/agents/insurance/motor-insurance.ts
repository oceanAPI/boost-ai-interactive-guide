import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for motor / auto insurance. Handles conversations
 * anchored to a vehicle policy — breakdown assistance, green-card
 * requests, mileage changes, driver additions. Cross-cuts with the
 * journey agents (Claims, Sales, Coverage) for FNOL, new policies,
 * and endorsements.
 */
const agent: SpecialistAgent = {
  key: "motor_insurance",
  name: "Motor Insurance",
  icon: "car-front",
  automationRate: 84,
  avgResolutionTime: "~2 min",
  topTopic: "My car broke down",
  description: "Auto policies — breakdown assistance, green card, driver and vehicle changes, mileage updates, and no-claims-bonus protection.",
  capabilities: [
    { title: "Breakdown assistance", description: "Dispatches roadside assistance and tracks ETA for stranded drivers" },
    { title: "Green card requests", description: "Issues proof-of-insurance cards for cross-border travel" },
    { title: "Add/remove driver", description: "Processes named-driver changes with underwriting re-rating" },
    { title: "Change of vehicle", description: "Handles mid-term vehicle swaps with immediate cover confirmation" },
    { title: "Mileage & usage updates", description: "Annual-mileage changes and commute-category updates" },
    { title: "No-claims bonus", description: "Confirms current NCB, issues proof-of-NCB for other insurers" },
  ],
  quickActions: ["Breakdown help", "Green card", "Change vehicle", "Add driver", "Update mileage", "My NCB"],
  flow: {
    knowledgeSources: [
      { id: "mi-kb-motor-faq", name: "Motor FAQ", type: "faq", icon: "books", description: "Vehicle coverage rules, breakdown network, NCB terms" },
      { id: "mi-kb-policy-api", name: "Motor Policy API", type: "api", icon: "computer-api", description: "Vehicle details, drivers, mileage, cover options" },
      { id: "mi-kb-breakdown-network", name: "Breakdown Network DB", type: "database", icon: "database-connection", description: "Partner recovery contractors and dispatch rules" },
    ],
    guardrails: [
      { id: "mi-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect coverage or cost claims" },
      { id: "mi-gr-underwriting", name: "Underwriting Guardrail", type: "compliance", icon: "lock-security", description: "Triggers re-rating when driver or vehicle changes exceed thresholds" },
    ],
    actionHooks: [
      { id: "mi-ah-dispatch-breakdown", name: "Dispatch Breakdown", type: "webhook", icon: "target-selection", description: "Sends recovery job to the breakdown-network API with location" },
      { id: "mi-ah-issue-green-card", name: "Issue Green Card", type: "email", icon: "phone", description: "Emails digital green card PDF to the customer" },
      { id: "mi-ah-transfer-uw", name: "Transfer to Underwriter", type: "transfer", icon: "headset", description: "Escalates complex endorsements to a human underwriter" },
    ],
    processes: [
      { id: "mi-pr-endorsement", name: "Endorsement Processing", type: "workflow", icon: "hierarchy", description: "Validates and applies mid-term policy changes with re-rating" },
      { id: "mi-pr-breakdown-workflow", name: "Breakdown Workflow", type: "workflow", icon: "cogs", description: "Orchestrates intake, dispatch, ETA tracking, and completion" },
    ],
    standardResponses: [
      { id: "mi-sr-dispatched", name: "Breakdown Dispatched", type: "confirmation", icon: "thumbs-up", description: "Confirms dispatch with contractor name and ETA" },
      { id: "mi-sr-endorsed", name: "Policy Endorsed", type: "confirmation", icon: "check-symbol-check", description: "Confirms endorsement with effective date and any premium change" },
    ],
  },
  tier: "primary",
};

export default agent;

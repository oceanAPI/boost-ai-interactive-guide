import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for home / property insurance. Buildings and
 * contents cover, emergency-plumbing dispatch, valuables add-ons,
 * moving-home policy transfers.
 */
const agent: SpecialistAgent = {
  key: "home_insurance",
  name: "Home Insurance",
  icon: "house",
  automationRate: 82,
  avgResolutionTime: "~2.5 min",
  topTopic: "Water damage from a burst pipe",
  description: "Home policies — buildings, contents, emergency assistance, moving home, valuables add-ons, and accidental-damage cover.",
  capabilities: [
    { title: "Emergency assistance", description: "Dispatches emergency plumbers, locksmiths, and glazing services" },
    { title: "Buildings vs contents", description: "Explains what's covered by each part of the policy" },
    { title: "Moving home", description: "Transfers the policy to a new address with mid-term re-rating" },
    { title: "Valuables & high-value items", description: "Adds named items (jewellery, art, bikes) to the schedule" },
    { title: "Accidental damage", description: "Adds or removes accidental-damage cover mid-term" },
    { title: "Home emergency claims", description: "Handles simple incident reporting and triage" },
  ],
  quickActions: ["Emergency plumber", "Moving home", "Add valuables", "Accidental damage", "Report incident", "Cover explained"],
  flow: {
    knowledgeSources: [
      { id: "hi-kb-home-faq", name: "Home FAQ", type: "faq", icon: "books", description: "Buildings/contents rules, single-article limits, exclusions" },
      { id: "hi-kb-policy-api", name: "Home Policy API", type: "api", icon: "computer-api", description: "Property details, schedule, coverage limits" },
      { id: "hi-kb-emergency-network", name: "Emergency Network DB", type: "database", icon: "database-connection", description: "Approved tradespeople and dispatch rules" },
    ],
    guardrails: [
      { id: "hi-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents coverage or limit errors" },
      { id: "hi-gr-single-article", name: "Single-Article Limit Guardrail", type: "compliance", icon: "lock-security", description: "Enforces evidence requirements before adding high-value items" },
    ],
    actionHooks: [
      { id: "hi-ah-dispatch-emergency", name: "Dispatch Emergency Tradesperson", type: "webhook", icon: "target-selection", description: "Sends a job to the emergency network with address and trade type" },
      { id: "hi-ah-update-schedule", name: "Update Schedule", type: "webhook", icon: "cogs", description: "Adds valuables or endorsements to the policy schedule" },
      { id: "hi-ah-transfer-claims", name: "Transfer to Claims", type: "transfer", icon: "headset", description: "Warm handover to Claims agent for anything beyond triage" },
    ],
    processes: [
      { id: "hi-pr-move-home", name: "Move Home", type: "workflow", icon: "hierarchy", description: "Validates new address, re-rates, and transfers cover seamlessly" },
      { id: "hi-pr-emergency-flow", name: "Emergency Flow", type: "workflow", icon: "cogs", description: "Intake, dispatch, ETA, and post-visit status tracking" },
    ],
    standardResponses: [
      { id: "hi-sr-dispatched", name: "Tradesperson Dispatched", type: "confirmation", icon: "thumbs-up", description: "Confirms dispatch with contractor name and ETA" },
      { id: "hi-sr-moved", name: "Policy Moved", type: "confirmation", icon: "check-symbol-check", description: "Confirms move-home with new effective date and premium change" },
    ],
  },
  tier: "primary",
};

export default agent;

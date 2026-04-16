import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for pet insurance. Veterinary bill submission,
 * coverage explainer, add/remove pets, pre-existing condition rules.
 * Particularly relevant for DTC challengers (Lemonade, Hedvig) and
 * some composite mutuals.
 */
const agent: SpecialistAgent = {
  key: "pet_insurance",
  name: "Pet Insurance",
  icon: "paw-print",
  automationRate: 83,
  avgResolutionTime: "~2 min",
  topTopic: "Submit a vet bill",
  description: "Pet policies — vet bill submission, cover explainer, add/remove pets, pre-existing condition rules, breed-specific exclusions.",
  capabilities: [
    { title: "Submit vet bill", description: "Photo-based vet-bill intake with structured extraction and claim creation" },
    { title: "Cover explainer", description: "Explains accident, illness, and wellness cover with limits and excesses" },
    { title: "Add / remove pet", description: "Manages the pet schedule with veterinary history intake" },
    { title: "Pre-existing conditions", description: "Clarifies how pre-existing conditions are handled per policy type" },
  ],
  quickActions: ["Submit bill", "My cover", "Add pet", "Remove pet", "Pre-existing rules"],
  flow: {
    knowledgeSources: [
      { id: "pi-kb-pet-faq", name: "Pet FAQ", type: "faq", icon: "books", description: "Cover rules, excesses, breed exclusions, wellness add-ons" },
      { id: "pi-kb-policy-api", name: "Pet Policy API", type: "api", icon: "computer-api", description: "Pet schedule, claim history, cover limits" },
      { id: "pi-kb-ocr", name: "Vet-Bill OCR", type: "api", icon: "computer-api", description: "Structured extraction of procedures and costs from uploaded bills" },
    ],
    guardrails: [
      { id: "pi-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect cover or exclusion claims" },
      { id: "pi-gr-fraud-ocr", name: "Fraud Screening", type: "compliance", icon: "lock-security", description: "Detects duplicate or edited vet bills via OCR + pattern checks" },
    ],
    actionHooks: [
      { id: "pi-ah-file-claim", name: "File Vet Claim", type: "webhook", icon: "target-selection", description: "Opens claim with extracted procedure codes and reimbursement calc" },
      { id: "pi-ah-update-schedule", name: "Update Pet Schedule", type: "webhook", icon: "cogs", description: "Adds or removes pets from the policy schedule" },
    ],
    processes: [
      { id: "pi-pr-claim-flow", name: "Vet Claim Flow", type: "workflow", icon: "cogs", description: "OCR → validation → reimbursement calculation → payout" },
    ],
    standardResponses: [
      { id: "pi-sr-claim-filed", name: "Claim Filed", type: "confirmation", icon: "thumbs-up", description: "Confirms claim with expected reimbursement and timeline" },
      { id: "pi-sr-pet-added", name: "Pet Added", type: "confirmation", icon: "check-symbol-check", description: "Confirms pet added to schedule with new premium" },
    ],
  },
  tier: "addon",
  // Pet insurance is a DTC-first product in Europe; some mutuals also carry it.
  variants: ["insurance:dtc", "insurance:mutual"],
};

export default agent;

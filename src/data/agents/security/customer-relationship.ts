import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_customer_relationship",
  name: "Customer relationship",
  icon: "heart_hand",
  automationRate: 70,
  avgResolutionTime: "~2 min",
  topTopic: "Moving house",
  description: "Account-level conversations — moving house, transferring an agreement, end-of-contract options, life-event changes (bereavement, divorce), loyalty and retention offers.",
  capabilities: [
    { title: "Moving house", description: "Transfer the agreement to a new address, coordinate technician for old + new site" },
    { title: "Contract transfer", description: "Transfer agreement to a new owner / occupier with identity checks" },
    { title: "Retention offers", description: "Surface loyalty offers, contract-renewal pricing and bundle options" },
    { title: "Life-event handling", description: "Bereavement, divorce, separation — compassionate flows with human escalation" },
    { title: "End-of-contract options", description: "Explain renewal, pause, downgrade and cancellation paths" },
  ],
  quickActions: ["I'm moving house", "Cancel my contract", "Transfer the agreement", "Renewal options", "I need to pause"],
  flow: {
    knowledgeSources: [
      { id: "sec-cr-kb-contract", name: "Contract library", type: "document", icon: "hierarchy-document", description: "Notice periods, transfer rules and exit terms per market and product" },
      { id: "sec-cr-kb-offers", name: "Retention offer catalogue", type: "document", icon: "books", description: "Current approved offers per tier, market, contract length" },
    ],
    guardrails: [
      { id: "sec-cr-gr-empathy", name: "Empathy tone", type: "tone", icon: "heart", description: "Life-event conversations follow the compassionate-tone playbook and avoid upsell" },
      { id: "sec-cr-gr-auth", name: "Owner-only changes", type: "auth", icon: "lock-security", description: "Account owner identity must be verified before contract-level changes" },
    ],
    actionHooks: [
      { id: "sec-cr-ah-transfer", name: "Log transfer request", type: "webhook", icon: "hierarchy", description: "Creates a transfer task with new owner / address for the back office" },
      { id: "sec-cr-ah-offer", name: "Apply retention offer", type: "webhook", icon: "hand-to-hand", description: "Applies an approved retention offer and confirms new price / term" },
    ],
    processes: [
      { id: "sec-cr-pr-move", name: "Moving-house flow", type: "workflow", icon: "route", description: "Coordinates removal at old site + install at new site with one confirmation" },
    ],
    standardResponses: [
      { id: "sec-cr-sr-logged", name: "Change logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms the change is logged with reference and what happens next" },
      { id: "sec-cr-sr-human", name: "Routed to retention specialist", type: "informational", icon: "headset", description: "Hand-off used for complex life-events and sensitive cancellations" },
    ],
  },
};

export default agent;

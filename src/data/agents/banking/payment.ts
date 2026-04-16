import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "bank_payment",
  name: "Payment",
  icon: "banknote",
  automationRate: 85,
  avgResolutionTime: "~2 min",
  topTopic: "Send a wire transfer",
  description: "Outbound bill pay, wire transfers, standing orders, and payment scheduling — distinct from card-specific operations.",
  capabilities: [
    { title: "Bill pay setup", description: "Add payees, schedule one-time or recurring bill payments" },
    { title: "Wire transfers", description: "Initiates domestic and international wires with cut-off and fee disclosure" },
    { title: "Standing orders", description: "Create, modify, or cancel recurring transfers between accounts" },
    { title: "Payment status tracking", description: "Real-time status on initiated payments — scheduled, in-flight, settled, returned" },
  ],
  quickActions: ["Pay a bill", "Wire money", "Standing order", "Payment status", "Cancel payment"],
  flow: {
    knowledgeSources: [
      { id: "bpy-kb-payment-faq", name: "Payments FAQ", type: "faq", icon: "books", description: "Cut-off times, fees, limits, regulatory context" },
      { id: "bpy-kb-payment-api", name: "Payments API", type: "api", icon: "computer-api", description: "Initiation, status tracking, cancellation of payments" },
    ],
    guardrails: [
      { id: "bpy-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Enforces strong auth before high-value payment initiation" },
      { id: "bpy-gr-sanctions", name: "Sanctions Screening", type: "compliance", icon: "shield-medal", description: "Screens international payments against sanctions lists" },
    ],
    actionHooks: [
      { id: "bpy-ah-initiate", name: "Initiate Payment", type: "webhook", icon: "target-selection", description: "Submits payment for execution with full audit trail" },
      { id: "bpy-ah-cancel", name: "Cancel Payment", type: "webhook", icon: "cogs", description: "Cancels a scheduled or in-flight payment where possible" },
    ],
    processes: [
      { id: "bpy-pr-wire-orchestration", name: "Wire Orchestration", type: "workflow", icon: "hierarchy", description: "Coordinates validation, screening, and execution for wire transfers" },
    ],
    standardResponses: [
      { id: "bpy-sr-scheduled", name: "Payment Scheduled", type: "confirmation", icon: "thumbs-up", description: "Confirms scheduling with amount, date, and reference" },
    ],
  },
  tier: "addon",
};

export default agent;

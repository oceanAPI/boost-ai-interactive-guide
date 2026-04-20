import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_general",
  name: "General inquiries",
  icon: "speech",
  automationRate: 88,
  avgResolutionTime: "~1 min",
  topTopic: "Is the app down?",
  description: "App status, fee and limits FAQ, regulatory registrations, incident updates, complaint handling, and user feedback across every digital-first product.",
  capabilities: [
    { title: "Status & incidents", description: "Real-time app, payment-rail, and third-party-connector status with subscribe-to-updates" },
    { title: "Fees & limits FAQ", description: "Plan-specific fees, transaction limits, FX spreads, and out-of-network ATM charges" },
    { title: "Regulatory registrations", description: "E-money licence, BaaS sponsor bank, deposit protection scheme, and country coverage" },
    { title: "Complaint handling", description: "Log regulated complaints with acknowledgement, reference, and escalation to ombudsman if unresolved" },
    { title: "In-app release notes", description: "Summarise recent updates, new features, and changes to the UX that customers should know about" },
    { title: "Feedback & NPS", description: "Capture feedback and NPS signals and route to the product research backlog" },
  ],
  quickActions: ["App status", "Fees & limits", "Who regulates you", "File complaint", "What's new", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "fg-kb-status", name: "Status Page API", type: "api", icon: "globe", description: "Real-time system status, incident history, and scheduled maintenance windows" },
      { id: "fg-kb-fees", name: "Fee & Limits Schedule", type: "document", icon: "hierarchy-document", description: "Plan-tier fee schedule and transaction limits" },
      { id: "fg-kb-licensing", name: "Regulatory Registry", type: "document", icon: "hierarchy-document", description: "Licence details, sponsor banks, deposit protection, and country coverage" },
    ],
    guardrails: [
      { id: "fg-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about fees, limits, or regulatory status" },
      { id: "fg-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "lock-security", description: "Blocks any output that could be read as personalised financial advice" },
    ],
    actionHooks: [
      { id: "fg-ah-subscribe", name: "Subscribe to Status", type: "webhook", icon: "phone", description: "Opts the user into status-page email or push notifications" },
      { id: "fg-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a formal regulated-complaint record with acknowledgement reference" },
      { id: "fg-ah-feedback", name: "Capture Feedback", type: "webhook", icon: "thumbs-up", description: "Stores feedback and NPS signals in the product backlog" },
    ],
    processes: [
      { id: "fg-pr-incident-lookup", name: "Incident Lookup", type: "workflow", icon: "hierarchy", description: "Checks the status page for any active incident matching the user's reported symptom" },
      { id: "fg-pr-complaint-intake", name: "Complaint Intake", type: "workflow", icon: "cogs", description: "Captures regulated complaint with category, severity, and SLA clock start" },
    ],
    standardResponses: [
      { id: "fg-sr-status", name: "Status Update", type: "informational", icon: "thumbs-up", description: "Returns system status and links to any active-incident post" },
      { id: "fg-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint recorded with reference and expected response time" },
    ],
  },
  tier: "primary",
};

export default agent;

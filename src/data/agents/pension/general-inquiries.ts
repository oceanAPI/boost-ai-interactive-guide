import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_general",
  name: "General inquiries",
  icon: "speech",
  automationRate: 82,
  avgResolutionTime: "~1.5 min",
  topTopic: "When will I get my statement?",
  description: "Scheme info, operating hours, general questions, complaints, fee inquiries, and member feedback across every pension product.",
  capabilities: [
    { title: "Scheme FAQ", description: "Answer common questions about pension products, rules, and member services" },
    { title: "Operating hours & contact", description: "Phone-line opening hours, email addresses, and postal routing for member queries" },
    { title: "Complaint handling", description: "Log and route regulated complaints to the internal resolutions team with acknowledgement SLAs" },
    { title: "Charge & fee inquiries", description: "Explain annual management charges, platform fees, and fund costs across the scheme" },
    { title: "Contribution-rate inquiries", description: "Current employer / employee contribution rates, salary-sacrifice options, and annual allowance reminders" },
    { title: "Feedback collection", description: "Collect and route member feedback and service suggestions to product and operations teams" },
  ],
  quickActions: ["Opening hours", "Fees explained", "File complaint", "Contact scheme", "Contribution rates", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "pg-kb-general-faq", name: "Scheme FAQ", type: "faq", icon: "books", description: "Scheme-wide FAQ covering products, policies, and common questions" },
      { id: "pg-kb-fee-schedule", name: "Fee Schedule", type: "document", icon: "hierarchy-document", description: "Current charges across all funds, products, and service tiers" },
      { id: "pg-kb-crm", name: "Member CRM", type: "api", icon: "computer-api", description: "Member records, open cases, and communication preferences" },
    ],
    guardrails: [
      { id: "pg-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about fees, rates, or scheme rules" },
      { id: "pg-gr-tone", name: "Tone & Empathy", type: "tone", icon: "heart", description: "Ensures appropriate empathetic tone for complaints and sensitive life events" },
    ],
    actionHooks: [
      { id: "pg-ah-transfer-cs", name: "Transfer to Member Services", type: "transfer", icon: "headset", description: "Transfers to a live agent for unresolved inquiries" },
      { id: "pg-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a formal regulated-complaint record with acknowledgement letter" },
      { id: "pg-ah-feedback", name: "Capture Feedback", type: "webhook", icon: "thumbs-up", description: "Stores member feedback in the product insights backlog" },
    ],
    processes: [
      { id: "pg-pr-complaint-intake", name: "Complaint Intake", type: "workflow", icon: "hierarchy", description: "Captures regulated complaint with category, severity, and SLA clock start" },
      { id: "pg-pr-rate-lookup", name: "Rate Lookup", type: "workflow", icon: "cogs", description: "Looks up current fees, AMCs, and contribution rates for the member's scheme" },
    ],
    standardResponses: [
      { id: "pg-sr-fees", name: "Fee Explanation", type: "informational", icon: "thumbs-up", description: "Returns a plain-language fee breakdown with total annual cost" },
      { id: "pg-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint has been recorded with reference and expected response time" },
    ],
  },
  tier: "primary",
};

export default agent;

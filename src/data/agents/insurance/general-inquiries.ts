import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "insurance_general",
  name: "General inquiries",
  icon: "speech",
  automationRate: 82,
  avgResolutionTime: "~1.5 min",
  topTopic: "What does my policy cover?",
  description: "Firm info, regulated disclosures, policy-document requests, complaint handling, rate and premium inquiries, and feedback across every line of business.",
  capabilities: [
    { title: "Firm FAQ", description: "Answer common questions about the insurer, lines of business, and country coverage" },
    { title: "Regulated disclosures", description: "Provide authorisation details, ombudsman contact, and compensation-scheme coverage" },
    { title: "Policy-document requests", description: "Fetch and deliver policy wording, schedules, certificates, and endorsements on demand" },
    { title: "Complaint handling", description: "Log and route regulated complaints with acknowledgement and ombudsman referral path" },
    { title: "Premium & rate inquiries", description: "Explain premium components, discounts, no-claims bonus, and IPT / tax breakdown" },
    { title: "Feedback collection", description: "Capture policyholder feedback and route to the product or claims team" },
  ],
  quickActions: ["Firm details", "My policy docs", "File complaint", "Premium breakdown", "Ombudsman", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "ig-kb-general-faq", name: "Firm FAQ", type: "faq", icon: "books", description: "Insurer-wide FAQ covering lines of business, country coverage, and regulatory regime" },
      { id: "ig-kb-policy-api", name: "Policy Document API", type: "api", icon: "computer-api", description: "Fetches policy wording, schedules, and certificates from the policy store" },
      { id: "ig-kb-premium-engine", name: "Premium Breakdown Engine", type: "api", icon: "computer-api", description: "Returns premium components, discounts, and tax for the customer's active policies" },
    ],
    guardrails: [
      { id: "ig-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about coverage, exclusions, or premium calculation" },
      { id: "ig-gr-tone", name: "Tone & Empathy", type: "tone", icon: "heart", description: "Ensures appropriate empathetic tone especially for complaints and ombudsman referrals" },
    ],
    actionHooks: [
      { id: "ig-ah-transfer-cs", name: "Transfer to Customer Service", type: "transfer", icon: "headset", description: "Transfers to a live agent for unresolved inquiries" },
      { id: "ig-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a formal regulated-complaint record with acknowledgement and ombudsman pathway" },
      { id: "ig-ah-send-docs", name: "Send Policy Docs", type: "email", icon: "phone", description: "Delivers policy wording, schedule, or certificate via email or post" },
    ],
    processes: [
      { id: "ig-pr-complaint-intake", name: "Complaint Intake", type: "workflow", icon: "hierarchy", description: "Captures regulated complaint with category, severity, and SLA clock start" },
      { id: "ig-pr-doc-delivery", name: "Document Delivery", type: "workflow", icon: "cogs", description: "Fetches and delivers requested policy documents via preferred channel" },
    ],
    standardResponses: [
      { id: "ig-sr-premium", name: "Premium Breakdown", type: "informational", icon: "thumbs-up", description: "Returns premium component breakdown with IPT and total annual cost" },
      { id: "ig-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint recorded with reference and expected response time" },
    ],
  },
  tier: "primary",
};

export default agent;

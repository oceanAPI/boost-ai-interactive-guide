import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for commercial / business insurance. Property,
 * liability, fleet, professional indemnity — sold typically via broker
 * channels and requiring schedule management per SME or enterprise.
 */
const agent: SpecialistAgent = {
  key: "business_insurance",
  name: "Business Insurance",
  icon: "building-institution",
  automationRate: 70,
  avgResolutionTime: "~3.5 min",
  topTopic: "Add a new vehicle to our fleet",
  description: "Commercial cover — property, public and employer liability, fleet, professional indemnity, schedule management, and broker coordination.",
  capabilities: [
    { title: "Schedule management", description: "Add/remove properties, vehicles, employees from the policy schedule" },
    { title: "Certificate of insurance", description: "Issues certificates of insurance for contracts and landlords" },
    { title: "Fleet management", description: "Manages vehicle additions, named drivers, and mid-term adjustments" },
    { title: "Professional indemnity", description: "Policy limits, retroactive dates, claims-made vs occurrence explainer" },
    { title: "Broker coordination", description: "Routes enquiries to the broker-of-record with full context" },
  ],
  quickActions: ["Add vehicle", "Certificate of insurance", "Add employee", "Change address", "Talk to broker"],
  flow: {
    knowledgeSources: [
      { id: "bi-kb-comm-faq", name: "Commercial FAQ", type: "faq", icon: "books", description: "Coverage terms, schedule rules, certificate issuance" },
      { id: "bi-kb-policy-api", name: "Commercial Policy API", type: "api", icon: "computer-api", description: "Schedule, limits, retroactive dates, broker-of-record" },
      { id: "bi-kb-broker-registry", name: "Broker Registry", type: "database", icon: "database-connection", description: "Broker-of-record per account with contact details" },
    ],
    guardrails: [
      { id: "bi-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect cover or limit claims on commercial lines" },
      { id: "bi-gr-auth", name: "Signatory Authentication", type: "compliance", icon: "lock-security", description: "Verifies corporate signatory authority before schedule changes" },
    ],
    actionHooks: [
      { id: "bi-ah-schedule-update", name: "Update Schedule", type: "webhook", icon: "target-selection", description: "Adds or removes items from the commercial schedule" },
      { id: "bi-ah-issue-certificate", name: "Issue Certificate", type: "email", icon: "phone", description: "Generates and emails a certificate of insurance" },
      { id: "bi-ah-transfer-broker", name: "Transfer to Broker", type: "transfer", icon: "headset", description: "Warm handover to the broker-of-record with conversation context" },
    ],
    processes: [
      { id: "bi-pr-schedule-validation", name: "Schedule Validation", type: "workflow", icon: "hierarchy", description: "Validates signatory authority and applies mid-term re-rating" },
    ],
    standardResponses: [
      { id: "bi-sr-updated", name: "Schedule Updated", type: "confirmation", icon: "thumbs-up", description: "Confirms schedule change with any premium adjustment" },
      { id: "bi-sr-cert-issued", name: "Certificate Issued", type: "confirmation", icon: "check-symbol-check", description: "Confirms certificate issued with delivery details" },
    ],
  },
  tier: "addon",
  // Commercial insurance is predominantly a broker-channel product.
  variants: ["insurance:broker"],
};

export default agent;

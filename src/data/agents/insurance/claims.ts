import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "claims",
  name: "Claims Agent",
  icon: "umbrella",
  automationRate: 82,
  avgResolutionTime: "~2 min",
  topTopic: "Claim Status",
  description: "FNOL, status updates, document submission, repair shop routing, settlement inquiries.",
  capabilities: [
    { title: "First Notice of Loss (FNOL)", description: "Guides policyholders through initial claim filing with structured data collection" },
    { title: "Claim status updates", description: "Real-time status queries -- where is my claim, when will I hear back?" },
    { title: "Document submission", description: "Routes and confirms receipt of photos, police reports, and medical records" },
    { title: "Settlement inquiries", description: "Explains payment timelines, check status, and direct deposit options" },
    { title: "Repair shop network", description: "Connects auto claimants with approved DRP shops and towing services" },
    { title: "Fraud screening guardrail", description: "Flags anomalous claim patterns for human review before proceeding" },
  ],
  quickActions: ["First notice of loss", "Claim status", "Document upload", "Repair routing", "Settlement ETA", "Subrogation"],
  flow: {
    knowledgeSources: [
      { id: "ic-kb-claims-faq", name: "Claims FAQ", type: "faq", icon: "books", description: "Frequently asked questions about filing and tracking claims" },
      { id: "ic-kb-policy-api", name: "Policy & Claims API", type: "api", icon: "computer-api", description: "Real-time claim status, policy details, and coverage verification" },
      { id: "ic-kb-repair-network", name: "Repair Network DB", type: "database", icon: "database-connection", description: "Approved repair shops, towing services, and contractor network" },
    ],
    guardrails: [
      { id: "ic-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate claim status or coverage information" },
      { id: "ic-gr-fraud", name: "Fraud Screening", type: "compliance", icon: "lock-security", description: "Flags suspicious claim patterns for human review" },
    ],
    actionHooks: [
      { id: "ic-ah-transfer-adjuster", name: "Transfer to Adjuster", type: "transfer", icon: "headset", description: "Routes complex claims to a claims adjuster" },
      { id: "ic-ah-sms-update", name: "Send SMS Update", type: "sms", icon: "phone", description: "Sends claim status updates via SMS" },
      { id: "ic-ah-fnol-workflow", name: "Trigger FNOL Workflow", type: "webhook", icon: "target-selection", description: "Initiates the first notice of loss processing workflow" },
    ],
    processes: [
      { id: "ic-pr-claim-validation", name: "Claim Validation", type: "workflow", icon: "hierarchy", description: "Validates claim details against policy coverage" },
      { id: "ic-pr-doc-classify", name: "Document Classification", type: "workflow", icon: "cogs", description: "Classifies and routes uploaded claim documents" },
    ],
    standardResponses: [
      { id: "ic-sr-filed", name: "Claim Filed", type: "confirmation", icon: "thumbs-up", description: "Confirms claim has been filed with reference number and next steps" },
      { id: "ic-sr-missing-info", name: "Missing Information", type: "request", icon: "route", description: "Requests additional documentation needed to process the claim" },
    ],
  },
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_general",
  name: "General inquiries",
  icon: "speech",
  automationRate: 83,
  avgResolutionTime: "~1.5 min",
  topTopic: "Where's the nearest branch?",
  description: "Branch info, shared-branching network lookup, operating hours, fee and rate inquiries, complaint handling, and member feedback across the credit union.",
  capabilities: [
    { title: "Branch & ATM locator", description: "Finds home-branch, shared-branching network, and CO-OP ATMs with hours and services" },
    { title: "General FAQ", description: "Answers common questions about products, eligibility, and member benefits" },
    { title: "Rate & fee inquiries", description: "Current savings, CD, and loan rates plus fee schedule and waiver eligibility" },
    { title: "Complaint handling", description: "Logs and routes member complaints with acknowledgement and escalation path to the member advocate" },
    { title: "Community programmes", description: "Routes requests about scholarships, sponsorships, and financial-literacy events to the community team" },
    { title: "Feedback & survey", description: "Captures member-experience feedback and NPS signals and routes to the service team" },
  ],
  quickActions: ["Find a branch", "Shared branching", "Rates today", "File complaint", "Scholarships", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "cg-kb-general-faq", name: "Member FAQ", type: "faq", icon: "books", description: "Credit-union-wide FAQ covering products, policies, and eligibility" },
      { id: "cg-kb-branch-api", name: "Branch & Shared Network API", type: "api", icon: "globe", description: "Branch locations, shared-branching CUSOs, and CO-OP ATM network" },
      { id: "cg-kb-rate-sheet", name: "Rate Sheet", type: "document", icon: "hierarchy-document", description: "Current interest rates and fee schedule across products" },
    ],
    guardrails: [
      { id: "cg-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about rates, fees, or eligibility rules" },
      { id: "cg-gr-tone", name: "Tone & Empathy", type: "tone", icon: "heart", description: "Keeps the warm, community-rooted tone credit unions are built on — especially for complaints" },
    ],
    actionHooks: [
      { id: "cg-ah-transfer-cs", name: "Transfer to Member Services", type: "transfer", icon: "headset", description: "Transfers to live member services for unresolved inquiries" },
      { id: "cg-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a complaint record with acknowledgement and member-advocate routing if unresolved" },
      { id: "cg-ah-community", name: "Route to Community Team", type: "transfer", icon: "route", description: "Hands off scholarship / sponsorship / event requests to the community team" },
    ],
    processes: [
      { id: "cg-pr-complaint-intake", name: "Complaint Intake", type: "workflow", icon: "hierarchy", description: "Captures complaint with category, severity, and SLA clock start" },
      { id: "cg-pr-branch-lookup", name: "Branch Lookup", type: "workflow", icon: "cogs", description: "Finds closest home branch, shared-branching CUSO, or surcharge-free ATM based on location" },
    ],
    standardResponses: [
      { id: "cg-sr-branch-info", name: "Branch Information", type: "informational", icon: "thumbs-up", description: "Provides branch details with map link and service list" },
      { id: "cg-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint recorded with reference and expected response time" },
    ],
  },
  tier: "primary",
};

export default agent;

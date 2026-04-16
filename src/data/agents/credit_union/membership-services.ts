import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "cu_membership",
  name: "Membership Services",
  icon: "user-plus",
  automationRate: 85,
  avgResolutionTime: "~2 min",
  topTopic: "How do I join?",
  description: "Joining a credit union, eligibility and field-of-membership verification, member benefits, account opening, and referral programs.",
  capabilities: [
    { title: "Eligibility check", description: "Verify field-of-membership criteria — employer, community, association, or family ties" },
    { title: "Online application", description: "Step-by-step guidance through the digital membership application process" },
    { title: "Member benefits overview", description: "Explain dividends, lower rates, shared branching, and cooperative perks" },
    { title: "Referral programs", description: "Details on member-get-member incentive and bonus programs" },
    { title: "Joint & minor accounts", description: "Adding joint members, opening youth or custodial accounts" },
    { title: "Membership verification", description: "Confirm active membership status, member number lookup, and ID requirements" },
  ],
  quickActions: ["Am I eligible?", "Join online", "Member benefits", "Refer a friend", "Joint account", "Membership status"],
  flow: {
    knowledgeSources: [
      { id: "cu-ms-kb-faq", name: "Membership FAQ", type: "faq", icon: "books", description: "Eligibility rules, field-of-membership criteria, application steps" },
      { id: "cu-ms-kb-member-api", name: "Member Lookup API", type: "api", icon: "computer-api", description: "Real-time membership status, member number, and account linkage" },
      { id: "cu-ms-kb-charter", name: "Charter & Bylaws DB", type: "database", icon: "database-connection", description: "Credit union charter details and field-of-membership definitions" },
    ],
    guardrails: [
      { id: "cu-ms-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated eligibility or membership details" },
      { id: "cu-ms-gr-pii", name: "PII Protection", type: "compliance", icon: "shield-medal", description: "Masks SSN and personal data during eligibility verification" },
    ],
    actionHooks: [
      { id: "cu-ms-ah-apply", name: "Start Application", type: "webhook", icon: "target-selection", description: "Launches the online membership application flow" },
      { id: "cu-ms-ah-transfer", name: "Transfer to Member Services", type: "transfer", icon: "headset", description: "Warm handover to a membership specialist for complex cases" },
      { id: "cu-ms-ah-welcome", name: "Send Welcome Kit", type: "email", icon: "phone", description: "Emails new-member welcome packet with account details" },
    ],
    processes: [
      { id: "cu-ms-pr-onboarding", name: "New Member Onboarding", type: "workflow", icon: "hierarchy", description: "Orchestrates eligibility check, ID verification, and account opening" },
      { id: "cu-ms-pr-referral", name: "Referral Tracking", type: "workflow", icon: "cogs", description: "Tracks referral submissions and bonus payouts" },
    ],
    standardResponses: [
      { id: "cu-ms-sr-eligible", name: "Eligibility Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms the member meets field-of-membership requirements" },
      { id: "cu-ms-sr-benefits", name: "Benefits Summary", type: "confirmation", icon: "check-symbol-check", description: "Summarises key credit union member benefits and perks" },
    ],
  },
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_join",
  name: "Join a pension",
  icon: "user-plus",
  automationRate: 76,
  avgResolutionTime: "~4 min",
  topTopic: "How do I start a pension?",
  description: "Onboarding into workplace or personal pensions — eligibility checks, scheme comparison, required documents, initial contribution setup, and opt-in confirmation.",
  capabilities: [
    { title: "Eligibility check", description: "Confirms age, residency, employment-status, and earnings thresholds for workplace and personal schemes" },
    { title: "Scheme comparison", description: "Side-by-side view of workplace vs personal vs occupational options with fee and contribution trade-offs" },
    { title: "Required documents", description: "Generates a personalised checklist — ID, NI or tax ID, proof of address, employment evidence" },
    { title: "Initial contribution setup", description: "Captures monthly amount, salary-sacrifice preference, and bank mandate or payroll instruction" },
    { title: "Beneficiary capture", description: "Collects initial nominated beneficiaries with legal-consent step at onboarding" },
    { title: "Opt-in confirmation", description: "Issues welcome pack, member number, online-portal credentials, and first-contribution date" },
  ],
  quickActions: ["Am I eligible?", "Compare schemes", "Documents needed", "Set contribution", "Add beneficiary", "Confirm join"],
  flow: {
    knowledgeSources: [
      { id: "pj-kb-eligibility-rules", name: "Eligibility Rules", type: "document", icon: "hierarchy-document", description: "Statutory and scheme-specific eligibility criteria across all products" },
      { id: "pj-kb-scheme-catalogue", name: "Scheme Catalogue", type: "database", icon: "database-connection", description: "Product descriptions, fees, default funds, and contribution structures" },
      { id: "pj-kb-identity-api", name: "Identity Verification API", type: "api", icon: "computer-api", description: "Real-time ID check, PEP screening, and address validation" },
    ],
    guardrails: [
      { id: "pj-gr-kyc", name: "KYC & AML", type: "compliance", icon: "lock-security", description: "Enforces identity-verification, sanctions, and source-of-funds checks before scheme activation" },
      { id: "pj-gr-suitability", name: "Suitability Awareness", type: "compliance", icon: "shield-medal", description: "Flags cases (high contribution vs earnings, existing adequate provision) for advisor review before opt-in" },
    ],
    actionHooks: [
      { id: "pj-ah-open-account", name: "Open Pension Account", type: "webhook", icon: "target-selection", description: "Creates the pension pot in the scheme registry once checks pass" },
      { id: "pj-ah-mandate", name: "Set Up Contribution Mandate", type: "webhook", icon: "banknote", description: "Registers the direct-debit or payroll-sacrifice instruction" },
      { id: "pj-ah-welcome-pack", name: "Send Welcome Pack", type: "email", icon: "phone", description: "Emails or posts the welcome pack with member number and portal credentials" },
    ],
    processes: [
      { id: "pj-pr-onboarding", name: "Member Onboarding", type: "workflow", icon: "hierarchy", description: "Multi-step onboarding: eligibility → documents → ID check → mandate → opt-in" },
      { id: "pj-pr-kyc", name: "KYC & Screening", type: "workflow", icon: "cogs", description: "Runs identity verification, PEP / sanctions screening, and document-authenticity checks" },
    ],
    standardResponses: [
      { id: "pj-sr-joined", name: "Welcome Confirmation", type: "confirmation", icon: "thumbs-up", description: "Confirms scheme activation with member number and first-contribution date" },
      { id: "pj-sr-checklist", name: "Documents Required", type: "informational", icon: "check-symbol-check", description: "Returns the personalised document checklist with upload links" },
    ],
  },
  tier: "primary",
};

export default agent;

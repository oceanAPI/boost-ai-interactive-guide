import type { SpecialistAgent } from "../_types";

/**
 * Product-line agent for life insurance. Term, whole-of-life, and
 * critical-illness products — beneficiaries, policy value, medical
 * underwriting status, claims intake with sensitive handling.
 */
const agent: SpecialistAgent = {
  key: "life_insurance",
  name: "Life Insurance",
  icon: "hand-protection",
  automationRate: 72,
  avgResolutionTime: "~3 min",
  topTopic: "Update my beneficiaries",
  description: "Life policies — term, whole-of-life, critical illness — beneficiary management, policy value, medical-underwriting status, and bereavement claims handling.",
  capabilities: [
    { title: "Beneficiary management", description: "View, add, or update beneficiaries with strong auth and legal consent" },
    { title: "Policy value & projections", description: "Explains surrender value, bonus history, projected maturity values" },
    { title: "Medical underwriting status", description: "Tracks progress of medical questionnaires, GP reports, and decision" },
    { title: "Critical-illness cover", description: "Explains covered conditions and claim definitions per policy" },
    { title: "Bereavement intake", description: "Empathetic first-contact flow for bereavement with warm handover" },
    { title: "Premium & cover changes", description: "Mid-term changes to sum assured, term, or riders" },
  ],
  quickActions: ["Update beneficiaries", "Policy value", "Medical status", "Covered conditions", "Report bereavement", "Change cover"],
  flow: {
    knowledgeSources: [
      { id: "li-kb-life-faq", name: "Life FAQ", type: "faq", icon: "books", description: "Product terms, covered conditions, claim definitions" },
      { id: "li-kb-policy-api", name: "Life Policy API", type: "api", icon: "computer-api", description: "Policy value, beneficiaries, cover amounts" },
      { id: "li-kb-medical-uw", name: "Medical Underwriting System", type: "api", icon: "computer-api", description: "Underwriting application status and decisioning" },
    ],
    guardrails: [
      { id: "li-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect cover or condition claims" },
      { id: "li-gr-sensitive", name: "Bereavement Sensitivity", type: "compliance", icon: "shield-medal", description: "Switches tone and routes bereavement conversations to specialist handlers" },
      { id: "li-gr-auth", name: "Strong Identity Verification", type: "compliance", icon: "lock-security", description: "BankID/strong-auth required before beneficiary changes or bereavement disclosures" },
    ],
    actionHooks: [
      { id: "li-ah-update-beneficiary", name: "Update Beneficiary", type: "webhook", icon: "target-selection", description: "Commits beneficiary change with legal consent record" },
      { id: "li-ah-transfer-bereavement", name: "Transfer to Bereavement Team", type: "transfer", icon: "headset", description: "Warm handover to dedicated bereavement handlers with full context" },
      { id: "li-ah-send-forms", name: "Send Forms", type: "email", icon: "phone", description: "Emails medical questionnaires or bereavement forms" },
    ],
    processes: [
      { id: "li-pr-beneficiary", name: "Beneficiary Change", type: "workflow", icon: "hierarchy", description: "Multi-step identity-verified beneficiary update workflow" },
      { id: "li-pr-underwriting", name: "Underwriting Orchestration", type: "workflow", icon: "cogs", description: "Coordinates medical questionnaire, GP reports, and decision delivery" },
    ],
    standardResponses: [
      { id: "li-sr-updated", name: "Beneficiary Updated", type: "confirmation", icon: "thumbs-up", description: "Confirms beneficiary change with legal language" },
      { id: "li-sr-referred", name: "Referred to Specialist", type: "request", icon: "route", description: "Explains why the query requires a human specialist" },
    ],
  },
  tier: "primary",
};

export default agent;

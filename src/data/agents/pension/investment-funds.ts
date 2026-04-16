import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "pension_funds",
  name: "Investment Funds",
  icon: "graph-bar",
  automationRate: 78,
  avgResolutionTime: "~3 min",
  topTopic: "Switch my fund",
  description: "Fund catalogue, performance, fees, risk profiles, and switches — how pension savings are invested across workplace and personal pensions.",
  capabilities: [
    { title: "Fund catalogue", description: "Available funds with fees, category, risk class, and sustainability rating" },
    { title: "Fund comparison", description: "Side-by-side on fees, 1/3/5-year returns, and volatility" },
    { title: "My performance", description: "Current holdings returns and fee breakdown per fund" },
    { title: "Switch funds", description: "Initiate switch with cooling-off disclosure and settlement timing" },
    { title: "Risk profile", description: "Self-assessment questionnaire suggesting suitable fund mix" },
    { title: "Sustainable funds", description: "ESG-screened and sustainability-labelled fund options" },
  ],
  quickActions: ["Available funds", "Compare funds", "Switch fund", "My performance", "Fund fees", "Sustainable options"],
  flow: {
    knowledgeSources: [
      { id: "pf-kb-fund-faq", name: "Fund FAQ", type: "faq", icon: "books", description: "Fund types, fees, risk classes, switching rules" },
      { id: "pf-kb-catalogue", name: "Fund Catalogue API", type: "api", icon: "computer-api", description: "Available funds, performance, fees, ratings" },
      { id: "pf-kb-risk-engine", name: "Risk Profile Engine", type: "api", icon: "computer-api", description: "Questionnaire-driven risk assessment and fund suggestions" },
    ],
    guardrails: [
      { id: "pf-gr-no-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised investment advice — provides information only" },
      { id: "pf-gr-cooling-off", name: "Cooling-off Validation", type: "compliance", icon: "lock-security", description: "Enforces cooling-off period and regulatory disclosure before switch" },
    ],
    actionHooks: [
      { id: "pf-ah-switch", name: "Trigger Fund Switch", type: "webhook", icon: "target-selection", description: "Submits fund reallocation with regulatory disclosures" },
      { id: "pf-ah-confirmation", name: "Send Confirmation", type: "email", icon: "phone", description: "Emails switch confirmation with settlement date" },
    ],
    processes: [
      { id: "pf-pr-switch-validation", name: "Switch Validation", type: "workflow", icon: "cogs", description: "Validates switch against plan rules, cooling-off, and settlement" },
      { id: "pf-pr-disclosure", name: "Regulatory Disclosure", type: "workflow", icon: "hierarchy", description: "Injects mandatory fund-switch disclosures per jurisdiction" },
    ],
    standardResponses: [
      { id: "pf-sr-switched", name: "Switch Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms switch with settlement date and new allocation" },
      { id: "pf-sr-disclaimer", name: "Advice Disclaimer", type: "request", icon: "route", description: "Explains that information provided is not personalised advice" },
    ],
  },
  tier: "primary",
};

export default agent;

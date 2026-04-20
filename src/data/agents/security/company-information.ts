import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_company_information",
  name: "Sector Alarm information",
  icon: "government",
  automationRate: 88,
  avgResolutionTime: "~45s",
  topTopic: "Coverage countries",
  description: "About Sector Alarm — history, coverage markets, monitoring centres, certifications, approvals. For prospects, regulators and current customers asking about the company.",
  capabilities: [
    { title: "Coverage & markets", description: "Where Sector Alarm operates and what is covered in each country" },
    { title: "Monitoring centres", description: "Which monitoring centre serves the customer's market and its certifications" },
    { title: "Certifications & approvals", description: "Insurer approvals, standards compliance and certifications per market" },
    { title: "Company history", description: "Founded year, ownership, scale, recent milestones" },
    { title: "Career & supplier entry points", description: "Redirect career and supplier inquiries to the right public channels" },
  ],
  quickActions: ["Which countries do you cover?", "Where is your monitoring centre?", "Are you approved by my insurer?", "Company history", "Are you hiring?"],
  flow: {
    knowledgeSources: [
      { id: "sec-ci-kb-about", name: "About Sector Alarm", type: "document", icon: "hierarchy-document", description: "Public-facing company facts, milestones and scale figures" },
      { id: "sec-ci-kb-cert", name: "Certifications library", type: "document", icon: "shield-medal", description: "Current insurer approvals + compliance certifications per market" },
    ],
    guardrails: [
      { id: "sec-ci-gr-hallucination", name: "Hallucination detection", type: "hallucination", icon: "shield-medal", description: "Company facts must come from the curated about library, not open web" },
    ],
    actionHooks: [],
    processes: [],
    standardResponses: [
      { id: "sec-ci-sr-coverage", name: "Coverage map", type: "informational", icon: "globe", description: "Lists active markets with monitoring-centre location" },
      { id: "sec-ci-sr-cert", name: "Certifications list", type: "informational", icon: "shield-medal", description: "Lists certifications relevant to the customer's market and insurer" },
    ],
  },
};

export default agent;

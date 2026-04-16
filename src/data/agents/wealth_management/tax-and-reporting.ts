import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_tax",
  name: "Tax & Reporting",
  icon: "graph-bar",
  automationRate: 82,
  avgResolutionTime: "~2 min",
  topTopic: "My tax documents",
  description: "1099 forms, cost basis reporting, tax-loss harvesting opportunities, year-end statements, and gain/loss summaries.",
  capabilities: [
    { title: "Tax document access", description: "Download 1099-B, 1099-DIV, 1099-INT, and consolidated tax statements" },
    { title: "Cost basis reporting", description: "Lot-level cost basis with method selection (FIFO, specific ID, average)" },
    { title: "Tax-loss harvesting", description: "Identifies positions with unrealised losses eligible for harvesting" },
    { title: "Gain/loss summary", description: "Realised and unrealised gains broken down by short-term and long-term" },
    { title: "Year-end documents", description: "Annual portfolio review, fee summary, and performance attribution report" },
    { title: "Withholding management", description: "Federal and state tax withholding elections for distributions" },
  ],
  quickActions: ["My 1099s", "Cost basis", "Tax-loss harvest", "Gains & losses", "Year-end report", "Withholding"],
  flow: {
    knowledgeSources: [
      { id: "tr-kb-tax-faq", name: "Tax FAQ", type: "faq", icon: "books", description: "1099 types, cost basis methods, wash sale rules, and filing deadlines" },
      { id: "tr-kb-tax-api", name: "Tax Document API", type: "api", icon: "computer-api", description: "Real-time access to generated tax forms and cost basis data" },
      { id: "tr-kb-lot-db", name: "Tax Lot Database", type: "database", icon: "database-connection", description: "Lot-level purchase data, holding periods, and adjusted cost basis" },
    ],
    guardrails: [
      { id: "tr-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated tax figures or cost basis amounts" },
      { id: "tr-gr-no-tax-advice", name: "Non-advice Guardrail", type: "compliance", icon: "shield-medal", description: "Blocks personalised tax advice — recommends consulting a tax professional" },
    ],
    actionHooks: [
      { id: "tr-ah-download", name: "Send Tax Documents", type: "email", icon: "phone", description: "Emails consolidated tax documents to the client" },
      { id: "tr-ah-advisor", name: "Transfer to Tax Specialist", type: "transfer", icon: "headset", description: "Warm handover to tax reporting specialist for complex queries" },
    ],
    processes: [
      { id: "tr-pr-harvest-flow", name: "Tax-Loss Harvesting Workflow", type: "workflow", icon: "hierarchy", description: "Identifies harvesting candidates, checks wash sale rules, and queues trades" },
      { id: "tr-pr-doc-generation", name: "Document Generation", type: "workflow", icon: "cogs", description: "Generates and packages year-end tax documents for download" },
    ],
    standardResponses: [
      { id: "tr-sr-doc-ready", name: "Document Ready", type: "confirmation", icon: "thumbs-up", description: "Confirms tax documents are available with download links" },
      { id: "tr-sr-gain-loss", name: "Gain/Loss Summary", type: "confirmation", icon: "check-symbol-check", description: "Presents realised and unrealised gain/loss totals by holding period" },
    ],
  },
  tier: "primary",
};

export default agent;

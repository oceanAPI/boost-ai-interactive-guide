import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_offboarding",
  name: "Offboarding & transfer",
  icon: "logout",
  automationRate: 60,
  avgResolutionTime: "~5 min",
  topTopic: "Transfer my account to another firm",
  description: "Client-initiated offboarding — in-specie asset transfers, mandate termination, closing statements, tax reporting, and discreet retention conversations before departure is final.",
  capabilities: [
    { title: "In-specie transfer", description: "Transfers positions to the destination custodian without liquidating — preserves cost basis and avoids tax events" },
    { title: "Cash-out & close", description: "Orderly liquidation with price-impact awareness, custody fee reconciliation, and final cash settlement" },
    { title: "Mandate termination", description: "Terminates discretionary or advisory mandates with accurate performance-fee crystallisation and prorated charges" },
    { title: "Final statements & tax docs", description: "Generates final statements, tax lots, and realised-gains reports in destination-friendly formats" },
    { title: "Retention conversation", description: "Routes the departing client to their wealth manager for a discretionary retention conversation before execution" },
    { title: "Data-rights exit", description: "Handles GDPR / data-protection deletion and portability requests in line with regulatory retention obligations" },
  ],
  quickActions: ["In-specie transfer", "Close account", "Terminate mandate", "Final statements", "Talk to my WM", "Data export"],
  flow: {
    knowledgeSources: [
      { id: "wo-kb-transfer-rules", name: "Transfer Rules", type: "document", icon: "hierarchy-document", description: "Custody transfer procedures, ACATS / CREST protocols, and cross-border tax considerations" },
      { id: "wo-kb-position-api", name: "Position & Tax-lot API", type: "api", icon: "computer-api", description: "Real-time holdings, cost basis, and realised / unrealised gains for tax reporting" },
      { id: "wo-kb-custody-api", name: "Custodian Registry", type: "api", icon: "computer-api", description: "Destination custodian validation and transfer-instruction routing" },
    ],
    guardrails: [
      { id: "wo-gr-auth", name: "Strong Authentication", type: "compliance", icon: "lock-security", description: "Requires signatory authorisation matching the household signing matrix for transfers and closures" },
      { id: "wo-gr-retention-check", name: "Retention Opportunity", type: "tone", icon: "heart", description: "Flags high-value departures for discretionary retention outreach before execution" },
    ],
    actionHooks: [
      { id: "wo-ah-transfer-request", name: "Submit Transfer", type: "webhook", icon: "target-selection", description: "Submits the in-specie or cash transfer instruction to the custodian with timestamp" },
      { id: "wo-ah-terminate-mandate", name: "Terminate Mandate", type: "webhook", icon: "banknote", description: "Crystallises performance fees, prorates charges, and closes the mandate" },
      { id: "wo-ah-retention-hand", name: "Route to Retention", type: "transfer", icon: "headset", description: "Warm handover to the client's wealth manager for a retention conversation" },
    ],
    processes: [
      { id: "wo-pr-transfer-out", name: "Transfer-out Workflow", type: "workflow", icon: "hierarchy", description: "Retention check → auth → custodian validation → in-specie / cash transfer → final statement" },
      { id: "wo-pr-closure", name: "Account Closure", type: "workflow", icon: "cogs", description: "Terminates mandates, reconciles fees, issues final statements and tax docs, then archives the file" },
    ],
    standardResponses: [
      { id: "wo-sr-submitted", name: "Transfer Submitted", type: "confirmation", icon: "thumbs-up", description: "Confirms transfer submission with expected settlement date and custodian reference" },
      { id: "wo-sr-closed", name: "Account Closed", type: "confirmation", icon: "check-symbol-check", description: "Confirms account closure with final-statement delivery and data-retention schedule" },
    ],
  },
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_close_account",
  name: "Close account",
  icon: "logout",
  automationRate: 78,
  avgResolutionTime: "~3 min",
  topTopic: "How do I close my account?",
  description: "Self-serve account closure — balance sweep, direct-debit migration check, retention offer, open-obligation audit, and data-rights handling with a single tap in the app.",
  capabilities: [
    { title: "Balance sweep", description: "Returns remaining balance to the customer's verified external bank account before closure" },
    { title: "Direct-debit audit", description: "Lists every active recurring payment pointing at this account and warns before closure" },
    { title: "Open-obligation check", description: "Blocks closure while there's an outstanding BNPL balance, unsettled trade, active card dispute, or pending KYC" },
    { title: "Retention offer", description: "Presents a personalised retention offer (fee waiver, upgrade, feature unlock) before confirming" },
    { title: "Data rights exit", description: "Handles GDPR / CCPA deletion and data-portability exports in line with regulatory retention obligations" },
    { title: "Final statement & confirmation", description: "Issues final statement and emailed closure confirmation with audit-trail reference" },
  ],
  quickActions: ["Start closure", "List direct debits", "Any obligations?", "See offer", "Export my data", "Confirm close"],
  flow: {
    knowledgeSources: [
      { id: "fca-kb-balance-api", name: "Balance & Sweep API", type: "api", icon: "computer-api", description: "Real-time balance, pending-transaction check, and external-bank verification for the sweep" },
      { id: "fca-kb-mandate-api", name: "Direct-debit Registry", type: "api", icon: "computer-api", description: "Active mandates pulling from or pushing to this account" },
      { id: "fca-kb-retention", name: "Retention Playbook", type: "document", icon: "hierarchy-document", description: "Segment-based retention offers by churn reason and tenure" },
    ],
    guardrails: [
      { id: "fca-gr-auth", name: "Re-authentication", type: "compliance", icon: "lock-security", description: "Requires fresh biometric or PIN re-authentication at the confirmation step" },
      { id: "fca-gr-obligations", name: "Open-obligation Block", type: "compliance", icon: "shield-medal", description: "Prevents closure while unsettled obligations exist — protects customer and firm" },
    ],
    actionHooks: [
      { id: "fca-ah-sweep", name: "Execute Balance Sweep", type: "webhook", icon: "banknote", description: "Moves the remaining balance to the verified external account" },
      { id: "fca-ah-close", name: "Close Account", type: "webhook", icon: "target-selection", description: "Closes the account in the ledger and revokes card / device credentials" },
      { id: "fca-ah-data-export", name: "Data Export", type: "email", icon: "phone", description: "Generates and delivers a GDPR / CCPA data export to the customer" },
    ],
    processes: [
      { id: "fca-pr-closure", name: "Closure Workflow", type: "workflow", icon: "hierarchy", description: "Obligation check → mandate warning → retention → sweep → close → data-retention schedule" },
      { id: "fca-pr-retention", name: "Retention Offer", type: "workflow", icon: "cogs", description: "Selects and presents a personalised retention offer based on churn reason and segment" },
    ],
    standardResponses: [
      { id: "fca-sr-closed", name: "Account Closed", type: "confirmation", icon: "thumbs-up", description: "Confirms closure with final-statement delivery and data-retention schedule" },
      { id: "fca-sr-blocked", name: "Closure Blocked", type: "informational", icon: "check-symbol-check", description: "Explains which open obligation is blocking closure and how to clear it" },
    ],
  },
  tier: "primary",
};

export default agent;

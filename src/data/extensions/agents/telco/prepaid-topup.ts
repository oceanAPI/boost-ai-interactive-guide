import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_prepaid_topup",
  name: "Prepaid & Top-up",
  icon: "wallet",
  automationRate: 90,
  avgResolutionTime: "~1 min",
  topTopic: "Top up my balance",
  description:
    "Pay-as-you-go customers — balance check, top-up via card / voucher / in-store, validity windows, and PAYG plan rules.",
  capabilities: [
    { title: "Balance & validity",   description: "Show current credit balance, included inclusions, and days until validity lapse" },
    { title: "Top-up action",         description: "Top up by card or voucher code, immediate credit" },
  ],
  quickActions: ["Check balance", "Top up now", "Redeem voucher"],
  flow: {
    knowledgeSources: [
      { id: "tc-pt-kb-payg", name: "PAYG Balance API", type: "api", icon: "computer-api", description: "Live PAYG balance and validity lookups" },
    ],
    guardrails: [
      { id: "tc-pt-gr-pii",  name: "PII Protection",   type: "pii", icon: "lock-security", description: "Card / voucher data scoped to the authenticated session, never echoed" },
    ],
    actionHooks: [
      { id: "tc-pt-ah-topup",name: "Apply Top-up",     type: "api", icon: "money",        description: "Applies a top-up via card or voucher and returns new balance" },
    ],
    processes: [
      { id: "tc-pt-pr-verify",name: "Account Verification",type: "verification",icon: "check-symbol-check",description: "Light strong-auth before any paid action" },
    ],
    standardResponses: [
      { id: "tc-pt-sr-topped",name: "Top-up Applied",   type: "standard",icon: "thumbs-up",description: "Confirms the top-up with new balance and new validity date" },
    ],
  },
  variants: ["telco:mobile"],
  tier: "light",
};

export default agent;

import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_loyalty",
  name: "Loyalty Programme",
  icon: "heart",
  automationRate: 83,
  avgResolutionTime: "~2 min",
  topTopic: "My points",
  description:
    "Frequent-flyer programme servicing — tier status, points balance, redemption, missing-miles claims, and upgrades. Tier-aware service quality throughout the conversation.",
  capabilities: [
    { title: "Balance & tier status",      description: "Show points balance, tier status, and progress to next tier" },
    { title: "Redemption options",          description: "Browse redemption catalogue — award flights, upgrades, hotels, partners" },
    { title: "Missing miles claim",         description: "File a claim for a recent flight where miles were not automatically credited" },
    { title: "Upgrade with points",         description: "Offer and apply points-based cabin upgrades subject to availability" },
  ],
  quickActions: ["My balance", "Tier status", "Redeem", "Missing miles", "Upgrade"],
  flow: {
    knowledgeSources: [
      { id: "al-ly-kb-fqtv-api", name: "Frequent Flyer API",    type: "api",      icon: "computer-api",       description: "Live connection to the loyalty platform for balance, status, and transactions" },
      { id: "al-ly-kb-rules",    name: "Redemption Rules",       type: "document", icon: "hierarchy-document", description: "Redemption eligibility, partner rules, and tier-benefit matrix" },
    ],
    guardrails: [
      { id: "al-ly-gr-pii",      name: "PII Protection",         type: "pii",      icon: "lock-security", description: "Loyalty account access restricted to authenticated member" },
    ],
    actionHooks: [
      { id: "al-ly-ah-redeem",   name: "Redeem Points",           type: "api",      icon: "finger-tap",    description: "Books an award seat or upgrade using points" },
      { id: "al-ly-ah-claim-miles",name: "Claim Missing Miles",   type: "api",      icon: "refresh-idea",  description: "Submits a missing-mileage claim with the flight reference" },
    ],
    processes: [
      { id: "al-ly-pr-verify",   name: "Member Verification",     type: "verification",icon: "check-symbol-check",description: "Strong-auth of the loyalty account before any redemption" },
    ],
    standardResponses: [
      { id: "al-ly-sr-redeemed", name: "Redemption Confirmed",    type: "standard",icon: "thumbs-up",      description: "Confirms the redemption with points deducted and booking reference" },
    ],
  },
  variants: ["airline:scheduled"],
  tier: "addon",
};

export default agent;

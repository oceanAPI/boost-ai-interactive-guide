import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_award_redemption",
  name: "Award Redemption",
  icon: "trophy",
  automationRate: 76,
  avgResolutionTime: "~3 min",
  topTopic: "Use my miles",
  description:
    "Loyalty redemption — search award-flight availability across own metal and partners, redeem miles, manage upgrade awards, and handle award-ticket changes. Companion to the Loyalty agent: Loyalty owns balance / status / earning, this agent owns spending miles.",
  capabilities: [
    { title: "Award availability search",      description: "Find award-seat availability on own metal and alliance / bilateral partners with mileage cost per fare type" },
    { title: "Redeem miles for flight",         description: "Book an award flight against the member's account and confirm mileage / co-pay totals" },
    { title: "Upgrade-award redemption",         description: "Spend miles or upgrade vouchers to upgrade an existing booking on eligible fare classes" },
    { title: "Award-ticket changes",             description: "Change or cancel an award booking with the correct mileage refund and fees" },
  ],
  quickActions: ["Find award seats", "Redeem miles", "Upgrade with miles", "Change award ticket"],
  flow: {
    knowledgeSources: [
      { id: "al-ar-kb-award-api",name: "Award Inventory API",  type: "api",      icon: "computer-api",       description: "Live award-availability platform across own metal and partner carriers" },
      { id: "al-ar-kb-rules",    name: "Loyalty Programme Rules",type: "document",icon: "hierarchy-document", description: "Programme rules — redemption charts, upgrade eligibility, change fees, partner conditions" },
    ],
    guardrails: [
      { id: "al-ar-gr-balance",  name: "Balance Sufficiency Check",type: "guardrail",icon: "shield-medal",      description: "Verifies sufficient miles + co-pay availability before any redemption commit" },
    ],
    actionHooks: [
      { id: "al-ar-ah-redeem",   name: "Redeem Award",          type: "api",      icon: "trophy",              description: "Posts the redemption against the member's mileage balance and confirms the new PNR" },
      { id: "al-ar-ah-cancel",   name: "Cancel Award Ticket",   type: "api",      icon: "refresh-idea",        description: "Cancels the award ticket with mileage refund per programme rules" },
    ],
    processes: [
      { id: "al-ar-pr-verify",   name: "Member Verification",   type: "verification",icon: "check-symbol-check",description: "Loyalty-account auth before any award action; partner-airline cross-check where required" },
    ],
    standardResponses: [
      { id: "al-ar-sr-redeemed", name: "Award Booked",          type: "standard",icon: "thumbs-up",           description: "Confirms the award booking with new PNR, mileage charge, and remaining balance" },
      { id: "al-ar-sr-fallback", name: "Specialist Handoff",    type: "fallback",icon: "route",               description: "Fallback when partner-availability or programme exception requires a specialist" },
    ],
  },
  variants: ["airline:scheduled"],
  tier: "addon",
};

export default agent;

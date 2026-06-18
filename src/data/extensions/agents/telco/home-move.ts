import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_home_move",
  name: "Home Move (Flytning)",
  icon: "home",
  automationRate: 78,
  avgResolutionTime: "~3 min",
  topTopic: "I'm moving",
  description:
    "The Nordic 'flytning' journey end-to-end — check service at the new address, schedule the disconnect/reconnect, rebook fibre installation, reroute mail, and handle coverage gaps during transit.",
  capabilities: [
    { title: "New-address service check",     description: "Confirm whether the current plan works at the new address and with which technology (fibre, xDSL, 5G FWA)" },
    { title: "Move scheduling",               description: "Schedule the disconnect at the old address and the reconnect at the new address, aligned to the customer's move date" },
    { title: "Installation rebooking",         description: "Rebook or reschedule fibre / technician visits when the move date shifts" },
    { title: "Coverage-gap options",           description: "Offer a 4G/5G back-up during any gap between disconnect and reconnect when fibre isn't ready" },
    { title: "Plan-change on move",            description: "Handle upgrades or downgrades triggered by the move (e.g. single-dwelling to family home)" },
    { title: "Contract terms on move",          description: "Explain how the move interacts with minimum-term contracts and any fees or waivers" },
  ],
  quickActions: ["Check new address", "Schedule move", "Rebook install", "Back-up during move", "Change plan at move", "Move fees?"],
  flow: {
    knowledgeSources: [
      { id: "tc-hm-kb-coverage", name: "Coverage Service",      type: "api",      icon: "globe",              description: "Coverage-check service returning fibre / xDSL / FWA availability at any address" },
      { id: "tc-hm-kb-install",  name: "Installation Scheduler",type: "api",      icon: "calendar-clock",     description: "Live technician-scheduling system for install / disconnect / reconnect appointments" },
      { id: "tc-hm-kb-rules",    name: "Move-policy Rulebook",  type: "document", icon: "hierarchy-document", description: "Policy on move fees, waivers, contract-term impact, and backup-service eligibility" },
    ],
    guardrails: [
      { id: "tc-hm-gr-no-surprise-fee",name: "No Surprise Fees", type: "guardrail",icon: "shield-medal",     description: "Every move quote shows the full cost breakdown before any commit — no hidden fees" },
      { id: "tc-hm-gr-pii",            name: "Address Privacy",  type: "pii",      icon: "lock-security",    description: "New-address details scoped to the authenticated account and never cross-referenced externally" },
    ],
    actionHooks: [
      { id: "tc-hm-ah-schedule",       name: "Schedule Move",    type: "api",      icon: "calendar-day",     description: "Books the full move package — disconnect, reconnect, install — as a linked set" },
      { id: "tc-hm-ah-backup",          name: "Activate Backup",  type: "api",      icon: "refresh-idea",     description: "Activates the 4G/5G back-up package for the gap between disconnect and reconnect" },
    ],
    processes: [
      { id: "tc-hm-pr-verify",          name: "Owner Verification",type: "verification",icon: "check-symbol-check",description: "Verifies the move is requested by the account owner, with right-to-move checks (landlord consent where required)" },
      { id: "tc-hm-pr-escalate",        name: "Installation-ops Handoff",type: "transfer",icon: "headset",   description: "Hands off to installation operations when the timing or technology needs specialist coordination" },
    ],
    standardResponses: [
      { id: "tc-hm-sr-confirmed",       name: "Move Scheduled",    type: "standard",icon: "thumbs-up",         description: "Confirms the scheduled move with all linked appointments and a single reference number" },
      { id: "tc-hm-sr-fallback",        name: "Specialist Handoff",type: "fallback",icon: "route",             description: "Fallback when coverage, technology change, or contract rules need manual handling" },
    ],
  },
  variants: ["telco:broadband", "telco:mobile"],
  tier: "primary",
};

export default agent;

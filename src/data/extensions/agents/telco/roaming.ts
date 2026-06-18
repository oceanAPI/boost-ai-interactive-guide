import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_roaming",
  name: "Roaming",
  icon: "globe",
  automationRate: 86,
  avgResolutionTime: "~2 min",
  topTopic: "Use my phone abroad",
  description:
    "Everything about using the subscription outside the home market — EU Roam-Like-Home, non-EU destination packs, daily caps, usage alerts, and emergency re-enable when a customer hits a block mid-trip.",
  capabilities: [
    { title: "Destination coverage lookup",   description: "Is my plan usable in country X, and under what rules (RLH, pack, pay-as-you-go)?" },
    { title: "Travel pack purchase",          description: "Buy a day/week/month travel data pack tailored to the destination and trip length" },
    { title: "EU Roam-Like-Home advisor",     description: "Explain the EU fair-use policy and when it triggers a notice or throttle" },
    { title: "Daily spending-cap management", description: "Set or lift a daily cap while abroad to stop bill-shock or unblock emergency use" },
    { title: "Usage monitoring abroad",        description: "Real-time view of data / minutes / SMS consumed in the current roaming session" },
    { title: "Emergency unblock",              description: "One-tap re-enable after a cap trip or fair-use notice, with clear cost visibility" },
  ],
  quickActions: ["Travelling where?", "Buy travel pack", "Lift my cap", "How much have I used?", "Emergency unblock", "Roaming rules"],
  flow: {
    knowledgeSources: [
      { id: "tc-rm-kb-roaming-api",   name: "Roaming Platform API",      type: "api",      icon: "computer-api",       description: "Live connection to the roaming platform for pack inventory, active usage, and caps" },
      { id: "tc-rm-kb-country-matrix",name: "Country Rules Matrix",      type: "document", icon: "globe",              description: "Per-country rules — RLH zone, fair-use thresholds, emergency-number mapping, VAT treatment" },
      { id: "tc-rm-kb-pack-catalog",  name: "Travel Pack Catalogue",     type: "api",      icon: "computer-api",       description: "Current travel-pack catalogue with price, validity, inclusions, and eligibility" },
    ],
    guardrails: [
      { id: "tc-rm-gr-no-bill-shock",name: "Bill-shock Prevention",     type: "guardrail",icon: "shield-medal",     description: "Never silently disables a cap without explicit consent; always shows the cost risk of unblocking" },
      { id: "tc-rm-gr-pii",          name: "PII Protection",            type: "pii",      icon: "lock-security",    description: "Location data used only within the roaming context, never persisted for tracking" },
    ],
    actionHooks: [
      { id: "tc-rm-ah-buy-pack",     name: "Purchase Travel Pack",      type: "api",      icon: "finger-tap",       description: "Activates the selected travel pack immediately and returns proof-of-activation" },
      { id: "tc-rm-ah-lift-cap",     name: "Lift Daily Cap",             type: "api",      icon: "refresh-idea",     description: "Raises or removes the daily spending cap with a timed expiry option" },
    ],
    processes: [
      { id: "tc-rm-pr-verify",       name: "Identity Verification",     type: "verification",icon: "check-symbol-check",description: "Strong-auth before paid changes or cap lifts abroad" },
      { id: "tc-rm-pr-escalate",     name: "Escalate to Abroad Desk",   type: "transfer", icon: "headset",          description: "Priority transfer to the abroad-customer desk when a traveller is blocked mid-trip" },
    ],
    standardResponses: [
      { id: "tc-rm-sr-pack-active",  name: "Pack Activated",             type: "standard",icon: "thumbs-up",         description: "Confirms the travel pack is live with inclusions, expiry, and emergency unblock path" },
      { id: "tc-rm-sr-fallback",     name: "Specialist Help Needed",     type: "fallback",icon: "route",             description: "Graceful fallback when a destination-specific rule blocks self-serve action" },
    ],
  },
  variants: ["telco:mobile"],
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_ancillaries",
  name: "Ancillaries & Upsell",
  icon: "money",
  automationRate: 89,
  avgResolutionTime: "~1.5 min",
  topTopic: "Pick a seat",
  description:
    "Add-on purchases attached to a booking — seat selection, extra baggage, meals, lounge access, fast-track security, priority boarding, and paid upgrades. The biggest self-serve revenue surface for an airline.",
  capabilities: [
    { title: "Seat selection",                description: "Browse the seat map and pick or change a seat with live pricing per cabin" },
    { title: "Extra baggage purchase",        description: "Buy additional bag allowance up to the cabin's limit at the lowest pre-airport price" },
    { title: "Meal pre-order",                description: "Pre-order an in-flight meal where the route supports it, with dietary options" },
    { title: "Lounge & fast-track",           description: "Buy lounge access or fast-track security at applicable airports" },
    { title: "Cabin upgrade",                  description: "Quote and purchase a paid upgrade (e.g. Plus, Business) on eligible bookings" },
    { title: "Bundle offers",                  description: "Surface curated bundles (seat + bag + meal) when they save the customer money" },
  ],
  quickActions: ["Pick a seat", "Add a bag", "Pre-order meal", "Lounge access", "Upgrade my cabin", "View bundles"],
  flow: {
    knowledgeSources: [
      { id: "al-an-kb-merchandising",  name: "Merchandising API",   type: "api",      icon: "computer-api",       description: "Live ancillaries catalogue with route-specific pricing and inventory" },
      { id: "al-an-kb-seatmap",        name: "Seat Map Service",    type: "api",      icon: "computer-api",       description: "Live seat-map service with availability, pricing, and aircraft-type metadata" },
      { id: "al-an-kb-fares",          name: "Fare Family Reference",type: "document",icon: "hierarchy-document", description: "Per-fare-family inclusions and what's already paid for" },
    ],
    guardrails: [
      { id: "al-an-gr-no-double-charge",name: "No Double Charging",  type: "guardrail",icon: "shield-medal",      description: "Never offers an ancillary the fare family already includes — clear inclusion check" },
      { id: "al-an-gr-pii",             name: "Payment Data Protection",type: "pii",   icon: "lock-security",     description: "Card and tokenised payment handled per PCI-DSS in a contained sub-flow" },
    ],
    actionHooks: [
      { id: "al-an-ah-purchase",        name: "Purchase Ancillary",  type: "api",      icon: "finger-tap",         description: "Posts the purchase to the booking, returns updated PNR with the new ancillary attached" },
      { id: "al-an-ah-bundle",          name: "Apply Bundle",        type: "api",      icon: "money",              description: "Applies a curated bundle in a single transaction with the savings clearly itemised" },
    ],
    processes: [
      { id: "al-an-pr-verify",          name: "PNR Verification",    type: "verification",icon: "check-symbol-check",description: "PNR + family-name auth plus payment-method confirmation" },
      { id: "al-an-pr-payment",         name: "Payment Capture",     type: "workflow", icon: "money",              description: "PCI-scoped payment capture flow with retry / decline handling" },
    ],
    standardResponses: [
      { id: "al-an-sr-purchased",       name: "Ancillary Added",     type: "standard",icon: "thumbs-up",           description: "Confirms the ancillary is on the PNR with new totals and updated boarding pass" },
      { id: "al-an-sr-fallback",        name: "Manual Assistance",   type: "fallback",icon: "route",               description: "Fallback when the ancillary needs manual ticketing or doesn't fit the catalogue" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

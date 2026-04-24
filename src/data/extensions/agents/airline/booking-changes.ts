import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_booking_changes",
  name: "Booking Changes",
  icon: "calendar-clock",
  automationRate: 85,
  avgResolutionTime: "~2.5 min",
  topTopic: "Change my flight",
  description:
    "End-to-end voluntary booking changes — date changes, upgrades, seat selection, route changes, and cancellations. Fare-rule aware, ancillary-aware.",
  capabilities: [
    { title: "Date change",                description: "Change travel dates within fare-rule boundaries with clear fee visibility" },
    { title: "Route change",               description: "Change origin or destination where the fare permits with fare-difference calculation" },
    { title: "Cabin upgrade",              description: "Offer and apply cabin upgrades using cash, points, or bid-upgrade" },
    { title: "Seat selection",             description: "Assign or change seats; manage extra-legroom and emergency-row eligibility" },
    { title: "Cancel & refund",            description: "Process voluntary cancellations with refund eligibility check" },
    { title: "Ancillary add-ons",          description: "Add baggage, meals, lounge access, and fast-track as ancillaries" },
  ],
  quickActions: ["Change date", "Change route", "Upgrade", "Seat selection", "Cancel", "Add baggage"],
  flow: {
    knowledgeSources: [
      { id: "al-bc-kb-booking-api", name: "Booking Engine API",       type: "api",      icon: "computer-api",       description: "Live connection to the GDS/PSS for modifications and pricing" },
      { id: "al-bc-kb-fare-rules", name: "Fare Rules Engine",         type: "api",      icon: "balance",            description: "Structured fare-rule evaluator for change fees, refundability, and eligibility" },
      { id: "al-bc-kb-ancillary",  name: "Ancillary Catalogue",       type: "document", icon: "hierarchy-document", description: "Inventory of bookable ancillaries with price and availability" },
    ],
    guardrails: [
      { id: "al-bc-gr-fare-rules",name: "Fare Rules Respected",       type: "guardrail",icon: "shield-medal",       description: "Never bypasses fare conditions — every change offered within the rules of the booked fare" },
      { id: "al-bc-gr-pii",       name: "PII Protection",              type: "pii",      icon: "lock-security",      description: "PNR and traveller data protected; lookups require authenticated identity" },
    ],
    actionHooks: [
      { id: "al-bc-ah-change",    name: "Apply Booking Change",       type: "api",      icon: "refresh-idea",       description: "Posts the booking change to the PSS with fare-difference payment where applicable" },
      { id: "al-bc-ah-upgrade",   name: "Apply Upgrade",               type: "api",      icon: "chart-growth",       description: "Processes cabin upgrade via cash, points, or accepted bid" },
    ],
    processes: [
      { id: "al-bc-pr-price-diff",name: "Fare Difference Calculation",type: "workflow", icon: "balance",             description: "Calculates and presents the fare difference due before any change is committed" },
      { id: "al-bc-pr-verify",    name: "Traveller Verification",     type: "verification",icon: "check-symbol-check",description: "Strong-auth before applying any paid change to the booking" },
    ],
    standardResponses: [
      { id: "al-bc-sr-confirm",   name: "Booking Updated",             type: "standard", icon: "thumbs-up",          description: "Confirms the booking change with updated itinerary and any payments" },
      { id: "al-bc-sr-fallback",  name: "Agent Review Needed",         type: "fallback", icon: "headset",            description: "Graceful fallback when the change requires complex fare-rule handling" },
    ],
  },
  variants: ["airline:scheduled", "airline:low_cost"],
  tier: "primary",
};

export default agent;

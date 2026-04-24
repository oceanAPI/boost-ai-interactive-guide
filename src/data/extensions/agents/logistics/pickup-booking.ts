import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "lg_pickup_booking",
  name: "Pickup Booking",
  icon: "calendar-clock",
  automationRate: 88,
  avgResolutionTime: "~1.5 min",
  topTopic: "Book a pickup",
  description:
    "For senders — book a parcel pickup from their home or business, manage recurring pickup schedules, and reschedule on the fly.",
  capabilities: [
    { title: "One-off pickup booking", description: "Book a driver to collect parcels on a specific day and time window" },
    { title: "Recurring pickup schedule",description: "Set up a recurring daily or weekly pickup for businesses" },
    { title: "Reschedule & cancel",    description: "Change or cancel a scheduled pickup within the allowed window" },
  ],
  quickActions: ["Book pickup", "Recurring schedule", "Reschedule", "Cancel pickup"],
  flow: {
    knowledgeSources: [
      { id: "lg-pb-kb-booking-api",name: "Pickup Booking API",    type: "api",      icon: "computer-api", description: "Live pickup-scheduling platform for driver dispatch" },
      { id: "lg-pb-kb-coverage",   name: "Service Area Coverage", type: "document", icon: "globe",        description: "Which postal codes support which pickup services" },
    ],
    guardrails: [
      { id: "lg-pb-gr-pii",        name: "Address Privacy",       type: "pii",      icon: "lock-security",description: "Pickup addresses scoped to authenticated account" },
    ],
    actionHooks: [
      { id: "lg-pb-ah-book",       name: "Book Pickup",           type: "api",      icon: "finger-tap",   description: "Creates the pickup booking with driver dispatch" },
    ],
    processes: [
      { id: "lg-pb-pr-verify",     name: "Account Verification",   type: "verification",icon: "check-symbol-check",description: "Verifies the booking is against the authenticated account" },
    ],
    standardResponses: [
      { id: "lg-pb-sr-booked",     name: "Pickup Booked",         type: "standard",icon: "thumbs-up",     description: "Confirms the pickup with date, time window, and driver-dispatch ETA" },
    ],
  },
  variants: ["logistics:parcel", "logistics:freight"],
  tier: "addon",
};

export default agent;

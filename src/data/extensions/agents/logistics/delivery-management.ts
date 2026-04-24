import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "lg_delivery_management",
  name: "Delivery Management",
  icon: "calendar-day",
  automationRate: 86,
  avgResolutionTime: "~2 min",
  topTopic: "Change delivery",
  description:
    "Lets recipients reshape a scheduled delivery — reschedule, redirect to a pickup point, change the address, or leave it with a neighbour. The dominant self-serve journey for in-flight parcels.",
  capabilities: [
    { title: "Reschedule delivery",        description: "Move the delivery to another slot the recipient selects" },
    { title: "Redirect to pickup point",   description: "Re-route an in-flight parcel to the nearest pickup location or parcel locker" },
    { title: "Address change mid-flight",  description: "Change the delivery address when operationally possible and eligible" },
    { title: "Leave-with-neighbour permissions", description: "Grant or revoke neighbour-leave permission on the account" },
    { title: "Safe-place instructions",    description: "Add or update a safe-place preference for future deliveries" },
    { title: "Hold-at-depot",              description: "Arrange for a parcel to be held at the depot for customer pickup" },
  ],
  quickActions: ["Reschedule", "Change pickup", "Change address", "Leave with neighbour", "Safe place", "Hold at depot"],
  flow: {
    knowledgeSources: [
      { id: "lg-dm-kb-delivery-api", name: "Delivery Management API",type: "api",      icon: "computer-api",       description: "Live operational API for reschedule, redirect, and hold actions" },
      { id: "lg-dm-kb-eligibility",  name: "Action Eligibility Rules",type: "document", icon: "hierarchy-document", description: "Rules engine for which actions are allowed given parcel state, operator, and product" },
      { id: "lg-dm-kb-locations",    name: "Pickup Point Directory", type: "api",      icon: "globe",              description: "Directory of pickup points, parcel lockers, and depots with live capacity" },
    ],
    guardrails: [
      { id: "lg-dm-gr-ownership",    name: "Recipient-Only Actions", type: "guardrail",icon: "shield-medal", description: "Mutations only allowed by the verified recipient; senders can only change before dispatch" },
      { id: "lg-dm-gr-pii",          name: "Address Privacy",         type: "pii",      icon: "lock-security",description: "Address changes never echoed in shared transcripts" },
    ],
    actionHooks: [
      { id: "lg-dm-ah-reschedule",   name: "Reschedule Delivery",     type: "api",      icon: "calendar-clock",description: "Posts the reschedule to the operations platform with new slot" },
      { id: "lg-dm-ah-redirect",     name: "Redirect to Pickup Point",type: "api",      icon: "route",        description: "Redirects the parcel to a different endpoint when operationally eligible" },
    ],
    processes: [
      { id: "lg-dm-pr-verify",       name: "Recipient Verification",  type: "verification",icon: "check-symbol-check",description: "Strong-auth of recipient before applying any change" },
      { id: "lg-dm-pr-escalate",     name: "Escalate to Depot",       type: "transfer", icon: "headset",      description: "Hand-off when operational constraints block the requested change" },
    ],
    standardResponses: [
      { id: "lg-dm-sr-confirm",      name: "Change Confirmed",        type: "standard", icon: "thumbs-up",    description: "Confirms the delivery change with the new instructions" },
      { id: "lg-dm-sr-ineligible",   name: "Too Late / Ineligible",   type: "fallback", icon: "route",        description: "Graceful fallback when the parcel is past the point changes are possible" },
    ],
  },
  variants: ["logistics:parcel"],
  tier: "primary",
};

export default agent;

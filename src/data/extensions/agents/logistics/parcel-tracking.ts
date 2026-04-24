import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "lg_parcel_tracking",
  name: "Parcel Tracking",
  icon: "route",
  automationRate: 92,
  avgResolutionTime: "~1 min",
  topTopic: "Where is my parcel?",
  description:
    "The single dominant journey in any parcel operator — answering 'where is my parcel?'. Supports multi-operator lookup, proactive delay notifications, and smart ETA re-estimation.",
  capabilities: [
    { title: "Track by reference",         description: "Return the current state and next scheduled event for any parcel by tracking number" },
    { title: "Multi-parcel inbox view",     description: "For authenticated users, show all in-flight parcels at a glance" },
    { title: "Delay notification & ETA refresh",description: "Surface known delays and provide a refreshed ETA based on operational data" },
    { title: "Delivery-confirmation receipts",description: "Share proof-of-delivery records including signature image where available" },
    { title: "Cross-operator handoffs",     description: "Surface state transitions when a parcel moves across carrier networks" },
    { title: "Proactive status subscription", description: "Offer SMS or email proactive updates at key milestones" },
  ],
  quickActions: ["Track parcel", "My parcels", "Delivery time", "Proof of delivery", "Subscribe to updates", "Report issue"],
  flow: {
    knowledgeSources: [
      { id: "lg-pt-kb-tracking-api",name: "Tracking Platform API",   type: "api",      icon: "computer-api", description: "Real-time connection to the parcel tracking platform with event-level detail" },
      { id: "lg-pt-kb-eta-model",   name: "ETA Forecast Service",     type: "api",      icon: "calendar-clock",description: "ML-derived ETA model that accounts for route, weather, and network load" },
      { id: "lg-pt-kb-status-faq",  name: "Status-Code FAQ",          type: "faq",      icon: "books",        description: "Plain-language explanations of every tracking status code customers see" },
    ],
    guardrails: [
      { id: "lg-pt-gr-pii",       name: "Address Privacy",           type: "pii",       icon: "lock-security",description: "Never reveal recipient address or name unless the lookup is from the authenticated recipient" },
      { id: "lg-pt-gr-no-guess",  name: "No Speculative ETAs",       type: "guardrail", icon: "shield-medal", description: "Never fabricate delivery estimates — falls back to 'check back later' when the model is low-confidence" },
    ],
    actionHooks: [
      { id: "lg-pt-ah-subscribe", name: "Subscribe to Updates",       type: "api",       icon: "finger-tap",   description: "Signs the recipient up for push/SMS/email notifications at the next status transition" },
      { id: "lg-pt-ah-report",    name: "Report Delivery Issue",      type: "form",       icon: "speech",       description: "Opens a structured issue-report for missing, damaged, or mis-delivered parcels" },
    ],
    processes: [
      { id: "lg-pt-pr-proactive", name: "Proactive Delay Outreach",  type: "workflow",   icon: "route",       description: "Triggers outbound notifications when a delivery slips beyond tolerance" },
      { id: "lg-pt-pr-escalate",  name: "Escalate to Claims",         type: "transfer",   icon: "headset",      description: "Routes to the Claims agent when a parcel hits missing/lost state" },
    ],
    standardResponses: [
      { id: "lg-pt-sr-on-schedule",name: "On Schedule",               type: "standard",  icon: "thumbs-up",    description: "Canned confirmation that the parcel is on track with next-event time" },
      { id: "lg-pt-sr-delayed",   name: "Delayed — New ETA",          type: "standard",  icon: "clock-pass",   description: "Formatted delay notice with refreshed ETA and empathy phrasing" },
    ],
  },
  variants: ["logistics:parcel", "logistics:cross_border"],
  tier: "primary",
};

export default agent;

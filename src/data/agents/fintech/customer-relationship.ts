import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_customer_relationship",
  name: "Customer relationship",
  icon: "users",
  automationRate: 85,
  avgResolutionTime: "~90 sec",
  topTopic: "Chat with priority support",
  description: "Priority-tier routing, in-app support threads, feedback capture, and fast escalation for power users and business customers on digital-first platforms.",
  capabilities: [
    { title: "Priority routing", description: "Detects premium / business / institutional tier and routes to the matched in-app support queue" },
    { title: "Persistent chat threads", description: "Threads stay alive across app sessions — context, attachments, and history always visible" },
    { title: "Usage-aware context", description: "Surfaces recent transactions, open tickets, and product-launch status to reduce repeat-explanation" },
    { title: "VIP escalation", description: "Fast-tracks power-users, merchants, and API partners to the senior support or engineering on-call" },
    { title: "Feature & change requests", description: "Captures product feedback with the signal needed for the product team to prioritise" },
    { title: "Trust & safety routing", description: "Routes account-health issues (fraud flags, frozen funds, KYC re-verification) to the trust & safety team" },
  ],
  quickActions: ["Priority chat", "Reopen thread", "VIP escalate", "Feature request", "Account health", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "fcr-kb-segments", name: "Customer Segments", type: "database", icon: "database-connection", description: "Tier, ARR, churn signal, and tenure across every user segment" },
      { id: "fcr-kb-tickets", name: "Support Ticket Store", type: "api", icon: "computer-api", description: "All past tickets, threads, and resolution quality per customer" },
      { id: "fcr-kb-usage", name: "Product Usage Telemetry", type: "api", icon: "globe", description: "Recent feature usage, friction points, and device-level context" },
    ],
    guardrails: [
      { id: "fcr-gr-auth", name: "Session Auth", type: "compliance", icon: "lock-security", description: "Ties every support thread to an authenticated app session — anonymous support routed via public channels only" },
      { id: "fcr-gr-data-minimisation", name: "Data Minimisation", type: "compliance", icon: "shield-medal", description: "Surfaces only the customer data needed for the current query, never the full profile" },
    ],
    actionHooks: [
      { id: "fcr-ah-warm-handover", name: "Handover to Human", type: "transfer", icon: "headset", description: "Hands off to a human support agent with full thread and usage context" },
      { id: "fcr-ah-escalate-vip", name: "Escalate to VIP Queue", type: "transfer", icon: "route", description: "Routes premium tier customers to the senior-support queue with priority SLA" },
      { id: "fcr-ah-engineering", name: "Escalate to Engineering", type: "transfer", icon: "route", description: "Pages the on-call engineer for platform incidents affecting this customer" },
    ],
    processes: [
      { id: "fcr-pr-tier-match", name: "Tier Matching", type: "workflow", icon: "hierarchy", description: "Determines tier-specific routing based on ARR, segment, and contractual entitlement" },
      { id: "fcr-pr-feedback-intake", name: "Feedback Intake", type: "workflow", icon: "cogs", description: "Tags feedback by theme and routes to the appropriate product surface backlog" },
    ],
    standardResponses: [
      { id: "fcr-sr-queued", name: "In Priority Queue", type: "confirmation", icon: "thumbs-up", description: "Confirms position in priority queue with expected response time" },
      { id: "fcr-sr-feedback-captured", name: "Feedback Captured", type: "confirmation", icon: "check-symbol-check", description: "Confirms feedback recorded with product-team reference" },
    ],
  },
  tier: "primary",
};

export default agent;

import type { SpecialistAgent } from "../_types";

/**
 * Sits at the very top of the support funnel — the "Proactive activities"
 * stage in the Deloitte right-channelling model. Reduces downstream volume by
 * reaching customers via SMS, email, push and in-app notifications before they
 * call.
 */
const agent: SpecialistAgent = {
  key: "proactive_outreach",
  name: "Proactive Outreach",
  icon: "phone",
  automationRate: 96,
  avgResolutionTime: "N/A (proactive)",
  topTopic: "Renewal reminder",
  description: "Outbound SMS, email, push and in-app nudges — renewal reminders, premium-due alerts, claim status updates, policy lapse prevention.",
  capabilities: [
    { title: "Renewal reminders", description: "Notifies customers of upcoming renewals with one-tap renewal confirmation" },
    { title: "Premium-due alerts", description: "SMS and email reminders ahead of direct-debit or invoice due dates" },
    { title: "Claim status push", description: "Proactively updates claimants on major milestones without them asking" },
    { title: "Lapse-prevention nudges", description: "Triggers outreach sequence on first missed payment to avoid policy lapse" },
    { title: "Life-event triggers", description: "Detects signals (address move, vehicle change) and proposes relevant coverage" },
    { title: "Weather / event alerts", description: "Warns customers in affected postcodes about storms and travel advisories" },
  ],
  quickActions: ["Send renewal reminder", "Schedule premium alert", "Push claim update", "Start lapse flow", "Trigger life-event offer", "Weather alert broadcast"],
  flow: {
    knowledgeSources: [
      { id: "ipo-kb-campaigns", name: "Campaign Library", type: "database", icon: "database-connection", description: "Approved outbound message templates with legal sign-off" },
      { id: "ipo-kb-customer-api", name: "Customer 360 API", type: "api", icon: "computer-api", description: "Customer profile, preferences, policy portfolio, recent activity" },
      { id: "ipo-kb-events", name: "Event Stream", type: "api", icon: "computer-api", description: "Real-time policy, claim, payment and life-event signals" },
    ],
    guardrails: [
      { id: "ipo-gr-consent", name: "Consent & Preference Guard", type: "compliance", icon: "lock-security", description: "Respects channel-level opt-in/opt-out and time-of-day rules (GDPR, ePrivacy)" },
      { id: "ipo-gr-frequency", name: "Contact Frequency Cap", type: "compliance", icon: "shield-medal", description: "Prevents over-contact by enforcing per-customer weekly message ceiling" },
      { id: "ipo-gr-hallucination", name: "Template-Only Output", type: "hallucination", icon: "shield-medal", description: "Forces outbound copy through approved templates — no free-form generation" },
    ],
    actionHooks: [
      { id: "ipo-ah-send-sms", name: "Send SMS", type: "sms", icon: "phone", description: "Dispatches SMS via the preferred provider (Vonage/Twilio)" },
      { id: "ipo-ah-send-email", name: "Send Email", type: "webhook", icon: "target-selection", description: "Dispatches transactional email via marketing cloud" },
      { id: "ipo-ah-push", name: "Send Push / In-App", type: "webhook", icon: "phone", description: "Delivers push notification to mobile app users" },
      { id: "ipo-ah-inbound-handoff", name: "Open Inbound Path", type: "transfer", icon: "headset", description: "One-tap reply routes into chat/voice AI agents seamlessly" },
    ],
    processes: [
      { id: "ipo-pr-renewal-seq", name: "Renewal Sequence", type: "workflow", icon: "hierarchy", description: "Multi-touch renewal journey: -30d email, -7d SMS, -1d push" },
      { id: "ipo-pr-lapse-save", name: "Lapse-Prevention Sequence", type: "workflow", icon: "cogs", description: "Escalating nudges after missed payment with one-tap repair" },
    ],
    standardResponses: [
      { id: "ipo-sr-scheduled", name: "Outreach Scheduled", type: "confirmation", icon: "thumbs-up", description: "Confirms the outbound message was queued with delivery window" },
      { id: "ipo-sr-blocked", name: "Outreach Blocked", type: "request", icon: "route", description: "Explains why a message was suppressed (consent, cap, quiet hours)" },
    ],
  },
};

export default agent;

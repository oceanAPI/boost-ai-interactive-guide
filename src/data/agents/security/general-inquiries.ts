import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_general_inquiries",
  name: "General inquiries",
  icon: "speech",
  automationRate: 82,
  avgResolutionTime: "~1 min",
  topTopic: "Opening hours",
  description: "Catch-all for contact details, opening hours, press / PR routing, supplier questions and anything that doesn't fit the other specialist agents.",
  capabilities: [
    { title: "Contact routing", description: "Route the customer to the right channel — chat, phone, email, branch — per market" },
    { title: "Opening hours", description: "Current opening hours including holiday overrides per market" },
    { title: "Press & PR routing", description: "Redirect media inquiries to the press desk with a clear hand-off note" },
    { title: "Supplier / partner", description: "Route supplier, installer and partner inquiries to the right operational inbox" },
    { title: "Catch-all fallback", description: "Graceful hand-off when the topic isn't recognised, with context preserved" },
  ],
  quickActions: ["Opening hours", "How do I contact you?", "Media inquiry", "I'm a supplier", "I don't know where to go"],
  flow: {
    knowledgeSources: [
      { id: "sec-gi-kb-contact", name: "Contact directory", type: "document", icon: "hierarchy-document", description: "Canonical numbers, emails and chat hours per market and topic" },
      { id: "sec-gi-kb-ooh", name: "OOH / holidays", type: "document", icon: "clock-pass", description: "Public-holiday calendar + out-of-hours behaviour per market" },
    ],
    guardrails: [
      { id: "sec-gi-gr-hallucination", name: "Hallucination detection", type: "hallucination", icon: "shield-medal", description: "Contact details must come from the directory — no improvised numbers" },
    ],
    actionHooks: [
      { id: "sec-gi-ah-handoff", name: "Queue-aware hand-off", type: "transfer", icon: "headset", description: "Hands off to the best available queue for the detected topic + language" },
    ],
    processes: [],
    standardResponses: [
      { id: "sec-gi-sr-contact", name: "Contact details", type: "informational", icon: "phone", description: "Plain list of channels with hours for the customer's market" },
      { id: "sec-gi-sr-handed-off", name: "Handed off", type: "confirmation", icon: "check-symbol-check", description: "Confirms the context is in queue and sets expectations on wait time" },
    ],
  },
};

export default agent;

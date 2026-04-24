import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "ps_benefits_eligibility",
  name: "Benefits Eligibility",
  icon: "hand-protection",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "Am I eligible?",
  description:
    "Helps citizens understand whether they may qualify for specific welfare benefits, what the criteria are, and how to apply — without making binding decisions.",
  capabilities: [
    { title: "Eligibility pre-screen",      description: "Walk through top-level criteria for each benefit and flag likely eligibility" },
    { title: "Benefit catalogue search",    description: "Help citizens find which benefits exist for their situation (unemployment, sickness, family)" },
    { title: "Application routing",          description: "Point the citizen to the right application channel (digital form, in-person, phone)" },
    { title: "Required documents list",      description: "List the documents typically required for each benefit application" },
    { title: "Concurrent benefit interaction",description: "Explain how receiving one benefit affects eligibility for another" },
    { title: "Life-event guidance",          description: "Surface which benefits may apply after life events (job loss, new child, illness, retirement)" },
  ],
  quickActions: ["Am I eligible?", "Find a benefit", "Apply now", "Required documents", "Life event", "Talk to a caseworker"],
  flow: {
    knowledgeSources: [
      { id: "ps-be-kb-benefit-catalog", name: "Benefits Catalogue",      type: "document", icon: "books",              description: "Complete list of administered benefits with official eligibility criteria, updated per legislation changes" },
      { id: "ps-be-kb-rules-api",       name: "Eligibility Rules API",    type: "api",      icon: "computer-api",       description: "Structured rules engine that returns a preliminary eligibility verdict given citizen inputs" },
      { id: "ps-be-kb-life-events",     name: "Life-event Playbooks",     type: "faq",      icon: "hierarchy-document", description: "Curated playbooks mapping common life events to the benefits most often relevant" },
    ],
    guardrails: [
      { id: "ps-be-gr-not-binding", name: "Non-Binding Guidance",        type: "guardrail",    icon: "shield-medal",  description: "Every eligibility response is clearly framed as preliminary — binding decisions only via formal application" },
      { id: "ps-be-gr-pii",         name: "PII Protection",              type: "pii",          icon: "lock-security", description: "Sensitive data (health, family, income) handled per data-protection regulation, never stored in transcripts" },
    ],
    actionHooks: [
      { id: "ps-be-ah-start-app",   name: "Launch Application",           type: "form",         icon: "finger-tap",    description: "Opens the official benefit application form, prefilled where possible from the screening answers" },
      { id: "ps-be-ah-save-summary",name: "Save Screening Summary",       type: "email",        icon: "phone",         description: "Emails the citizen a summary of the screening so they can continue the application later" },
    ],
    processes: [
      { id: "ps-be-pr-screening",   name: "Guided Screening Flow",        type: "workflow",     icon: "hierarchy",     description: "Multi-step structured interview that collects only the fields the rules engine needs to return a verdict" },
      { id: "ps-be-pr-handoff",     name: "Caseworker Handoff for Edge Cases",type: "transfer", icon: "headset",       description: "Routes ambiguous eligibility cases to a caseworker with the screening answers pre-loaded" },
    ],
    standardResponses: [
      { id: "ps-be-sr-verdict",     name: "Preliminary Verdict",          type: "standard",     icon: "thumbs-up",     description: "Formatted preliminary-eligibility response with next steps and disclaimer on non-binding nature" },
      { id: "ps-be-sr-fallback",    name: "Cannot Determine",             type: "fallback",     icon: "route",         description: "Graceful fallback when the screening cannot produce a confident verdict" },
    ],
  },
  variants: ["public_sector:benefits"],
  tier: "primary",
};

export default agent;

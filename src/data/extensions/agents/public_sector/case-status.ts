import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "ps_case_status",
  name: "Case Status",
  icon: "hierarchy-document",
  automationRate: 82,
  avgResolutionTime: "~1.5 min",
  topTopic: "Where is my case?",
  description:
    "Citizens check the status of an open case, see which stage it's at, and find out what's expected next. Looks up by case number or authenticated identity.",
  capabilities: [
    { title: "Case lookup by number",       description: "Retrieve case state by case reference number without requiring full login" },
    { title: "Authenticated full-case view", description: "Show all open cases and timelines for a verified citizen via national ID" },
    { title: "Next-step visibility",        description: "Explain what the citizen or agency is waiting on, and what happens next" },
    { title: "Hearing-date lookup",         description: "Surface scheduled hearing or review dates and their meaning" },
    { title: "Decision-timeline estimates", description: "Share typical time-to-decision for the case type the user is asking about" },
    { title: "Recent-activity summary",     description: "Render the latest updates on the case in plain language" },
  ],
  quickActions: ["Find my case", "Next step", "Hearing date", "Decision timeline", "Recent activity", "Talk to a caseworker"],
  flow: {
    knowledgeSources: [
      { id: "ps-cs-kb-case-api",      name: "Case Management API",      type: "api",      icon: "computer-api",       description: "Authenticated lookup of case state, stages, and milestones from the internal case-management system" },
      { id: "ps-cs-kb-faq-cases",     name: "Case Process FAQ",         type: "faq",      icon: "books",              description: "Plain-language explanations of every case stage and what it means for the citizen" },
      { id: "ps-cs-kb-glossary",      name: "Legal Terms Glossary",     type: "document", icon: "hierarchy-document", description: "Citizen-friendly definitions for tribunal and administrative-law terminology" },
    ],
    guardrails: [
      { id: "ps-cs-gr-no-legal",      name: "No Legal Advice",          type: "guardrail",     icon: "shield-medal",      description: "Blocks the agent from interpreting law or advising on case merits — routes to qualified help instead" },
      { id: "ps-cs-gr-pii",           name: "PII Protection",            type: "pii",           icon: "lock-security",     description: "Ensures national-ID and sensitive case details are never exposed in transcripts or logs" },
    ],
    actionHooks: [
      { id: "ps-cs-ah-transfer-cw",   name: "Transfer to Caseworker",    type: "transfer",      icon: "headset",           description: "Hands conversation to a human caseworker with full case context when the request can't be automated" },
      { id: "ps-cs-ah-email-update",  name: "Email Case Summary",         type: "email",         icon: "phone",             description: "Sends a formatted email summary of the current case state to the citizen's verified address" },
    ],
    processes: [
      { id: "ps-cs-pr-idporten",       name: "ID-porten Verification",    type: "verification",  icon: "check-symbol-check", description: "Triggers national-ID strong-auth before revealing any case-private information" },
      { id: "ps-cs-pr-route-by-type", name: "Route by Case Type",        type: "workflow",      icon: "route",             description: "Dispatches the citizen into the right agent for the specific case type (benefits, appeals, tax, licensing)" },
    ],
    standardResponses: [
      { id: "ps-cs-sr-stage-explain",  name: "Stage Explainer",          type: "standard",      icon: "hierarchy",          description: "Canned, plain-language explanation of what any given case stage means" },
      { id: "ps-cs-sr-fallback",       name: "Unable to Locate",         type: "fallback",      icon: "route",             description: "Graceful fallback when a case reference can't be matched — offers caseworker handover" },
    ],
  },
  tier: "primary",
};

export default agent;

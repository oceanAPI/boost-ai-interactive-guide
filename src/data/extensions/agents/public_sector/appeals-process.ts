import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "ps_appeals_process",
  name: "Appeals Process",
  icon: "balance",
  automationRate: 74,
  avgResolutionTime: "~3 min",
  topTopic: "How do I appeal?",
  description:
    "Explains how to file an appeal against an administrative decision, what evidence helps, deadlines, and what to expect at each stage of the review.",
  capabilities: [
    { title: "Eligibility to appeal",        description: "Check whether a specific decision type is appealable and which body handles it" },
    { title: "Step-by-step appeal guide",    description: "Walk the citizen through the appeal process from notice to hearing to decision" },
    { title: "Evidence & documentation tips",description: "Explain what kinds of evidence strengthen an appeal, without advising on case merits" },
    { title: "Deadlines & time limits",       description: "Surface the statutory deadline for this specific decision type and warn when close to expiry" },
    { title: "Free legal aid signposting",    description: "Point citizens toward the correct legal-aid body when qualified advice is required" },
    { title: "Appeal-status lookup",          description: "Hand off to Case Status agent once an appeal is filed and active" },
  ],
  quickActions: ["Can I appeal this?", "Appeal steps", "Deadline check", "Evidence tips", "Find legal aid", "Appeal status"],
  flow: {
    knowledgeSources: [
      { id: "ps-ap-kb-process-docs", name: "Appeals Process Docs",       type: "document", icon: "hierarchy-document", description: "Internal process guides describing each appeal stage, timing, and required inputs" },
      { id: "ps-ap-kb-legal-aid",    name: "Legal Aid Directory",        type: "api",      icon: "computer-api",       description: "Directory of accredited free legal-aid providers by region, referenced when signposting" },
      { id: "ps-ap-kb-case-types",   name: "Appealable Decisions Catalog", type: "faq",    icon: "books",              description: "Authoritative list of which decision types are appealable, to which body, and under which law" },
    ],
    guardrails: [
      { id: "ps-ap-gr-no-legal",      name: "No Legal Advice",           type: "guardrail",    icon: "shield-medal",  description: "Never advises on case merits, argues positions, or predicts outcome — strictly procedural" },
      { id: "ps-ap-gr-deadline-alert",name: "Deadline Risk Flag",        type: "guardrail",    icon: "clock-pass",    description: "Raises a strong visible alert when the citizen is within 7 days of a filing deadline" },
    ],
    actionHooks: [
      { id: "ps-ap-ah-send-checklist",name: "Send Appeal Checklist",     type: "email",        icon: "phone",         description: "Emails the citizen a personalised checklist of documents and deadlines for their decision type" },
      { id: "ps-ap-ah-legal-aid-form",name: "Prefill Legal Aid Request", type: "form",         icon: "finger-tap",    description: "Launches a partially-populated legal-aid application based on the citizen's context" },
    ],
    processes: [
      { id: "ps-ap-pr-decision-lookup",name: "Look Up Source Decision",  type: "workflow",     icon: "hierarchy",     description: "Retrieves the original decision being appealed to confirm it falls under this tribunal's remit" },
      { id: "ps-ap-pr-jurisdiction",  name: "Jurisdiction Routing",       type: "workflow",     icon: "route",         description: "Redirects cases that belong to a different body to the correct authority with a warm-handoff" },
    ],
    standardResponses: [
      { id: "ps-ap-sr-steps-summary",  name: "Appeal Steps Summary",     type: "standard",     icon: "hierarchy",     description: "Canned clear summary of the 4–5 appeal stages and who does what at each" },
      { id: "ps-ap-sr-fallback",       name: "Escalate to Caseworker",   type: "fallback",     icon: "headset",       description: "Graceful fallback when questions require qualified procedural judgement" },
    ],
  },
  variants: ["public_sector:appeals"],
  tier: "primary",
};

export default agent;

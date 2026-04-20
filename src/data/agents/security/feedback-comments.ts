import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_feedback_comments",
  name: "Feedback & comments",
  icon: "thumbs-up",
  automationRate: 85,
  avgResolutionTime: "~1 min",
  topTopic: "Leave feedback",
  description: "Structured feedback capture — compliments, complaints, product suggestions, technician reviews. Tags and routes each to the right internal listener with a closing-the-loop promise.",
  capabilities: [
    { title: "Leave feedback", description: "Guided intake that tags feedback by product, theme and sentiment" },
    { title: "Technician review", description: "Short post-visit review that reaches the technician and the dispatch team" },
    { title: "Product suggestion", description: "Capture feature requests with enough context for the product team to act on" },
    { title: "Complaint logging", description: "Formal complaint capture with reference, SLA and escalation path" },
    { title: "Close-the-loop", description: "Tell the customer what happens next and when they should expect a reply" },
  ],
  quickActions: ["Leave feedback", "Rate my technician", "Suggest a feature", "File a complaint", "What happens with my feedback?"],
  flow: {
    knowledgeSources: [
      { id: "sec-fc-kb-taxonomy", name: "Feedback taxonomy", type: "document", icon: "hierarchy-document", description: "Tagging model, SLA targets, routing rules per theme" },
    ],
    guardrails: [
      { id: "sec-fc-gr-empathy", name: "Empathy tone", type: "tone", icon: "heart", description: "Follows the compassionate-tone playbook on complaints and negative feedback" },
      { id: "sec-fc-gr-pii", name: "PII scrub", type: "pii", icon: "hand-protection", description: "Strips identifying information from free-text feedback before routing to product" },
    ],
    actionHooks: [
      { id: "sec-fc-ah-log", name: "Log feedback", type: "webhook", icon: "hierarchy", description: "Creates the feedback record with tags, sentiment and routing target" },
      { id: "sec-fc-ah-notify", name: "Notify owner", type: "webhook", icon: "finger-tap", description: "Pings the named internal owner when feedback matches their watch list" },
    ],
    processes: [
      { id: "sec-fc-pr-intake", name: "Feedback intake", type: "workflow", icon: "hierarchy", description: "Short structured intake that adapts to the feedback type" },
    ],
    standardResponses: [
      { id: "sec-fc-sr-logged", name: "Feedback received", type: "confirmation", icon: "check-symbol-check", description: "Confirms receipt, reference and what the customer should expect next" },
    ],
  },
};

export default agent;

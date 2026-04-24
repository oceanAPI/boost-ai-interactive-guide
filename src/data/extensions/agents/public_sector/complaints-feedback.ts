import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "ps_complaints_feedback",
  name: "Complaints & Feedback",
  icon: "speech",
  automationRate: 70,
  avgResolutionTime: "~2 min",
  topTopic: "File a complaint",
  description:
    "Lets citizens file complaints, feedback, or service-quality concerns with the agency and routes urgent matters to the correct escalation path.",
  capabilities: [
    { title: "File a complaint",     description: "Capture a structured complaint with topic, reference, and preferred follow-up channel" },
    { title: "Escalation routing",   description: "Identify when a complaint needs immediate escalation (fraud, safety, rights concerns) and route accordingly" },
  ],
  quickActions: ["File complaint", "Check complaint status", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "ps-cf-kb-forms", name: "Complaint Intake Form Schema", type: "document", icon: "hierarchy-document", description: "Schema for the complaint intake form — required fields, classification taxonomy" },
    ],
    guardrails: [
      { id: "ps-cf-gr-pii", name: "PII Protection", type: "pii", icon: "lock-security", description: "Sensitive complaint details handled under data-protection rules and not echoed in logs" },
    ],
    actionHooks: [
      { id: "ps-cf-ah-submit", name: "Submit Complaint", type: "form", icon: "finger-tap", description: "Submits the structured complaint into the internal tracking system and returns a reference number" },
    ],
    processes: [
      { id: "ps-cf-pr-urgency", name: "Urgency Classifier", type: "workflow", icon: "route", description: "Screens the complaint text for urgency markers and routes critical matters to a live human immediately" },
    ],
    standardResponses: [
      { id: "ps-cf-sr-confirm", name: "Complaint Received", type: "standard", icon: "thumbs-up", description: "Confirms receipt of complaint with reference number and expected turnaround" },
    ],
  },
  tier: "light",
};

export default agent;

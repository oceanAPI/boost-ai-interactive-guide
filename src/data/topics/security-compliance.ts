import type { TopicEntry } from "./_types";

export const SECURITY_COMPLIANCE: TopicEntry = {
  key: "security-compliance",
  sectionId: "topic-security",
  name: "Security & Compliance",
  shortDescription:
    "Bank-grade guardrails, EU AI Act readiness, and enterprise-level data protection built into every interaction.",
  icon: "shield-medal",
  color: "border-boost-purple",
  headerContent: [
    {
      type: "stats",
      heading: "Security at a glance",
      items: [
        { value: 6, suffix: "+", label: "Guardrail types" },
        { value: 100, suffix: "%", label: "Audit trail coverage" },
        { value: 24, suffix: "/7", label: "Monitoring" },
      ],
    },
  ],
  content: [
    {
      type: "callout",
      heading: "Regulatory Gridlock — solved",
      body: "EU AI Act and DORA create a compliance wall for AI deployment in financial services. boost.ai is built for this reality — bank-grade guardrails, full auditability, and configurable controls mean you deploy with confidence, not compliance anxiety.",
      variant: "purple",
    },
  ],
};

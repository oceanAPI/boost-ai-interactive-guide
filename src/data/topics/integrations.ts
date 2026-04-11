import type { TopicEntry } from "./_types";

export const INTEGRATIONS: TopicEntry = {
  key: "integrations",
  sectionId: "topic-integrations",
  name: "Integrations & Architecture",
  shortDescription:
    "Pre-built connections to your channels, handover systems, backend APIs, and voice infrastructure.",
  icon: "integration-artificial-intelligence",
  color: "border-boost-green",
  headerContent: [
    {
      type: "stats",
      heading: "Integration ecosystem",
      items: [
        { value: 50, suffix: "+", label: "Pre-built integrations" },
        { value: 12, suffix: "+", label: "Channel connectors" },
        { value: 6, suffix: "-8 wks", label: "To production" },
      ],
    },
  ],
  content: [
    {
      type: "callout",
      heading: "API-first by design",
      body: "Every capability in boost.ai is accessible via REST API — manage agents, update knowledge, trigger conversations, and pull analytics programmatically. Deep integration with your CI/CD pipelines and operational tooling.",
      variant: "green",
    },
  ],
};

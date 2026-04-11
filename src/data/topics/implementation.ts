import type { TopicEntry } from "./_types";

export const IMPLEMENTATION: TopicEntry = {
  key: "implementation",
  sectionId: "topic-implementation",
  name: "Implementation & Rollout",
  shortDescription:
    "From first meeting to production in 6-8 weeks — phased rollout with clear milestones and deliverables.",
  icon: "rocket",
  color: "border-boost-purple",
  /* headerContent renders ABOVE the roadmap chart */
  headerContent: [
    {
      type: "stats",
      heading: "Implementation at a glance",
      items: [
        { value: 6, suffix: "-8 wks", label: "To first agent live" },
        { value: 80, suffix: "%+", label: "Target automation rate" },
        { value: 4, label: "Phases to full rollout" },
      ],
    },
  ],
  /* content renders BELOW the roadmap chart */
  content: [
    {
      type: "table",
      heading: "Time to production comparison",
      columns: ["Approach", "Timeline", "Risk level"],
      rows: [
        { Approach: "boost.ai", Timeline: "6-8 weeks", "Risk level": "Low — proven methodology" },
        { Approach: "Generic LLM platform", Timeline: "3-6 months", "Risk level": "Medium — requires custom work" },
        { Approach: "Legacy IVR / Chatbot", Timeline: "6-12 months", "Risk level": "High — limited AI capability" },
        { Approach: "Build in-house", Timeline: "12-24 months", "Risk level": "Very high — unproven" },
      ],
      highlightColumn: "boost.ai",
    },
    {
      type: "text",
      heading: "Multi-market rollout",
      body: "For organizations operating across multiple markets, boost.ai supports a proven hub-and-spoke model. Build once for your primary market, then replicate and localize for additional markets. Each subsequent market typically takes 2-3 weeks to launch, leveraging the foundation built in the first deployment. Language support, local compliance requirements, and market-specific knowledge are configured per-market while sharing the core agent architecture.",
    },
    {
      type: "callout",
      heading: "No fragmented pilots",
      body: "Instead of running multiple disconnected AI experiments, boost.ai's implementation approach delivers a unified conversational AI strategy from day one. One platform, one orchestrator, one team — scaling from a single use case to enterprise-wide deployment.",
      variant: "purple",
    },
  ],
};

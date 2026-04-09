export interface ComparisonRow {
  capability: string;
  boost: string;
  llm: string;
  ivr: string;
  diy: string;
  boostDetail?: string;
  llmDetail?: string;
  ivrDetail?: string;
  diyDetail?: string;
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  {
    capability: "Time to production",
    boost: "yes", llm: "partial", ivr: "no", diy: "no",
    boostDetail: "6-8 weeks with pre-built financial services intents and templates",
    llmDetail: "3-6 months of prompt engineering and custom development",
    ivrDetail: "6-12 months for traditional IVR tree configuration",
    diyDetail: "12-24 months including ML team hiring and model training",
  },
  {
    capability: "Financial domain expertise",
    boost: "yes", llm: "partial", ivr: "partial", diy: "no",
    boostDetail: "Deep pre-built knowledge across insurance, banking, and wealth management",
    llmDetail: "Generic language model requires extensive domain fine-tuning",
    ivrDetail: "Basic menu trees with limited understanding",
    diyDetail: "Must build domain expertise from scratch",
  },
  {
    capability: "Automation rate",
    boost: "yes", llm: "partial", ivr: "no", diy: "partial",
    boostDetail: "80-90%+ automation with supervised guardrails",
    llmDetail: "Highly variable — depends on prompt quality and hallucination rate",
    ivrDetail: "40-60% containment with rigid decision trees",
    diyDetail: "Unknown — depends entirely on investment and team capability",
  },
  {
    capability: "Agentic orchestration",
    boost: "yes", llm: "partial", ivr: "no", diy: "no",
    boostDetail: "Native multi-agent routing with intent-based orchestration",
    llmDetail: "Emerging frameworks, not production-hardened",
    ivrDetail: "No agent concept — fixed menu paths only",
    diyDetail: "Requires building full orchestration layer from scratch",
  },
  {
    capability: "Claims & policy intake",
    boost: "yes", llm: "no", ivr: "no", diy: "no",
    boostDetail: "FNOL, claim status, policy servicing built into specialist agents",
    llmDetail: "Must custom-build every workflow and integration",
    ivrDetail: "Cannot handle complex multi-step processes",
    diyDetail: "Must build and maintain every workflow",
  },
  {
    capability: "Compliance & guardrails",
    boost: "yes", llm: "partial", ivr: "partial", diy: "no",
    boostDetail: "Financial-grade guardrails prevent hallucination and off-topic responses",
    llmDetail: "Generic safety filters — not industry-specific compliance",
    ivrDetail: "Basic script compliance — rigid but limited",
    diyDetail: "Must build and maintain all compliance layers",
  },
  {
    capability: "Human handoff quality",
    boost: "yes", llm: "partial", ivr: "no", diy: "partial",
    boostDetail: "Full conversation context, intent data, and sentiment transferred to agent",
    llmDetail: "Varies by implementation — often loses context",
    ivrDetail: "Typically drops all context on transfer",
    diyDetail: "Custom integration required with each contact center",
  },
  {
    capability: "Ongoing learning",
    boost: "yes", llm: "no", ivr: "no", diy: "partial",
    boostDetail: "Continuous improvement via conversation analytics and AI trainer tools",
    llmDetail: "Requires manual prompt engineering and re-deployment",
    ivrDetail: "Manual menu tree updates by vendor or IT",
    diyDetail: "Manual model retraining and deployment cycles",
  },
];

export interface TimelinePhase {
  weeks: string;
  title: string;
  tasks: string[];
  color: string;
}

export function getTimeline(companyName: string): TimelinePhase[] {
  return [
    {
      weeks: "Week 1–2",
      title: "Discovery & Design",
      color: "#59195d",
      tasks: [
        `Map top 50 ${companyName} inquiry types`,
        "Define agent architecture and routing logic",
        "Align on KPIs & automation targets",
        "Identify system integrations and data flows",
      ],
    },
    {
      weeks: "Week 3–4",
      title: "Build & Configure",
      color: "#208269",
      tasks: [
        "Configure specialist agents with intent libraries",
        "Load financial services NLP models",
        "Connect APIs (claims, policy, billing systems)",
        "Setup guardrails, compliance rules, and escalation triggers",
      ],
    },
    {
      weeks: "Week 5–6",
      title: "Test & Tune",
      color: "#36b595",
      tasks: [
        `UAT with ${companyName} stakeholders`,
        "NLP accuracy testing (>95% target)",
        "Human escalation and handoff testing",
        "CSAT measurement baseline established",
      ],
    },
    {
      weeks: "Week 7–8",
      title: "Launch & Optimize",
      color: "#ef8b00",
      tasks: [
        "Soft launch (20% traffic ramp-up)",
        "Real-time automation rate monitoring",
        "Edge case tuning from live conversations",
        "Full production rollout across channels",
      ],
    },
  ];
}

export const ROI_HIGHLIGHTS = [
  {
    title: "Cost per contact reduced by 80%",
    description:
      "AI handles 80-90% of interactions at a fraction of human agent cost.",
    color: "emerald",
  },
  {
    title: "Go live in 6-8 weeks, not months",
    description:
      "Pre-built intents, NLP models, and no-code builder accelerate deployment.",
    color: "purple",
  },
  {
    title: "CSAT improves as humans focus on complex cases",
    description:
      "AI handles tier-1, freeing agents for high-value interactions.",
    color: "amber",
  },
  {
    title: "Infinite scale without headcount",
    description:
      "Handle 10x volume during peak events with zero additional staffing.",
    color: "rose",
  },
];

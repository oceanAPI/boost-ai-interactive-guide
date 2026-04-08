export interface ComparisonRow {
  capability: string;
  boostai: string;
  genericLLM: string;
  legacyIVR: string;
  buildInHouse: string;
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  {
    capability: "Time to production",
    boostai: "6–8 weeks",
    genericLLM: "3–6 months",
    legacyIVR: "6–12 months",
    buildInHouse: "12–24 months",
  },
  {
    capability: "Insurance domain expertise",
    boostai: "Deep, pre-built",
    genericLLM: "Generic",
    legacyIVR: "Limited",
    buildInHouse: "Must build",
  },
  {
    capability: "Automation rate (insurance)",
    boostai: "90%+",
    genericLLM: "Variable",
    legacyIVR: "40–60%",
    buildInHouse: "Unknown",
  },
  {
    capability: "Agentic orchestration",
    boostai: "Native",
    genericLLM: "Emerging",
    legacyIVR: "No",
    buildInHouse: "Must build",
  },
  {
    capability: "FNOL + claims intake",
    boostai: "Built-in",
    genericLLM: "Custom build",
    legacyIVR: "No",
    buildInHouse: "Must build",
  },
  {
    capability: "Compliance & guardrails",
    boostai: "Insurance-grade",
    genericLLM: "Generic",
    legacyIVR: "Basic",
    buildInHouse: "Must build",
  },
  {
    capability: "Human handoff quality",
    boostai: "Full context transfer",
    genericLLM: "Variable",
    legacyIVR: "Drops context",
    buildInHouse: "Custom",
  },
  {
    capability: "Ongoing learning",
    boostai: "Continuous",
    genericLLM: "Requires prompt eng.",
    legacyIVR: "Manual",
    buildInHouse: "Manual",
  },
];

export interface TimelinePhase {
  weeks: string;
  title: string;
  tasks: string[];
}

export function getTimeline(companyName: string): TimelinePhase[] {
  return [
    {
      weeks: "Week 1–2",
      title: "Discovery & Design",
      tasks: [
        `Map top 50 ${companyName} inquiry types`,
        "Define agent architecture",
        "Align on KPIs & automation targets",
        "Identify system integrations",
      ],
    },
    {
      weeks: "Week 3–4",
      title: "Build & Configure",
      tasks: [
        "Configure specialist agents",
        "Load insurance intent library",
        "Connect to claims & policy APIs",
        "Guardrail logic setup",
      ],
    },
    {
      weeks: "Week 5–6",
      title: "Test & Tune",
      tasks: [
        `UAT with ${companyName} team`,
        "NLP accuracy testing (>95% target)",
        "Human escalation testing",
        "CSAT measurement baseline",
      ],
    },
    {
      weeks: "Week 7–8",
      title: "Launch & Optimize",
      tasks: [
        "Soft launch (20% traffic)",
        "Monitor automation rates live",
        "Tune edge cases in real-time",
        "Full production rollout",
      ],
    },
  ];
}

export const ROI_HIGHLIGHTS = [
  {
    title: "Cost per contact reduced by 80%",
    description:
      "AI handles 90% of interactions at a fraction of human agent cost. Typical cost drops from $8-15 per contact to under $0.50.",
    color: "emerald",
  },
  {
    title: "Go live in 6-8 weeks, not 6-8 months",
    description:
      "boost.ai deploys in weeks using pre-built insurance intents, NLP models, and a no-code agent builder. Competitors take 6-12 months.",
    color: "purple",
  },
  {
    title: "CSAT improves as humans focus on what matters",
    description:
      "When AI handles tier-1, human agents focus on complex cases — driving higher satisfaction scores across the board.",
    color: "amber",
  },
  {
    title: "Infinite scale without incremental headcount",
    description:
      "Handle 10x the volume during CAT events or open enrollment with zero additional staffing — AI scales instantly.",
    color: "rose",
  },
];

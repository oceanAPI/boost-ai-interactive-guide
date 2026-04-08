export type StakeholderRole = "general" | "cto" | "vp_cx" | "ops_manager" | "ai_trainer" | "executive";

export interface RoleDefinition {
  key: StakeholderRole;
  label: string;
  shortLabel: string;
  description: string;
  sectionOrder: string[];
  highlights: Record<string, string>;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    key: "general",
    label: "General Overview",
    shortLabel: "General",
    description: "Balanced walkthrough of the full offering",
    sectionOrder: [
      "hero", "orchestrator", "agents", "solution", "roi",
      "case-studies", "comparison", "architecture", "security",
      "demo", "timeline", "next-steps",
    ],
    highlights: {},
  },
  {
    key: "executive",
    label: "Executive / Decision Maker",
    shortLabel: "Executive",
    description: "ROI-focused with high-level architecture and proven results",
    sectionOrder: [
      "hero", "roi", "case-studies", "orchestrator", "comparison",
      "agents", "solution", "architecture", "security",
      "timeline", "demo", "next-steps",
    ],
    highlights: {
      roi: "Key decision point: projected ROI based on your current conversation costs",
      "case-studies": "Results from organizations similar to yours",
      timeline: "From decision to live in 6-8 weeks",
    },
  },
  {
    key: "cto",
    label: "CTO / VP Engineering",
    shortLabel: "CTO",
    description: "Architecture, security, and technical integration depth",
    sectionOrder: [
      "hero", "architecture", "security", "orchestrator", "agents",
      "solution", "comparison", "roi", "case-studies",
      "timeline", "demo", "next-steps",
    ],
    highlights: {
      architecture: "Full system architecture with your selected integrations",
      security: "SOC 2, ISO 27001, GDPR — enterprise-grade from day one",
      orchestrator: "Agentic AI with guardrails, not a black-box LLM",
    },
  },
  {
    key: "vp_cx",
    label: "VP Customer Experience",
    shortLabel: "VP CX",
    description: "Customer impact, automation rates, and agent capabilities",
    sectionOrder: [
      "hero", "orchestrator", "agents", "demo", "roi",
      "case-studies", "solution", "comparison", "timeline",
      "architecture", "security", "next-steps",
    ],
    highlights: {
      orchestrator: "How every customer interaction is intelligently routed",
      agents: "Specialist agents trained for your industry verticals",
      demo: "See how your customers will experience the AI agent",
      roi: "CSAT improvement alongside cost reduction",
    },
  },
  {
    key: "ops_manager",
    label: "Operations Manager",
    shortLabel: "Operations",
    description: "Deployment planning, integrations, and resource requirements",
    sectionOrder: [
      "hero", "timeline", "architecture", "orchestrator", "agents",
      "solution", "roi", "case-studies", "comparison",
      "security", "demo", "next-steps",
    ],
    highlights: {
      timeline: "Week-by-week implementation with your team's resource allocation",
      architecture: "Integration points with your existing systems",
      agents: "What each specialist agent handles — reducing your queue volume",
    },
  },
  {
    key: "ai_trainer",
    label: "AI Trainer / Content Lead",
    shortLabel: "AI Trainer",
    description: "Platform capabilities, agent building, and knowledge management",
    sectionOrder: [
      "hero", "agents", "solution", "orchestrator", "demo",
      "timeline", "architecture", "roi", "case-studies",
      "comparison", "security", "next-steps",
    ],
    highlights: {
      agents: "Deep dive into each agent's capabilities and how they're trained",
      solution: "The tools you'll use daily in the boost.ai platform",
      demo: "Live preview of the conversational experience you'll manage",
    },
  },
];

export function getRoleDefinition(role: StakeholderRole): RoleDefinition {
  return ROLE_DEFINITIONS.find((r) => r.key === role) || ROLE_DEFINITIONS[0];
}

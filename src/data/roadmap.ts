/* ─── Implementation Roadmap Data ───
   Easy to modify: just add/remove items in each lane.
   startWeek and endWeek are 1-indexed (week 1 = first week from start date).
*/

export interface RoadmapItem {
  name: string;
  startWeek: number;
  endWeek: number;
  highlight?: boolean;
  detail?: string;
  owner?: string;
  deliverables?: string[];
}

export interface RoadmapPhase {
  name: string;
  startWeek: number;
  endWeek: number;
  color: "purple" | "purple-dark" | "green" | "green-light";
}

export interface RoadmapLane {
  name: string;
  items: RoadmapItem[];
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  { name: "Discovery", startWeek: 1, endWeek: 2, color: "purple" },
  { name: "Build", startWeek: 3, endWeek: 5, color: "purple-dark" },
  { name: "Pilot", startWeek: 6, endWeek: 7, color: "green" },
  { name: "Scale", startWeek: 8, endWeek: 12, color: "green-light" },
];

export const ROADMAP_LANES: RoadmapLane[] = [
  {
    name: "Key Milestones",
    items: [
      {
        name: "Kickoff",
        startWeek: 1, endWeek: 1, highlight: true,
        detail: "Joint workshop with stakeholders to align on vision, scope, and success criteria.",
        owner: "boost.ai + Customer",
        deliverables: ["Project charter", "Stakeholder map", "Communication plan"],
      },
      {
        name: "Scope sign-off",
        startWeek: 2, endWeek: 3, highlight: true,
        detail: "Formal approval of intent map, integration requirements, and KPI targets.",
        owner: "Customer",
        deliverables: ["Signed scope document", "Intent map v1", "KPI baseline"],
      },
      {
        name: "UAT start",
        startWeek: 6, endWeek: 6, highlight: true,
        detail: "Begin user acceptance testing with real conversation flows and edge cases.",
        owner: "Customer + boost.ai QA",
        deliverables: ["Test plan", "UAT environment", "Test accounts"],
      },
      {
        name: "Go-Live",
        startWeek: 8, endWeek: 8, highlight: true,
        detail: "Production launch to 100% traffic with monitoring dashboards active.",
        owner: "boost.ai Delivery",
        deliverables: ["Go-live checklist", "Runbook", "Monitoring dashboard"],
      },
    ],
  },
  {
    name: "Agent Configuration",
    items: [
      {
        name: "Intent mapping",
        startWeek: 1, endWeek: 2,
        detail: "Map customer journeys to intents. Identify top 20 use cases by volume and complexity.",
        owner: "boost.ai + Domain experts",
        deliverables: ["Intent taxonomy", "Journey maps", "Priority matrix"],
      },
      {
        name: "Orchestrator setup",
        startWeek: 3, endWeek: 4,
        detail: "Configure the central orchestrator with routing logic, LLM model selection, and fallback chains.",
        owner: "boost.ai Delivery",
        deliverables: ["Routing configuration", "Model assignments", "Fallback rules"],
      },
      {
        name: "Specialist agents",
        startWeek: 3, endWeek: 5,
        detail: "Build and configure specialist agents for each use case — persona, knowledge sources, and action hooks.",
        owner: "boost.ai Delivery",
        deliverables: ["Agent configurations", "Persona definitions", "Action hook specs"],
      },
      {
        name: "Guardrails & hooks",
        startWeek: 5, endWeek: 6,
        detail: "Implement safety guardrails, content filters, and custom action hooks for business logic.",
        owner: "boost.ai + Customer IT",
        deliverables: ["Guardrail ruleset", "Hook implementations", "Compliance checklist"],
      },
      {
        name: "Optimization",
        startWeek: 8, endWeek: 12,
        detail: "Ongoing tuning based on live data — conversation analysis, intent refinement, and response quality.",
        owner: "AI Trainers + boost.ai CSM",
        deliverables: ["Weekly performance reports", "Tuning recommendations", "Expansion roadmap"],
      },
    ],
  },
  {
    name: "Knowledge & Training",
    items: [
      {
        name: "Content audit",
        startWeek: 1, endWeek: 2,
        detail: "Review existing FAQ, help articles, and internal documentation for knowledge base population.",
        owner: "Customer content team",
        deliverables: ["Content inventory", "Gap analysis", "Source list"],
      },
      {
        name: "KB population",
        startWeek: 3, endWeek: 5,
        detail: "Populate knowledge bases with approved content. Connect to external sources (CMS, help center).",
        owner: "boost.ai + Content team",
        deliverables: ["Populated knowledge bases", "Source connections", "Content review log"],
      },
      {
        name: "Flow validation",
        startWeek: 5, endWeek: 6,
        detail: "End-to-end validation of conversation flows against real scenarios and edge cases.",
        owner: "QA + Domain experts",
        deliverables: ["Test results", "Flow corrections", "Edge case catalog"],
      },
      {
        name: "Team training",
        startWeek: 7, endWeek: 8,
        detail: "Train your AI trainers and admins on the boost.ai platform — analytics, tuning, and content management.",
        owner: "boost.ai Academy",
        deliverables: ["Training certification", "Admin playbook", "Platform access"],
      },
    ],
  },
  {
    name: "Integrations",
    items: [
      {
        name: "API scoping",
        startWeek: 1, endWeek: 2,
        detail: "Document all integration points — channels, backend APIs, handover systems, and authentication.",
        owner: "Customer IT + boost.ai",
        deliverables: ["Integration spec", "API inventory", "Auth requirements"],
      },
      {
        name: "Channel connectors",
        startWeek: 3, endWeek: 4,
        detail: "Activate pre-built connectors for web chat, messaging apps, voice, and email channels.",
        owner: "boost.ai Delivery",
        deliverables: ["Connected channels", "Widget configuration", "Channel-specific settings"],
      },
      {
        name: "Handover config",
        startWeek: 4, endWeek: 5,
        detail: "Configure human handover to your contact center — routing rules, context passing, and fallback logic.",
        owner: "boost.ai + CC team",
        deliverables: ["Handover flows", "Agent desktop integration", "Escalation rules"],
      },
      {
        name: "E2E testing",
        startWeek: 6, endWeek: 7,
        detail: "Full end-to-end testing across all channels and integrations in staging environment.",
        owner: "QA team",
        deliverables: ["Test report", "Bug fixes", "Performance benchmarks"],
      },
    ],
  },
  {
    name: "Quality & Go-Live",
    items: [
      {
        name: "Test scenarios",
        startWeek: 4, endWeek: 5,
        detail: "Build comprehensive test suite covering happy paths, edge cases, and adversarial inputs.",
        owner: "boost.ai QA",
        deliverables: ["Test suite", "Scenario library", "Expected outcomes"],
      },
      {
        name: "Jailbreak testing",
        startWeek: 5, endWeek: 7,
        detail: "Adversarial testing to ensure guardrails hold — prompt injection, topic deviation, data extraction attempts.",
        owner: "boost.ai Security",
        deliverables: ["Security report", "Guardrail adjustments", "Risk assessment"],
      },
      {
        name: "Pilot (10-20%)",
        startWeek: 6, endWeek: 7,
        detail: "Controlled launch to subset of real traffic. Daily monitoring of resolution rate, CSAT, and escalation rate.",
        owner: "boost.ai + Customer ops",
        deliverables: ["Pilot metrics", "Daily standup notes", "Tuning log"],
      },
      {
        name: "Full rollout",
        startWeek: 8, endWeek: 9,
        detail: "Ramp to 100% traffic across all configured channels. Monitoring dashboards go live.",
        owner: "boost.ai Delivery",
        deliverables: ["Production deployment", "Monitoring alerts", "Stakeholder report"],
      },
      {
        name: "Performance tuning",
        startWeek: 9, endWeek: 12,
        detail: "Continuous optimization — analyze conversations, refine intents, improve resolution quality, expand coverage.",
        owner: "AI Trainers + boost.ai CSM",
        deliverables: ["Monthly performance review", "Optimization backlog", "Expansion plan"],
      },
    ],
  },
];

export const TOTAL_WEEKS = 12;

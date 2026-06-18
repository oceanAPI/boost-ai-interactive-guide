/** Shared section registry for the presentation/slideshow mode */
export type SectionGroup =
  | "intro"
  | "topics"
  | "platform"
  | "proof"
  | "community"
  | "commercial"
  | "scoping"
  | "close";

export interface SlideSection {
  id: string;
  label: string;
  /** When false, section is off by default even for "Full" preset */
  defaultEnabled?: boolean;
  /** Story-phase grouping — drives the visual grouping + bulk actions in admin */
  group?: SectionGroup;
  /** Rough read/scan time in minutes — sums to an "estimated length" for the AE */
  minutes?: number;
  /** One-line what-it-is, shown on hover in admin */
  hint?: string;
}

export const SECTION_GROUPS: { key: SectionGroup; label: string }[] = [
  { key: "intro", label: "Intro" },
  { key: "topics", label: "Deep-dive topics" },
  { key: "platform", label: "Platform" },
  { key: "proof", label: "Proof" },
  { key: "community", label: "Community" },
  { key: "commercial", label: "Commercial" },
  { key: "scoping", label: "Scoping & delivery" },
  { key: "close", label: "Close" },
];

export const SLIDE_SECTIONS: SlideSection[] = [
  { id: "hero",                     label: "Overview",                  group: "intro",      minutes: 1,  hint: "Cover slide with the customer name + brand" },
  { id: "agenda",                   label: "Agenda",                    group: "intro",      minutes: 1,  hint: "Timed or numbered agenda — BR opener / demo-meeting starter", defaultEnabled: false },
  { id: "orchestrator",             label: "Agent Orchestrator",        group: "intro",      minutes: 3,  hint: "Visual map of the orchestrator + specialist agents" },
  { id: "thought-leadership",       label: "State of Conversational AI", group: "intro",     minutes: 2,  hint: "Big-number thought-leadership story stats — Agentic / Orchestration / Personalised / Revenue / Channels", defaultEnabled: false },
  { id: "topics",                   label: "Deep Dive",                 group: "topics",     minutes: 1,  hint: "Hub page linking to the 4 deep-dive topics" },
  { id: "topic-implementation",     label: "Implementation & Roadmap",  group: "topics",     minutes: 3,  hint: "12-week delivery plan with milestones" },
  { id: "topic-integrations",       label: "Integrations & Architecture", group: "topics",   minutes: 3,  hint: "Integration architecture diagram + catalogue" },
  { id: "topic-security",           label: "Security & Compliance",     group: "topics",     minutes: 3,  hint: "Certifications, guardrails, data handling" },
  { id: "topic-ways-of-working",    label: "Ways of Working",           group: "topics",     minutes: 3,  hint: "Implementation plan + team + hypercare + lifecycle" },
  { id: "platform-vision",          label: "Platform & Vision",         group: "platform",   minutes: 4,  hint: "Today · 2026 Roadmap · Vision (3 tabs)" },
  { id: "voice",                    label: "Voice Preview",             group: "platform",   minutes: 2,  hint: "Voice channel scaffolding + demo placeholder" },
  { id: "demo",                     label: "Chat Preview",              group: "platform",   minutes: 3,  hint: "Chat demo with the AI analyzer panel" },
  { id: "performance",              label: "Performance Snapshot",      group: "proof",      minutes: 2,  hint: "Live KPI tiles with trend arrows — CE operational telemetry", defaultEnabled: false },
  { id: "benchmarking",             label: "Benchmarking",              group: "proof",      minutes: 2,  hint: "Customer vs peer cohort vs industry averages — per metric bar chart", defaultEnabled: false },
  { id: "agentic-before-after",     label: "Agentic Transformation",    group: "proof",      minutes: 2,  hint: "Pre-boost vs post-boost outcomes per topic — the agentic story", defaultEnabled: false },
  { id: "personalisation",          label: "Personalised CX",           group: "proof",      minutes: 3,  hint: "Top intents → CRM/API integrations → 180-day impact + user-journey flows", defaultEnabled: false },
  { id: "revenue",                  label: "Sales & Revenue",           group: "proof",      minutes: 2,  hint: "Lead-gen metrics + sell-via-agent journeys — the revenue story", defaultEnabled: false },
  { id: "agent-swot",               label: "Agent SWOT",                group: "proof",      minutes: 3,  hint: "Per-agent strengths / weaknesses / opportunities / threats", defaultEnabled: false },
  { id: "uat-status",               label: "Rollout Status",            group: "proof",      minutes: 2,  hint: "Traffic-light rollout / UAT health per agent + market", defaultEnabled: false },
  { id: "impact",                   label: "Business Impact",           group: "proof",      minutes: 2,  hint: "CSAT · Automation · Data · Commercial (4 tabs)" },
  { id: "trust-validation",         label: "Platform Credibility",      group: "proof",      minutes: 2,  hint: "9-year track record + analyst recognition" },
  { id: "case-studies",             label: "Case Studies",              group: "proof",      minutes: 3,  hint: "Customer stories — AE-picks or auto-sorted" },
  { id: "community",                label: "Boost.ai Community",        group: "community",  minutes: 1,  hint: "Training + platform walkthrough video library" },
  { id: "boost-camp",               label: "Boost Camp",                group: "community",  minutes: 2,  hint: "Annual event with clickable map of past + upcoming" },
  { id: "resources",                label: "Resources & Trust",         group: "community",  minutes: 2,  hint: "Academy · Help Center · Trust Center · Community — four external surfaces", defaultEnabled: false },
  { id: "commercial-offer",         label: "Commercial Offer",          group: "commercial", minutes: 2,  hint: "Pricing framing + proposal terms" },
  { id: "roi",                      label: "ROI Calculator",            group: "commercial", minutes: 2,  hint: "Interactive savings + break-even modelling" },
  { id: "scope-of-work",            label: "Scope of Work",             group: "commercial", minutes: 3,  hint: "Visual SOW — scope, team, timeline, integrations/ROI" },
  { id: "project-framing",           label: "Project Framing",           group: "scoping",    minutes: 4,  hint: "4-tab SoW opener — brief + success criteria + use-case journey + traffic/volume load", defaultEnabled: false },
  { id: "build-scope",               label: "Build Scope",               group: "scoping",    minutes: 5,  hint: "Tabbed deliverables — overview / channels / intelligence / integrations", defaultEnabled: false },
  { id: "roles-and-responsibilities", label: "Roles & Responsibilities", group: "scoping",    minutes: 3,  hint: "RACI matrix with FTE allocations — Customer / boost.ai / 3rd Party", defaultEnabled: false },
  { id: "solution-architecture",     label: "Solution Architecture",     group: "scoping",    minutes: 3,  hint: "Interactive architecture diagram of channels, boost core, and integrations", defaultEnabled: false },
  { id: "out-of-scope",              label: "Out of Scope",              group: "scoping",    minutes: 1,  hint: "Explicit exclusions — what this SoW does NOT cover", defaultEnabled: false },
  { id: "success-plan",             label: "Success Plan",              group: "close",      minutes: 3,  hint: "Gantt timeline of committed initiatives — CE strategic plan", defaultEnabled: false },
  { id: "top-recommendations",      label: "Top Recommendations",       group: "close",      minutes: 2,  hint: "Ranked initiatives with weight + confidence + urgency — CE strategic recs", defaultEnabled: false },
  { id: "governance",               label: "Governance & Cadence",      group: "close",      minutes: 2,  hint: "Review cadence + sponsor + next BR date — CE governance", defaultEnabled: false },
  { id: "next-steps",               label: "Next Steps",                group: "close",      minutes: 1,  hint: "What happens after this guide" },
  { id: "custom",                   label: "Other",                     group: "close",      minutes: 1,  hint: "Optional — freeform title, body, image/video", defaultEnabled: false },
];

/* ─── Presets ─── */
/** Named starting points that set `enabled` flags for a given sales context. */
export interface SectionPreset {
  key: string;
  label: string;
  description: string;
  /** Section IDs that should be enabled. Everything else is disabled. */
  enable: string[];
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    key: "full",
    label: "Full guide",
    description: "Everything on (default)",
    enable: SLIDE_SECTIONS.filter((s) => s.defaultEnabled !== false).map((s) => s.id),
  },
  {
    key: "executive",
    label: "Executive",
    description: "Short, strategic — ~10 min scan",
    enable: ["hero", "orchestrator", "platform-vision", "trust-validation", "impact", "commercial-offer", "next-steps"],
  },
  {
    key: "technical",
    label: "Technical deep-dive",
    description: "Architecture + implementation detail",
    enable: ["hero", "orchestrator", "topics", "topic-implementation", "topic-integrations", "topic-security", "topic-ways-of-working", "platform-vision", "demo", "next-steps"],
  },
  {
    key: "commercial",
    label: "Commercial focus",
    description: "ROI-led, for CFO/finance conversations",
    enable: ["hero", "impact", "roi", "scope-of-work", "commercial-offer", "case-studies", "next-steps"],
  },
  {
    key: "demo",
    label: "Demo-led",
    description: "Voice + chat preview + case studies",
    enable: ["hero", "orchestrator", "voice", "demo", "case-studies", "next-steps"],
  },
];

/** Total scan time of a given enabled-section id list */
export function estimateMinutes(enabledIds: string[]): number {
  const enabled = new Set(enabledIds);
  return SLIDE_SECTIONS.filter((s) => enabled.has(s.id)).reduce(
    (sum, s) => sum + (s.minutes ?? 2),
    0,
  );
}

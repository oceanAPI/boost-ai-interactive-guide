/**
 * Section Reference Library
 *
 * Maps each section's unique ID to its metadata for tracking,
 * content management, and cross-referencing.
 *
 * When content is added or modified, update the relevant entry here.
 * The git hook (hooks/post-push-section-tracker) reads this file
 * to report which sections were affected by a push.
 */

export interface SectionReference {
  /** Unique section ID (matches the DOM id and nav id) */
  sectionId: string;
  /** Display name */
  name: string;
  /** Data file path (relative to src/) */
  dataFile: string;
  /** Component file path (relative to src/) */
  componentFile: string;
  /** Content sources — URLs, documents, articles used to build this section */
  sources: { label: string; url?: string; note?: string }[];
  /** Section number in the guide (e.g. "04") */
  sectionNumber: string;
  /** Content status */
  status: "draft" | "review" | "complete";
}

export const SECTION_REGISTRY: SectionReference[] = [
  {
    sectionId: "hero",
    name: "Overview",
    dataFile: "lib/types.ts",
    componentFile: "components/sections/HeroSection.tsx",
    sources: [],
    sectionNumber: "01",
    status: "complete",
  },
  {
    sectionId: "orchestrator",
    name: "Agent Orchestrator",
    dataFile: "data/agents/",
    componentFile: "components/sections/OrchestratorSection.tsx",
    sources: [
      { label: "elev.io Article #935", url: "https://boost.elevio.help/en/articles/935", note: "How the orchestrator works" },
    ],
    sectionNumber: "02",
    status: "complete",
  },
  {
    sectionId: "topics",
    name: "Deep Dive Hub",
    dataFile: "data/topics/index.ts",
    componentFile: "components/sections/TopicHubSection.tsx",
    sources: [],
    sectionNumber: "03",
    status: "complete",
  },
  {
    sectionId: "topic-implementation",
    name: "Implementation & Rollout",
    dataFile: "data/topics/implementation.ts",
    componentFile: "components/sections/topics/TopicSection.tsx",
    sources: [
      { label: "BEC Sales Deck", note: "Slide 19 — 3-part capability breakdown" },
    ],
    sectionNumber: "04",
    status: "draft",
  },
  {
    sectionId: "topic-integrations",
    name: "Integrations & Architecture",
    dataFile: "data/topics/integrations.ts",
    componentFile: "components/sections/topics/TopicSection.tsx",
    sources: [
      { label: "BEC Sales Deck", note: "Slide 13 — Orchestrator + connected agents" },
    ],
    sectionNumber: "05",
    status: "draft",
  },
  {
    sectionId: "topic-security",
    name: "Security & Compliance",
    dataFile: "data/topics/security-compliance.ts",
    componentFile: "components/sections/topics/TopicSection.tsx",
    sources: [
      { label: "BEC Sales Deck", note: "Slide 13 — Banking-tailored guardrails" },
    ],
    sectionNumber: "06",
    status: "draft",
  },
  {
    sectionId: "topic-ways-of-working",
    name: "Ways of Working",
    dataFile: "data/topics/ways-of-working.ts",
    componentFile: "components/sections/topics/TopicSection.tsx",
    sources: [
      { label: "BEC Sales Deck", note: "Slide 5 — Agenda: governance & customer success" },
    ],
    sectionNumber: "07",
    status: "draft",
  },
  {
    sectionId: "roi",
    name: "ROI Calculator",
    dataFile: "components/sections/ROISection.tsx",
    componentFile: "components/sections/ROISection.tsx",
    sources: [],
    sectionNumber: "08",
    status: "complete",
  },
  {
    sectionId: "demo",
    name: "Live Demo Preview",
    dataFile: "data/demo-scripts.ts",
    componentFile: "components/sections/DemoPreviewSection.tsx",
    sources: [],
    sectionNumber: "10",
    status: "complete",
  },
  {
    sectionId: "next-steps",
    name: "Next Steps",
    dataFile: "components/sections/NextStepsSection.tsx",
    componentFile: "components/sections/NextStepsSection.tsx",
    sources: [],
    sectionNumber: "",
    status: "complete",
  },
];

/** Look up a section by its unique ID */
export function getSectionRef(sectionId: string): SectionReference | undefined {
  return SECTION_REGISTRY.find((s) => s.sectionId === sectionId);
}

/** Get all sections with a given status */
export function getSectionsByStatus(status: SectionReference["status"]): SectionReference[] {
  return SECTION_REGISTRY.filter((s) => s.status === status);
}

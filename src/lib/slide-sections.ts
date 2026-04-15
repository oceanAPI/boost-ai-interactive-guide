/** Shared section registry for the presentation/slideshow mode */
export interface SlideSection {
  id: string;
  label: string;
}

export const SLIDE_SECTIONS: SlideSection[] = [
  { id: "hero", label: "Overview" },
  { id: "orchestrator", label: "Agent Orchestrator" },
  { id: "topics", label: "Deep Dive" },
  { id: "topic-implementation", label: "Implementation & Roadmap" },
  { id: "topic-integrations", label: "Integrations & Architecture" },
  { id: "topic-security-compliance", label: "Security & Compliance" },
  { id: "topic-ways-of-working", label: "Ways of Working" },
  { id: "core-components", label: "Platform Components" },
  { id: "demo", label: "Live Demo" },
  { id: "case-studies", label: "Case Studies" },
  { id: "roi", label: "ROI Calculator" },
  { id: "next-steps", label: "Next Steps" },
];

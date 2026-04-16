/** Shared section registry for the presentation/slideshow mode */
export interface SlideSection {
  id: string;
  label: string;
  defaultEnabled?: boolean;
}

export const SLIDE_SECTIONS: SlideSection[] = [
  { id: "hero", label: "Overview" },
  { id: "orchestrator", label: "Agent Orchestrator" },
  { id: "topics", label: "Deep Dive" },
  { id: "topic-implementation", label: "Implementation & Roadmap" },
  { id: "topic-integrations", label: "Integrations & Architecture" },
  { id: "topic-security", label: "Security & Compliance" },
  { id: "topic-ways-of-working", label: "Ways of Working" },
  { id: "platform-vision", label: "Platform & Vision" },
  { id: "voice", label: "Voice Preview" },
  { id: "demo", label: "Chat Preview" },
  { id: "impact", label: "Business Impact" },
  { id: "trust-validation", label: "Platform Credibility" },
  { id: "case-studies", label: "Case Studies" },
  { id: "community", label: "Boost.ai Community" },
  { id: "boost-camp", label: "Boost Camp" },
  { id: "commercial-offer", label: "Commercial Offer" },
  { id: "roi", label: "ROI Calculator" },
  { id: "scope-of-work", label: "Scope of Work" },
  { id: "next-steps", label: "Next Steps" },
  { id: "custom", label: "Other", defaultEnabled: false },
];

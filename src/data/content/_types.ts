/* ─────────────────────────────────────────────
 *  Content registry types
 *
 *  Each section defines its own content shape.
 *  Industry overrides replace fields selectively —
 *  anything not overridden falls back to defaults.
 *
 *  FUTURE: When auth is added, the resolver in
 *  index.ts will fetch from an API instead of
 *  static imports. Components stay unchanged.
 * ───────────────────────────────────────────── */

// ─── Hero Section ───
export interface HeroContent {
  tagline: string;             // e.g. "Your AI-Powered Customer Experience"
  subtitle: string;            // e.g. "Built specifically for {{company_name}}"
  highlights: string[];        // 3-4 bullet points shown under subtitle
}

// ─── Case Studies Section ───
export interface CaseStudyContent {
  sectionTitle: string;
  sectionSubtitle: string;
  /** Which case study IDs to show (from case-studies.ts). Empty = show all. */
  featuredIds: string[];
}

// ─── Trust & Validation Section ───
export interface TrustValidationContent {
  sectionTitle: string;
  sectionSubtitle: string;
  platformStats: { label: string; value: string; detail?: string }[];
  journeySteps: {
    title: string;
    description: string;
    duration: string;
    milestone?: string;
  }[];
  industryProof: {
    title: string;
    description: string;
    stat?: string;
  }[];
  analystQuotes: {
    source: string;
    quote: string;
    year?: string;
  }[];
}

// ─── Voice Section ───
export interface VoiceContent {
  sectionTitle: string;
  sectionSubtitle: string;
  capabilities: {
    title: string;
    description: string;
    icon: string;
  }[];
  useCases: {
    title: string;
    scenario: string;
    outcome: string;
  }[];
  stats: { label: string; value: string }[];
}

// ─── Core Components Section ───
export interface CoreComponentsContent {
  sectionTitle: string;
  sectionSubtitle: string;
  components: {
    id: string;
    name: string;
    tagline: string;
    description: string;
    features: string[];
    icon: string;
  }[];
}

// ─── Impact Section (generic — used for CSAT, automation, data, commercial) ───
export interface ImpactContent {
  sectionTitle: string;
  sectionSubtitle: string;
  metrics: {
    label: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  narrative: string;             // paragraph explaining the impact story
  calloutStat?: { value: string; label: string };
}

// ─── Scope of Work Section ───
export interface ScopeOfWorkContent {
  sectionTitle: string;
  sectionSubtitle: string;
  phases: {
    name: string;
    weeks: string;
    deliverables: string[];
    color: string;
  }[];
  includedItems: string[];
  excludedItems: string[];
}

// ─── Authentication Impacts Section ───
export interface AuthImpactsContent {
  sectionTitle: string;
  sectionSubtitle: string;
  preAuth: {
    title: string;
    capabilities: string[];
    automationRate: string;
  };
  postAuth: {
    title: string;
    capabilities: string[];
    automationRate: string;
  };
  methods: {
    name: string;
    description: string;
    securityLevel: "basic" | "standard" | "high";
  }[];
}

// ─── Boost Camp Videos Section ───
export interface BoostCampContent {
  sectionTitle: string;
  sectionSubtitle: string;
  videos: {
    id: string;
    title: string;
    description: string;
    duration: string;
    thumbnailUrl?: string;
    videoUrl: string;
    category: string;
  }[];
}

// ─── Commercial Offer Section ───
export interface CommercialOfferContent {
  sectionTitle: string;
  sectionSubtitle: string;
  tiers: {
    name: string;
    description: string;
    price?: string;
    features: string[];
    recommended?: boolean;
  }[];
  addOns: {
    name: string;
    description: string;
    price?: string;
  }[];
  disclaimers: string[];
}

// ─── Custom "Other" Section ───
export interface CustomSectionContent {
  sectionTitle: string;
  sectionSubtitle: string;
  blocks: {
    type: "heading" | "text" | "image" | "video";
    content: string;          // text content, image URL, or video URL
    caption?: string;
  }[];
}

// ─── ROI Section (admin-filled values have defaults here) ───
export interface ROIContent {
  sectionTitle: string;
  sectionSubtitle: string;
  highlights: {
    title: string;
    description: string;
    color: string;
  }[];
}

// ─── Next Steps Section ───
export interface NextStepsContent {
  sectionTitle: string;
  sectionSubtitle: string;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
  ctaText: string;
}

// ─── Master content map ───
// Maps section ID → content type. Used by the resolver.
export interface SectionContentMap {
  hero: HeroContent;
  "case-studies": CaseStudyContent;
  "trust-validation": TrustValidationContent;
  voice: VoiceContent;
  "core-components": CoreComponentsContent;
  "impact-csat": ImpactContent;
  "impact-automation": ImpactContent;
  "impact-data": ImpactContent;
  "impact-commercial": ImpactContent;
  "scope-of-work": ScopeOfWorkContent;
  "auth-impacts": AuthImpactsContent;
  "boost-camp": BoostCampContent;
  "commercial-offer": CommercialOfferContent;
  "custom-other": CustomSectionContent;
  roi: ROIContent;
  "next-steps": NextStepsContent;
}

export type SectionId = keyof SectionContentMap;

// ─── Industry content override ───
// Partial — only override fields you need, rest falls from defaults
export type IndustryContentOverrides = {
  [K in SectionId]?: Partial<SectionContentMap[K]>;
};

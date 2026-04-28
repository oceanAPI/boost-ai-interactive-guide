/**
 * boost.ai Product Vision
 * The strategic narrative behind the 2026 roadmap.
 *
 * Sourced from the canonical "Product Roadmap 2026" deck (slides 1-39):
 * - Tagline + opening (slides 1-2)
 * - Three Product Strategy pillars (slide 3)
 * - Four focus areas + regulated-enterprises question (slide 4)
 * - Per-focus-area Product Vision paragraphs (slides 7+, already wired)
 * - Test Studio determinism spotlight + A2A heritage + Knowledge
 *   Transformation + credibility stats (boost narrative additions).
 */

import type { FocusArea } from "./product-roadmap-2026";

/* ─── Company tagline — appears at the foot of every Product Roadmap 2026 deck slide ─── */
export const COMPANY_TAGLINE = "Trust every conversation";

/* ─── Vision opening — slide 2 of the Product Roadmap 2026 deck ─── */
export interface VisionOpening {
  paragraphs: string[];
  /** The italicised closing line — rendered with emphasis. */
  emphasis: string;
}

export const VISION_OPENING: VisionOpening = {
  paragraphs: [
    "There will be a complete shift in how people interact with technology at every level — and that will be through conversations. It will influence everything we do from shopping, to entertainment, to music, to travel, to education — and will impact how every Enterprise business is built and run.",
    "It will shift how whole societies communicate, and the relationship and interface that everyone has with technology — across every channel we use today, and those just around the corner.",
  ],
  emphasis:
    "The future isn't about automation — it's about conversations, and creating and guiding the operating layer of a more intuitive, human-centered digital world.",
};

/* ─── Three Product Strategy pillars — slide 3 of the Product Roadmap 2026 deck ─── *
 * "Our future is built on meaningful outcomes — The boost.ai Product
 * Strategy." These pillars sit BEFORE the four focus areas: they're
 * the why; the focus areas are the where; the per-focus-area phases
 * are the how. */
export interface StrategyPillar {
  id: "simplifying" | "control" | "security";
  title: string;
  /** Two-tone title — the second word renders in italic accent style. */
  emphasis: string;
  body: string;
}

export const STRATEGY_PILLARS: StrategyPillar[] = [
  {
    id: "simplifying",
    title: "Simplifying",
    emphasis: "complexity",
    body: "As the technical capabilities grow more complex, our focus must stay on simplicity — in ideas, user experience, delivery and deployment — to ensure success can truly scale.",
  },
  {
    id: "control",
    title: "Right level",
    emphasis: "of Control",
    body: "Control is the foundation to all future success in CAI AI — especially for Enterprises in regulated industries. As Generative AI evolves daily, we remain relentless in pushing boundaries of what trusted, controllable AI can do.",
  },
  {
    id: "security",
    title: "Security &",
    emphasis: "Safety first",
    body: "Every idea we bring to life starts with a simple, non-negotiable commitment: security and safety first. This is not just a technical requirement — it's the foundation of every product & every relationship we build.",
  },
];

/* ─── Focus-areas closing line — slide 4 of the Product Roadmap 2026 deck ─── *
 * The four focus areas (voice / agentic / adoption / scalability) sit
 * inside this framing question. */
export const FOCUS_AREAS_OUTRO =
  "And how do we do all this while still providing the confidence that regulated enterprises expect?";

export interface VisionPillar {
  id: FocusArea;
  title: string;
  question: string;
  productVision: string;
  colour: "purple" | "green-light" | "gold" | "green";
}

export const VISION_PILLARS: VisionPillar[] = [
  {
    id: "voice",
    title: "Voice & Multimodality",
    question: "How do we deliver excellent voice and multi-modal experiences?",
    productVision:
      "Deliver best-in-class voice experiences and customer-facing tools for designing, deploying, optimising, and analysing voice agents. This includes hybrid architecture for enterprise-level control, seamless transitions between chat and voice, and multi-modal support that ranges from telephony to app-based interfaces such as avatars.",
    colour: "purple",
  },
  {
    id: "agentic",
    title: "Agentic Capabilities & Control",
    question: "How do we enable more free-flowing agentic conversations with less setup?",
    productVision:
      "Build an agentic orchestration layer that replaces intent-based NLU by intelligently routing conversations to the right internal and external agents. The platform evolves from controlled internal routing with foundational analytics to automated intent-to-agent transformations, A2A support, and a high-agency control room that governs and improves agent behaviour. Over time, it becomes self-improving by adapting to both internal performance signals and external business changes.",
    colour: "green-light",
  },
  {
    id: "adoption",
    title: "Platform Adoption & Connectivity",
    question: "How do we streamline customer adoption and management of an AI agent?",
    productVision:
      "Transform the platform into a conversationally driven, self-service environment where both technical and non-technical users can build, analyse, and extend automation through natural language. By embedding AI Companions across settings, flows, connectors, and analytics, we reduce friction and accelerate adoption. An integration service for custom channels and human handovers further unlocks accessibility and flexibility for enterprises.",
    colour: "gold",
  },
  {
    id: "scalability",
    title: "Enterprise Scaling",
    question: "How do we make the platform scalable for large, complex enterprises?",
    productVision:
      "Enable enterprises to confidently scale conversational AI across multiple teams, business units, and geographies by providing advanced configuration tools and centralised administration and analytics. Empower customers and partners to spin up, configure, and manage multiple instances programmatically.",
    colour: "green",
  },
];

/* ─── The Test Studio flagship narrative — boost's real moat ─── */
export interface VisionSpotlight {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  credibilityLine: string;
  /** Short rule-based test set examples shown as chips */
  testSetExamples: string[];
}

export const TEST_STUDIO_SPOTLIGHT: VisionSpotlight = {
  eyebrow: "Why we can credibly say self-improving",
  heading: "AI you can prove. Not just promise.",
  paragraphs: [
    "Most platforms claim self-improvement. We built the architecture that actually earns it. Every conversation component in boost — every agent, guardrail, hook, every routing decision — carries a unique identifier. That means behaviour isn't a black box: it's a sequence of testable, trackable events with right answers.",
    "Test Studio turns that into leverage. Define the outcome a regulated industry demands — this conversation should trigger the compliance guardrail, that one should swap to the claims agent, the other should never call the payment hook. Run thousands of these expectations in parallel against any model, any prompt change, any new agent, before a single customer sees the difference. Drift in LLM thinking gets caught at the test tier, not in production.",
    "And because the system knows what a passing test looks like, it can suggest new ones. Review and approve the first few. As trust accrues, approval rates climb, and the test-suite expands itself — always inside the regulated-industry boundaries your legal team signed off on.",
  ],
  credibilityLine:
    "Self-improving isn't a marketing claim. It's what happens when you spend nine years building a determinism-first architecture and your customers — banks, insurers, pension funds — won't let you ship anything less.",
  testSetExamples: [
    "should trigger guardrail",
    "should NOT trigger guardrail",
    "should swap to different agent",
    "should remain within agent",
    "should trigger Hook X",
    "should NOT trigger Hook X",
  ],
};

/* ─── A2A Heritage ─── */
export interface Callout {
  eyebrow: string;
  heading: string;
  body: string[];
}

export const A2A_HERITAGE: Callout = {
  eyebrow: "A2A since 2017",
  heading: "We didn't pivot to agent-to-agent. We pioneered it.",
  body: [
    "boost built Virtual Agent Network (VAN) back in 2017 — cited in EU documents discussing the future of AI Agents and conversational AI. Because of our hybrid architecture, a boost agent can hold a conversation with another agent without exposing an attack surface.",
    "The obvious use case is coming home: log into an OpenAI or Anthropic client with your boost-powered bank agent, and your assistant can safely transact with the bank on your behalf. You see the whole transcript. If the external agent misbehaves, that's on them — not on the user, and not on the bank.",
  ],
};

/* ─── Knowledge Transformation ─── */
export const KNOWLEDGE_TRANSFORMATION: Callout = {
  eyebrow: "Respect the investment",
  heading: "Knowledge Transformation isn't magic — it's migration.",
  body: [
    "We don't ask you to throw away the nine years of carefully-tuned flows, intents, and knowledge you've built. Knowledge Transformation takes your existing content and turns it into structured RAG that agentic actions can consume directly.",
    "No rip-and-replace. No forklift migration. No retraining an army of AI trainers. The content you already paid for becomes the foundation of what comes next.",
  ],
};

/* ─── Credibility stats — repeat at top of TODAY + end of VISION ─── */
export interface CredibilityStat {
  value: string;
  label: string;
}

export const CREDIBILITY_STATS: CredibilityStat[] = [
  { value: "9 years", label: "in production at enterprise scale" },
  { value: "120%", label: "ARR growth since 2016" },
  { value: "Regulated", label: "financial services focus" },
  { value: "Model-agnostic", label: "for voice and LLM providers" },
];

/**
 * boost.ai Product Vision
 * The strategic narrative behind the 2026 roadmap.
 *
 * Four pillars + the Test Studio determinism spotlight + A2A heritage + Knowledge Transformation clarity + credibility stats.
 */

import type { FocusArea } from "./product-roadmap-2026";

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
  heading: "Determinism, earned.",
  paragraphs: [
    "Every component in a boost conversation has a unique identifier. In Test Studio, generated content maps rule-based to what happened and where it went. We build determined-outcome test sets per agent — tests with a right answer, in a regulated industry context where that matters.",
    "Anything that isn't \"should trigger Hook 1 of Agent 1\" becomes a negative test for that outcome — automatically catching false positives across the whole system. Batch-run, fast, low-token. New model? Batch-test it against your reference suite. Changed an agent's instructions? Pattern-detect the drift in LLM thinking before a single customer sees it.",
    "Once reviewed and approved, the suggested-test-data engine continuously improves until it runs on its own — safely, inside the regulated-industry framework our customers actually live in.",
  ],
  credibilityLine:
    "Self-improving isn't a claim. It's a consequence of nine years of unique identifiers, hybrid architecture, and customers who wouldn't let us ship anything less.",
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
    "boost built Virtual Agent Network (VAN) back in 2017 — cited in EU documents discussing the future of chatbots and conversational AI. Because of our hybrid architecture, a boost agent can hold a conversation with another agent without exposing an attack surface.",
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

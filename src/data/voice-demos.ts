/**
 * voice-demos — six showcase demos for the Voice Preview section.
 *
 * Each entry corresponds to a `demoN` intent + matching specialist
 * agent configured on the boost.ai tenant (financewizard.boost.ai
 * today; whichever tenant.demo_tenant routes to in custom_live mode).
 *
 * The primer field is what we POST to /chat/v2 as the user's first
 * text turn — the tenant's NLU/intent system matches it 1:1 and
 * routes to the dedicated agent. The primer bubble is suppressed in
 * the transcript display (replaced with a header strip) so the
 * conversation reads as if the agent opened it itself.
 *
 * Adding a 7th+ demo is pure data: append a record here, configure
 * `demo7` + its agent on the tenant. Zero code changes our side.
 */

import type { FocusArea } from "./product-roadmap-2026";

/** Glyph SVG path. Centred in a 24×24 viewBox, single colour
 *  inherits currentColor. Drawn inline rather than imported so
 *  this data file has no runtime React dependency. */
export interface DemoGlyph {
  /** SVG path d-attribute(s). Each entry renders as one <path> with
   *  the same stroke/fill rules. */
  paths: string[];
  /** If true, paths render as fill="currentColor" instead of stroke. */
  filled?: boolean;
}

export interface VoiceDemo {
  /** Stable identifier — matches the tenant intent name 1:1. Sent
   *  as the literal primer text on session start. */
  id: "demo1" | "demo2" | "demo3" | "demo4" | "demo5" | "demo6";
  /** Card label shown in the gallery. */
  label: string;
  /** One-line teaser under the label. Sales-readable. */
  tagline: string;
  /** Why this demo matters — the value-prop messaging shown in
   *  the pre-flight panel before the user clicks Start. */
  valueProp: string;
  /** What's actually happening under the hood — the technical
   *  story behind the moment. Shown below the value prop. */
  techExplanation: string;
  /** What the user should expect to hear/experience. Shown as a
   *  small "What to listen for" hint just above the Start button. */
  expectedBehavior: string;
  /** Roadmap pillar this demo ties back to. Drives the accent
   *  colour on the card so the visual taxonomy is consistent
   *  with the Platform & Vision section. */
  pillar: FocusArea;
  /** SVG glyph rendered in the faded-purple circle on each card. */
  glyph: DemoGlyph;
}

export const VOICE_DEMOS: VoiceDemo[] = [
  {
    id: "demo1",
    label: "Specialist routing",
    tagline: "Watch the orchestrator hand off mid-call",
    valueProp:
      "One AI Agent, many specialists. The Agent Orchestrator listens to context, not keywords, and routes you to the right specialist — card agent, loan agent, fraud agent — without you ever picking a menu option.",
    techExplanation:
      "On primer match, the demo1 intent invokes the orchestrator's routing logic. You'll hear the agent introduce itself, then explicitly switch specialist agents when the conversation shifts topics. The transition is voiced, not silent — the agent narrates the handoff so end users feel the system thinking.",
    expectedBehavior:
      "Ask one question, then change topics. The voice agent will switch specialists between turns and tell you it did.",
    pillar: "agentic",
    glyph: {
      paths: [
        "M12 4l8 4-8 4-8-4 8-4z",
        "M4 12l8 4 8-4",
        "M4 16l8 4 8-4",
      ],
    },
  },
  {
    id: "demo2",
    label: "Barge-in interrupt",
    tagline: "Talk over the agent — it stops mid-sentence",
    valueProp:
      "Real-time conversation control, not turn-taking. Customers don't have to wait for the prompt to finish before speaking. The agent yields the floor the moment it hears voice activity — the way humans actually talk.",
    techExplanation:
      "When voice activity is detected during agent playback, the response's barge_in flag tells the client to cancel the in-flight TTS immediately. The agent picks back up at the next conversational beat with full context — no repeat, no reset.",
    expectedBehavior:
      "Start talking while the agent is mid-response. The audio stops cleanly and the agent responds to what you just said.",
    pillar: "voice",
    glyph: {
      paths: [
        "M3 12h4",
        "M9 8v8",
        "M13 4v16",
        "M17 6v12",
        "M21 12h-1",
      ],
    },
  },
  {
    id: "demo3",
    label: "Guardrails",
    tagline: "Try to push the agent off-policy",
    valueProp:
      "Regulated industries demand controllable AI. Boost agents refuse off-policy requests with reasoning, not with a generic 'I can't help with that'. The guardrail is part of the brain, not a filter bolted on top.",
    techExplanation:
      "The demo3 agent runs with an explicit policy boundary. Off-policy prompts are detected by the orchestrator's guardrail layer before any specialist agent sees them, and the response is composed to acknowledge the request, decline with reasoning, and offer the in-policy alternative.",
    expectedBehavior:
      "Ask the agent to do something outside its scope — give you investment advice, share another customer's data, ignore instructions. It will decline and tell you why.",
    pillar: "agentic",
    glyph: {
      paths: [
        "M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z",
        "M9 12l2 2 4-4",
      ],
    },
  },
  {
    id: "demo4",
    label: "Generative responses",
    tagline: "Ask something unscripted — see the AI think",
    valueProp:
      "Generative AI inside a deterministic frame. The agent answers questions it has never been explicitly trained on by synthesising context, but every response stays inside the determinism boundary your legal team signed off on.",
    techExplanation:
      "When the demo4 intent fires, the agent runs in generative mode — composing fresh responses from the underlying knowledge sources rather than playing back a scripted flow. Every generation passes the output guardrail before reaching the TTS engine.",
    expectedBehavior:
      "Ask an unusual, off-the-rails question. The agent will give a coherent, in-domain answer that wasn't pre-written.",
    pillar: "agentic",
    glyph: {
      paths: [
        "M12 3v3",
        "M12 18v3",
        "M5.6 5.6l2.1 2.1",
        "M16.3 16.3l2.1 2.1",
        "M3 12h3",
        "M18 12h3",
        "M5.6 18.4l2.1-2.1",
        "M16.3 7.7l2.1-2.1",
        "M12 8a4 4 0 100 8 4 4 0 000-8z",
      ],
    },
  },
  {
    id: "demo5",
    label: "Knowledge-grounded",
    tagline: "Ask from the knowledge base — hear it cite the source",
    valueProp:
      "Every generative response is grounded in YOUR content. No hallucinations, no made-up policies, no generic answers. The agent cites the document, the section, the version — the same auditable trail your compliance team already trusts.",
    techExplanation:
      "The demo5 agent is wired to the tenant's knowledge sources via Knowledge Transformation. When the user asks a content question, the agent retrieves the relevant document(s), composes the answer, and surfaces the source reference. The exact citation appears in the transcript bubble.",
    expectedBehavior:
      "Ask about a product feature, policy, or process. The agent will answer accurately and tell you which document the answer came from.",
    pillar: "agentic",
    glyph: {
      paths: [
        "M4 5a2 2 0 012-2h11l3 3v15a2 2 0 01-2 2H6a2 2 0 01-2-2V5z",
        "M7 8h8",
        "M7 12h8",
        "M7 16h5",
      ],
    },
  },
  {
    id: "demo6",
    label: "Adaptive voice",
    tagline: "Hear the agent switch voice profiles mid-call",
    valueProp:
      "Express Voice for speed when the moment is conversational. Enterprise Voice for precision when the moment is regulated. Boost is the only platform that blends both in one call, switching profile based on intent — not pre-configuring per deployment.",
    techExplanation:
      "Adaptive Voice routes turns to either Express (speech-to-speech, sub-second latency) or Enterprise (STT → LLM → TTS pipeline, full transcript auditability) based on the orchestrator's routing decision. The demo6 flow takes you through both within the same conversation so you can hear the difference.",
    expectedBehavior:
      "Notice two distinct voice qualities across the call — one feels conversational and fast, the other crisper and more deliberate.",
    pillar: "voice",
    glyph: {
      paths: [
        "M5 9v6",
        "M9 6v12",
        "M13 4v16",
        "M17 7v10",
        "M21 10v4",
      ],
    },
  },
];

/* ─── Pillar-driven accent colour map ────────────────────────── *
 * Mirrors the colours used in VISION_PILLARS so the demo gallery
 * shares its visual taxonomy with the Platform & Vision section.
 * Single source per pillar; pillars without a demo are still
 * declared for type completeness. */
export const PILLAR_ACCENT_TEXT: Record<FocusArea, string> = {
  voice: "text-boost-purple",
  agentic: "text-boost-green",
  adoption: "text-boost-gold",
  scalability: "text-boost-green-light",
};

export const PILLAR_ACCENT_BG: Record<FocusArea, string> = {
  voice: "bg-boost-purple",
  agentic: "bg-boost-green",
  adoption: "bg-boost-gold",
  scalability: "bg-boost-green-light",
};

export const PILLAR_ACCENT_BG_SOFT: Record<FocusArea, string> = {
  voice: "bg-boost-purple/8",
  agentic: "bg-boost-green/8",
  adoption: "bg-boost-gold/8",
  scalability: "bg-boost-green-light/8",
};

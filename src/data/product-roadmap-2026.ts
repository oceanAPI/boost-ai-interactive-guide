/**
 * boost.ai 2026 Product Roadmap
 * Source: Product Roadmap 2026 internal deck.
 * Structure: NOW / SOON / LATER buckets across four focus areas.
 */

export type RoadmapBucket = "now" | "soon" | "later";
export type FocusArea = "voice" | "agentic" | "adoption" | "scalability";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export interface RoadmapItem {
  id: string;
  title: string;
  bucket: RoadmapBucket;
  quarter: Quarter;
  focus: FocusArea;
  /** One-line copy for the card */
  summary: string;
  /** Full paragraph(s) for the expanded panel. Multiple paragraphs separated by "\n\n". */
  description: string;
  /** "What this unlocks for you" business-value paragraph. Plain language. */
  unlocks: string;
}

/* ─── Focus area meta — labels only. No per-area accent colours (design discipline). ─── */
export interface FocusAreaMeta {
  id: FocusArea;
  label: string;
  shortLabel: string;
  question: string;
}

export const FOCUS_AREAS: Record<FocusArea, FocusAreaMeta> = {
  voice: {
    id: "voice",
    label: "Voice & Multimodality",
    shortLabel: "Voice",
    question: "How do we deliver excellent voice and multi-modal experiences?",
  },
  agentic: {
    id: "agentic",
    label: "Agentic Capabilities",
    shortLabel: "Agentic",
    question: "How do we enable more free-flowing agentic conversations with less setup?",
  },
  adoption: {
    id: "adoption",
    label: "Platform Adoption",
    shortLabel: "Adoption",
    question: "How do we streamline customer adoption and management of an AI agent?",
  },
  scalability: {
    id: "scalability",
    label: "Enterprise Scalability",
    shortLabel: "Scalability",
    question: "How do we make the platform scalable for large, complex enterprises?",
  },
};

/* ─── Bucket meta ─── */
export interface BucketMeta {
  id: RoadmapBucket;
  label: string;
  sublabel: string;
  description: string;
}

export const BUCKETS: Record<RoadmapBucket, BucketMeta> = {
  now: {
    id: "now",
    label: "Now",
    sublabel: "Q1 2026",
    description: "Shipping this quarter. Beta-available or generally available.",
  },
  soon: {
    id: "soon",
    label: "Soon",
    sublabel: "Q2 2026",
    description: "In active development. Targeted for the next quarter.",
  },
  later: {
    id: "later",
    label: "Later",
    sublabel: "Q3 – Q4 2026",
    description: "Committed for the second half of 2026.",
  },
};

/* ─── The roadmap ─── */
export const PRODUCT_ROADMAP_2026: RoadmapItem[] = [
  /* ──────────────── NOW — Q1 ──────────────── */
  {
    id: "agent-orchestration-beta",
    title: "Agent Orchestration (Beta)",
    bucket: "now",
    quarter: "Q1",
    focus: "agentic",
    summary: "The foundation for scalable, agentic customer experiences.",
    description:
      "Agent Orchestration uses generative AI to dynamically route conversations to the right specialist agent based on context — not fixed rules. The Orchestrator also guides conversations between agents with built-in disambiguation and contextual understanding.\n\nThis enables more natural, scalable, and resilient customer experiences across digital channels and voice, even as conversations grow more complex.",
    unlocks:
      "You stop maintaining brittle intent rules. A new product line or customer journey doesn't require re-training the entire NLU — you add a specialist agent and the Orchestrator routes to it. The system gets more capable as you grow, not more fragile.",
  },
  {
    id: "adaptive-voice",
    title: "Adaptive Voice",
    bucket: "now",
    quarter: "Q1",
    focus: "voice",
    summary: "Apply different voice approaches to different parts of the user journey.",
    description:
      "Adaptive Voice lets you dynamically blend speech-to-speech (Express Voice) and STT/TTS-pipeline (Enterprise Voice) capabilities in a single conversation.\n\nIt enables fast, free-flowing interactions for simple use cases, while seamlessly switching to full compliance and control when complexity or regulation requires it.",
    unlocks:
      "You don't have to choose between speed and control. Simple lookups stay conversational and fast. Regulated transactions (payments, changes of address, account takeovers) automatically switch to the compliant pipeline with full logs — all inside one call.",
  },
  {
    id: "custom-sound-effects",
    title: "Custom Sound Effects",
    bucket: "now",
    quarter: "Q1",
    focus: "voice",
    summary: "Keep users engaged with subtle audio cues instead of silence.",
    description:
      "Smart fillers keep voice conversations natural while the AI is thinking. Instead of silence, they use subtle sounds or short cues to signal that the system is active and listening.\n\nSmart fillers are configurable and context-aware, helping reduce drop-offs and making voice interactions feel smooth, responsive, and trustworthy.",
    unlocks:
      "Fewer abandoned calls. Customers don't hang up during long LLM thinking times. The voice agent feels alive and listening instead of frozen — the difference between a demo and a deployment that survives real traffic.",
  },
  {
    id: "webrtc-configuration",
    title: "WebRTC Configuration",
    bucket: "now",
    quarter: "Q1",
    focus: "voice",
    summary: "Embed voice AI directly into apps and websites — no telephony required.",
    description:
      "Enable voice conversations with AI agents directly from web and app experiences using WebRTC.\n\nThis capability lets customers offer instant, in-browser voice access to Boost Voice agents without relying on traditional telephony — expanding automation to new entry points while simplifying setup and delivering a more seamless end-user experience.",
    unlocks:
      "You skip the SIP trunks, carrier contracts, and number provisioning. A customer with your mobile app or web portal can talk to your voice agent with a tap — and the full context (who they are, what they're doing) comes along for the ride.",
  },

  /* ──────────────── SOON — Q2 ──────────────── */
  {
    id: "chat-api-v3",
    title: "Chat API v3",
    bucket: "soon",
    quarter: "Q2",
    focus: "adoption",
    summary: "Next-generation chat integration surface for modern agentic experiences.",
    description:
      "Chat API v3 is the refreshed integration surface designed for generative responses, asynchronous interactions, and richer client-side experiences.\n\nIt supports the new Chat Panel Widget and exposes the full capabilities of Agent Orchestration through a clean, developer-friendly API.",
    unlocks:
      "Your engineering team spends less time plumbing and more time building the UX. Rich content, streaming responses, and agentic tool calls all come through one typed surface — fewer workarounds, smaller client bundles.",
  },
  {
    id: "voice-cloning",
    title: "Voice Cloning",
    bucket: "soon",
    quarter: "Q2",
    focus: "voice",
    summary: "Create your own brand-specific voice for the boost.ai platform.",
    description:
      "Design and use custom, brand-specific voices in ElevenLabs and deploy them to your Admin Panel.\n\nVoice cloning lets teams record, preview, and assign unique voice profiles for AI agents when using ElevenLabs as the TTS provider — making it easy to deliver more natural, consistent, and on-brand voice experiences.",
    unlocks:
      "Your voice AI sounds like your brand, not a generic synthesiser. For regulated markets where a distinctive brand voice matters (private banking, wealth, insurance), you stop compromising between sounding human and sounding like you.",
  },
  {
    id: "agentic-sounds",
    title: "Agentic Sounds",
    bucket: "soon",
    quarter: "Q2",
    focus: "voice",
    summary: "Conversational filler messages that keep voice interactions flowing.",
    description:
      "Agentic sounds are short, context-aware conversational responses the AI uses while thinking or processing — \"one moment\", \"let me check\", subtle affirmations. They go beyond static fillers to produce genuinely conversational pacing.\n\nConfigurable per agent and per use case.",
    unlocks:
      "Your voice agent sounds like a person, not a machine. The awkward silences that make customers ask \"hello? are you there?\" disappear. Handle times go down because customers stay engaged.",
  },
  {
    id: "multimodal-conversations",
    title: "Multimodal Conversations",
    bucket: "soon",
    quarter: "Q2",
    focus: "voice",
    summary: "Move seamlessly between voice and messaging in one conversation.",
    description:
      "Let conversations flow across channels without breaking context. Multi-channel conversations allow users to switch between voice and messaging within the same interaction — for example, starting on a call, collecting structured information via chat, and continuing on voice.\n\nThis enables more natural, efficient conversations and better handling of scenarios where different modalities work best together.",
    unlocks:
      "KYC forms, claim filings, and mortgage applications stop breaking. The caller can read a long list, upload a document, or confirm a small print — mid-call — without losing the agent. Voice handles the emotion, chat handles the detail.",
  },
  {
    id: "conversation-testing-v2",
    title: "Conversation Testing v2",
    bucket: "soon",
    quarter: "Q2",
    focus: "scalability",
    summary: "Continuously optimise knowledge for higher-quality AI Agent responses.",
    description:
      "Test end-to-end conversations — including NLU, few-shot prompts, and Orchestrator routing — at scale and over time.\n\nConversation Testing v2 enables teams to automatically generate, run, and track large volumes of routing and conversation tests from a single, unified Test Studio. This makes it possible to confidently validate agent behaviour before and after changes, and to monitor performance as systems evolve.",
    unlocks:
      "Instead of hand-crafting test cases one at a time, you batch-generate and batch-run thousands. Model upgrades, prompt changes, and new agents all get regression-tested automatically. No more \"it worked in the demo\" surprises in prod.",
  },
  {
    id: "ai-review-continuous-improvement",
    title: "AI Review — Continuous Improvement",
    bucket: "soon",
    quarter: "Q2",
    focus: "scalability",
    summary: "More accurate AI reviews powered by a boost-hosted model.",
    description:
      "Improve the accuracy of AI-powered conversation reviews with a boost-hosted, fine-tuned AI Review model. Teams can manually review AI-reviewed conversations, and track discrepancies between AI and human evaluations.\n\nThis creates a continuous feedback loop that improves review quality over time while giving teams greater visibility and control over AI-generated CX insights.",
    unlocks:
      "Your QA team scales without hiring. Every conversation gets reviewed, not just a 2% sample. Regulatory audits become easier because every handled call has an AI-scored outcome with evidence trail, not just post-hoc spot-checks.",
  },
  {
    id: "improved-topic-analytics",
    title: "Improved Topic Analytics",
    bucket: "soon",
    quarter: "Q2",
    focus: "scalability",
    summary: "Topic-level insights across agentic conversations.",
    description:
      "Gain clear visibility into the topics and questions driving customer conversations, including interactions handled through Agentic Actions. Improved topic analytics shows what end users are actually asking about, giving teams actionable insight to understand demand, identify gaps, and continuously improve customer experiences as they adopt agentic AI.",
    unlocks:
      "You see what customers actually want — not just what you built for. Product teams spot emerging themes weeks earlier. When a new question appears (new regulation, new product), you catch it before it becomes a surge of escalations.",
  },
  {
    id: "granular-user-permissions",
    title: "Granular User Permissions",
    bucket: "soon",
    quarter: "Q2",
    focus: "scalability",
    summary: "Control who can do what — down to the detail.",
    description:
      "Create custom access roles tailored to how your teams actually work. More granular user permissions let you define exactly what each user can see and do across the Boost platform, giving enterprises the flexibility to safely involve more stakeholders without overexposing sensitive capabilities.",
    unlocks:
      "You bring in business analysts, QA, and compliance without giving them production-push rights. Larger teams can work in parallel without stepping on each other. SOX / ISO auditors see the exact permission surface with no hand-waving.",
  },

  /* ──────────────── LATER — Q3/Q4 ──────────────── */
  {
    id: "voice-test-studio",
    title: "Voice Test Studio in Admin Panel",
    bucket: "later",
    quarter: "Q3",
    focus: "voice",
    summary: "Test, validate, and improve voice AI at scale.",
    description:
      "Automate and scale voice call testing directly in the Admin Panel.\n\nVoice Test Studio makes it easy to run large volumes of test calls, uncover technical and conversational issues, and identify improvement opportunities — helping teams launch reliable, high-quality voice experiences that meet customer expectations from day one.",
    unlocks:
      "Voice deployments stop being a scary one-off event. Every change — new agent, new TTS voice, new prompt — gets validated against a reference suite of calls before it reaches a real caller. Launch confidence, not launch hope.",
  },
  {
    id: "new-chat-panel-widget",
    title: "New Chat Panel Widget",
    bucket: "later",
    quarter: "Q3",
    focus: "adoption",
    summary: "Chat experiences designed for agentic AI.",
    description:
      "The next generation of our chat interface is designed for modern AI agents, generative responses, and asynchronous interactions.\n\nIt delivers a refreshed, flexible UI with out-of-the-box full-screen and inline options, smoother handoffs to human agents, and a new Admin Panel configuration experience that lets teams customise multiple chat panel setups without relying on front-end development.",
    unlocks:
      "Your chat surface stops looking like 2018. Rich media, streaming replies, file uploads, and seamless human handover all work out of the box. Marketing and CX teams can configure it without burning frontend sprints.",
  },
  {
    id: "agent-orchestration-a2a",
    title: "Agent Orchestration — External A2A",
    bucket: "later",
    quarter: "Q3",
    focus: "agentic",
    summary: "Orchestrate AI agents across platforms and vendors.",
    description:
      "Connect and coordinate external AI agents via the A2A protocol directly within the Boost platform.\n\nThis enables multi-agent collaboration across instances and vendors, allowing Boost to orchestrate complex conversations as part of a broader AI ecosystem — not just within a single platform. boost pioneered this with Virtual Agent Network in 2017 — now it comes home as an open standard.",
    unlocks:
      "Your customer can bring their own assistant (OpenAI, Google, Anthropic) and have it safely talk to your bank agent on their behalf. You set the rules. They get the convenience. No one rebuilds — the agents speak to each other.",
  },
  {
    id: "knowledge-transformation",
    title: "Knowledge Transformation",
    bucket: "later",
    quarter: "Q3",
    focus: "agentic",
    summary: "Turn existing flows and content into agent-ready knowledge.",
    description:
      "Convert existing flow and intent content directly into structured knowledge for Agentic Action. Knowledge Transformation lets teams reuse what they've already built in the Admin Panel — turning flows, actions, and linked content into usable knowledge without manual rework.\n\nThis makes it faster and more practical for existing customers to adopt Agentic Action at scale. Respect the years of content you've already built — no rip-and-replace.",
    unlocks:
      "You don't throw away nine years of carefully-tuned flows. Your existing content becomes RAG for the agentic layer. Migration from intent-based to agentic is an evolution, not a forklift. Your AI trainers keep their jobs and their expertise.",
  },
  {
    id: "high-agency-control-room",
    title: "High-Agency Control Room",
    bucket: "later",
    quarter: "Q4",
    focus: "agentic",
    summary: "Monitor, control, and correct agent behaviour in real time.",
    description:
      "Gain real-time visibility into agentic behaviour and intervene when it matters.\n\nThe Control Room continuously monitors AI agent actions, flags potentially unwanted behaviour, and recommends immediate adjustments — enabling enterprises to safely deploy agentic AI with confidence through built-in oversight and continuous-improvement mechanisms, always with a human in the loop.",
    unlocks:
      "Compliance officers stop worrying. Every potential drift — an agent talking about competitors, an agent quoting numbers outside policy, an agent missing a required disclaimer — gets flagged and suggests a fix. You approve, or you don't. You keep the reins.",
  },
  {
    id: "multi-instance-management",
    title: "Multi-Instance Management",
    bucket: "later",
    quarter: "Q4",
    focus: "scalability",
    summary: "Centralised management for multi-agent environments.",
    description:
      "Operate and administer multiple AI Agents from a single master instance.\n\nMulti-instance management simplifies governance, configuration, and rollout across teams, brands, or customers — reducing operational overhead, accelerating time to value, and making large-scale and partner-led deployments easier to manage.",
    unlocks:
      "One team manages many brands. A bank with retail + private + business + insurance arms runs four agents from one control plane. Assets move between instances. Governance is uniform without being uniform.",
  },
  {
    id: "ai-companion-analytics",
    title: "AI Companion for Analytics",
    bucket: "later",
    quarter: "Q4",
    focus: "adoption",
    summary: "Ask questions and get instant insights from your conversation data.",
    description:
      "Explore and analyse conversation data using natural language directly in the Admin Panel. The AI Companion for Analytics lets teams ask questions, generate custom metrics, and drill into results on demand — without relying on predefined dashboards, technical expertise, or data exports.\n\nThis makes advanced analytics accessible to more users and enables faster, more informed decisions.",
    unlocks:
      "A product manager types \"show me automation rate for stolen card over the last month, broken down by channel\" and gets an answer in seconds. No SQL, no tickets to the data team. Insights reach the people who can act on them.",
  },
  {
    id: "ai-companion-flow-building",
    title: "AI Companion for Flow Building",
    bucket: "later",
    quarter: "Q4",
    focus: "adoption",
    summary: "Build and optimise conversation flows using natural language.",
    description:
      "Create, modify, and improve conversation flows by simply describing what you want to achieve.\n\nThe AI Companion for flow building lets teams build flows conversationally, apply changes instantly, and optimise tone and structure with AI-powered suggestions — reducing complexity, speeding up iteration, and making flow building accessible to more users without deep platform expertise.",
    unlocks:
      "Your AI trainers build flows the same way they think about them — in plain language. \"Make this sound more formal\", \"add a step for the over-65 segment\", \"shorten this path\". The tool that used to need a specialist now scales to every team member who knows the business.",
  },
  {
    id: "integration-service",
    title: "Integration Service",
    bucket: "later",
    quarter: "Q4",
    focus: "adoption",
    summary: "Build and scale integrations without depending on core releases.",
    description:
      "A dedicated Integration Service that decouples integrations from the core platform. This allows customers and partners to build and maintain their own integrations independently, while enabling Boost to deliver new strategic integrations and integration-related capabilities faster.\n\nThe result is greater flexibility, faster innovation, and a more scalable integration ecosystem for all parties.",
    unlocks:
      "You ship integrations on your own timeline, not ours. A new CRM, a new core banking system, a new KYC vendor — your team (or a partner) builds it and owns it. No more waiting for the next core release to unlock a connection.",
  },
];

/* ─── Helpers ─── */
export function getItemsByBucket(bucket: RoadmapBucket): RoadmapItem[] {
  return PRODUCT_ROADMAP_2026.filter((item) => item.bucket === bucket);
}

export function getItemsByFocus(focus: FocusArea): RoadmapItem[] {
  return PRODUCT_ROADMAP_2026.filter((item) => item.focus === focus);
}

export function getItem(id: string): RoadmapItem | undefined {
  return PRODUCT_ROADMAP_2026.find((item) => item.id === id);
}

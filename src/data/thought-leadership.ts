import type { PerformanceMetrics, ThoughtLeadershipStat } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────
 *  The state-of-conversational-AI story
 *
 *  The reference deck (LähiTapiola & Turva) is built on FOUR core
 *  challenges — Agentic · Personalised CX · Sales · Channels (deck
 *  slide 3) — and each challenge tells the SAME data-driven arc:
 *
 *    1. boost.ai thought-leadership stat   (the big-number opener)
 *    2. how it works + boost market data   (proof points)
 *    3. named success stories              (case studies)
 *    4. the customer's own data            (benchmark context)
 *    5. how the transition looks for them  (today → future / what-if)
 *
 *  STORY_CHAPTERS encodes that arc as shared boost.ai content. The
 *  "Agentic" and "Orchestration" deck stats are combined into one
 *  fuller chapter ("Agentic Adoption") per the workshop; the other
 *  three each fill the section as their own chapter rather than a
 *  small box among many.
 *
 *  THOUGHT_LEADERSHIP_DEFAULTS is the 4 hero stats only — the
 *  customer-overridable slice the CSM edits in the builder. When a
 *  Customer has `thought_leadership`, those headline/stat/narrative
 *  values override the matching chapter hero by position.
 * ────────────────────────────────────────────────────────────── */

export type ChapterIcon = "agentic" | "personalised" | "sales" | "channels";

export interface ChapterProofPoint {
  value: string;
  label: string;
  sublabel?: string;
  /** Before/after pair — when both are set the card draws a tiny
   *  improvement graph (two bars, before → after) instead of a static
   *  figure. Direction (rising/falling) is inferred from the values. */
  from?: number;
  to?: number;
}

export interface ChapterCaseStudy {
  name: string;
  subtitle?: string;
  /** The transformation arc — where they came from and where they got to
   *  (deck slides 5/6). When present the card leads with this story
   *  rather than a bare metric grid. */
  before?: string;
  after?: string;
  metrics: { value: string; label: string }[];
}

export interface ChapterRoadmapItem {
  tag: string;
  title: string;
  body: string;
  /** Links to a full entry in `product-roadmap-2026` — when set, the card
   *  is clickable and opens a detail popup with the richer description +
   *  what it unlocks. */
  roadmapItemId?: string;
}

/** One instance in a slide-7 cohort distribution — an (anonymised)
 *  customer/instance benchmarked against the rest. The `isYou` entry is
 *  the customer's own instance, highlighted. */
export interface BenchmarkInstance {
  label: string;
  value: number;
  isYou?: boolean;
}

/** Peer / industry benchmark rendered as the slide-7 cohort distribution
 *  inside the chapter — ONE consistent shape across every chapter. The
 *  `dataset` label is the placeholder for the dataset-filter that will
 *  drive these numbers later — for now the bars carry static,
 *  deck-modelled values. */
export interface ChapterBenchmark {
  /** What's being measured, e.g. "% of agentic replies". */
  title: string;
  /** Placeholder dataset filter the comparison is drawn from. */
  dataset?: string;
  /** Unit suffix on the numbers (default "%"). */
  unit?: string;
  /** Slide-7 cohort distribution — every (anonymised) instance as its own
   *  full bar, sorted, with the customer's instance highlighted. Values
   *  are static deck-modelled placeholders today; later they'll be
   *  fetched live per instance and shown anonymised. */
  distribution: BenchmarkInstance[];
  /** Cohort average reference line (%), drawn across the distribution. */
  average?: number;
  /** Legend label for the cohort bars, e.g. "Anonymised insurer instances". */
  cohortLabel?: string;
  /** When set, the "you" value reads the live customer figure for this
   *  PerformanceMetrics field (falls back to the static value). */
  youFromPerformance?: keyof PerformanceMetrics;
  /** Short caption under the chart. */
  note?: string;
}

/** One channel in the customer's inquiry-mix profile (deck slide 40 —
 *  "Adoption & Automation of incoming inquiries"). The story of where
 *  this customer's traffic sits today and how much of it is automated. */
export interface ChannelMixSlice {
  channel: string;
  /** Share of total inquiries (%). */
  share: number;
  /** Human-readable annual volume, e.g. "~914,000 / yr". */
  volume: string;
  /** Current automation rate for this channel (%). */
  automation: number;
}

/** The customer's channel profile "as our story" — the inquiry mix
 *  across channels plus the today→target automation arc (deck slide 40). */
export interface ChannelProfile {
  title: string;
  /** Placeholder dataset filter the profile is drawn from. */
  dataset?: string;
  channels: ChannelMixSlice[];
  /** Total automation today (%). */
  totalAutomation: number;
  /** The automation ceiling we're aiming for (%). */
  targetAutomation: number;
  /** When set, total automation reads the live customer figure. */
  totalFromPerformance?: keyof PerformanceMetrics;
  note?: string;
}

/** One metric in the NLU→LLM impact chart — the before (NLU-based) and
 *  after (LLM-based) values that show why the shift matters. */
export interface ImpactMetric {
  metric: string;
  /** Value on the old NLU/intent-matched approach. */
  nlu: number;
  /** Value on the LLM-based agentic approach. */
  llm: number;
}

/** One row of a ranked impact chart (deck slide 15 — CSAT by interaction
 *  type). Sorted as authored; `tone` highlights the winning / failing row. */
export interface ImpactRankRow {
  label: string;
  value: number;
  tone?: "best" | "worst" | "neutral";
}

/** "Why this matters" — either paired NLU/LLM before-after bars (`metrics`)
 *  OR a ranked horizontal bar chart (`ranking`, deck slide 15). One of the
 *  two is set per chapter. */
export interface ChapterImpact {
  title: string;
  unit?: string;
  /** Paired NLU-based → LLM-based uplift bars. */
  metrics?: ImpactMetric[];
  /** Ranked horizontal bars on a fixed scale (deck slide 15). */
  ranking?: ImpactRankRow[];
  /** Upper bound of the ranking scale (e.g. 10 for a /10 CSAT score). */
  scaleMax?: number;
  note?: string;
  /** Small attribution line under the chart, e.g. "Data from boost.ai customer in FS". */
  source?: string;
}

export interface UseCaseTurn {
  from: "user" | "agent";
  text: string;
}

/** One side of the before/after — a transcript plus its resolved line. */
export interface UseCaseTranscript {
  messages: UseCaseTurn[];
  /** The result line under the transcript. */
  outcome?: string;
}

/** A real, named example — the "see it in action" pitch. Rendered as a
 *  side-by-side chat before/after so the chapter SHOWS the same request
 *  handled today vs going forward, not just describes it (deck slides
 *  20 / 24 / 36). */
export interface ChapterUseCase {
  /** "Real example — LähiTapiola auto-insurance invoice". */
  label: string;
  /** One-line scenario context. */
  scenario: string;
  /** The same request, handled the way it is today. */
  today: UseCaseTranscript;
  /** The same request, handled the agentic way going forward. */
  future: UseCaseTranscript;
}

export interface StoryChapter {
  /** Stable id — also the in-page anchor for the challenge row. */
  id: string;
  icon: ChapterIcon;
  /** Slide-3 challenge label. */
  challenge: string;
  /** Chapter title. */
  headline: string;
  /** Hero figure ("88%", "4–5×"). */
  stat: string;
  /** Caption under the primary hero ring (deck slide 4). */
  statLabel?: string;
  /** Optional second hero ring shown alongside the first — e.g. the
   *  Orchestration donut (deck slide 12) inside the Agentic chapter. */
  secondaryStat?: string;
  secondaryStatLabel?: string;
  /** Data-driven opener sentence. */
  narrative: string;
  /** boost market-data proof points. */
  proofPoints?: ChapterProofPoint[];
  /** Named success stories. */
  caseStudies?: ChapterCaseStudy[];
  /** Peer / industry benchmark — rendered as a live bar comparison. */
  benchmark?: ChapterBenchmark;
  /** The customer's own channel-mix profile, told as our story (slide 40). */
  channelProfile?: ChannelProfile;
  /** Roadmap items that extend THIS challenge's story (every chapter
   *  carries the items that help solve its own challenge). */
  roadmap?: ChapterRoadmapItem[];
  /** Toggle label for the roadmap block — named per challenge rather
   *  than the generic "what's coming next". */
  roadmapLabel?: string;
  /** Opt-in real-example chat mockup ("see it in action"). */
  useCase?: ChapterUseCase;
  /** The customer-facing transition. */
  transition?: { today: string; future: string };
  /** "Why this matters" impact chart — NLU-based vs LLM-based uplift. */
  impact?: ChapterImpact;
  /** Deep-dive section anchor + link label. */
  linkSection?: string;
  linkLabel?: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "agentic-adoption",
    icon: "agentic",
    challenge: "Agentic",
    headline: "Agentic Adoption",
    stat: "88%",
    statLabel: "Agentic",
    secondaryStat: "31%",
    secondaryStatLabel: "Orchestration",
    narrative:
      "91% of our customers have LLM features in production today, and 28% of all inquiries are now generative. Orchestration — still labelled beta — is already live for 31% of customers, and 26% of insurers.",
    proofPoints: [
      { value: "+20 pts", label: "NPS · Global Telco", sublabel: "42 → 62 in two weeks", from: 42, to: 62 },
      { value: "+12 pp", label: "Automation · Nordic Payments", sublabel: "55% → 67% after go-live", from: 55, to: 67 },
      { value: "−23.5 pp", label: "Escalations · Global Retail", sublabel: "31% → 7.5% in three weeks", from: 31, to: 7.5 },
    ],
    caseStudies: [
      {
        name: "Storebrand",
        subtitle: "Agentic AI in customer service for insurance",
        before: "Pre-defined dialogue trees with little back-end integration — the bot answered, but it couldn't act.",
        after: "LLM-based agentic AI wired into the core policy & claims systems — now it resolves end-to-end, and ranks #1 for AI insurance chat in the market.",
        metrics: [
          { value: "50%", label: "Traffic handled by Agentic AI" },
          { value: "43%", label: "Increase in CSAT" },
          { value: "24%", label: "Escalations (from 31%)" },
        ],
      },
    ],
    benchmark: {
      title: "% of agentic replies — Insurance Nordics",
      dataset: "Insurance · Nordics · agentic actions activated",
      cohortLabel: "Anonymised insurer instances",
      youFromPerformance: "automation_rate",
      average: 28,
      distribution: [
        { label: "Insurance O", value: 95 },
        { label: "Insurance C", value: 82 },
        { label: "Insurance A", value: 57 },
        { label: "Insurance G", value: 51 },
        { label: "Insurance B", value: 36 },
        { label: "Insurance H", value: 34 },
        { label: "Insurance L", value: 20 },
        { label: "Insurance I", value: 12 },
        { label: "Insurance K", value: 11 },
        { label: "Insurance F", value: 5 },
        { label: "Insurance E", value: 4 },
        { label: "Insurance D", value: 3 },
        { label: "Insurance J", value: 3 },
        { label: "Insurance M", value: 2 },
        { label: "Insurance N", value: 2 },
        { label: "You", value: 28, isYou: true },
      ],
      note: "Each bar is one anonymised insurer instance that has activated agentic actions. The cohort average sits at 28% — the top movers clear 90%, and that gap is the opportunity.",
    },
    roadmapLabel: "Platform Enablers for Generative Adoption",
    roadmap: [
      {
        tag: "Q4",
        title: "High-Agency Control Room",
        body: "Monitor, control and correct agent behaviour in real time — built-in oversight and self-healing as you scale.",
        roadmapItemId: "high-agency-control-room",
      },
      {
        tag: "Beta",
        title: "Agent Orchestration",
        body: "Route conversations generatively to the right specialist agent by context, not fixed rules.",
        roadmapItemId: "agent-orchestration-beta",
      },
      {
        tag: "Q3",
        title: "External A2A Orchestration",
        body: "Coordinate external AI agents across platforms and vendors via the A2A protocol — one orchestrated ecosystem.",
        roadmapItemId: "agent-orchestration-a2a",
      },
    ],
    useCase: {
      label: "Real example — Storebrand agentic claims",
      scenario: "A customer reports a travel-claim while abroad — the same request, handled two ways.",
      today: {
        messages: [
          { from: "user", text: "My flight home got cancelled and I had to book a hotel. Can I claim it?" },
          { from: "agent", text: "I can help with travel claims. Please open the claims portal and complete the travel-claim form — you'll need your policy number and receipts." },
          { from: "user", text: "Where do I find my policy number?" },
          { from: "agent", text: "It's on your policy documents, or you can log in to your account to look it up." },
        ],
        outcome: "Sent to a portal to do the work themselves — many drop off here.",
      },
      future: {
        messages: [
          { from: "user", text: "My flight home got cancelled and I had to book a hotel. Can I claim it?" },
          { from: "agent", text: "Yes — your travel policy covers cancellation costs. I can see the trip already, want me to start the claim for you?" },
          { from: "user", text: "Please." },
          { from: "agent", text: "Done. I've opened claim #TR-48201, pre-filled it from your booking and added the hotel receipt you uploaded. Reimbursement of €214 is approved and on its way to your account." },
        ],
        outcome: "Reported, validated and settled in one conversation — no handover, no form.",
      },
    },
    transition: {
      today: "Single-agent flows, rule-based routing, and manual oversight of edge cases.",
      future:
        "Orchestrated specialist agents routed generatively, monitored and self-corrected in real time across chat and voice.",
    },
    impact: {
      title: "NLU-based → LLM-based: the uplift",
      metrics: [
        { metric: "Automation rate", nlu: 46, llm: 66 },
        { metric: "Containment", nlu: 78, llm: 94 },
        { metric: "First-contact resolution", nlu: 55, llm: 82 },
        { metric: "Agentic replies", nlu: 4, llm: 28 },
      ],
      note: "Moving from intent-matched NLU flows to LLM-based agentic answers lifts every metric that matters — this is why the shift is worth making.",
    },
    linkSection: "agentic-before-after",
    linkLabel: "See the before / after transformation",
  },
  {
    id: "personalised-cx",
    icon: "personalised",
    challenge: "Personalised CX",
    headline: "Personalised CX",
    stat: "49%",
    narrative:
      "49% of our customers authenticate the end-user to deliver a personalised experience — turning generic answers into account-aware, proactive service.",
    proofPoints: [
      { value: "9.7 / 10", label: "CSAT", sublabel: "AI Agent + API/RPA vs 1.9 for a failed answer", from: 1.9, to: 9.7 },
      { value: "+20%", label: "CSAT uplift", sublabel: "from end-to-end journeys" },
      { value: "97%", label: "Containment", sublabel: "up from 92%", from: 92, to: 97 },
    ],
    caseStudies: [
      {
        name: "Accelerating Synergy",
        subtitle: "Automating CX during a Nordic banking merger",
        before: "Two merging banks ran parallel, unauthenticated chat — generic answers, duplicated effort and rising manual volume mid-integration.",
        after: "One authenticated, account-aware AI Agent across the merged base — resolving end-to-end and freeing the equivalent of a small team.",
        metrics: [
          { value: "54%", label: "Reduction in manual chats" },
          { value: "77.8%", label: "CSAT" },
          { value: "9–12", label: "FTEs automated" },
          { value: "$0.8–1.4m", label: "Saved" },
        ],
      },
      {
        name: "UK Insurer",
        subtitle: "Personalised AI Agent journeys",
        before: "Anonymous answers sent customers to the portal to check policies and claims themselves — feedback and engagement stalled.",
        after: "Authenticated journeys answer account questions in chat — positive feedback and portal engagement both climbed.",
        metrics: [
          { value: "24%", label: "CSAT uplift" },
          { value: "43% → 66%", label: "Positive feedback" },
          { value: "51% → 55%", label: "Portal engagement" },
        ],
      },
    ],
    benchmark: {
      title: "% of conversations authenticated — Insurance Nordics",
      dataset: "Insurance · Nordics · authenticated journeys",
      cohortLabel: "Anonymised insurer instances",
      average: 61,
      distribution: [
        { label: "Insurance O", value: 88 },
        { label: "Insurance C", value: 84 },
        { label: "Insurance A", value: 79 },
        { label: "Insurance G", value: 74 },
        { label: "Insurance B", value: 71 },
        { label: "Insurance H", value: 66 },
        { label: "Insurance L", value: 63 },
        { label: "Insurance I", value: 58 },
        { label: "Insurance K", value: 54 },
        { label: "You", value: 49, isYou: true },
        { label: "Insurance F", value: 47 },
        { label: "Insurance E", value: 41 },
        { label: "Insurance D", value: 33 },
        { label: "Insurance J", value: 28 },
        { label: "Insurance M", value: 22 },
        { label: "Insurance N", value: 14 },
      ],
      note: "Each bar is one anonymised insurer instance. Authenticating the end-user unlocks account-aware, proactive answers — the cohort average sits at 61% and you have clear room to climb.",
    },
    roadmapLabel: "Platform Enablers for Personalised CX",
    roadmap: [
      {
        tag: "Q1",
        title: "Long-term memory",
        body: "The agent remembers prior conversations and preferences across sessions — a continuous, personal relationship, not a cold start every time.",
      },
      {
        tag: "Q2",
        title: "Proactive outreach",
        body: "Account-aware nudges at the right moment — renewal reminders, claim updates, payment due dates — sent before the customer has to ask.",
      },
    ],
    useCase: {
      label: "Real example — auto-insurance invoice",
      scenario: "A customer asks about a bill — generic answer vs account-aware action.",
      today: {
        messages: [
          { from: "user", text: "Do I have any unpaid invoices?" },
          { from: "agent", text: "You can view your invoices by logging in to the customer portal under 'Billing'. Is there anything else I can help with?" },
          { from: "user", text: "Can't you just tell me?" },
          { from: "agent", text: "I'm not able to access account details here — please log in to check your balance." },
        ],
        outcome: "Account-blind — the customer has to go find the answer themselves.",
      },
      future: {
        messages: [
          { from: "user", text: "Do I have any unpaid invoices?" },
          { from: "agent", text: "You have one open auto-insurance invoice of €182, due 5 May. Would you like to pay it now or move the due date?" },
          { from: "user", text: "Can I push it back a few weeks?" },
          { from: "agent", text: "Done — I've moved the due date to 2 June and sent you the updated invoice. Nothing else is outstanding." },
        ],
        outcome: "Account-aware from the first message — no portal, no login wall.",
      },
    },
    transition: {
      today: "Generic answers point customers to a portal to find invoices, coverage and claim status themselves.",
      future:
        "Authenticated, account-aware answers — \"you have one open auto-insurance invoice, due 5.5; tap to move it 4 weeks\" — handled in chat.",
    },
    impact: {
      title: "End-to-end journeys lift CSAT by 20%",
      unit: "",
      scaleMax: 10,
      ranking: [
        { label: "Failed answer, no escalation", value: 1.9, tone: "worst" },
        { label: "Correct answer, no escalation", value: 7.2 },
        { label: "Failed answer, escalation offered", value: 7.5 },
        { label: "Correct answer, escalation offered", value: 7.8 },
        { label: "Asked directly for human escalation", value: 8.0 },
        { label: "AI Agent + API/RPA", value: 9.7, tone: "best" },
      ],
      note: "An agent that can act end-to-end — calling APIs and RPA on the customer's own account — scores 9.7/10, far above any answer-only path. The worst experience isn't a wrong answer; it's a failed answer with nowhere to go (1.9).",
      source: "Data from a boost.ai customer in financial services",
    },
    linkSection: "personalisation",
    linkLabel: "See the top-intent integration opportunities",
  },
  {
    id: "sales",
    icon: "sales",
    challenge: "Sales",
    headline: "Drive revenue",
    stat: "11%",
    narrative:
      "11% of our customers already create more value from revenue generation than cost savings — and that share is growing fast as the AI Agent moves from service to selling.",
    proofPoints: [
      { value: "10M €", label: "Mortgage sales", sublabel: "initiated by a proactive callback" },
      { value: "Proactive", label: "Lead capture", sublabel: "the agent pops up at the moment of intent" },
    ],
    caseStudies: [
      {
        name: "Lead generation with the AI Agent",
        subtitle: "GenAI agents in customer service",
        metrics: [
          { value: "42%", label: "Higher lead conversion · Tryg" },
          { value: "60%", label: "Win rate on leads · Nordic Insurance" },
          { value: "150", label: "Upsales in week 1 · Finnish Telco" },
        ],
      },
    ],
    benchmark: {
      title: "Lead conversion via AI Agent — Financial services",
      dataset: "FS · revenue-generating agents",
      cohortLabel: "Anonymised FS instances",
      average: 31,
      distribution: [
        { label: "FS instance H", value: 64 },
        { label: "FS instance C", value: 60 },
        { label: "FS instance A", value: 55 },
        { label: "FS instance G", value: 49 },
        { label: "FS instance B", value: 44 },
        { label: "FS instance L", value: 42 },
        { label: "FS instance I", value: 38 },
        { label: "FS instance K", value: 33 },
        { label: "FS instance F", value: 29 },
        { label: "FS instance E", value: 24 },
        { label: "FS instance D", value: 19 },
        { label: "FS instance J", value: 15 },
        { label: "FS instance M", value: 11 },
        { label: "FS instance N", value: 8 },
        { label: "You · static web forms", value: 6, isYou: true },
      ],
      note: "Each bar is one anonymised FS instance running a revenue-generating agent. Static web forms convert in low single digits — proactive, in-conversation capture is the gap, with the cohort averaging 31%.",
    },
    roadmapLabel: "Platform Enablers for Revenue Generation",
    roadmap: [
      {
        tag: "Q2",
        title: "In-conversation product recommendations",
        body: "The agent surfaces the right product at the moment of intent and completes the sale in the conversation — no hand-off to a form.",
      },
      {
        tag: "Q3",
        title: "Lead scoring & advisor handoff",
        body: "Qualify and score leads in real time, then route the hottest to advisors with the full conversation context attached.",
      },
    ],
    useCase: {
      label: "Real example — proactive mortgage lead",
      scenario: "A customer browses the rates page — passive answer vs proactive capture.",
      today: {
        messages: [
          { from: "user", text: "What's your mortgage rate?" },
          { from: "agent", text: "Our mortgage rates start from 3.4%. You can read more on our mortgages page or call our advisors during office hours." },
        ],
        outcome: "A service answer, then silence — no lead captured, the moment of intent passes.",
      },
      future: {
        messages: [
          { from: "agent", text: "Looking at mortgage rates? I can give you a personalised estimate in under a minute — want to try?" },
          { from: "user", text: "Sure. We're thinking about a place around €350k." },
          { from: "agent", text: "Based on your profile that's well within reach. A specialist can confirm the exact rate — shall I book a callback for tomorrow at 14:00?" },
          { from: "user", text: "Yes, perfect." },
          { from: "agent", text: "Booked. You'll get a confirmation by SMS, and I've passed your details to the mortgage team." },
        ],
        outcome: "A passive page-view turned into a qualified lead and a booked callback — €10M in mortgage sales started this way.",
      },
    },
    transition: {
      today: "The agent answers service questions; sales and upsell happen elsewhere, if at all.",
      future:
        "The agent recognises buying intent, recommends the right product, and completes the sale — proactively, in the conversation.",
    },
    impact: {
      title: "Proactive, in-conversation capture multiplies conversion",
      unit: "%",
      scaleMax: 70,
      ranking: [
        { label: "Static web form (you today)", value: 6, tone: "worst" },
        { label: "Cohort average — revenue-generating agent", value: 31 },
        { label: "Tryg — higher lead conversion", value: 42 },
        { label: "Nordic Insurance — win rate on agent-sourced leads", value: 60, tone: "best" },
      ],
      note: "Capturing intent inside the conversation — at the moment it happens — converts several times better than a static form. Tryg lifted lead conversion 42%, Nordic Insurance wins 60% of agent-sourced leads, and a Finnish telco booked 150 upsales in week one. One proactive mortgage callback alone started €10M in sales.",
      source: "Data from boost.ai customers in financial services (deck p.31)",
    },
    linkSection: "revenue",
    linkLabel: "See the lead-gen + sell-via-agent journeys",
  },
  {
    id: "channels",
    icon: "channels",
    challenge: "Channels",
    headline: "Channels",
    stat: "62%",
    statLabel: "of our customers run Voice",
    narrative:
      "Over the last year, our customer are automating 4-5 times more customer interactions over Voice, as tech matures significantly.",
    proofPoints: [
      { value: "470k €", label: "Saved annually", sublabel: "moving 10% of written messages to chat" },
      { value: "800k €", label: "Saved annually", sublabel: "moving 10% of phone to automation" },
      { value: "220k €", label: "Saved annually", sublabel: "+10% chat automation" },
    ],
    caseStudies: [
      {
        name: "Driving Frontline Readiness",
        subtitle: "Automating AI voice training for new-hire onboarding",
        metrics: [
          { value: "30", label: "Technical scenarios" },
          { value: "0", label: "Trainee attrition" },
          { value: "+45%", label: "Trainee confidence" },
        ],
      },
    ],
    benchmark: {
      title: "Total automation across all channels — Financial services",
      dataset: "Financial services · all channels",
      unit: "%",
      cohortLabel: "Anonymised FS instances",
      youFromPerformance: "automation_rate",
      average: 35,
      distribution: [
        { label: "FS instance H", value: 72 },
        { label: "FS instance C", value: 66 },
        { label: "FS instance A", value: 61 },
        { label: "FS instance G", value: 55 },
        { label: "FS instance B", value: 50 },
        { label: "FS instance L", value: 45 },
        { label: "FS instance I", value: 40 },
        { label: "FS instance K", value: 35 },
        { label: "FS instance F", value: 30 },
        { label: "FS instance E", value: 26 },
        { label: "FS instance D", value: 21 },
        { label: "FS instance J", value: 17 },
        { label: "You", value: 13, isYou: true },
        { label: "FS instance M", value: 12 },
        { label: "FS instance N", value: 8 },
      ],
      note: "Each bar is one anonymised FS instance's total automation across phone, messages and chat. The cohort averages 35% — the per-channel breakdown below shows where your headroom sits.",
    },
    channelProfile: {
      title: "Your inquiry mix today",
      dataset: "All channels · last 12 months",
      channels: [
        { channel: "Phone", share: 41, volume: "~914,000 / yr", automation: 4 },
        { channel: "Online messages", share: 34, volume: "~750,000 / yr", automation: 18 },
        { channel: "Chat", share: 25, volume: "~550,000 / yr", automation: 53 },
      ],
      totalAutomation: 13,
      targetAutomation: 100,
      totalFromPerformance: "automation_rate",
      note: "Phone carries the most volume yet the least automation — the biggest, most visible prize as one AI Agent moves onto the voice line.",
    },
    roadmapLabel: "Platform Enablers across Channels",
    roadmap: [
      {
        tag: "Now",
        title: "Boost Voice — in-house",
        body: "One AI Agent across chat, voice and messaging. Voice automation built natively, not stitched together from third parties.",
      },
      {
        tag: "Q2",
        title: "Adaptive Voice & WebRTC",
        body: "Low-latency, barge-in-capable voice that adapts tone and pace to the caller — the phone line that finally feels natural.",
      },
      {
        tag: "Q3",
        title: "Multi-modal avatars",
        body: "Bring the agent on-screen for video and avatar channels as your customers adopt them — one brain, every surface.",
      },
    ],
    useCase: {
      label: "Real example — claim settled by voice",
      scenario: "A device-insurance claim over the phone — transfer-and-queue vs settled live.",
      today: {
        messages: [
          { from: "user", text: "Hi, I cracked my phone screen and I have device insurance." },
          { from: "agent", text: "For device claims you'll need our claims team. I'll transfer you now — please hold." },
          { from: "agent", text: "[Transferred] All our agents are busy. Your estimated wait is 12 minutes." },
        ],
        outcome: "Handed to a queue — a call that could self-serve waits for a human.",
      },
      future: {
        messages: [
          { from: "user", text: "Hi, I cracked my phone screen and I have device insurance." },
          { from: "agent", text: "I can help with that. I've found your device cover — repairs are handled with a €49 excess. Would you like me to book a repair or arrange a replacement?" },
          { from: "user", text: "Repair, please." },
          { from: "agent", text: "Booked at the Helsinki centre for Thursday. I've taken the €49 excess from your saved card and texted you the confirmation and drop-off details." },
        ],
        outcome: "End-to-end on the phone line — the channel customers already reach for, now automated.",
      },
    },
    transition: {
      today: "Phone (41%), written messages (34%) and chat (25%) handled in silos, 13% total automation.",
      future:
        "One AI Agent across every channel — claims settlements offered instantly, invoices and payments self-served by voice and chat.",
    },
    impact: {
      title: "Where the savings are — every 10% shifted",
      unit: "k €",
      scaleMax: 850,
      ranking: [
        { label: "+10% chat automation", value: 220 },
        { label: "Move 10% of written messages to chat", value: 470 },
        { label: "Move 10% of phone to automation", value: 800, tone: "best" },
      ],
      note: "Phone carries the most volume yet the least automation, so it holds the biggest prize: every 10% of calls shifted to automation is worth ~€800k a year — far more than the same shift on any other channel. That is why bringing one AI Agent onto the voice line matters most.",
      source: "Modelled on your channel mix and per-channel cost-to-serve",
    },
    linkSection: "platform-vision",
    linkLabel: "See the channel + roadmap vision",
  },
];

/**
 * The 4 customer-overridable hero stats (one per chapter). The builder
 * lets the CSM load + tweak these; the section overrides the matching
 * chapter hero by position. Numbers mirror the deck.
 */
export const THOUGHT_LEADERSHIP_DEFAULTS: ThoughtLeadershipStat[] = STORY_CHAPTERS.map(
  (c) => ({ headline: c.headline, stat: c.stat, narrative: c.narrative }),
);

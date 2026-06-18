import type { ThoughtLeadershipStat } from "@/lib/types";

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
}

export interface ChapterCaseStudy {
  name: string;
  subtitle?: string;
  metrics: { value: string; label: string }[];
}

export interface ChapterRoadmapItem {
  tag: string;
  title: string;
  body: string;
}

/** A real, named example — the "see it in action" pitch. Rendered as a
 *  chat mockup so the chapter shows the going-forward experience, not
 *  just describes it (deck slides 20 / 24 / 36). */
export interface ChapterUseCase {
  /** "Real example — LähiTapiola auto-insurance invoice". */
  label: string;
  /** One-line scenario context. */
  scenario: string;
  /** The conversation, in order. */
  messages: { from: "user" | "agent"; text: string }[];
  /** The resolved outcome line under the transcript. */
  outcome?: string;
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
  /** Data-driven opener sentence. */
  narrative: string;
  /** boost market-data proof points. */
  proofPoints?: ChapterProofPoint[];
  /** Named success stories. */
  caseStudies?: ChapterCaseStudy[];
  /** Peer / industry benchmark context. */
  benchmark?: { title: string; average?: string; leader?: string; note?: string };
  /** Roadmap items that extend the story (Agentic Adoption). */
  roadmap?: ChapterRoadmapItem[];
  /** Opt-in real-example chat mockup ("see it in action"). */
  useCase?: ChapterUseCase;
  /** The customer-facing transition. */
  transition?: { today: string; future: string };
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
    narrative:
      "91% of our customers have LLM features in production today, and 28% of all inquiries are now generative. Orchestration — still labelled beta — is already live for 31% of customers, and 26% of insurers.",
    proofPoints: [
      { value: "46% → 66%", label: "Automation", sublabel: "in 2 months" },
      { value: "15% → 7%", label: "Human handovers", sublabel: "halved" },
      { value: "+20 pts", label: "NPS uplift", sublabel: "42 → 62 in 2 weeks" },
    ],
    caseStudies: [
      {
        name: "Storebrand",
        subtitle: "Agentic AI in customer service for insurance",
        metrics: [
          { value: "50%", label: "Traffic handled by Agentic AI" },
          { value: "43%", label: "Increase in CSAT" },
          { value: "24%", label: "Escalations (from 31%)" },
          { value: "#1", label: "AI chat for insurance, ranked" },
        ],
      },
    ],
    benchmark: {
      title: "% of Agentic replies — Insurance Nordics",
      average: "28%",
      note: "Among insurers who've activated agentic actions. Top movers already exceed 90% — the gap is the opportunity.",
    },
    roadmap: [
      {
        tag: "Q4",
        title: "High-Agency Control Room",
        body: "Monitor, control and correct agent behaviour in real time — built-in oversight and self-healing as you scale.",
      },
      {
        tag: "Beta",
        title: "Agent Orchestration",
        body: "Route conversations generatively to the right specialist agent by context, not fixed rules.",
      },
      {
        tag: "Q3",
        title: "External A2A Orchestration",
        body: "Coordinate external AI agents across platforms and vendors via the A2A protocol — one orchestrated ecosystem.",
      },
    ],
    useCase: {
      label: "Real example — Storebrand agentic claims",
      scenario: "A customer reports a travel-claim while abroad — the agent acts, it doesn't just answer.",
      messages: [
        { from: "user", text: "My flight home got cancelled and I had to book a hotel. Can I claim it?" },
        { from: "agent", text: "Yes — your travel policy covers cancellation costs. I can see the claim already, want me to start it for you?" },
        { from: "user", text: "Please." },
        { from: "agent", text: "Done. I've opened claim #TR-48201, pre-filled it from your booking and added the hotel receipt you uploaded. Reimbursement of €214 is approved and on its way to your account." },
      ],
      outcome: "Claim reported, validated and settled in one conversation — no handover, no form.",
    },
    transition: {
      today: "Single-agent flows, rule-based routing, and manual oversight of edge cases.",
      future:
        "Orchestrated specialist agents routed generatively, monitored and self-corrected in real time across chat and voice.",
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
      { value: "9.7 / 10", label: "CSAT", sublabel: "AI Agent + API/RPA vs 1.9 for a failed answer" },
      { value: "+20%", label: "CSAT uplift", sublabel: "from end-to-end journeys" },
      { value: "97%", label: "Containment", sublabel: "up from 92%" },
    ],
    caseStudies: [
      {
        name: "Accelerating Synergy",
        subtitle: "Automating CX during a Nordic banking merger",
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
        metrics: [
          { value: "24%", label: "CSAT uplift" },
          { value: "43% → 66%", label: "Positive feedback" },
          { value: "51% → 55%", label: "Portal engagement" },
        ],
      },
    ],
    benchmark: {
      title: "Positive conversation feedback vs insurers",
      leader: "85.5%",
      note: "Personalised + agentic conversations consistently top peer feedback scores.",
    },
    useCase: {
      label: "Real example — auto-insurance invoice",
      scenario: "An authenticated customer asks about a bill — the agent already knows which one.",
      messages: [
        { from: "user", text: "Do I have any unpaid invoices?" },
        { from: "agent", text: "You have one open auto-insurance invoice of €182, due 5 May. Would you like to pay it now or move the due date?" },
        { from: "user", text: "Can I push it back a few weeks?" },
        { from: "agent", text: "Done — I've moved the due date to 2 June and sent you the updated invoice. Nothing else is outstanding." },
      ],
      outcome: "Account-aware from the first message — no portal, no login wall, no \"please check your statements\".",
    },
    transition: {
      today: "Generic answers point customers to a portal to find invoices, coverage and claim status themselves.",
      future:
        "Authenticated, account-aware answers — \"you have one open auto-insurance invoice, due 5.5; tap to move it 4 weeks\" — handled in chat.",
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
    useCase: {
      label: "Real example — proactive mortgage lead",
      scenario: "A customer browses the rates page — the agent reads intent and opens the door.",
      messages: [
        { from: "agent", text: "Looking at mortgage rates? I can give you a personalised estimate in under a minute — want to try?" },
        { from: "user", text: "Sure. We're thinking about a place around €350k." },
        { from: "agent", text: "Based on your profile that's well within reach. A specialist can confirm the exact rate — shall I book a callback for tomorrow at 14:00?" },
        { from: "user", text: "Yes, perfect." },
        { from: "agent", text: "Booked. You'll get a confirmation by SMS, and I've passed your details to the mortgage team." },
      ],
      outcome: "A passive page-view turned into a qualified lead and a booked callback — €10M in mortgage sales started this way.",
    },
    transition: {
      today: "The agent answers service questions; sales and upsell happen elsewhere, if at all.",
      future:
        "The agent recognises buying intent, recommends the right product, and completes the sale — proactively, in the conversation.",
    },
    linkSection: "revenue",
    linkLabel: "See the lead-gen + sell-via-agent journeys",
  },
  {
    id: "channels",
    icon: "channels",
    challenge: "Channels",
    headline: "Channels",
    stat: "4–5×",
    narrative:
      "Over the last year our customers are automating 4–5× more interactions over Voice as the technology matures — one AI Agent across chat, voice and messaging.",
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
      title: "Total automation across all channels vs FS",
      note: "Total automation sits at ~13% today vs peers at 20–50% — the headroom across phone, messages and chat is the prize.",
    },
    useCase: {
      label: "Real example — claim settled by voice",
      scenario: "The same AI Agent picks up the phone — and settles the claim live, no transfer.",
      messages: [
        { from: "user", text: "Hi, I cracked my phone screen and I have device insurance." },
        { from: "agent", text: "I can help with that. I've found your device cover — repairs are handled with a €49 excess. Would you like me to book a repair or arrange a replacement?" },
        { from: "user", text: "Repair, please." },
        { from: "agent", text: "Booked at the Helsinki centre for Thursday. I've taken the €49 excess from your saved card and texted you the confirmation and drop-off details." },
      ],
      outcome: "End-to-end on the phone line — the channel customers already reach for, now automated.",
    },
    transition: {
      today: "Phone (41%), written messages (34%) and chat (25%) handled in silos, 13% total automation.",
      future:
        "One AI Agent across every channel — claims settlements offered instantly, invoices and payments self-served by voice and chat.",
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

/**
 * Boost Camp event history and upcoming events — April 2023 to April 2026.
 *
 * Structure:
 *   Location → multiple events (one per year/occasion) → speakers[].
 *
 * Data is drawn from public sources:
 *   - boost.ai event pages (many since retired — referenced via Cvent + LinkedIn)
 *   - LinkedIn announcements (boost.ai company page posts)
 *   - VUX World live coverage (Boost Camp 2025)
 *   - Botrepreneurs event directory (for archived pages)
 *
 * Speaker kinds:
 *   - "customer"  → boost.ai customer representatives
 *   - "boost"     → boost.ai employees
 *   - "partner"   → solution partners, consultants, integrators
 *   - "analyst"   → industry analysts / independent voices
 *
 * Draft flag:
 *   - Attendance numbers are never disclosed publicly by boost.ai
 *   - All flagship Boost Camp editions in Oslo comfortably cleared the
 *     50-attendee threshold based on agenda structure + named speakers
 *   - Regional spinoffs (London 2025, Stockholm 2026) and breakfast
 *     seminars (Q1 2024) are marked draft where attendance is genuinely
 *     ambiguous
 */

export type SpeakerKind = "customer" | "boost" | "partner" | "analyst";

export interface EventSpeaker {
  name: string;
  role: string;
  company: string;
  kind: SpeakerKind;
  /** Optional session / talk title */
  topic?: string;
}

export type EventStatus = "past" | "upcoming";

export interface BoostCampEvent {
  id: string;
  year: string;
  /** Human-friendly date, e.g. "17 June 2025". Omit if date not publicly disclosed. */
  date?: string;
  /** Event theme / tagline */
  theme?: string;
  /** Venue name */
  venue?: string;
  /** Attendance, e.g. "200+". Usually omitted — boost.ai doesn't publish numbers. */
  attendees?: string;
  status: EventStatus;
  speakers: EventSpeaker[];
  /** External link for more info (LinkedIn post, registration, recap) */
  url?: string;
  /** Draft flag where attendance crossing 50+ is ambiguous, or speakers are incomplete */
  draft?: boolean;
}

export interface BoostCampLocation {
  id: string;
  city: string;
  country: string;
  /** Position as % of world-map.svg container — tuned manually */
  x: number;
  y: number;
  events: BoostCampEvent[];
}

/* ────────────────────────────────────────────────────────────────
 *  The event history
 * ──────────────────────────────────────────────────────────────── */

export const BOOST_CAMP_LOCATIONS: BoostCampLocation[] = [
  {
    id: "oslo",
    city: "Oslo",
    country: "Norway",
    x: 50.5,
    y: 27,
    events: [
      {
        id: "oslo-2023",
        year: "2023",
        date: "24 May 2023",
        theme: "The community gathers — bigger and better than ever",
        venue: "Oslo",
        status: "past",
        speakers: [
          {
            name: "Jerry Haywood",
            role: "CEO",
            company: "boost.ai",
            kind: "boost",
            topic: "First post-pandemic Boost Camp — vision as new CEO",
          },
        ],
      },
      {
        id: "oslo-2024",
        year: "2024",
        date: "22 May 2024",
        theme: "AI-Powered, Human-Centric: A New Era of CX",
        venue: "The Hub, Oslo",
        status: "past",
        speakers: [
          {
            name: "Elin Hauge",
            role: "AI & Business Strategist",
            company: "Independent",
            kind: "analyst",
            topic: "Keynote — the post-ChatGPT strategic landscape, data-driven decisions, hyper-personalisation",
          },
          {
            name: "Matilde Them Olsen",
            role: "Digital CX Lead",
            company: "Alm. Brand Group",
            kind: "customer",
          },
          {
            name: "Andryo Pereira",
            role: "AI Product Lead",
            company: "Bold",
            kind: "customer",
          },
          {
            name: "Nordea",
            role: "Customer session",
            company: "Nordea",
            kind: "customer",
          },
          {
            name: "Icelandair",
            role: "Customer session",
            company: "Icelandair",
            kind: "customer",
          },
          {
            name: "Desert Financial Credit Union",
            role: "Customer session",
            company: "Desert Financial Credit Union",
            kind: "customer",
          },
        ],
      },
      {
        id: "oslo-2025",
        year: "2025",
        date: "17 June 2025",
        theme: "Level Up with AI — cutting through the noise",
        venue: "Oslo",
        status: "past",
        speakers: [
          {
            name: "Nick Mitchell",
            role: "CRO",
            company: "boost.ai",
            kind: "boost",
          },
          {
            name: "Ben Maxim",
            role: "CTO",
            company: "MSU Federal Credit Union",
            kind: "customer",
          },
          {
            name: "Åse Marthinsen",
            role: "GenAI Lead",
            company: "DNB",
            kind: "customer",
          },
          {
            name: "H&M",
            role: "Customer case study",
            company: "H&M",
            kind: "customer",
          },
          {
            name: "Sage",
            role: "Customer case study",
            company: "Sage",
            kind: "customer",
          },
          {
            name: "Telenor",
            role: "Customer case study",
            company: "Telenor",
            kind: "customer",
          },
          {
            name: "Vipps MobilePay",
            role: "Customer case study",
            company: "Vipps MobilePay",
            kind: "customer",
          },
          {
            name: "Ciklum",
            role: "Partner session",
            company: "Ciklum",
            kind: "partner",
          },
        ],
      },
      {
        id: "oslo-2026",
        year: "2026",
        theme: "Leaders in conversational AI exploring the future of customer service and AI agents",
        venue: "Oslo (date TBD)",
        status: "upcoming",
        draft: true,
        speakers: [],
      },
    ],
  },

  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    x: 47,
    y: 34,
    events: [
      {
        id: "london-2025",
        year: "2025",
        theme: "Boost Camp London — first UK regional edition",
        status: "past",
        draft: true,
        speakers: [],
      },
    ],
  },

  {
    id: "nashville",
    city: "Nashville",
    country: "USA",
    x: 26,
    y: 41,
    events: [
      {
        id: "nashville-2026",
        year: "2026",
        date: "2 June 2026",
        theme: "The Enterprise AI Imperative",
        venue: "Acme Feed & Seed — The Hatchery, 101 Broadway, Nashville TN",
        status: "upcoming",
        speakers: [
          {
            name: "MSU Federal Credit Union",
            role: "Customer spotlight",
            company: "MSU Federal Credit Union",
            kind: "customer",
          },
        ],
      },
    ],
  },

  {
    id: "stockholm",
    city: "Stockholm",
    country: "Sweden",
    x: 53,
    y: 27,
    events: [
      {
        id: "stockholm-2024-breakfast",
        year: "2024",
        date: "15 February 2024",
        theme: "Breakfast seminar — Automating for Happy Customers",
        venue: "Epicenter Store, Regeringsgatan 61A, Stockholm",
        status: "past",
        draft: true,
        speakers: [
          {
            name: "Jens Granath",
            role: "Representative",
            company: "Skatteverket (Swedish Tax Authority)",
            kind: "customer",
          },
          {
            name: "Rasmus Hauch",
            role: "CTO",
            company: "boost.ai",
            kind: "boost",
            topic: "Product roadmap",
          },
          {
            name: "Nathaniel Ahy",
            role: "Product",
            company: "boost.ai",
            kind: "boost",
            topic: "LLM demo",
          },
        ],
      },
      {
        id: "stockholm-2026",
        year: "2026",
        theme: "Agentic AI — from pilot to production",
        venue: "Stockholm (date TBD)",
        status: "upcoming",
        draft: true,
        speakers: [
          {
            name: "Skatteverket",
            role: "Featured customer session",
            company: "Skatteverket (Swedish Tax Authority)",
            kind: "customer",
            topic: "How do you innovate with AI inside one of the world's most regulated organisations?",
          },
        ],
      },
    ],
  },

  {
    id: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    x: 51.2,
    y: 29,
    events: [
      {
        id: "copenhagen-2024-breakfast",
        year: "2024",
        date: "29 February 2024",
        theme: "Breakfast seminar — Automating for Happy Customers",
        venue: "Industriens Hus, H.C. Andersens Blvd. 18, Copenhagen",
        status: "past",
        draft: true,
        speakers: [
          {
            name: "Michelle Halvorsen",
            role: "Representative",
            company: "Alm. Brand Group",
            kind: "customer",
          },
          {
            name: "Kathrine Munch Torp",
            role: "Representative",
            company: "Alm. Brand Group",
            kind: "customer",
          },
          {
            name: "Ian Wisler Paulsen",
            role: "CX expert",
            company: "Independent",
            kind: "analyst",
          },
          {
            name: "Rasmus Hauch",
            role: "CTO",
            company: "boost.ai",
            kind: "boost",
            topic: "Product roadmap preview",
          },
        ],
      },
    ],
  },
];

/* ── Helpers ── */

/** Get all events, flattened across locations, sorted newest-first */
export function getAllEventsFlat(): Array<BoostCampEvent & { city: string; country: string }> {
  return BOOST_CAMP_LOCATIONS.flatMap((loc) =>
    loc.events.map((e) => ({ ...e, city: loc.city, country: loc.country })),
  ).sort((a, b) => Number(b.year) - Number(a.year));
}

/** Does a location have at least one upcoming event? (used to pick dot style) */
export function locationHasUpcoming(loc: BoostCampLocation): boolean {
  return loc.events.some((e) => e.status === "upcoming");
}

/** Summary — "3 events · 2023, 2024, 2025" */
export function locationSummary(loc: BoostCampLocation): string {
  const years = [...new Set(loc.events.map((e) => e.year))].join(", ");
  const count = loc.events.length;
  return `${count} event${count === 1 ? "" : "s"} · ${years}`;
}

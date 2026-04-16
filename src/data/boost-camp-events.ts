/**
 * Boost Camp event history and upcoming events.
 *
 * Structure:
 *   Location → multiple events (one per year) → speakers[].
 *
 * Each event also tracks status (past / upcoming), theme, venue, date.
 * Speakers are tagged by kind so we can visually distinguish customer
 * talks from boost.ai talks / analyst keynotes.
 *
 * **Data status:** seeded from publicly-available boost.ai and
 * LinkedIn references. Marked PLACEHOLDER where a field needs
 * confirmation. Replace with internal research when available.
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
  /** Human-friendly date, e.g. "17 June 2025" */
  date?: string;
  /** Event theme / tagline */
  theme?: string;
  /** Venue name */
  venue?: string;
  /** Attendance, e.g. "200+" */
  attendees?: string;
  status: EventStatus;
  speakers: EventSpeaker[];
  /** External link for more info (LinkedIn post, registration, recap) */
  url?: string;
  /** Whether the speakers list is a draft/placeholder */
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
        id: "oslo-2024",
        year: "2024",
        date: "23 May 2024",
        theme: "AI-Powered, Human-Centric: A New Era of CX",
        venue: "The Hub, Oslo",
        status: "past",
        draft: true,
        speakers: [
          {
            name: "Elin Hauge",
            role: "AI & Business Strategist",
            company: "Independent",
            kind: "analyst",
            topic: "Keynote — What AI means for business leaders",
          },
          // PLACEHOLDER — add confirmed customer speakers
        ],
      },
      {
        id: "oslo-2025",
        year: "2025",
        date: "17 June 2025",
        theme: "Level Up with AI",
        venue: "The Hub, Oslo",
        status: "past",
        draft: true,
        speakers: [
          {
            name: "Matilde Them Olsen",
            role: "Digital CX Lead",
            company: "Alm. Brand Group",
            kind: "customer",
            topic: "Scaling AI in Nordic insurance",
          },
          {
            name: "Andryo Pereira",
            role: "AI Product Lead",
            company: "Bold",
            kind: "customer",
          },
          {
            name: "Kane Simms",
            role: "Founder",
            company: "VUX World",
            kind: "analyst",
            topic: "Gaining clarity in conversational AI",
          },
          // PLACEHOLDER — add remaining speakers
        ],
      },
      {
        id: "oslo-2026",
        year: "2026",
        date: "21 October 2026",
        theme: "The roadmap, in the room",
        venue: "Clarion Hotel The Hub, Oslo",
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
        theme: "Boost Camp London",
        status: "past",
        draft: true,
        speakers: [
          // PLACEHOLDER — add confirmed speakers
        ],
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
        theme: "Boost Camp USA",
        status: "upcoming",
        draft: true,
        speakers: [],
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
        id: "stockholm-2026",
        year: "2026",
        theme: "Boost Camp Stockholm",
        status: "upcoming",
        draft: true,
        speakers: [],
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
  const years = loc.events.map((e) => e.year).join(", ");
  const count = loc.events.length;
  return `${count} event${count === 1 ? "" : "s"} · ${years}`;
}

/* ──────────────────────────────────────────────────────────────
 *  Audience section defaults
 *
 *  Sales / Customer Excellence / Professional Services all consume
 *  the same shared section catalogue (see SLIDE_SECTIONS in
 *  `src/lib/slide-sections.ts` + the render list in
 *  `src/app/guide/GuideClient.tsx`). What differs per audience is
 *  *which sections are enabled by default* when the admin opens a
 *  fresh form, and *which sections are shown as toggles* at all.
 *
 *  Contract:
 *    - Section IDs here MUST exist in SLIDE_SECTIONS. Referencing
 *      a non-existent ID is a silent no-op at runtime — keep the
 *      lists honest.
 *    - Users can opt any hidden section in, or any default-enabled
 *      section out, via admin. Defaults are a starting point, not
 *      a restriction.
 *    - Additive-only. New sections get added to the per-audience
 *      lists in their respective PRs (PR 4+ will add Agenda,
 *      Performance, Success Plan, etc.).
 * ────────────────────────────────────────────────────────────── */

import type { Audience } from "@/lib/types";

/**
 * Sections enabled-by-default for Sales. Matches today's shipping
 * Sales flow exactly — no behavioural change when audience=sales.
 * `custom` stays off-by-default because it's the "Other" one-off.
 */
export const SALES_DEFAULTS: readonly string[] = [
  "hero",
  "orchestrator",
  "topics",
  "topic-implementation",
  "topic-integrations",
  "topic-security",
  "topic-ways-of-working",
  "platform-vision",
  "voice",
  "demo",
  "impact",
  "trust-validation",
  "case-studies",
  "community",
  "boost-camp",
  "commercial-offer",
  "roi",
  "scope-of-work",
  "next-steps",
];

/**
 * Sections enabled-by-default for Customer Excellence.
 *
 * Today's list uses only sections that already exist in
 * SLIDE_SECTIONS. New CE-specific sections (Agenda, Performance,
 * Success Plan, Top Recommendations, Benchmarking, Agent SWOT,
 * UAT Status, Agentic Before/After, Governance) land in PR 4+ and
 * will be added here as they ship.
 *
 * Omitted relative to Sales: voice + demo (CE doesn't pitch them
 * to existing customers); commercial-offer / roi / scope-of-work
 * (CE is rarely the commercial owner post-sale — they're on for
 * expansion conversations, off by default); topic-implementation
 * (lifecycle concern covered by the Success Plan section later).
 */
export const CE_DEFAULTS: readonly string[] = [
  "agenda",
  "performance",
  "benchmarking",
  "agentic-before-after",
  "agent-swot",
  "uat-status",
  "orchestrator",
  "topic-integrations",
  "topic-ways-of-working",
  "platform-vision",
  "impact",
  "trust-validation",
  "case-studies",
  "community",
  "boost-camp",
  "success-plan",
  "top-recommendations",
  "governance",
  "next-steps",
];

/**
 * Sections enabled-by-default for Professional Services.
 *
 * PS surface is deferred to a later phase — this stub is defensive
 * so `/admin?audience=professional-services` doesn't blow up today.
 * Architecture / implementation / security topics approximate what
 * a PS reader would care about most until the real PS section set
 * lands.
 */
export const PS_DEFAULTS: readonly string[] = [
  "orchestrator",
  "topics",
  "topic-implementation",
  "topic-integrations",
  "topic-security",
  "topic-ways-of-working",
  "platform-vision",
  "next-steps",
];

/** Per-audience default-enabled section IDs. */
export const AUDIENCE_DEFAULTS: Record<Audience, readonly string[]> = {
  "sales": SALES_DEFAULTS,
  "customer-excellence": CE_DEFAULTS,
  "professional-services": PS_DEFAULTS,
};

/**
 * Is this section enabled-by-default for the given audience?
 * Accepts `undefined` audience (= no audience param in URL) and
 * falls back to the SLIDE_SECTIONS `defaultEnabled` flag so bare
 * `/admin` continues to work exactly as before.
 */
export function isDefaultForAudience(
  sectionId: string,
  audience: Audience | undefined,
  fallback: boolean,
): boolean {
  if (!audience) return fallback;
  return AUDIENCE_DEFAULTS[audience].includes(sectionId);
}

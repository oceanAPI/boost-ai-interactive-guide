/**
 * Builds the FeedbackMeta snapshot captured when a user opens the
 * feedback modal via a contextual trigger (section pill or global
 * shortcut).
 *
 * The URL is the reproducer: this app encodes guide state into the URL,
 * so one click on a stored meta.url restores the exact scene the
 * reporter was looking at.
 *
 * Client-only — touches window/navigator. Do not import into SSR paths.
 */

import type { FeedbackMeta } from "./feedback-backlog";

const GUIDE_STATE_MAX_CHARS = 4096;
/**
 * Upper bound on how many sections we'll report as "in view" even if
 * more qualify. Keeps the payload bounded on very tall viewports.
 */
const MAX_SECTIONS_IN_VIEW = 5;

function detectRoute(pathname: string): FeedbackMeta["route"] {
  if (pathname.includes("/admin")) return "Admin";
  if (pathname.includes("/slides")) return "Slideshow";
  if (pathname.includes("/guide")) return "Guide";
  return "Other";
}

/**
 * Identify which section the user is actually engaged with at trigger
 * time. Priority, highest-confidence first:
 *
 *   1. Cursor position — whichever `main div[id]` is currently under
 *      the mouse (via the :hover pseudo-class, which stays stable when
 *      a keyboard shortcut fires).
 *   2. Keyboard focus — if `document.activeElement` is inside a
 *      `main div[id]`, that section is where the user's attention is.
 *   3. Viewport overlap — synchronous walk ranking sections by how
 *      much of the viewport they cover. Only used when neither hover
 *      nor focus yields a section (e.g. trigger fired while the
 *      pointer was off-window).
 *
 * Returns:
 *   - nearestSection: the single most-likely section id, undefined if
 *     the page has no section anchors at all
 *   - sectionsInView: all viewport-overlapping sections ordered by
 *     overlap size (most first), capped at MAX_SECTIONS_IN_VIEW —
 *     always computed so reviewers can see what else was visible
 *     regardless of which signal chose nearestSection
 *   - nearestSectionSource: which signal was used — "hover" / "focus"
 *     / "viewport". Lets the UI differentiate high-confidence
 *     (hover/focus) from inferred (viewport).
 *
 * Only considers direct children of <main> with an `id` attribute —
 * matches the wrapping pattern used in GuideClient.tsx so we don't pick
 * up incidental `id`s from headers, nav, etc.
 */
function detectSectionsInView(): {
  nearestSection?: string;
  sectionsInView?: string[];
  nearestSectionSource?: FeedbackMeta["nearestSectionSource"];
} {
  const main = document.querySelector("main");
  if (!main) return {};

  const candidates = main.querySelectorAll<HTMLElement>("div[id]");
  if (candidates.length === 0) return {};

  // Always compute viewport overlap — used for sectionsInView regardless
  // of which signal picks nearestSection, and serves as the final
  // fallback.
  const viewportBottom = window.innerHeight;
  const overlaps: Array<{ id: string; overlap: number }> = [];
  for (const el of candidates) {
    if (!el.id) continue;
    const rect = el.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, viewportBottom);
    const overlap = bottom - top;
    if (overlap > 0) overlaps.push({ id: el.id, overlap });
  }
  overlaps.sort((a, b) => b.overlap - a.overlap);
  const sectionsInView = overlaps.slice(0, MAX_SECTIONS_IN_VIEW).map((o) => o.id);

  // 1. Hover — cursor position is the strongest signal.
  // `main div[id]:hover` may match multiple ancestors; the deepest one
  // (last in document order under a given root) is the innermost
  // section the cursor is directly over.
  const hovered = Array.from(main.querySelectorAll<HTMLElement>("div[id]:hover"));
  if (hovered.length > 0) {
    const innermost = hovered[hovered.length - 1];
    return {
      nearestSection: innermost.id,
      sectionsInView,
      nearestSectionSource: "hover",
    };
  }

  // 2. Keyboard focus — if the user is tabbing, activeElement is inside
  // a section. Note: `document.activeElement` is usually the element
  // that held focus BEFORE the shortcut modal opens, which is what we
  // want here (the component in the tree the user was interacting with).
  const focused = document.activeElement as HTMLElement | null;
  if (focused && focused !== document.body) {
    const ancestor = focused.closest<HTMLElement>("main div[id]");
    if (ancestor?.id) {
      return {
        nearestSection: ancestor.id,
        sectionsInView,
        nearestSectionSource: "focus",
      };
    }
  }

  // 3. Fallback — no pointer or focus signal. Infer from viewport
  // overlap. This is the weakest signal because "most pixels on screen"
  // ≠ "what the user is looking at".
  if (sectionsInView.length > 0) {
    return {
      nearestSection: sectionsInView[0],
      sectionsInView,
      nearestSectionSource: "viewport",
    };
  }

  return {};
}

function decodeGuideState(dataParam: string | undefined): unknown {
  if (!dataParam) return undefined;
  try {
    // Admin page encodes with base64url. atob needs standard base64,
    // so reverse the URL-safe substitutions before decoding.
    const normalized = dataParam.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const decoded = JSON.parse(json);
    const serialized = JSON.stringify(decoded);
    if (serialized.length > GUIDE_STATE_MAX_CHARS) {
      return { _truncated: true, preview: serialized.slice(0, GUIDE_STATE_MAX_CHARS) };
    }
    return decoded;
  } catch {
    return undefined;
  }
}

export function captureMeta(): FeedbackMeta {
  const url = window.location.href;
  const pathname = window.location.pathname;
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  const route = detectRoute(pathname);

  let guideState: unknown;
  if (route === "Guide" && typeof params.data === "string") {
    guideState = decodeGuideState(params.data);
  }

  const { nearestSection, sectionsInView, nearestSectionSource } = detectSectionsInView();

  return {
    url,
    pathname,
    route,
    params,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent,
    guideState,
    scroll: { x: window.scrollX, y: window.scrollY },
    nearestSection,
    sectionsInView,
    nearestSectionSource,
    capturedAt: Date.now(),
  };
}

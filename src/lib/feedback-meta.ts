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

import type { FeedbackMeta, HoveredElement } from "./feedback-backlog";

const GUIDE_STATE_MAX_CHARS = 4096;
/**
 * Upper bound on how many sections we'll report as "in view" even if
 * more qualify. Keeps the payload bounded on very tall viewports.
 */
const MAX_SECTIONS_IN_VIEW = 5;

const TEXT_SNIPPET_MAX = 80;
const CLASS_SNIPPET_MAX = 100;

/**
 * Cursor position tracker. Updated passively on every `pointermove` so
 * `captureMeta()` can attach viewport-relative coordinates to the
 * report. Passive listener + a single mutable object: zero work beyond
 * writing two numbers per mousemove, no preventDefault, no rAF.
 *
 * `hasPosition` stays false until the pointer has actually moved over
 * the page at least once; lets us distinguish "cursor at (0,0)" from
 * "cursor position unknown."
 */
const cursorTracker: { x: number; y: number; hasPosition: boolean } = {
  x: 0,
  y: 0,
  hasPosition: false,
};

if (typeof window !== "undefined") {
  const onPointerMove = (e: PointerEvent) => {
    cursorTracker.x = e.clientX;
    cursorTracker.y = e.clientY;
    cursorTracker.hasPosition = true;
  };
  // Track on both pointer and mouse — covers touch-initiated hover on
  // hybrid devices that don't fire pointermove.
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", () => {
    cursorTracker.hasPosition = false;
  }, { passive: true });
}

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

/**
 * Serialize an element into a minimal fingerprint for the reviewer.
 * Skips the feedback pill and anything inside the modal so our own
 * chrome never masquerades as the user's target.
 */
function serializeElement(el: HTMLElement): HoveredElement | undefined {
  if (el.classList.contains("feedback-pill")) return undefined;
  if (el.closest('[role="dialog"]')) return undefined;

  const rect = el.getBoundingClientRect();
  const result: HoveredElement = { tag: el.tagName };
  if (el.id) result.id = el.id;
  if (typeof el.className === "string" && el.className) {
    result.classes = el.className.slice(0, CLASS_SNIPPET_MAX);
  }
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  if (text) result.text = text.slice(0, TEXT_SNIPPET_MAX);
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) result.ariaLabel = ariaLabel.slice(0, TEXT_SNIPPET_MAX);
  const testId = el.getAttribute("data-testid");
  if (testId) result.dataTestId = testId.slice(0, TEXT_SNIPPET_MAX);
  const role = el.getAttribute("role");
  if (role) result.role = role;
  result.rect = {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.width),
    h: Math.round(rect.height),
  };
  return result;
}

/**
 * Identify the element the cursor is over. Two signals, in order:
 *
 *   1. `:hover` pseudo-class chain — what the browser says is currently
 *      hovered. Most accurate when it's populated (cursor is physically
 *      over the page).
 *   2. `elementFromPoint(cursor.x, cursor.y)` — resolves from the last
 *      known cursor position. Covers cases where `:hover` is empty (JS-
 *      dispatched events in tests, focus recently moved off the page,
 *      touch devices).
 *
 * Zero listeners on this call path — the one pointermove listener that
 * feeds `cursorTracker` is already in place and is `passive: true`.
 */
function captureHoveredElement(): HoveredElement | undefined {
  if (typeof document === "undefined") return undefined;

  // 1. :hover chain — deepest-first walk.
  const hovered = document.querySelectorAll<HTMLElement>(":hover");
  for (let i = hovered.length - 1; i >= 0; i--) {
    const serialized = serializeElement(hovered[i]);
    if (serialized) return serialized;
  }

  // 2. Fallback: resolve from last known cursor coordinates.
  if (cursorTracker.hasPosition) {
    const el = document.elementFromPoint(cursorTracker.x, cursorTracker.y) as HTMLElement | null;
    if (el) {
      // Walk up until we find an element that isn't our chrome.
      let cursor: HTMLElement | null = el;
      while (cursor) {
        const serialized = serializeElement(cursor);
        if (serialized) return serialized;
        cursor = cursor.parentElement;
      }
    }
  }

  return undefined;
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
  const hoveredElement = captureHoveredElement();
  const cursor = cursorTracker.hasPosition
    ? { x: cursorTracker.x, y: cursorTracker.y }
    : undefined;

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
    hoveredElement,
    cursor,
    capturedAt: Date.now(),
  };
}

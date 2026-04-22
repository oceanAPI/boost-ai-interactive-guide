"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  addFeedback,
  FEEDBACK_LABELS,
  getFeedback,
  isShared,
  removeFeedback,
  type FeedbackEntry,
  type FeedbackLabel,
} from "@/lib/feedback-backlog";
import { captureMeta, captureMetaAtPoint } from "@/lib/feedback-meta";
import {
  FeedbackTriggerContext,
  type FeedbackTriggerValue,
  type PendingContext,
} from "@/hooks/useFeedbackTrigger";
import { assetPath } from "@/lib/asset-path";
import { getSlideshow, subscribeSlideshow } from "@/lib/slideshow-bridge";

/** Stable getServerSnapshot for the slideshow bridge. Hoisted here
 *  rather than declared inline inside PinDropOverlay so it keeps the
 *  same identity across renders — useSyncExternalStore requires stable
 *  function references, and an inline `() => null` flunks the check
 *  in Next.js 16 dev mode. */
const getServerSnapshotForSlideshow = (): ReturnType<typeof getSlideshow> => null;

/* ─── Label palette ─────────────────────────────────────────────
 *  Small colored dot + uppercase tracked text, matching the modal's
 *  header grammar (see `FEED ME LOG` caption above). Active state adds
 *  a subtle tinted chip background; inactive is transparent with a
 *  muted dot + muted text.
 */
// Labels all share one palette to stay cohesive with the rest of the UI:
// boost-purple for the active chip, boost-green-light for the dot.
// No per-label rainbow tints — the label name itself is the signal.
const LABEL_META: Record<FeedbackLabel, { name: string }> = {
  bug: { name: "Bug" },
  information: { name: "Information" },
  visual: { name: "Visual" },
  idea: { name: "Idea" },
};

// Active chip: solid purple box, white text, green-light dot.
// One shared identity — the label name itself is the signal.
const LABEL_CHIP_ACTIVE = "bg-boost-purple text-white";
const LABEL_CHIP_DOT_ACTIVE = "bg-boost-green-light";
const LABEL_ENTRY_ACCENT = "border-boost-purple/50";

function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) return url;
  return url.slice(0, max) + "…";
}

/** Shared sessionStorage key with SearchLogPanel — unlock once, read both. */
const ADMIN_PASSWORD_KEY = "boost.ai:admin-password";

/* ─── Pac-Man icon ─── */
function PacManSvg({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/images/pac-man.svg")}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ filter: "brightness(0) invert(1)" }}
    />
  );
}

/* ─── Targeting overlay ─────────────────────────────────
 * Shown while the user is in "aim then click" mode. A small green
 * reticle follows the cursor; the native cursor is hidden. The next
 * click anywhere on the page is intercepted (capture phase,
 * preventDefault + stopImmediatePropagation) so underlying buttons
 * don't fire — and resolved to a precise click target via
 * document.elementFromPoint at that coordinate.
 *
 * Instruction chip at the top explains the controls. `Esc` cancels
 * without submitting.
 */
function TargetingOverlay({
  active,
  onComplete,
  onCancel,
  cursorRef,
}: {
  active: boolean;
  onComplete: (x: number, y: number) => void;
  onCancel: () => void;
  /** Optional to stay HMR-safe: during a hot update the overlay may
   *  remount one render ahead of the provider passing the ref. */
  cursorRef?: React.RefObject<{ x: number; y: number; fresh: boolean }>;
}) {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const positionedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      positionedRef.current = false;
      return;
    }

    // Hide the native cursor while aiming — only the green dot is visible.
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    const moveDot = (x: number, y: number) => {
      const dot = dotRef.current;
      if (!dot) return;
      // translate(-50%, -50%) centers the 16px reticle exactly on the
      // cursor so the hit point visually matches the click point.
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (!positionedRef.current) {
        dot.style.opacity = "1";
        positionedRef.current = true;
      }
    };

    // Seed the reticle from the global cursor tracker so it appears
    // immediately at the current cursor position when ⌘+. fires —
    // instead of waiting for the user's first mousemove after activation
    // (which left them staring at an invisible reticle if they were
    // idle). `fresh` guards against the pre-first-move 0,0 default.
    const seed = cursorRef?.current;
    if (seed && seed.fresh) {
      moveDot(seed.x, seed.y);
    }

    const onPointerMove = (e: PointerEvent) => moveDot(e.clientX, e.clientY);

    // Intercept the very first click and convert it into a target-
    // selection event. Capture-phase so we beat any delegate handlers,
    // stopImmediatePropagation so sibling capture listeners on window
    // don't also see it, preventDefault so default actions (submit,
    // navigation, focus) don't fire.
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      onComplete(e.clientX, e.clientY);
    };
    // Also block pointerdown so :active styles + focus don't briefly
    // flash on underlying buttons before click fires.
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("click", onClick, { capture: true });
    window.addEventListener("keydown", onKey, { capture: true });

    return () => {
      document.body.style.cursor = prevCursor;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as EventListenerOptions);
      window.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
      window.removeEventListener("keydown", onKey, { capture: true } as EventListenerOptions);
    };
  }, [active, onComplete, onCancel, cursorRef]);

  if (!active) return null;

  return (
    <>
      {/* Left-edge mode indicator — a slim full-height green strip
          plus a tiny corner hint pill. Shape chosen for two reasons:
          (1) right edge already hosts the pin-drop sidebar, so
          separating affordances across opposite edges prevents any
          collision; (2) a thin edge strip never overlaps content
          regardless of scroll / route / banner height. The corner
          pill carries the keyboard hint without eating real estate. */}
      <div
        aria-live="polite"
        className="fixed inset-y-0 left-0 z-[200] pointer-events-none flex items-start"
      >
        <span
          aria-hidden="true"
          className="w-[3px] h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(32,130,105,0.95) 0%, rgba(54,181,149,1) 100%)",
            boxShadow: "0 0 12px rgba(54,181,149,0.45)",
          }}
        />
        {/* Corner pill — pushed to mt-32 so it clears both the /admin
            work-mode banner and the sticky admin header regardless of
            which route we're in. On routes without a banner or header
            the pill just sits a little further down; never fights
            anything. */}
        <span className="inline-flex items-center gap-2 ml-2 mt-32 px-2.5 py-1 rounded-md bg-white shadow-md border border-boost-green-light/40 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green">
          <span className="w-1 h-1 rounded-full bg-boost-green-light animate-pulse" />
          Aim &amp; click
          <span className="text-boost-muted/50">·</span>
          <span className="text-boost-muted">Esc</span>
        </span>
      </div>

      {/* Pac-Man reticle — follows the cursor via transform. Fixed
          position, pointer-events: none so elementFromPoint resolves to
          the underlying target at click time. Opacity starts at 0 and
          fades in on first pointermove so it doesn't flash at (0,0)
          before the cursor moves. */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[201] pointer-events-none"
        style={{
          width: "22px",
          height: "22px",
          opacity: 0,
          transition: "opacity 120ms ease-out",
        }}
      >
        {/* Outer pulsing halo — boost-green-light at low opacity so it
            reads as a directional cue without dominating the glyph. */}
        <span
          className="absolute inset-[-7px] rounded-full border-2 animate-ping"
          style={{
            borderColor: "#36b595",
            opacity: 0.45,
          }}
        />
        {/* Pac-Man body — the brand SVG, masked to boost-green-light so
            it inherits the admin + Feed-me-log visual vocabulary. A soft
            white outer glow keeps it legible over dark or busy hero
            backgrounds. */}
        <span
          className="absolute inset-0"
          style={{
            backgroundColor: "#36b595",
            WebkitMaskImage: `url(${assetPath("/images/pac-man.svg")})`,
            maskImage: `url(${assetPath("/images/pac-man.svg")})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            filter: "drop-shadow(0 0 2px rgba(255,255,255,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
          }}
        />
      </div>
    </>
  );
}

/* ─── Pin-drop overlay (purple Pac-Man walkthrough mode) ─────
 * Entered via the Left+Right Arrow chord in FeedbackProvider.
 * A purple Pac-Man reticle follows the cursor. Up drops a pin +
 * autofocused inline input. Enter commits the note (pin stays
 * dimmed on page). Down sends every commited note as a separate
 * feedback entry (label="information"). Esc discards everything.
 *
 * Use case: live presentation walkthrough — the presenter or
 * customer spots something worth noting, drops a purple pin with
 * a short note, continues, then flushes all notes at the end.
 */
interface PinDraft {
  id: string;
  /** Viewport-relative cursor coords at drop time (used for meta capture). */
  x: number;
  y: number;
  /** Document-relative coords — pinned to page content so pins scroll with
   *  the section they were dropped on instead of floating over the viewport. */
  pageX: number;
  pageY: number;
  text: string;
  meta: import("@/lib/feedback-backlog").FeedbackMeta | null;
  /** Slide index at drop time. Only present when the pin was dropped
   *  inside SlideshowClient (i.e. while the slideshow-bridge snapshot
   *  was live). Undefined means guide-mode / scroll-positioned pin. */
  slideIndex?: number;
}

function PinDropOverlay({
  active,
  onComplete,
  onCancel,
  cursorRef,
}: {
  active: boolean;
  onComplete: (pins: PinDraft[]) => void;
  onCancel: () => void;
  /** Optional to stay HMR-safe: during a hot update the overlay may
   *  remount one render ahead of the provider passing the ref. */
  cursorRef?: React.RefObject<{ x: number; y: number; fresh: boolean }>;
}) {
  const [pins, setPins] = useState<PinDraft[]>([]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const pinsRef = useRef(pins);
  const activeInputIdRef = useRef(activeInputId);
  pinsRef.current = pins;
  activeInputIdRef.current = activeInputId;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Focus the input whenever a new pin becomes active.
  useEffect(() => {
    if (activeInputId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeInputId]);

  useEffect(() => {
    if (!active) {
      setPins([]);
      setActiveInputId(null);
      return;
    }

    const dropPin = () => {
      const ref = cursorRef?.current;
      if (!ref || !ref.fresh) return; // Cursor hasn't moved since page load.
      const { x, y } = ref;
      const id = `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      let meta: PinDraft["meta"] = null;
      try {
        meta = captureMetaAtPoint(x, y);
      } catch {
        meta = null;
      }
      // Translate viewport coords → document coords so the pin stays
      // anchored to the page content when the user scrolls.
      const pageX = x + window.scrollX;
      const pageY = y + window.scrollY;
      // If SlideshowClient is live, stamp the current slide index on
      // the pin so the rail can place its tick at the right slide
      // position (rather than at a document-Y ratio).
      const slideSnapshot = getSlideshow();
      const slideIndex = slideSnapshot?.currentIndex;
      setPins((prev) => [...prev, { id, x, y, pageX, pageY, text: "", meta, slideIndex }]);
      setActiveInputId(id);
    };

    // Mode just activated — open the comment field immediately at the
    // current cursor. The Pac-Man reticle is intentionally absent here;
    // Pac-Man is the ⌘+. funnel, not the pin-drop affordance.
    dropPin();

    const onKey = (e: KeyboardEvent) => {
      // When a textarea is focused (the inline note input), let its own
      // keydown handler drive Enter / Esc. We only care about the raw
      // walkthrough shortcuts at the document level here.
      const el = document.activeElement as HTMLElement | null;
      const inInput = !!el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT" || el.isContentEditable);
      if (inInput) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          dropPin();
          break;
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          // Flush every pin with non-empty text — caller iterates and
          // calls addFeedback once per pin.
          onComplete(pinsRef.current.filter((p) => p.text.trim().length > 0));
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onCancel();
          break;
        case "ArrowLeft":
        case "ArrowRight":
          // Suppress page scroll while in mode — user is holding / tapping
          // arrows as part of the chord re-entry attempt or just noise.
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey, { capture: true } as EventListenerOptions);
    };
  }, [active, onComplete, onCancel, cursorRef]);

  const activePin = pins.find((p) => p.id === activeInputId) ?? null;
  const noteCount = pins.filter((p) => p.text.trim().length > 0).length;

  /* ─── Right-rail state (scroll-position indicator + pin ticks) ───
   * The rail replaces the simple 3px purple strip AND the on-page
   * speech-bubble pin icons. It needs:
   *   - A slideshow snapshot (null in guide mode, present on /slides)
   *   - Document-height + scrollY tracking so the position segment
   *     and pin ticks can be placed at accurate Y-ratios
   *   - A `recall` marker (pageX, pageY, key) that drives the
   *     visual-recall flash when a pin tick is clicked. Re-keyed on
   *     every trigger so the animation restarts.
   */
  const slideshow = useSyncExternalStore(
    subscribeSlideshow,
    getSlideshow,
    getServerSnapshotForSlideshow,
  );
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    docHeight: 1,
    innerHeight: 1,
  });
  useEffect(() => {
    if (!active) return;
    const update = () => {
      setScrollState({
        scrollY: window.scrollY,
        docHeight: Math.max(1, document.documentElement.scrollHeight),
        innerHeight: Math.max(1, window.innerHeight),
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);
  /* ─── Rail-tick placement with bucket spread ───
   * Stacking bug-fix: multiple pins dropped in the same slide (or
   * within ~30px on the same scrollable page) used to collapse onto
   * identical topPct values, so only the last one was clickable.
   * Here we bucket pins by shared position and spread them evenly
   * within each bucket — every pin gets its own tick, every tick
   * stays visually attached to the section it belongs to.
   */
  const pinTicks = useMemo(() => {
    const pinsToRender = pins.filter((p) => p.id !== activeInputId);
    // Bucket key identifies pins that should stack together.
    const bucketKeyOf = (p: PinDraft): string => {
      if (slideshow && slideshow.total > 0) {
        return `slide:${typeof p.slideIndex === "number" ? p.slideIndex : -1}`;
      }
      return `scroll:${Math.floor(p.pageY / 30)}`;
    };
    const buckets = new Map<string, PinDraft[]>();
    for (const p of pinsToRender) {
      const key = bucketKeyOf(p);
      const existing = buckets.get(key);
      if (existing) existing.push(p);
      else buckets.set(key, [p]);
    }
    // Compute a unique topPct per pin.
    const result: Array<{ pin: PinDraft; topPct: number; stackCount: number; stackIndex: number }> = [];
    for (const bucketPins of buckets.values()) {
      const N = bucketPins.length;
      bucketPins.forEach((p, i) => {
        let topPct: number;
        if (slideshow && slideshow.total > 0) {
          const idx = typeof p.slideIndex === "number" ? p.slideIndex : 0;
          const slotStart = (idx / slideshow.total) * 100;
          const slotHeight = (1 / slideshow.total) * 100;
          // Even spread: each pin gets its own (i + 0.5)/N fraction of
          // the slide's slot. Single pin → centre. N pins → evenly
          // distributed across the slot.
          topPct = slotStart + ((i + 0.5) / N) * slotHeight;
        } else {
          const basePct =
            scrollState.docHeight > 0 ? (p.pageY / scrollState.docHeight) * 100 : 0;
          // Guide mode: pageY is usually distinct already, but pins
          // within the same 30px bucket get a small symmetric offset
          // around the base so they don't fully overlap.
          const offset = N > 1 ? (i - (N - 1) / 2) * 0.4 : 0;
          topPct = Math.max(0, Math.min(100, basePct + offset));
        }
        result.push({ pin: p, topPct, stackCount: N, stackIndex: i });
      });
    }
    return result;
  }, [pins, activeInputId, slideshow, scrollState.docHeight]);

  /** Scroll to / navigate to a pin, then re-open its inline editor at
   *  the original (pageX, pageY). The editor lets the reviewer EDIT
   *  (Enter commits) or DELETE (Esc in the field discards) the pin —
   *  same affordance the old on-page icon had. Replaces the earlier
   *  decorative recall-flash with something actionable. */
  const navigateToPin = useCallback(
    (pin: PinDraft) => {
      if (slideshow && typeof pin.slideIndex === "number") {
        slideshow.goToSlide(pin.slideIndex);
        // Wait for slide transition so the editor lands on the right
        // slide, not the previous one.
        setTimeout(() => setActiveInputId(pin.id), 520);
      } else {
        window.scrollTo({ top: Math.max(0, pin.pageY - 120), behavior: "smooth" });
        setTimeout(() => setActiveInputId(pin.id), 360);
      }
    },
    [slideshow],
  );

  // Speech-bubble mask — the "comment left here" marker. Pac-Man is
  // intentionally reserved for the ⌘+. funnel so the two modes stay
  // visually distinct.
  const flagMaskStyle = {
    WebkitMaskImage: `url(${assetPath("/icons/purple/speech.svg")})`,
    maskImage: `url(${assetPath("/icons/purple/speech.svg")})`,
    WebkitMaskSize: "contain" as const,
    maskSize: "contain" as const,
    WebkitMaskPosition: "center" as const,
    maskPosition: "center" as const,
    WebkitMaskRepeat: "no-repeat" as const,
    maskRepeat: "no-repeat" as const,
  };

  // Early-return AFTER all hooks have registered. Hooks must run on
  // every render (including renders when !active) to satisfy the
  // Rules of Hooks; only the render output is conditional.
  if (!active) return null;

  return (
    <>
      {/* Right rail — unified mini-map for the note-drop session.
          Replaces the old 3px mode-indicator strip AND the on-page
          speech-bubble pin icons with a single affordance:
            · 5px purple rail (same gradient as the old strip)
            · A brighter green segment showing current viewport
              position (guide) or current slide (slides)
            · Horizontal strike-ticks at each dropped pin, placed
              by pageY/docHeight ratio (guide) or slideIndex/total
              (slides). Click a tick to scroll-or-navigate to the
              pin + trigger the visual-recall flash.
            · "Note ready / N notes" corner pill stays as before.
          Wrapper is pointer-events-none; interactive children opt
          back in with `pointerEvents: auto` so clicks fall through
          empty rail regions. */}
      <div
        aria-live="polite"
        className="fixed inset-y-0 right-0 z-[200] flex items-start justify-end"
        style={{ pointerEvents: "none" }}
      >
        {/* Top-right corner pill — "Note ready" or "N notes" live count */}
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-2 mr-2 mt-32 px-2.5 py-1 rounded-md bg-white shadow-md border border-boost-purple/40 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-purple"
        >
          <span
            aria-hidden="true"
            className="w-3 h-3"
            style={{ backgroundColor: "#59195d", ...flagMaskStyle }}
          />
          {noteCount === 0 ? "Note ready" : `${noteCount} note${noteCount === 1 ? "" : "s"}`}
          <span className="text-boost-muted/50">·</span>
          <span className="text-boost-muted">&uarr; &darr; Esc</span>
        </span>

        {/* The rail itself — 10px wide (2× the prior 5px) so the
            position segment + pin ticks read as deliberate UI, not
            a seam. */}
        <div className="relative h-full flex-shrink-0" style={{ width: "10px" }}>
          {/* Base rail — same purple gradient as the prior thin strip */}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(89,25,93,0.95) 0%, rgba(69,17,73,1) 100%)",
              boxShadow: "0 0 12px rgba(89,25,93,0.45)",
            }}
          />

          {/* Position segment — brighter green block tracks current
              viewport (guide) or current slide (slides) */}
          {(() => {
            let topPct: number;
            let heightPct: number;
            if (slideshow && slideshow.total > 0) {
              topPct = (slideshow.currentIndex / slideshow.total) * 100;
              heightPct = (1 / slideshow.total) * 100;
            } else {
              const { scrollY, docHeight, innerHeight } = scrollState;
              const visible = Math.min(1, innerHeight / docHeight);
              topPct = Math.min(100, (scrollY / docHeight) * 100);
              heightPct = Math.max(4, visible * 100);
            }
            return (
              <span
                aria-hidden="true"
                className="absolute left-0 right-0"
                style={{
                  top: `${topPct}%`,
                  height: `${heightPct}%`,
                  background: "rgba(54,181,149,0.9)",
                  boxShadow: "0 0 8px rgba(54,181,149,0.55)",
                  transition: "top 180ms ease-out, height 180ms ease-out",
                }}
              />
            );
          })()}

          {/* Pin ticks — one per dropped pin (skipping the one whose
              inline editor is open). Positions come from `pinTicks`
              which spreads stacked pins within their shared bucket
              so every note gets a visible, clickable tick. Click
              re-opens the pin's inline editor at its original
              (pageX, pageY) — Enter commits edits, Esc in the field
              deletes. Tooltip via title attribute carries the full
              note text for longer previews. */}
          {pinTicks.map(({ pin: p, topPct }) => {
              const hasText = p.text.trim().length > 0;
              const label = hasText ? p.text : "Empty note";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigateToPin(p)}
                  aria-label={`Jump to note: ${label.slice(0, 80)}`}
                  title={label.slice(0, 200)}
                  className="absolute group focus-visible:outline-none"
                  style={{
                    top: `${topPct}%`,
                    right: 0,
                    width: "36px",
                    height: "22px",
                    transform: "translate(0, -50%)",
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    pointerEvents: "auto",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute transition-all"
                    style={{
                      top: "50%",
                      right: 0,
                      width: "28px",
                      height: "4px",
                      transform: "translateY(-50%)",
                      backgroundColor: hasText
                        ? "#36b595"
                        : "rgba(255,255,255,0.65)",
                      boxShadow: hasText
                        ? "0 0 8px rgba(54,181,149,0.7)"
                        : "none",
                      borderRadius: "1px",
                    }}
                  />
                  {/* Hover / focus affordance — thicker extension leftward */}
                  <span
                    aria-hidden="true"
                    className="absolute opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                    style={{
                      top: "50%",
                      right: 0,
                      width: "40px",
                      height: "6px",
                      transform: "translateY(-50%)",
                      backgroundColor: hasText ? "#36b595" : "#ffffff",
                      boxShadow: "0 0 12px rgba(54,181,149,0.85)",
                      borderRadius: "1px",
                    }}
                  />
                </button>
              );
            })}
        </div>
      </div>

      {/* Inline comment input for the currently-active pin. Absolute-
          positioned in document space so it stays attached to the pin
          even if the user scrolls. Offset 18px down-right so the input
          never overlaps the drop point. */}
      {activePin && (
        <div
          className="absolute z-[202]"
          style={{
            top: activePin.pageY + 18,
            left: activePin.pageX + 18,
          }}
        >
          <div className="flex items-start gap-2 p-2 rounded-lg bg-white shadow-xl border border-boost-border/70 animate-fade-in">
            <span
              aria-hidden="true"
              className="w-4 h-4 mt-1 flex-shrink-0"
              style={{ backgroundColor: "#59195d", ...flagMaskStyle }}
            />
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Note — Enter to save · Esc to discard"
              value={activePin.text}
              onChange={(e) => {
                const text = e.target.value;
                setPins((prev) =>
                  prev.map((p) => (p.id === activePin.id ? { ...p, text } : p)),
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Commit: if empty, discard this pin; otherwise keep it
                  // as a dimmed marker + clear the active-input flag so
                  // the reticle takes over again.
                  if (!activePin.text.trim()) {
                    setPins((prev) => prev.filter((p) => p.id !== activePin.id));
                  }
                  setActiveInputId(null);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  // Discard only this pin, stay in pin mode.
                  setPins((prev) => prev.filter((p) => p.id !== activePin.id));
                  setActiveInputId(null);
                }
              }}
              className="text-[12px] leading-snug text-boost-text placeholder:text-boost-muted outline-none resize-none bg-transparent"
              style={{ minWidth: "220px", maxWidth: "300px" }}
              autoFocus
            />
          </div>
        </div>
      )}

    </>
  );
}

/* ─── Pac-Man button ─── */
export function PacManFeedbackButton({
  onClick,
  ariaLabel = "Open feed me log",
}: {
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={ariaLabel}
      className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 bg-boost-green-light hover:scale-110 hover:bg-boost-green transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light/50"
    >
      <PacManSvg className="w-5 h-5" />
    </button>
  );
}

/* ─── Feedback modal ─── */
function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-filled context from the trigger (section pill / shortcut). Optional. */
  pending?: PendingContext;
}

export function FeedbackModal({ open, onClose, pending = {} }: FeedbackModalProps) {
  const shared = isShared();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<FeedbackLabel | undefined>(undefined);
  const [filterLabel, setFilterLabel] = useState<FeedbackLabel | "all">("all");
  const [showMetaJson, setShowMetaJson] = useState(false);
  /** Server-side time filter for the admin log read. "1d" / "7d" / "30d" / "all".
   *  Default "30d" keeps the admin panel fast even on a heavy log — matches
   *  Cloudflare's paid-tier capacity plan for a 200-person team. */
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "all">("30d");
  const [remoteTotal, setRemoteTotal] = useState<number | null>(null);
  const [remoteHasMore, setRemoteHasMore] = useState(false);
  /** Per-entry copy-as-JSON flash state: holds the id of the entry that was
   *  most recently copied so its button can briefly say "Copied!" */
  const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Restore admin password from sessionStorage (shared with search log panel)
  useEffect(() => {
    if (!shared) return;
    try {
      const saved = window.sessionStorage.getItem(ADMIN_PASSWORD_KEY);
      if (saved) setAdminPassword(saved);
    } catch {
      // ignore
    }
  }, [shared]);

  /** Translate the preset time range into an epoch-ms `since` value.
   *  "all" → undefined (no filter). */
  const sinceFor = (range: typeof timeRange): number | undefined => {
    const day = 86_400_000;
    switch (range) {
      case "1d":
        return Date.now() - day;
      case "7d":
        return Date.now() - 7 * day;
      case "30d":
        return Date.now() - 30 * day;
      case "all":
      default:
        return undefined;
    }
  };

  const refresh = useCallback(async () => {
    if (shared && !adminPassword) {
      setEntries([]);
      setRemoteTotal(null);
      setRemoteHasMore(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getFeedback(shared ? adminPassword : undefined, {
        since: sinceFor(timeRange),
      });
      setEntries(result.entries);
      setRemoteTotal(result.total ?? null);
      setRemoteHasMore(Boolean(result.hasMore));
    } finally {
      setLoading(false);
    }
  }, [adminPassword, shared, timeRange]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  // Seed label from pending context when the modal opens.
  // Reset local state on close so the next open starts clean.
  useEffect(() => {
    if (open) {
      setSelectedLabel(pending.label);
    } else {
      setSelectedLabel(undefined);
      setText("");
      setShowMetaJson(false);
    }
  }, [open, pending.label]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => textareaRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (showUnlock) {
      setTimeout(() => passwordInputRef.current?.focus(), 50);
    }
  }, [showUnlock]);

  const handleSubmit = async () => {
    if (submitting) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      // Re-capture meta at submit time if the modal is contextual but
      // the pending.meta is missing (e.g. opened from a stale trigger).
      // If pending.meta is present, respect it — it was captured when
      // the user actually hit the trigger, not now.
      const meta = pending.meta
        ? pending.meta
        : pending.sectionRef
          ? captureMeta()
          : undefined;

      const entry = await addFeedback(trimmed, {
        label: selectedLabel,
        sectionRef: pending.sectionRef,
        meta,
      });
      if (entry) {
        setText("");
        setSelectedLabel(undefined);
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRemove = async (id: string) => {
    await removeFeedback(id, shared ? adminPassword : undefined);
    await refresh();
  };

  /** Copy a single entry to the clipboard as pretty-printed JSON. The
   *  full entry (including meta with URL, nearestSection, hoveredElement,
   *  etc.) goes to the clipboard so it can be pasted into a bug-triage
   *  chat or imported into a database later. */
  const handleCopyEntry = async (entry: FeedbackEntry) => {
    try {
      const json = JSON.stringify(entry, null, 2);
      await navigator.clipboard.writeText(json);
      setCopiedEntryId(entry.id);
      setTimeout(() => {
        setCopiedEntryId((current) => (current === entry.id ? null : current));
      }, 1500);
    } catch {
      // Clipboard write can fail (permission denied, non-HTTPS on older
      // browsers). Silent — the entry is still visible in the modal.
    }
  };

  const handleUnlock = async () => {
    const pw = passwordInput.trim();
    if (!pw) return;
    setAdminPassword(pw);
    try {
      window.sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw);
    } catch {
      // ignore
    }
    setPasswordInput("");
    setShowUnlock(false);
  };

  const handleLock = () => {
    setAdminPassword("");
    setEntries([]);
    try {
      window.sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    } catch {
      // ignore
    }
  };

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.timestamp - a.timestamp),
    [entries],
  );
  const filtered = useMemo(
    () => (filterLabel === "all" ? sorted : sorted.filter((e) => e.label === filterLabel)),
    [sorted, filterLabel],
  );
  const locked = shared && !adminPassword;

  const hasContext = Boolean(pending.meta) || Boolean(pending.sectionRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8" role="presentation">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto focus:outline-none"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 sm:rounded-t-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(75,30,82,0.97) 0%, rgba(55,22,62,1) 100%)",
          }}
        >
          <div className="px-5 sm:px-7 pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-green-light">
                  <span className="inline-block">
                    <PacManSvg className="w-3.5 h-3.5" />
                  </span>
                  Feed me log
                  {shared && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50 bg-white/10 rounded px-1.5 py-0.5">
                      <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                      Shared
                    </span>
                  )}
                </p>
                <h3
                  id="feedback-modal-title"
                  className="mt-1.5 text-xl sm:text-2xl font-bold text-white leading-tight"
                >
                  Nom nom nom — feed me what to learn
                </h3>
                <p className="text-[12px] text-white/55 mt-1.5">
                  {shared
                    ? "Drop bugs, ideas, or polish notes. Anyone on the team can feed me — only the owner reads the log."
                    : "Feed me bugs, ideas, polish notes. Stored on this browser until the shared backend is wired."}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors flex-shrink-0 -mt-0.5"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Compose — always accessible, even when log is locked */}
        <div className="px-5 sm:px-7 py-5 border-b border-boost-border/60">
          {/* Label pills (single-select, optional) */}
          <div className="mb-3 flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em] mr-1">Label</span>
            {FEEDBACK_LABELS.map((lbl) => {
              const meta = LABEL_META[lbl];
              const active = selectedLabel === lbl;
              return (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setSelectedLabel(active ? undefined : lbl)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? LABEL_CHIP_ACTIVE
                      : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface/60"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? LABEL_CHIP_DOT_ACTIVE : "bg-boost-muted/40"}`} />
                  {meta.name}
                </button>
              );
            })}
          </div>

          {/* Log path — all reproducer context nested in a single disclosure.
              Summary line distills the most important identifiers (route,
              section, viewport); the open state shows the full breakdown
              plus the raw JSON for copy-paste into a GitHub issue. */}
          {hasContext && (() => {
            const nearestSrc = pending.meta?.nearestSectionSource;
            const isInferred = !pending.sectionRef && nearestSrc === "viewport";
            const displaySection =
              pending.sectionRef ||
              (pending.meta?.nearestSection ? `${isInferred ? "~" : ""}${pending.meta.nearestSection}` : null);
            const summaryBits = [
              pending.meta?.route,
              displaySection ? `§ ${displaySection}` : null,
              pending.meta?.viewport ? `${pending.meta.viewport.w}×${pending.meta.viewport.h}` : null,
            ].filter(Boolean);
            return (
              <details className="group mb-3 rounded-lg border border-boost-border/60 bg-boost-surface/20">
                <summary className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-boost-surface/40 rounded-lg transition-colors select-none list-none">
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-3 h-3 text-boost-muted transition-transform group-open:rotate-90"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em]">
                      Log path
                    </span>
                  </span>
                  <span className="text-[10px] text-boost-muted truncate tabular-nums">
                    {summaryBits.join(" · ")}
                  </span>
                </summary>
                <div className="px-3 pb-3 pt-1 space-y-2">
                  {/* Breakdown of the identifying signals */}
                  <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
                    {pending.meta?.route && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-boost-dark font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ring-boost-border">
                        {pending.meta.route}
                      </span>
                    )}
                    {pending.sectionRef && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-boost-green-light/15 text-boost-dark font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ring-boost-green-light/40">
                        § {pending.sectionRef}
                      </span>
                    )}
                    {!pending.sectionRef && pending.meta?.nearestSection && (() => {
                      const src = pending.meta.nearestSectionSource;
                      const inferred = src === "viewport";
                      const title = src === "hover"
                        ? "Cursor was over this section when the report was triggered"
                        : src === "focus"
                          ? "Keyboard focus was in this section when the report was triggered"
                          : "Inferred from viewport overlap — cursor wasn't over any section";
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold uppercase tracking-[0.14em] ${
                            inferred
                              ? "bg-boost-surface/60 text-boost-muted/80 italic ring-1 ring-inset ring-boost-border/60"
                              : "bg-white text-boost-dark ring-1 ring-inset ring-boost-border"
                          }`}
                          title={title}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {inferred && <span aria-hidden="true">~</span>}
                          {pending.meta.nearestSection}
                        </span>
                      );
                    })()}
                    {pending.meta?.viewport && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-boost-muted tabular-nums ring-1 ring-inset ring-boost-border">
                        {pending.meta.viewport.w}×{pending.meta.viewport.h}
                      </span>
                    )}
                  </div>

                  {/* URL — reproducer. The entire app state lives in query params, so
                      a single click restores the scene for the reviewer. */}
                  {pending.meta?.url && (
                    <div className="flex items-center gap-1.5 text-[10px] bg-white rounded-md px-2 py-1.5 ring-1 ring-inset ring-boost-border">
                      <span className="text-[9px] font-semibold text-boost-muted uppercase tracking-[0.14em] shrink-0">URL</span>
                      <span className="font-mono text-boost-dark/80 truncate flex-1">{truncateUrl(pending.meta.url, 80)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          try { navigator.clipboard?.writeText(pending.meta!.url); } catch { /* ignore */ }
                        }}
                        className="text-boost-muted hover:text-boost-dark transition-colors shrink-0"
                        title="Copy URL"
                        aria-label="Copy reproducer URL"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Element — the specific thing the cursor was on. Gives
                      reviewers pixel-level "where" to complement the section-
                      level "what". Read from the :hover chain at capture time
                      (no listeners, no latency). */}
                  {pending.meta?.hoveredElement && (() => {
                    const el = pending.meta.hoveredElement;
                    const primary = el.ariaLabel || el.text || el.dataTestId || el.id || "";
                    return (
                      <div className="flex items-start gap-1.5 text-[10px] bg-white rounded-md px-2 py-1.5 ring-1 ring-inset ring-boost-border">
                        <span className="text-[9px] font-semibold text-boost-muted uppercase tracking-[0.14em] shrink-0 mt-0.5">Element</span>
                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                          <code className="font-mono text-[10px] text-boost-dark bg-boost-surface/80 px-1.5 py-0.5 rounded">
                            {el.tag.toLowerCase()}
                            {el.id && <span className="text-boost-muted">#{el.id}</span>}
                          </code>
                          {primary && (
                            <span className="text-boost-dark/80 italic truncate max-w-[22rem]">
                              “{primary}”
                            </span>
                          )}
                          {el.role && (
                            <span className="text-[9px] text-boost-muted uppercase tracking-[0.14em]">
                              role={el.role}
                            </span>
                          )}
                          {el.dataTestId && el.dataTestId !== primary && (
                            <span className="text-[9px] text-boost-muted">
                              testid={el.dataTestId}
                            </span>
                          )}
                          {el.rect && (
                            <span className="text-[9px] text-boost-muted tabular-nums">
                              {el.rect.w}×{el.rect.h} @ ({el.rect.x},{el.rect.y})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Full JSON — for reviewers who need more than the summary chips. */}
                  {pending.meta && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowMetaJson((v) => !v)}
                        className="inline-flex items-center gap-1 text-[10px] text-boost-muted hover:text-boost-dark transition-colors font-semibold uppercase tracking-[0.14em]"
                        aria-expanded={showMetaJson}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showMetaJson ? "rotate-90" : ""}`}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                        Raw meta
                      </button>
                      {showMetaJson && (
                        <pre className="mt-1.5 max-h-40 overflow-auto bg-white rounded p-2 text-[10px] text-boost-muted font-mono whitespace-pre-wrap break-all ring-1 ring-inset ring-boost-border">
                          {JSON.stringify(pending.meta, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </details>
            );
          })()}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasContext ? "What went wrong? (optional)" : "What should we fix or try next?"}
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-muted/70 focus:outline-none focus:border-boost-muted/50 transition-colors text-[13px] leading-relaxed resize-none"
          />
          <div className="mt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-boost-green-light text-white hover:bg-boost-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Feeding…" : "Feed me"}
            </button>
          </div>
        </div>

        {/* Log view — locked by default in shared mode */}
        <div className="px-5 sm:px-7 py-5">
          {locked && !showUnlock ? (
            <div className="text-center py-6">
              <p className="text-[13px] text-boost-muted mb-3">
                Log is private to the owner.
              </p>
              <button
                type="button"
                onClick={() => setShowUnlock(true)}
                className="text-[11px] font-semibold text-boost-dark hover:text-boost-green transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Unlock with admin password
              </button>
            </div>
          ) : locked && showUnlock ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUnlock();
              }}
              className="max-w-sm mx-auto py-3"
            >
              <input
                ref={passwordInputRef}
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Admin password"
                className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-muted/70 focus:outline-none focus:border-boost-dark/40 text-sm"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!passwordInput.trim()}
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-boost-dark text-white hover:bg-boost-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlock(false);
                    setPasswordInput("");
                  }}
                  className="px-3 py-2 text-sm font-semibold rounded-lg text-boost-muted hover:text-boost-dark hover:bg-boost-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-boost-muted/60 mt-2 text-center">
                Stored in this tab's sessionStorage. Close the tab to clear.
              </p>
            </form>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[10px] font-bold text-boost-muted uppercase tracking-widest">
                  {loading
                    ? "Loading…"
                    : entries.length > 0
                      ? `${filtered.length} of ${entries.length} entr${entries.length === 1 ? "y" : "ies"}`
                      : "No entries yet"}
                </p>
                {shared && adminPassword && (
                  <button
                    type="button"
                    onClick={handleLock}
                    className="text-[10px] font-semibold text-boost-muted hover:text-boost-dark transition-colors"
                  >
                    Lock
                  </button>
                )}
              </div>

              {/* Time range — server-side filter when shared, client-side
                  on the local mirror otherwise. Keeps the admin read
                  fast even when the log has thousands of entries.
                  Shown whenever the log is unlocked and has anything to
                  filter; total/hasMore readout only shows in shared mode. */}
              {entries.length > 0 && (
                <div className="mb-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em] mr-1">
                    Range
                  </span>
                  {([
                    { key: "1d" as const, label: "Today" },
                    { key: "7d" as const, label: "7d" },
                    { key: "30d" as const, label: "30d" },
                    { key: "all" as const, label: "All time" },
                  ]).map((r) => {
                    const active = timeRange === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setTimeRange(r.key)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? "bg-boost-dark text-white"
                            : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface/60"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                  {remoteTotal !== null && (
                    <span className="ml-auto text-[10px] text-boost-muted/80 tabular-nums">
                      {entries.length} shown · {remoteTotal} total
                      {remoteHasMore && (
                        <span className="ml-1 text-boost-muted/70">(more in window)</span>
                      )}
                    </span>
                  )}
                </div>
              )}

              {/* Label filter */}
              {entries.length > 0 && (
                <div className="mb-3 flex items-center flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterLabel("all")}
                    aria-pressed={filterLabel === "all"}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                      filterLabel === "all"
                        ? "bg-boost-dark text-white"
                        : "bg-boost-surface/60 text-boost-muted hover:text-boost-dark"
                    }`}
                  >
                    All
                  </button>
                  {FEEDBACK_LABELS.map((lbl) => {
                    const meta = LABEL_META[lbl];
                    const active = filterLabel === lbl;
                    const count = sorted.filter((e) => e.label === lbl).length;
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setFilterLabel(active ? "all" : lbl)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? LABEL_CHIP_ACTIVE
                            : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface/60"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? LABEL_CHIP_DOT_ACTIVE : "bg-boost-muted/40"}`} />
                        {meta.name}
                        {count > 0 && <span className="tabular-nums opacity-70">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2.5">
                {filtered.map((e) => {
                  const labelMeta = e.label ? LABEL_META[e.label] : undefined;
                  return (
                    <div
                      key={e.id}
                      className={`group flex items-start gap-3 py-2.5 px-3 rounded-lg bg-boost-surface/50 border-l-2 ${
                        labelMeta ? LABEL_ENTRY_ACCENT : "border-boost-green-light/40"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-boost-dark leading-relaxed whitespace-pre-wrap">
                          {e.text}
                        </p>
                        {(e.label || e.sectionRef || e.meta) && (
                          <div className="mt-1.5 flex items-center flex-wrap gap-1.5 text-[10px]">
                            {labelMeta && (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md uppercase tracking-[0.12em] ${LABEL_CHIP_ACTIVE} font-semibold`}>
                                <span className={`w-1 h-1 rounded-full ${LABEL_CHIP_DOT_ACTIVE}`} />
                                {labelMeta.name}
                              </span>
                            )}
                            {e.sectionRef && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-boost-green-light/15 text-boost-dark font-semibold">
                                § {e.sectionRef}
                              </span>
                            )}
                            {!e.sectionRef && e.meta?.nearestSection && (() => {
                              const src = e.meta.nearestSectionSource;
                              const isInferred = src === "viewport" || !src;
                              const title = src === "hover"
                                ? "Cursor was over this section"
                                : src === "focus"
                                  ? "Keyboard focus was in this section"
                                  : "Inferred from viewport overlap";
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-semibold ${
                                    isInferred
                                      ? "bg-boost-surface/70 text-boost-muted italic"
                                      : "bg-boost-surface text-boost-dark"
                                  }`}
                                  title={title}
                                >
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  {isInferred && <span aria-hidden="true">~</span>}
                                  {e.meta.nearestSection}
                                </span>
                              );
                            })()}
                            {e.meta?.route && !e.sectionRef && !e.meta?.nearestSection && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-boost-surface text-boost-muted font-semibold uppercase tracking-widest">
                                {e.meta.route}
                              </span>
                            )}
                            {e.meta?.url && (
                              <a
                                href={e.meta.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-boost-dark/5 text-boost-dark hover:bg-boost-dark hover:text-white transition-colors font-semibold"
                                title="Open reproducer URL in new tab"
                              >
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                Reproduce
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-boost-muted tabular-nums shrink-0 mt-1">
                        {formatRelative(e.timestamp)}
                      </span>
                      <div className="flex items-start gap-1 shrink-0 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopyEntry(e)}
                          className={`transition-opacity ${
                            copiedEntryId === e.id
                              ? "opacity-100 text-boost-green"
                              : "opacity-0 group-hover:opacity-100 text-boost-muted/60 hover:text-boost-dark"
                          }`}
                          aria-label={copiedEntryId === e.id ? "Copied" : "Copy entry as JSON"}
                          title={copiedEntryId === e.id ? "Copied!" : "Copy entry as JSON"}
                        >
                          {copiedEntryId === e.id ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(e.id)}
                          className="opacity-0 group-hover:opacity-100 text-boost-muted/60 hover:text-boost-dark transition-opacity"
                          aria-label="Delete entry"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Global provider ─────────────────────────────────────
 * Owns the feedback modal state app-wide and hosts the
 * global keyboard shortcut (Cmd/Ctrl+.) that opens it with
 * auto-captured meta. Section pills and any other UI surface
 * uses useFeedbackTrigger() to open the modal with pre-filled
 * context.
 */

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingContext>({});
  const [targeting, setTargeting] = useState(false);
  const [pinning, setPinning] = useState(false);
  const openRef = useRef(open);
  const targetingRef = useRef(targeting);
  const pinningRef = useRef(pinning);

  /**
   * Always-on cursor tracker. Captures the latest viewport coords on
   * every pointermove so features that trigger via keyboard chords
   * (e.g. Left+Right → pin-drop) can read "where is the cursor right
   * now?" at the moment the chord fires — without waiting for the
   * user to move the mouse again after activation. `fresh` flips true
   * on the first move so we can distinguish "cursor at 0,0 because
   * never moved" from "cursor genuinely at 0,0".
   */
  const globalCursorRef = useRef<{ x: number; y: number; fresh: boolean }>({
    x: 0,
    y: 0,
    fresh: false,
  });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      globalCursorRef.current = { x: e.clientX, y: e.clientY, fresh: true };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    targetingRef.current = targeting;
  }, [targeting]);
  useEffect(() => {
    pinningRef.current = pinning;
  }, [pinning]);

  const openWith = useCallback((ctx: PendingContext = {}) => {
    setPending(ctx);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPending({});
  }, []);

  /** Enter targeting mode — green reticle follows cursor until user
   *  clicks somewhere or hits Esc. No-op if the modal is already open
   *  or targeting is already active. */
  const requestTarget = useCallback(() => {
    if (openRef.current || targetingRef.current) return;
    setTargeting(true);
  }, []);

  /** Invoked by TargetingOverlay when the user clicks somewhere on the
   *  page. We capture meta pinned to that exact screen coordinate, close
   *  targeting mode, and open the modal with the meta pre-filled. */
  const onTargetingComplete = useCallback(
    (x: number, y: number) => {
      setTargeting(false);
      let meta;
      try {
        meta = captureMetaAtPoint(x, y);
      } catch {
        meta = undefined;
      }
      openWith({ meta });
    },
    [openWith],
  );

  const onTargetingCancel = useCallback(() => {
    setTargeting(false);
  }, []);

  /** Submit every committed pin as its own feedback entry. Runs
   *  sequentially so the order in the log matches the order the
   *  presenter dropped them in. Empty-text pins are filtered inside
   *  PinDropOverlay before this fires. */
  const onPinsComplete = useCallback(
    async (pins: PinDraft[]) => {
      setPinning(false);
      for (const pin of pins) {
        const text = pin.text.trim();
        if (!text) continue;
        try {
          await addFeedback(text, {
            // Walkthrough pins land as "information" for now — the
            // closest neutral label in the shipped set. If a dedicated
            // "comment" label gets added later, swap it here + update
            // the worker's ALLOWED_LABELS.
            label: "information",
            sectionRef: pin.meta?.nearestSection,
            meta: pin.meta ?? undefined,
          });
        } catch (err) {
          // Swallow — one bad pin shouldn't kill the flush.
          console.warn("pin submit failed", err);
        }
      }
    },
    [],
  );

  const onPinsCancel = useCallback(() => {
    setPinning(false);
  }, []);

  // Global shortcut: Cmd/Ctrl+. (period). Hardened:
  // - never throws into the event loop
  // - preventDefault only on exact match
  // - respects native input cancel semantics
  // - re-entry guard via openRef / targetingRef
  //
  // Behavior: enters targeting mode (green reticle + aim-to-click) rather
  // than immediately opening the modal, so reports get pinned to the
  // exact element the user aims at.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      try {
        if (!(e.metaKey || e.ctrlKey)) return;
        if (e.shiftKey || e.altKey) return;
        if (e.key !== ".") return;
        const el = document.activeElement as HTMLElement | null;
        if (
          el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable)
        ) {
          return;
        }
        if (openRef.current || targetingRef.current || pinningRef.current) return;
        e.preventDefault();
        setTargeting(true);
      } catch (err) {
        // Swallow so we never break the host page's input loop.
        console.warn("feedback shortcut handler error", err);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Chord: Left + Right Arrow held simultaneously enters pin-drop mode.
  // Arrow keys repeat on hold, so we track per-key down/up state in refs
  // and treat "both currently held" as the trigger — regardless of which
  // one was pressed first. Ignored inside inputs / when another mode is
  // already active, and preventDefault'd when fired so the page doesn't
  // also horizontally scroll.
  useEffect(() => {
    const leftDown = { current: false };
    const rightDown = { current: false };

    const onDown = (e: KeyboardEvent) => {
      try {
        if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
        const el = document.activeElement as HTMLElement | null;
        if (
          el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable)
        ) {
          return;
        }
        if (e.key === "ArrowLeft") leftDown.current = true;
        else if (e.key === "ArrowRight") rightDown.current = true;
        else return;

        if (leftDown.current && rightDown.current) {
          if (openRef.current || targetingRef.current || pinningRef.current) return;
          e.preventDefault();
          setPinning(true);
        }
      } catch (err) {
        console.warn("pin-drop chord handler error", err);
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") leftDown.current = false;
      else if (e.key === "ArrowRight") rightDown.current = false;
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const value = useMemo<FeedbackTriggerValue>(
    () => ({ open, pending, openWith, close, requestTarget, targeting }),
    [open, pending, openWith, close, requestTarget, targeting],
  );

  return (
    <FeedbackTriggerContext.Provider value={value}>
      {children}
      <TargetingOverlay
        active={targeting}
        onComplete={onTargetingComplete}
        onCancel={onTargetingCancel}
        cursorRef={globalCursorRef}
      />
      <PinDropOverlay
        active={pinning}
        onComplete={onPinsComplete}
        onCancel={onPinsCancel}
        cursorRef={globalCursorRef}
      />
      <FeedbackModal open={open} onClose={close} pending={pending} />
    </FeedbackTriggerContext.Provider>
  );
}
